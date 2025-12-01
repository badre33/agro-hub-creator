import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { ProductGrid } from "@/components/ProductGrid";
import { ValidateButton } from "@/components/ValidateButton";
import { useCart } from "@/contexts/CartContext";
import { allProducts } from "@/data/products";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("legumes");
  const { updateQuantity, cartCount } = useCart();

  // Filtrer les produits selon la catégorie active
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => product.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-24">
      <Header cartCount={cartCount} />
      <CategoryNav
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      <ProductGrid
        products={filteredProducts}
        onQuantityChange={updateQuantity}
      />
      <ValidateButton cartCount={cartCount} />
    </div>
  );
};

export default Index;
