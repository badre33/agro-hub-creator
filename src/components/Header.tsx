import { ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import logo from "@/assets/logo-broccagri.png";

interface HeaderProps {
  cartCount: number;
}

export const Header = ({ cartCount }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <img src={logo} alt="Broccagri" className="h-10 sm:h-12 md:h-16 w-auto" />
          </Link>
          
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-10 w-10 sm:h-11 sm:w-11 hover:bg-primary/10 transition-all rounded-full"
                title="Espace Admin"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            
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
