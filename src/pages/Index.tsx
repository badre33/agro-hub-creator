import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { ProductGrid } from "@/components/ProductGrid";
import { ValidateButton } from "@/components/ValidateButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { allProducts } from "@/data/products";
import { useStockOverrides } from "@/hooks/useStock";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("legumes");
  const [search, setSearch] = useState("");
  const { updateQuantity, cartCount } = useCart();
  const { outOfStock } = useStockOverrides();

  // Si une recherche est active, on ignore la catégorie et on cherche dans TOUT le catalogue.
  // Sinon, on filtre par catégorie.
  const filteredProducts = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (s) {
      return allProducts.filter((p) => p.name.toLowerCase().includes(s));
    }
    return allProducts.filter((p) => p.category === activeCategory);
  }, [activeCategory, search]);

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-24">
      <Header cartCount={cartCount} />

      {/* Barre de recherche */}
      <div className="container mx-auto px-3 sm:px-4 pt-4 pb-2">
        <div className="relative max-w-2xl mx-auto">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Rechercher un produit (tomate, fraise, menthe...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-10 h-11 rounded-full border-2 focus-visible:border-primary"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearch("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {search && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""} trouvé{filteredProducts.length > 1 ? "s" : ""} pour « {search} »
          </p>
        )}
      </div>

      {/* Catégories : masquées pendant la recherche pour éviter la confusion */}
      {!search && (
        <CategoryNav
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      )}

      <ProductGrid
        products={filteredProducts}
        onQuantityChange={updateQuantity}
        outOfStock={outOfStock}
      />
      <ValidateButton cartCount={cartCount} />

      {/* Footer minimal avec liens légaux */}
      <footer className="container mx-auto px-4 pt-16 pb-24 sm:pb-28">
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Broccagri — Fruits & légumes du terroir marocain</p>
          <div className="flex gap-4">
            <a href="/boutique/a-propos" className="hover:text-foreground hover:underline">
              À propos
            </a>
            <a href="/boutique/cgv" className="hover:text-foreground hover:underline">
              CGV
            </a>
            <a href="mailto:contact@broccagri.ma" className="hover:text-foreground hover:underline">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
