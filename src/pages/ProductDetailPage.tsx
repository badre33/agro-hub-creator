import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Minus, Plus, ShoppingCart, Flame, Sparkles, Leaf, Truck, Shield } from "lucide-react";
import {
  allProducts,
  findProductBySlug,
  generateProductDescription,
  slugify,
  type ProductWithCategory,
} from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { Header } from "@/components/Header";
import placeholderImg from "@/assets/product-placeholder.jpg";
import { ProductCard } from "@/components/ProductCard";

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = useMemo(() => (slug ? findProductBySlug(slug) : undefined), [slug]);
  const { cart, updateQuantity, cartCount } = useCart();
  const navigate = useNavigate();

  // Quantité actuelle dans le panier pour ce produit
  const inCart = product ? cart[product.id] ?? 0 : 0;
  const [localQty, setLocalQty] = useState(inCart);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Produit introuvable</h1>
          <p className="text-muted-foreground mb-4">
            Ce produit n'existe pas ou a été retiré du catalogue.
          </p>
          <Link to="/">
            <Button>Retour au catalogue</Button>
          </Link>
        </div>
      </div>
    );
  }

  const description = generateProductDescription(product);

  const handleInc = () => {
    const q = localQty + 0.5;
    setLocalQty(q);
    updateQuantity(product.id, q);
  };
  const handleDec = () => {
    if (localQty > 0) {
      const q = Math.max(0, localQty - 0.5);
      setLocalQty(q);
      updateQuantity(product.id, q);
    }
  };

  // Produits similaires (même catégorie, sauf celui-ci)
  const related: ProductWithCategory[] = useMemo(
    () =>
      allProducts
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, 4),
    [product]
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header cartCount={cartCount} />

      {/* Breadcrumb / back */}
      <div className="container mx-auto px-4 pt-4">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au catalogue
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative">
            {product.badge === "promo" && (
              <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                <Flame className="h-4 w-4" /> Promo
              </div>
            )}
            {product.badge === "new" && (
              <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 bg-amber-400 text-amber-900 text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                <Sparkles className="h-4 w-4" /> Nouveau
              </div>
            )}
            <Card className="overflow-hidden aspect-square flex items-center justify-center bg-gradient-to-br from-muted to-muted/30">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = placeholderImg;
                }}
              />
            </Card>
          </div>

          {/* Infos */}
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                {product.category}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold text-primary">
                  {product.price.toFixed(2)} DH
                </span>
                <span className="text-muted-foreground">/ {product.unit}</span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="text-base text-muted-foreground line-through">
                    {product.oldPrice.toFixed(2)} DH
                  </span>
                )}
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">{description}</p>

            {/* Engagements */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 bg-muted/40 rounded-lg">
                <Leaf className="h-4 w-4 text-primary flex-shrink-0" />
                <span>100% terroir</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted/40 rounded-lg">
                <Truck className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Livraison 24/48h</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted/40 rounded-lg">
                <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Qualité garantie</span>
              </div>
            </div>

            {/* Sélecteur quantité + ajout panier */}
            <Card className="p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="font-semibold">Quantité</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleDec}
                    disabled={localQty === 0}
                    className="rounded-full h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="min-w-[80px] text-center font-bold text-lg">
                    {localQty} <span className="text-sm font-normal text-muted-foreground">{product.unit}</span>
                  </div>
                  <Button
                    size="icon"
                    onClick={handleInc}
                    className="rounded-full h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {localQty > 0 && (
                <div className="flex items-center justify-between p-2 bg-primary/10 rounded-lg mb-3">
                  <span className="text-sm">Sous-total</span>
                  <span className="font-bold text-primary">
                    {(product.price * localQty).toFixed(2)} DH
                  </span>
                </div>
              )}
              <Button
                onClick={() => navigate("/panier")}
                disabled={cartCount === 0}
                className="w-full h-12"
                size="lg"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Voir le panier ({cartCount})
              </Button>
            </Card>
          </div>
        </div>

        {/* Produits similaires */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">Vous aimerez aussi</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {related.map((p) => (
                <Link key={p.id} to={`/produit/${slugify(p.name)}`}>
                  <ProductCard product={p} onQuantityChange={updateQuantity} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
