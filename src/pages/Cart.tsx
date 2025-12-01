import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { allProducts } from "@/data/products";

const Cart = () => {
  const { getCartItems, updateQuantity, clearCart, cartCount } = useCart();
  const cartItems = getCartItems(allProducts);

  const total = cartItems.reduce((sum, item) => sum + item.total, 0);

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
      <div className="sticky top-0 z-30 bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Mon Panier</h1>
              <span className="text-muted-foreground">({cartCount} articles)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Votre panier est vide</h2>
            <p className="text-muted-foreground mb-6">
              Ajoutez des produits pour commencer votre commande
            </p>
            <Link to="/">
              <Button size="lg" className="rounded-full">
                Découvrir nos produits
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Liste des produits */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
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
                            className="h-8 w-8 rounded-full"
                            onClick={() => handleDecrement(item.id, item.quantity)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-semibold min-w-[60px] text-center">
                            {item.quantity} {item.unit}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-full"
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
                            className="h-8 w-8 text-destructive hover:text-destructive"
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
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Résumé de la commande</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Articles ({cartCount})</span>
                    <span>{total.toFixed(2)} DH</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">{total.toFixed(2)} DH</span>
                    </div>
                  </div>
                </div>
                <Button size="lg" className="w-full rounded-full mb-3">
                  Passer la commande
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full"
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
