import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Package,
  Loader2,
  LogOut,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "delivered"
  | "cancelled";

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  unit: string;
  subtotal: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_city: string;
  status: OrderStatus;
  total_amount: number;
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  preparing: "En préparation",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const STATUS_VARIANT: Record<
  OrderStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  confirmed: "default",
  preparing: "default",
  delivered: "outline",
  cancelled: "destructive",
};

const MyOrders = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        navigate("/login");
        return;
      }

      if (cancelled) return;
      setUser(currentUser);

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, customer_name, customer_phone, delivery_city, status, total_amount, notes, created_at, order_items (id, product_name, product_price, quantity, unit, subtotal)"
        )
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("Erreur chargement commandes:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos commandes.",
          variant: "destructive",
        });
      } else {
        setOrders((data as Order[]) ?? []);
      }
      setLoading(false);
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [navigate, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Mes commandes</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {orders.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="inline-flex p-6 bg-muted/50 rounded-full mb-4">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Aucune commande pour le moment
            </h2>
            <p className="text-muted-foreground mb-6">
              Quand vous passerez une commande connecté à votre compte, elle
              apparaîtra ici.
            </p>
            <Link to="/">
              <Button size="lg" className="rounded-full">
                Voir le catalogue
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              {orders.length} commande{orders.length > 1 ? "s" : ""} au total
            </p>
            {orders.map((order) => (
              <Card key={order.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-4 w-4 text-primary" />
                      <span className="font-semibold">
                        Commande #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                  <Badge variant={STATUS_VARIANT[order.status]}>
                    {STATUS_LABEL[order.status]}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-4 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    {order.customer_phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {order.delivery_city}
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  {order.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm py-1"
                    >
                      <span>
                        {item.product_name}{" "}
                        <span className="text-muted-foreground">
                          × {item.quantity} {item.unit}
                        </span>
                      </span>
                      <span className="font-medium">
                        {item.subtotal.toFixed(2)} DH
                      </span>
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <p className="text-xs italic text-muted-foreground mb-3 p-2 bg-muted/30 rounded">
                    Notes : {order.notes}
                  </p>
                )}

                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {order.total_amount.toFixed(2)} DH
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
