import { ShoppingCart, User, Package, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import logo from "@/assets/logo-broccagri.png";

interface HeaderProps {
  cartCount: number;
}

export const Header = ({ cartCount }: HeaderProps) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const refreshAuth = async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      setUser(u);
      if (u) {
        const { data } = await supabase.rpc("is_admin");
        setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
      }
    };

    refreshAuth();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => refreshAuth());
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
          >
            <img
              src={logo}
              alt="Broccagri"
              className="h-10 sm:h-12 md:h-16 w-auto"
            />
          </Link>

          <div className="flex items-center gap-2">
            {/* Menu utilisateur : différent selon connecté / déconnecté */}
            {!user ? (
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-11 sm:w-11 hover:bg-primary/10 transition-all rounded-full"
                  title="Connexion / Créer un compte"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-10 sm:h-11 px-2 sm:px-3 hover:bg-primary/10 transition-all rounded-full gap-1"
                    title={user.email ?? "Mon compte"}
                  >
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="text-xs text-muted-foreground">
                      Connecté en tant que
                    </div>
                    <div className="text-sm font-medium truncate">
                      {user.email}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/mes-commandes")}>
                    <Package className="h-4 w-4 mr-2" />
                    Mes commandes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/mon-profil")}>
                    <User className="h-4 w-4 mr-2" />
                    Mon profil
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <User className="h-4 w-4 mr-2" />
                      Back-office admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Link to="/panier">
              <Button
                variant="outline"
                size="lg"
                className="relative h-10 sm:h-11 px-3 sm:px-4 hover:bg-primary/10 hover:border-primary transition-all"
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline ml-2">Panier</span>
                {cartCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 sm:h-6 sm:w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
