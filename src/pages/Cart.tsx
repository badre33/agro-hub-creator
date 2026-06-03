import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  MapPin,
  Loader2,
  User,
  Mail,
  Home,
  Navigation,
  Loader,
} from "lucide-react";
import { allProducts } from "@/data/products";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Cart = () => {
  const { getCartItems, updateQuantity, clearCart, cartCount } = useCart();
  const cartItems = getCartItems(allProducts);
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<
    { id: string; label: string; address: string; city: string }[]
  >([]);
  const { toast } = useToast();

  // Récupère l'utilisateur connecté (s'il y en a un) pour pré-remplir le formulaire
  // depuis son profil et lier sa commande à son compte.
  useEffect(() => {
    const fillFromUser = (u: SupabaseUser | null) => {
      if (!u) return;
      const md = u.user_metadata || {};
      if (u.email && !customerEmail) setCustomerEmail(u.email);
      if (!customerName) {
        setCustomerName(md.full_name || md.name || "");
      }
      if (!customerPhone && md.phone) setCustomerPhone(md.phone);

      // Carnet d'adresses pour le sélecteur visuel
      const addrs = Array.isArray(md.addresses) ? md.addresses : [];
      setSavedAddresses(addrs);

      // Adresse principale = première du carnet si pas encore tapée
      if (addrs.length > 0) {
        const primary = addrs[0];
        if (!address && primary?.address) setAddress(primary.address);
        if (!city && primary?.city) setCity(primary.city);
      }
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      fillFromUser(user);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      fillFromUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Géolocalisation indisponible",
        description: "Votre navigateur ne supporte pas la géolocalisation.",
        variant: "destructive",
      });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setIsLocating(false);
        toast({
          title: "Position enregistrée ✓",
          description: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)} — l'adresse exacte aidera le livreur.`,
        });
      },
      (err) => {
        setIsLocating(false);
        toast({
          title: "Géolocalisation refusée",
          description:
            err.code === 1
              ? "Tu as refusé la permission. Tu peux toujours taper ton adresse manuellement."
              : "Impossible d'obtenir la position. Tape ton adresse manuellement.",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const total = cartItems.reduce((sum, item) => sum + item.total, 0);

  const handleSubmitOrder = async () => {
    if (
      !city.trim() ||
      !customerName.trim() ||
      !customerPhone.trim() ||
      !address.trim()
    ) {
      toast({
        title: "Informations manquantes",
        description:
          "Nom, téléphone, adresse et ville sont obligatoires.",
        variant: "destructive",
      });
      return;
    }
    if (customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      toast({
        title: "Email invalide",
        description: "Vérifie ton adresse email ou laisse le champ vide.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = crypto.randomUUID();

      // 1. Create the order — lie au user_id si connecté (pour /mes-commandes)
      const { error: orderError } = await supabase
        .from("orders")
        .insert({
          id: orderId,
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim() || null,
          customer_phone: customerPhone.trim(),
          delivery_address: address.trim(),
          delivery_city: city.trim(),
          delivery_lat: lat,
          delivery_lng: lng,
          total_amount: total,
          notes: notes.trim() || null,
          delivery_date: deliveryDate || null,
          user_id: currentUser?.id ?? null,
        });

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: orderId,
        product_name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        product_price: item.price,
        subtotal: item.total,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Send email notification (admin + client si email fourni)
      const { error: emailError } = await supabase.functions.invoke(
        "send-order-email",
        {
          body: {
            order_id: orderId,
            customer_name: customerName.trim(),
            customer_email: customerEmail.trim() || undefined,
            customer_phone: customerPhone.trim(),
            delivery_address: address.trim(),
            delivery_city: city.trim(),
            delivery_lat: lat ?? undefined,
            delivery_lng: lng ?? undefined,
            total_amount: total,
            items: orderItems,
            notes: notes.trim() || undefined,
          },
        }
      );

      if (emailError) {
        console.error("Email error:", emailError);
        // Continue even if email fails
      }

      // 4. Si le client est connecté, on enrichit son profil avec ce qu'il vient de remplir
      //    (utile pour les comptes créés en SSO sans nom/tel, ou pour 1ère commande).
      if (currentUser) {
        const md = currentUser.user_metadata || {};
        const updates: Record<string, unknown> = {};
        if (!md.full_name && customerName.trim()) updates.full_name = customerName.trim();
        if (!md.phone && customerPhone.trim()) updates.phone = customerPhone.trim();
        const existingAddrs = Array.isArray(md.addresses) ? md.addresses : [];
        // Si carnet d'adresses vide, on ajoute celle utilisée comme première adresse "Principale"
        if (existingAddrs.length === 0 && address.trim() && city.trim()) {
          updates.addresses = [
            {
              id: crypto.randomUUID(),
              label: "Principale",
              address: address.trim(),
              city: city.trim(),
            },
          ];
        }
        if (Object.keys(updates).length > 0) {
          await supabase.auth.updateUser({ data: { ...md, ...updates } }).catch((err) => {
            console.warn("Auto-save profil échoué (non bloquant):", err);
          });
        }
      }

      // 5. Clear cart and show success
      clearCart();
      setCity("");
      setCustomerName("");
      setCustomerPhone("");
      setNotes("");

      toast({
        title: "Commande envoyée ✅",
        description: currentUser
          ? `Votre commande #${orderId.slice(0, 8)} est enregistrée. Retrouvez-la dans "Mes commandes".`
          : `Votre commande #${orderId.slice(0, 8)} est enregistrée. Nous vous contacterons bientôt. Astuce : créez un compte pour suivre vos commandes.`,
      });
    } catch (error: any) {
      console.error("Order error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIncrement = (productId: number, currentQuantity: number) => {
    updateQuantity(productId, currentQuantity + 0.5);
  };

  const handleDecrement = (productId: number, currentQuantity: number) => {
    if (currentQuantity > 0.5) {
      updateQuantity(productId, currentQuantity - 0.5);
    } else {
      updateQuantity(productId, 0);
    }
  };

  const handleRemove = (productId: number) => {
    updateQuantity(productId, 0);
  };

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/50 transition-colors h-9 w-9 sm:h-10 sm:w-10">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-full">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Mon Panier</h1>
                <span className="text-xs sm:text-sm text-muted-foreground">{cartCount} article{cartCount > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-12 sm:py-16 animate-fade-in">
            <div className="inline-flex p-4 sm:p-6 bg-muted/50 rounded-full mb-4 sm:mb-6">
              <ShoppingCart className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 text-muted-foreground" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Votre panier est vide</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 px-4">
              Ajoutez des produits pour commencer votre commande
            </p>
            <Link to="/">
              <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-shadow text-sm sm:text-base">
                Découvrir nos produits
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Liste des produits */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {cartItems.map((item, index) => (
                <Card 
                  key={item.id} 
                  className="p-3 sm:p-4 hover:shadow-lg transition-all hover:-translate-y-0.5 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex gap-3 sm:gap-4">
                    <div className="relative group flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 rounded-lg transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-1 line-clamp-2">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                        {item.price} DH / {item.unit}
                      </p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-primary/10 hover:border-primary transition-colors flex-shrink-0"
                            onClick={() => handleDecrement(item.id, item.quantity)}
                          >
                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <span className="font-semibold text-xs sm:text-sm min-w-[60px] sm:min-w-[70px] text-center px-2 py-1 bg-muted/50 rounded-lg">
                            {item.quantity} {item.unit}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-primary/10 hover:border-primary transition-colors flex-shrink-0"
                            onClick={() => handleIncrement(item.id, item.quantity)}
                          >
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                          <span className="font-bold text-base sm:text-lg text-primary">
                            {item.total.toFixed(2)} DH
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors rounded-full flex-shrink-0"
                            onClick={() => handleRemove(item.id)}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Résumé de la commande */}
            <div className="lg:col-span-1">
              <Card className="p-4 sm:p-6 lg:sticky lg:top-24 shadow-lg border-2">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <div className="h-1 w-1 bg-primary rounded-full" />
                  Finaliser la commande
                </h2>
                
                {/* Champs client */}
                <div className="space-y-4 mb-4 sm:mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="font-semibold text-sm sm:text-base">
                      Nom complet *
                    </Label>
                    <Input
                      id="customerName"
                      type="text"
                      placeholder="Votre nom"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="rounded-lg border-2 focus:border-primary transition-colors text-sm sm:text-base h-10 sm:h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone" className="font-semibold text-sm sm:text-base">
                      Téléphone *
                    </Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      placeholder="06XXXXXXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="rounded-lg border-2 focus:border-primary transition-colors text-sm sm:text-base h-10 sm:h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="customerEmail"
                      className="flex items-center gap-2 font-semibold text-sm sm:text-base"
                    >
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      Email <span className="text-muted-foreground font-normal">(optionnel — pour recevoir la confirmation)</span>
                    </Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="votre@email.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="rounded-lg border-2 focus:border-primary transition-colors text-sm sm:text-base h-10 sm:h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="address"
                      className="flex items-center gap-2 font-semibold text-sm sm:text-base"
                    >
                      <Home className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      Adresse de livraison *
                    </Label>
                    {/* Sélecteur d'adresse depuis le carnet (visible si connecté + adresses sauvegardées) */}
                    {savedAddresses.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {savedAddresses.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => {
                              setAddress(a.address);
                              setCity(a.city);
                            }}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                              address === a.address && city === a.city
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border hover:bg-muted"
                            }`}
                            title={`${a.address}, ${a.city}`}
                          >
                            📍 {a.label}
                          </button>
                        ))}
                      </div>
                    )}
                    <Input
                      id="address"
                      type="text"
                      placeholder="Rue, n°, quartier, étage..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="rounded-lg border-2 focus:border-primary transition-colors text-sm sm:text-base h-10 sm:h-11"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGeolocate}
                      disabled={isLocating || isSubmitting}
                      className="w-full mt-1 rounded-lg text-xs sm:text-sm h-9 hover:bg-primary/10 hover:border-primary"
                    >
                      {isLocating ? (
                        <>
                          <Loader className="h-3 w-3 mr-2 animate-spin" />
                          Récupération de la position...
                        </>
                      ) : lat && lng ? (
                        <>
                          <Navigation className="h-3 w-3 mr-2 text-primary" />
                          Position enregistrée ({lat.toFixed(4)}, {lng.toFixed(4)})
                        </>
                      ) : (
                        <>
                          <Navigation className="h-3 w-3 mr-2" />
                          Partager ma position GPS (optionnel, aide le livreur)
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="flex items-center gap-2 font-semibold text-sm sm:text-base">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      Ville *
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Ex: Casablanca, Rabat..."
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="rounded-lg border-2 focus:border-primary transition-colors text-sm sm:text-base h-10 sm:h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="deliveryDate"
                      className="font-semibold text-sm sm:text-base"
                    >
                      Date de livraison souhaitée <span className="text-muted-foreground font-normal">(optionnel)</span>
                    </Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={deliveryDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="rounded-lg border-2 focus:border-primary transition-colors text-sm sm:text-base h-10 sm:h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="font-semibold text-sm sm:text-base">
                      Notes (optionnel)
                    </Label>
                    <Input
                      id="notes"
                      type="text"
                      placeholder="Instructions spéciales..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="rounded-lg border-2 focus:border-primary transition-colors text-sm sm:text-base h-10 sm:h-11"
                    />
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="flex justify-between text-xs sm:text-sm p-2 sm:p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Articles</span>
                    <span className="font-semibold">{cartCount} produit{cartCount > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm p-2 sm:p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-semibold">{total.toFixed(2)} DH</span>
                  </div>
                  <div className="border-t-2 pt-3 sm:pt-4">
                    <div className="flex justify-between items-center p-3 sm:p-4 bg-primary/5 rounded-lg">
                      <span className="font-bold text-base sm:text-lg">Total</span>
                      <span className="font-bold text-xl sm:text-2xl text-primary">{total.toFixed(2)} DH</span>
                    </div>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  className="w-full rounded-full mb-2 sm:mb-3 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 font-semibold text-sm sm:text-base py-5 sm:py-6"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || !city.trim() || !customerName.trim() || !customerPhone.trim() || !address.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Passer la commande"
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors text-sm sm:text-base py-5 sm:py-6"
                  onClick={clearCart}
                  disabled={isSubmitting}
                >
                  Vider le panier
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
