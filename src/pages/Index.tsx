import { useState } from "react";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { ProductGrid } from "@/components/ProductGrid";
import { ValidateButton } from "@/components/ValidateButton";
import { Product } from "@/components/ProductCard";

// Sample products data
const allProducts: Product[] = [
  { id: 1, name: "Pomme de terre Blanche", price: 6, image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400", unit: "kg" },
  { id: 2, name: "Pomme de terre Rouge", price: 6, image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400", unit: "kg" },
  { id: 3, name: "Carotte", price: 5, image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400", unit: "kg" },
  { id: 4, name: "Oignon", price: 12, image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400", unit: "kg" },
  { id: 5, name: "Tomate", price: 8, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400", unit: "kg" },
  { id: 6, name: "Poivron Rouge", price: 8, image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400", unit: "kg" },
  { id: 7, name: "Courgette", price: 5, image: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400", unit: "kg" },
  { id: 8, name: "Aubergine", price: 6, image: "https://images.unsplash.com/photo-1659261200833-ec8761558af7?w=400", unit: "kg" },
  { id: 9, name: "Pomme", price: 10, image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400", unit: "kg" },
  { id: 10, name: "Orange", price: 8, image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400", unit: "kg" },
  { id: 11, name: "Banane", price: 7, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400", unit: "kg" },
  { id: 12, name: "Fraise", price: 15, image: "https://images.unsplash.com/photo-1543528176-61b239494933?w=400", unit: "kg" },
  { id: 13, name: "Persil", price: 2, image: "https://images.unsplash.com/photo-1616781973119-2e0d27b26e91?w=400", unit: "botte" },
  { id: 14, name: "Coriandre", price: 2, image: "https://images.unsplash.com/photo-1592415486689-125cbbfcbee2?w=400", unit: "botte" },
  { id: 15, name: "Menthe", price: 2, image: "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400", unit: "botte" },
  { id: 16, name: "Laitue", price: 4, image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400", unit: "pièce" },
];

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("legumes");
  const [cart, setCart] = useState<Record<number, number>>({});

  const handleQuantityChange = (productId: number, quantity: number) => {
    setCart((prev) => ({
      ...prev,
      [productId]: quantity,
    }));
  };

  const cartCount = Object.values(cart).filter((qty) => qty > 0).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header cartCount={cartCount} />
      <CategoryNav
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      <ProductGrid
        products={allProducts}
        onQuantityChange={handleQuantityChange}
      />
      <ValidateButton cartCount={cartCount} />
    </div>
  );
};

export default Index;
