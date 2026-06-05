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
  const [deliveryTime, setDeliveryTime] = useState(""); // créneau souhaité (ex: "Matin (8h-12h)" ou "14:30")
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

  /**
   * Géolocalise l'utilisateur puis fait du reverse-geocoding via Nominatim
   * (OpenStreetMap, gratuit, sans clé API) pour récupérer une vraie adresse
   * lisible et la pré-remplir dans le formulaire.
   *
   * Politique d'usage Nominatim : 1 req/s max, doit avoir un User-Agent.
   * Pour un commerçant à faible volume comme Broccagri, parfaitement adapté.
   */
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
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);

        // Reverse geocoding via Nominatim — récupère l'adresse lisible
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=fr&zoom=18&addressdetails=1`;
          const res = await fetch(url, {
            headers: {
              // Bonne pratique Nominatim : identifier l'app appelante
              "Accept": "application/json",
            },
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          const a = data.address || {};

          // Construit une rue lisible : "12 Rue Mohamed Diouri"
          const streetParts = [a.house_number, a.road || a.pedestrian || a.footway]
            .filter(Boolean);
          // Quartier en complément : "Médina" / "Maârif" / etc.
          const neighborhood = a.suburb || a.neighbourhood || a.quarter || a.city_district;
          const streetLine = [streetParts.join(" "), neighborhood]
            .filter(Boolean)
            .join(", ");

          // Ville (Nominatim renvoie parfois "town" ou "village" pour les petites communes)
          const detectedCity = a.city || a.town || a.village || a.municipality || "";

          // Si on n'a vraiment rien d'utile, fallback sur display_name complet
          const fallbackAddress = streetLine || data.display_name || "";

          if (fallbackAddress) setAddress(fallbackAddress);
          if (detectedCity) setCity(detectedCity);

          setIsLocating(false);
          toast({
            title: "Adresse trouvée ✓",
            description: fallbackAddress
              ? `${fallbackAddress}${detectedCity ? `, ${detectedCity}` : ""}`
              : "Position enregistrée — vérifie l'adresse ci-dessous.",
          });
        } catch (geocodeErr) {
          // En cas d'échec du reverse geocoding, on garde au moins les coordonnées
          setIsLocating(false);
          toast({
            title: "Position enregistrée",
            description: `${latitude.toFixed(5)}, ${longitude.toFixed(5)} — tape ton adresse manuellement.`,
          });
        }
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

    const orderId = crypto.randomUUID();
    const orderItems = cartItems.map((item) => ({
      order_id: orderId,
      product_name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      product_price: item.price,
      subtotal: item.total,
    }));

    try {
      // 1. CRITIQUE : insère la commande
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
          delivery_time: deliveryTime || null,
          user_id: currentUser?.id ?? null,
        });

      if (orderError) {
        console.error("Order insert error:", orderError);
        toast({
          title: "Impossible d'enregistrer la commande",
          description: orderError.message || "Vérifie ta connexion et réessaie.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // 2. CRITIQUE : insère les lignes de la commande
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Order items insert error:", itemsError);
        toast({
          title: "Commande partiellement enregistrée",
          description:
            "Les produits n'ont pas pu être attachés. Notre équipe va te recontacter pour confirmer.",
          variant: "destructive",
        });
        // On continue quand même — l'admin pourra rattraper via la base
      }
    } catch (criticalError: unknown) {
      console.error("Critical order error:", criticalError);
      const msg = criticalError instanceof Error ? criticalError.message : String(criticalError);
      toast({
        title: "Erreur",
        description: msg || "Une erreur s'est produite. Réessaie dans un instant.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // À partir d'ici, la commande EST enregistrée. Les étapes suivantes sont
    // best-effort : si elles échouent, on ne montre pas d'erreur au client.

    // 3. Email + WhatsApp (Edge Function) — best-effort
    try {
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
            delivery_date: deliveryDate || undefined,
            delivery_time: deliveryTime || undefined,
          },
        }
      );
      if (emailError) console.warn("Email/WhatsApp non bloquant:", emailError);
    } catch (notifErr) {
      console.warn("Notification non bloquante échouée:", notifErr);
    }

    // 4. Auto-save profil — best-effort
    if (currentUser) {
      try {
        const md = currentUser.user_metadata || {};
        const updates: Record<string, unknown> = {};
        if (!md.full_name && customerName.trim()) updates.full_name = customerName.trim();
        if (!md.phone && customerPhone.trim()) updates.phone = customerPhone.trim();
        const existingAddrs = Array.isArray(md.addresses) ? md.addresses : [];
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
          await supabase.auth.updateUser({ data: { ...md, ...updates } });
        }
      } catch (profileErr) {
        console.warn("Auto-save profil échoué (non bloquant):", profileErr);
      }
    }

    // 5. Reset UI + toast succès
    clearCart();
    setCity("");
    setCustomerName("");
    setCustomerPhone("");
    setNotes("");
    setDeliveryDate("");
    setDeliveryTime("");

    toast({
      title: "Commande envoyée ✅",
      description: currentUser
        ? `Votre commande #${orderId.slice(0, 8)} est enregistrée. Retrouvez-la dans "Mes commandes".`
        : `Votre commande #${orderId.slice(0, 8)} est enregistrée. Nous vous contacterons bientôt. Astuce : créez un compte pour suivre vos commandes.`,
    });
    setIsSubmitting(false);
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
                          Récupération de l'adresse...
                        </>
                      ) : lat && lng ? (
                        <>
                          <Navigation className="h-3 w-3 mr-2 text-primary" />
                          Adresse récupérée ✓ — clic pour relancer
                        </>
                      ) : (
                        <>
                          <Navigation className="h-3 w-3 mr-2" />
                          Utiliser ma position pour remplir l'adresse
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

                  {/* Créneau horaire : chips rapides + option custom */}
                  <div className="space-y-2">
                    <Label className="font-semibold text-sm sm:text-base">
                      Créneau horaire <span className="text-muted-foreground font-normal">(optionnel)</span>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "Matin (8h-12h)", label: "Matin", sub: "8h–12h" },
                        { value: "Midi (12h-14h)", label: "Midi", sub: "12h–14h" },
                        { value: "Après-midi (14h-17h)", label: "Après-midi", sub: "14h–17h" },
                        { value: "Soir (17h-20h)", label: "Soir", sub: "17h–20h" },
                      ].map((slot) => {
                        const active = deliveryTime === slot.value;
                        return (
                          <button
                            key={slot.value}
                            type="button"
                            onClick={() =>
                              setDeliveryTime(active ? "" : slot.value)
                            }
                            className={`flex-1 min-w-[80px] px-3 py-2 rounded-lg border-2 transition-all text-center ${
                              active
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-card border-border hover:border-primary/40"
                            }`}
                          >
                            <div className="font-semibold text-sm">{slot.label}</div>
                            <div className={`text-xs ${active ? "opacity-90" : "text-muted-foreground"}`}>
                              {slot.sub}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {/* Heure précise si besoin */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-muted-foreground">ou heure précise :</span>
                      <Input
                        type="time"
                        value={
                          // Affiche le champ time uniquement s'il contient un format HH:MM
                          /^\d{2}:\d{2}$/.test(deliveryTime) ? deliveryTime : ""
                        }
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        className="h-9 w-32 rounded-lg border-2 focus:border-primary text-sm"
                      />
                    </div>
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
