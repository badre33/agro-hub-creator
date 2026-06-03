import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { allProducts } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Package,
  Loader2,
  LogOut,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  RotateCcw,
  XCircle,
  Search,
  Check,
  Clock,
  ChefHat,
  Truck,
  User,
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
  delivery_address: string | null;
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

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  preparing: "bg-purple-100 text-purple-800 border-purple-300",
  delivered: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

const TIMELINE_STEPS: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "delivered",
];
const TIMELINE_ICONS = {
  pending: Clock,
  confirmed: Check,
  preparing: ChefHat,
  delivered: Truck,
};

type FilterStatus = "all" | OrderStatus;

const MyOrders = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateQuantity } = useCart();

  const loadOrders = async (userId: string) => {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, customer_name, customer_phone, delivery_address, delivery_city, status, total_amount, notes, created_at, order_items (id, product_name, product_price, quantity, unit, subtotal)"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
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
  };

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
      await loadOrders(currentUser.id);
      setLoading(false);
    };
    init();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const filtered = useMemo(() => {
    let list = orders;
    if (filter !== "all") list = list.filter((o) => o.status === filter);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(s) ||
          o.order_items?.some((it) =>
            it.product_name.toLowerCase().includes(s)
          )
      );
    }
    return list;
  }, [orders, filter, search]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleReorder = (order: Order) => {
    let matched = 0;
    let unmatched = 0;
    for (const item of order.order_items ?? []) {
      const product = allProducts.find((p) => p.name === item.product_name);
      if (product) {
        updateQuantity(product.id, item.quantity);
        matched++;
      } else {
        unmatched++;
      }
    }
    toast({
      title: `${matched} produit${matched > 1 ? "s" : ""} ajouté${matched > 1 ? "s" : ""} au panier`,
      description: unmatched
        ? `${unmatched} produit(s) introuvable(s) au catalogue actuel.`
        : "Direction le panier pour valider.",
    });
    setTimeout(() => navigate("/panier"), 600);
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm("Confirmer l'annulation de cette commande ?")) return;
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId);
    if (error) {
      toast({
        title: "Annulation impossible",
        description:
          "Cette commande ne peut peut-être plus être annulée. Contactez-nous.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Commande annulée" });
      if (user) await loadOrders(user.id);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

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
            <div className="flex items-center gap-3 min-w-0">
              <Link to="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">
                  Mes commandes
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/mon-profil")}
                title="Mon profil"
              >
                <User className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Mon profil</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
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
          <>
            {/* Filters + search */}
            <div className="mb-6 space-y-3">
              <div className="flex flex-wrap gap-2">
                {(["all", "pending", "confirmed", "preparing", "delivered", "cancelled"] as FilterStatus[]).map(
                  (f) => {
                    const count =
                      f === "all"
                        ? orders.length
                        : orders.filter((o) => o.status === f).length;
                    if (f !== "all" && count === 0) return null;
                    return (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          filter === f
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border hover:bg-muted"
                        }`}
                      >
                        {f === "all" ? "Toutes" : STATUS_LABEL[f]} · {count}
                      </button>
                    );
                  }
                )}
              </div>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher (numéro, produit...)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {filtered.length} commande{filtered.length > 1 ? "s" : ""}{" "}
                affichée{filtered.length > 1 ? "s" : ""} sur {orders.length}
              </p>
            </div>

            {filtered.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  Aucune commande ne correspond à ce filtre.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filtered.map((order) => (
                  <Card key={order.id} className="p-5">
                    {/* En-tête commande */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-4 w-4 text-primary" />
                          <span className="font-semibold">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLOR[order.status]}`}
                      >
                        {STATUS_LABEL[order.status]}
                      </span>
                    </div>

                    {/* Timeline (sauf si annulée) */}
                    {order.status !== "cancelled" && (
                      <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          {TIMELINE_STEPS.map((step, idx) => {
                            const currentIdx = TIMELINE_STEPS.indexOf(
                              order.status
                            );
                            const done = idx <= currentIdx;
                            const Icon = TIMELINE_ICONS[step];
                            return (
                              <div
                                key={step}
                                className="flex flex-col items-center flex-1"
                              >
                                <div className="flex items-center w-full">
                                  {idx > 0 && (
                                    <div
                                      className={`h-0.5 flex-1 ${done ? "bg-primary" : "bg-border"}`}
                                    />
                                  )}
                                  <div
                                    className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                                      done
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    <Icon className="h-3.5 w-3.5" />
                                  </div>
                                  {idx < TIMELINE_STEPS.length - 1 && (
                                    <div
                                      className={`h-0.5 flex-1 ${idx < currentIdx ? "bg-primary" : "bg-border"}`}
                                    />
                                  )}
                                </div>
                                <span
                                  className={`text-[10px] mt-1.5 text-center ${
                                    done
                                      ? "text-foreground font-medium"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {STATUS_LABEL[step]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Adresse + contact */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-4 p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {order.customer_phone}
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span>
                          {order.delivery_address ? `${order.delivery_address}, ` : ""}
                          {order.delivery_city}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
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
                        📝 {order.notes}
                      </p>
                    )}

                    {/* Total + actions */}
                    <div className="flex justify-between items-center pt-3 border-t mb-3">
                      <span className="font-bold">Total</span>
                      <span className="text-xl font-bold text-primary">
                        {order.total_amount.toFixed(2)} DH
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleReorder(order)}
                        className="flex-1 min-w-[140px]"
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-2" />
                        Repasser cette commande
                      </Button>
                      {order.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancel(order.id)}
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-2" />
                          Annuler
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
