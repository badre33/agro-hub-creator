import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2, MapPin } from "lucide-react";
import { allProducts } from "@/data/products";
import { useState } from "react";

const Cart = () => {
  const { getCartItems, updateQuantity, clearCart, cartCount } = useCart();
  const cartItems = getCartItems(allProducts);
  const [city, setCity] = useState("");

  const total = cartItems.reduce((sum, item) => sum + item.total, 0);

  const handleWhatsAppOrder = () => {
    if (!city.trim()) {
      alert("Veuillez indiquer votre ville pour la livraison");
      return;
    }

    const phoneNumber = "212660017777"; // WhatsApp number without + and spaces
    
    // Format the order message
    let message = "🛒 *Nouvelle Commande Broccagri*\n\n";
    message += `📍 *Ville de livraison:* ${city}\n\n`;
    message += "📦 *Détails de la commande:*\n";
    
    cartItems.forEach((item, index) => {
      message += `\n${index + 1}. *${item.name}*\n`;
      message += `   Quantité: ${item.quantity} ${item.unit}\n`;
      message += `   Prix unitaire: ${item.price} DH/${item.unit}\n`;
      message += `   Total: ${item.total.toFixed(2)} DH\n`;
    });
    
    message += `\n💰 *Total de la commande: ${total.toFixed(2)} DH*`;
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp with the message
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/50 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Mon Panier</h1>
                <span className="text-sm text-muted-foreground">{cartCount} article{cartCount > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="inline-flex p-6 bg-muted/50 rounded-full mb-6">
              <ShoppingCart className="h-24 w-24 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Votre panier est vide</h2>
            <p className="text-muted-foreground mb-8">
              Ajoutez des produits pour commencer votre commande
            </p>
            <Link to="/">
              <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-shadow">
                Découvrir nos produits
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Liste des produits */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <Card 
                  key={item.id} 
                  className="p-4 hover:shadow-lg transition-all hover:-translate-y-0.5 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex gap-4">
                    <div className="relative group">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 rounded-lg transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.price} DH / {item.unit}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-full hover:bg-primary/10 hover:border-primary transition-colors"
                            onClick={() => handleDecrement(item.id, item.quantity)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-semibold min-w-[70px] text-center px-2 py-1 bg-muted/50 rounded-lg">
                            {item.quantity} {item.unit}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-full hover:bg-primary/10 hover:border-primary transition-colors"
                            onClick={() => handleIncrement(item.id, item.quantity)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-lg text-primary">
                            {item.total.toFixed(2)} DH
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors rounded-full"
                            onClick={() => handleRemove(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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
              <Card className="p-6 sticky top-24 shadow-lg border-2">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <div className="h-1 w-1 bg-primary rounded-full" />
                  Résumé de la commande
                </h2>
                
                {/* Champ Ville */}
                <div className="mb-6 space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-2 font-semibold">
                    <MapPin className="h-4 w-4 text-primary" />
                    Ville de livraison
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Ex: Casablanca, Rabat..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="rounded-lg border-2 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Articles</span>
                    <span className="font-semibold">{cartCount} produit{cartCount > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between text-sm p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-semibold">{total.toFixed(2)} DH</span>
                  </div>
                  <div className="border-t-2 pt-4">
                    <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
                      <span className="font-bold text-lg">Total</span>
                      <span className="font-bold text-2xl text-primary">{total.toFixed(2)} DH</span>
                    </div>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  className="w-full rounded-full mb-3 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 font-semibold"
                  onClick={handleWhatsAppOrder}
                  disabled={!city.trim()}
                >
                  Commander via WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors"
                  onClick={clearCart}
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
