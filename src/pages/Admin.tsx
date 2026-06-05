import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LogOut,
  Package,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Loader2,
  TrendingUp,
  ShoppingCart,
  Users,
  Trophy,
  Search,
  Download,
  Boxes,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { allProducts } from "@/data/products";
import { useStockOverrides } from "@/hooks/useStock";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import type { Database } from "@/integrations/supabase/types";

type OrderStatus = Database["public"]["Enums"]["order_status"];
type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];

interface OrderWithItems extends Order {
  order_items?: OrderItem[];
}

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  preparing: "bg-purple-100 text-purple-800 border-purple-300",
  delivered: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  preparing: "En préparation",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const Admin = () => {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [orderSearch, setOrderSearch] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Filtre les commandes selon la recherche admin (numéro, nom, ville, tel)
  const visibleOrders = useMemo(() => {
    const s = orderSearch.trim().toLowerCase();
    if (!s) return orders;
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(s) ||
        o.customer_name?.toLowerCase().includes(s) ||
        o.customer_phone?.toLowerCase().includes(s) ||
        o.delivery_city?.toLowerCase().includes(s)
    );
  }, [orders, orderSearch]);

  const exportCsv = () => {
    const rows = [
      [
        "ID",
        "Date",
        "Client",
        "Email",
        "Telephone",
        "Adresse",
        "Ville",
        "Statut",
        "Total (DH)",
        "Notes",
        "Date livraison souhaitee",
        "Creneau horaire",
      ],
      ...orders.map((o) => [
        o.id.slice(0, 8).toUpperCase(),
        new Date(o.created_at).toLocaleString("fr-FR"),
        o.customer_name || "",
        (o as any).customer_email || "",
        o.customer_phone || "",
        (o as any).delivery_address || "",
        o.delivery_city || "",
        statusLabels[o.status as OrderStatus] || o.status,
        Number(o.total_amount || 0).toFixed(2),
        (o.notes || "").replace(/\n/g, " "),
        (o as any).delivery_date || "",
        (o as any).delivery_time || "",
      ]),
    ];
    const csv = rows
      .map((r) =>
        r
          .map((cell) => {
            const s = String(cell ?? "");
            return /[,;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(",")
      )
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `broccagri-commandes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Export téléchargé ✓",
      description: `${orders.length} commande(s) exportée(s)`,
    });
  };

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      // Check if user is admin
      const { data: isAdminResult, error } = await supabase.rpc("is_admin");

      if (error || !isAdminResult) {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les droits d'administration.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      setChecking(false);
      fetchOrders();
    } catch (error) {
      console.error("Admin check error:", error);
      navigate("/login");
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch items for each order
      const ordersWithItems: OrderWithItems[] = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: items } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", order.id);
          return { ...order, order_items: items || [] };
        })
      );

      setOrders(ordersWithItems);
    } catch (error: any) {
      console.error("Fetch orders error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingStatus(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // Notification email au client (non bloquant)
      supabase.functions
        .invoke("send-status-update", {
          body: { order_id: orderId, new_status: newStatus },
        })
        .catch((err) => console.warn("Notification email échouée (non bloquant):", err));

      toast({
        title: "Statut mis à jour",
        description: `Commande #${orderId.slice(0, 8)} → ${statusLabels[newStatus]}. Email client envoyé.`,
      });
    } catch (error: any) {
      console.error("Update status error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Administration</h1>
                <span className="text-sm text-muted-foreground">Gestion des commandes</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchOrders}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats business : CA mois, panier moyen, clients, top produit */}
        <AdminBusinessStats orders={orders} />

        {/* Stats statuts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {(["pending", "confirmed", "preparing", "delivered"] as OrderStatus[]).map((status) => (
            <Card key={status} className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{statusLabels[status]}</span>
                <Badge className={statusColors[status]}>
                  {orders.filter((o) => o.status === status).length}
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        {/* Gestion de stock (collapsible) */}
        <AdminStockManager />

        {/* Barre de recherche + export + actualiser */}
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher commandes (numéro, nom, ville, téléphone)..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={exportCsv} disabled={orders.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
        {orderSearch && (
          <p className="text-xs text-muted-foreground mb-2">
            {visibleOrders.length} commande(s) sur {orders.length}
          </p>
        )}

        {/* Orders Table */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : visibleOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {orderSearch ? "Aucune commande ne correspond à la recherche" : "Aucune commande"}
                  </TableCell>
                </TableRow>
              ) : (
                visibleOrders.map((order) => (
                  <>
                    <TableRow 
                      key={order.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      <TableCell>
                        {expandedOrder === order.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        #{order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-sm text-muted-foreground">{order.customer_phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{order.delivery_city}</TableCell>
                      <TableCell className="font-bold text-primary">
                        {Number(order.total_amount).toFixed(2)} DH
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(order.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateOrderStatus(order.id, value as OrderStatus)}
                          disabled={updatingStatus === order.id}
                        >
                          <SelectTrigger className={`w-36 ${statusColors[order.status]}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(statusLabels) as OrderStatus[]).map((status) => (
                              <SelectItem key={status} value={status}>
                                {statusLabels[status]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                    {expandedOrder === order.id && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/30 p-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold mb-2">Détails de la commande</h4>
                            {(order as any).delivery_address && (
                              <p className="text-sm">
                                <strong>Adresse :</strong> {(order as any).delivery_address}, {order.delivery_city}
                              </p>
                            )}
                            {((order as any).delivery_date || (order as any).delivery_time) && (
                              <p className="text-sm bg-amber-50 border border-amber-200 p-2 rounded">
                                <strong>📅 Livraison souhaitée :</strong>{" "}
                                {(order as any).delivery_date
                                  ? new Date((order as any).delivery_date).toLocaleDateString("fr-FR", {
                                      weekday: "long",
                                      day: "numeric",
                                      month: "long",
                                    })
                                  : ""}
                                {(order as any).delivery_date && (order as any).delivery_time ? " — " : ""}
                                <strong>{(order as any).delivery_time ?? ""}</strong>
                              </p>
                            )}
                            {order.notes && (
                              <p className="text-sm text-muted-foreground mb-2">
                                <strong>Notes:</strong> {order.notes}
                              </p>
                            )}
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Produit</TableHead>
                                  <TableHead>Quantité</TableHead>
                                  <TableHead>Prix unitaire</TableHead>
                                  <TableHead>Sous-total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {order.order_items?.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell>{item.product_name}</TableCell>
                                    <TableCell>
                                      {Number(item.quantity)} {item.unit}
                                    </TableCell>
                                    <TableCell>{Number(item.product_price)} DH/{item.unit}</TableCell>
                                    <TableCell className="font-bold">
                                      {Number(item.subtotal).toFixed(2)} DH
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

/**
 * Carte de stats business affichée en haut du back-office.
 * Computes : CA du mois en cours, panier moyen, nb commandes mois, top produit, nb clients uniques.
 */
const AdminBusinessStats = ({ orders }: { orders: OrderWithItems[] }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    // On exclut les commandes annulées pour le CA et panier moyen
    const validOrders = orders.filter((o) => o.status !== "cancelled");
    const monthOrders = validOrders.filter(
      (o) => new Date(o.created_at).getTime() >= monthStart
    );

    const monthRevenue = monthOrders.reduce(
      (sum, o) => sum + Number(o.total_amount || 0),
      0
    );
    const avgBasket =
      monthOrders.length > 0 ? monthRevenue / monthOrders.length : 0;

    // Top produit (toutes périodes) : compte les quantités cumulées par nom
    const productQty = new Map<string, number>();
    for (const o of validOrders) {
      for (const item of o.order_items || []) {
        const prev = productQty.get(item.product_name) || 0;
        productQty.set(item.product_name, prev + Number(item.quantity));
      }
    }
    let topProduct = "—";
    let topProductQty = 0;
    for (const [name, qty] of productQty.entries()) {
      if (qty > topProductQty) {
        topProductQty = qty;
        topProduct = name;
      }
    }

    // Clients uniques : par téléphone (puisque email peut être null pour invités)
    const uniqClients = new Set(
      validOrders.map((o) => o.customer_phone).filter(Boolean)
    );

    return {
      monthRevenue,
      avgBasket,
      monthOrdersCount: monthOrders.length,
      topProduct,
      topProductQty,
      uniqueClients: uniqClients.size,
    };
  }, [orders]);

  // Données pour le graphique : CA par jour sur les 7 derniers jours
  const chartData = useMemo(() => {
    const days: { label: string; date: Date; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push({
        label: d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit" }),
        date: d,
        revenue: 0,
      });
    }
    const validOrders = orders.filter((o) => o.status !== "cancelled");
    for (const o of validOrders) {
      const d = new Date(o.created_at);
      d.setHours(0, 0, 0, 0);
      const day = days.find((x) => x.date.getTime() === d.getTime());
      if (day) day.revenue += Number(o.total_amount || 0);
    }
    return days.map(({ label, revenue }) => ({ label, revenue: Math.round(revenue) }));
  }, [orders]);

  const fmtDH = (n: number) =>
    n.toLocaleString("fr-MA", { maximumFractionDigits: 2 }) + " DH";

  const monthLabel = new Date().toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Aperçu — {monthLabel}
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-700" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">CA du mois</div>
              <div className="font-bold text-base truncate">
                {fmtDH(stats.monthRevenue)}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-blue-700" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">
                Commandes / Panier moyen
              </div>
              <div className="font-bold text-base">
                {stats.monthOrdersCount}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  · {fmtDH(stats.avgBasket)}
                </span>
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Trophy className="h-5 w-5 text-purple-700" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Top produit</div>
              <div className="font-bold text-sm truncate">
                {stats.topProduct}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {stats.topProductQty > 0
                  ? `${stats.topProductQty} unité${stats.topProductQty > 1 ? "s" : ""} vendue${stats.topProductQty > 1 ? "s" : ""}`
                  : "Aucune vente"}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="h-5 w-5 text-orange-700" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">
                Clients uniques
              </div>
              <div className="font-bold text-base">{stats.uniqueClients}</div>
              <div className="text-[10px] text-muted-foreground">
                par téléphone
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Mini graphique CA sur les 7 derniers jours */}
      <Card className="p-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">CA des 7 derniers jours</h3>
          <span className="text-xs text-muted-foreground">
            Total : {fmtDH(chartData.reduce((s, d) => s + d.revenue, 0))}
          </span>
        </div>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="label"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                  fontSize: 12,
                }}
                formatter={(value: number) => [`${value} DH`, "CA"]}
              />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

/**
 * Section pliable pour gérer les ruptures de stock par produit.
 * Lit/écrit dans la table public.product_stock_overrides.
 */
const AdminStockManager = () => {
  const { outOfStock, reload } = useStockOverrides();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const { toast } = useToast();

  const toggle = async (productId: number, isOutOfStock: boolean) => {
    setBusy(productId);
    try {
      const { error } = await supabase
        .from("product_stock_overrides")
        .upsert({ product_id: productId, in_stock: !isOutOfStock, updated_at: new Date().toISOString() });
      if (error) throw error;
      await reload();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e.message || "Impossible de mettre à jour le stock.",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return allProducts;
    return allProducts.filter((p) => p.name.toLowerCase().includes(s));
  }, [search]);

  return (
    <Card className="mb-6 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Boxes className="h-5 w-5 text-amber-700" />
          </div>
          <div className="text-left">
            <div className="font-semibold">Gestion du stock</div>
            <div className="text-xs text-muted-foreground">
              {outOfStock.size === 0
                ? "Aucun produit en rupture"
                : `${outOfStock.size} produit${outOfStock.size > 1 ? "s" : ""} en rupture`}
            </div>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="border-t p-4">
          <div className="relative mb-3">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="max-h-96 overflow-y-auto border rounded-lg divide-y">
            {filtered.map((p) => {
              const isOOS = outOfStock.has(p.id);
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between gap-3 px-3 py-2 ${isOOS ? "bg-red-50" : ""}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.category} · {p.price} DH / {p.unit}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-xs font-medium ${isOOS ? "text-red-600" : "text-green-600"}`}
                    >
                      {isOOS ? "Rupture" : "En stock"}
                    </span>
                    <Switch
                      checked={!isOOS}
                      onCheckedChange={() => toggle(p.id, isOOS)}
                      disabled={busy === p.id}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

export default Admin;
