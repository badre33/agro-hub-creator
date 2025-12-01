import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { ProductGrid } from "@/components/ProductGrid";
import { ValidateButton } from "@/components/ValidateButton";
import { Product } from "@/components/ProductCard";

// Produits complets avec catégories
interface ProductWithCategory extends Product {
  category: string;
}

const allProducts: ProductWithCategory[] = [
  // Légumes
  { id: 1, name: "Pomme de terre Blanche", price: 6, image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400", unit: "kg", category: "legumes" },
  { id: 2, name: "Pomme de terre Rouge", price: 6, image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400", unit: "kg", category: "legumes" },
  { id: 3, name: "Pomme de terre frite", price: 6, image: "https://images.unsplash.com/photo-1533326523521-f74c0420ca6e?w=400", unit: "kg", category: "legumes" },
  { id: 4, name: "Pomme de terre Pt", price: 6, image: "https://images.unsplash.com/photo-1552507911-3d1b65a8a4a5?w=400", unit: "kg", category: "legumes" },
  { id: 5, name: "Pomme douce", price: 7, image: "https://images.unsplash.com/photo-1592940296197-fbb84fc902fc?w=400", unit: "kg", category: "legumes" },
  { id: 6, name: "TOPINAMBOUR", price: 0, image: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400", unit: "kg", category: "legumes" },
  { id: 7, name: "Carotte", price: 5, image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400", unit: "kg", category: "legumes" },
  { id: 8, name: "Oignon", price: 12, image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400", unit: "kg", category: "legumes" },
  { id: 9, name: "Oignon Rouge", price: 0, image: "https://images.unsplash.com/photo-1587411768788-f04e46934bc6?w=400", unit: "kg", category: "legumes" },
  { id: 10, name: "Oignon Verte", price: 7, image: "https://images.unsplash.com/photo-1629114529792-6f0ebb53d8d1?w=400", unit: "kg", category: "legumes" },
  { id: 11, name: "Tomate", price: 6, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400", unit: "kg", category: "legumes" },
  { id: 12, name: "Poivron vert", price: 6, image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400", unit: "kg", category: "legumes" },
  { id: 13, name: "Poivron Rouge", price: 6, image: "https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=400", unit: "kg", category: "legumes" },
  { id: 14, name: "Poivron Douce", price: 12, image: "https://images.unsplash.com/photo-1601398496181-03fb48fd43c7?w=400", unit: "kg", category: "legumes" },
  { id: 15, name: "Aubergine", price: 5, image: "https://images.unsplash.com/photo-1659261200833-ec8761558af7?w=400", unit: "kg", category: "legumes" },
  { id: 16, name: "Courgette", price: 5, image: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400", unit: "kg", category: "legumes" },
  { id: 17, name: "Broccoli", price: 6, image: "https://images.unsplash.com/photo-1584868356733-4aec97099004?w=400", unit: "kg", category: "legumes" },
  { id: 18, name: "Chou Fleure", price: 8, image: "https://images.unsplash.com/photo-1568584711271-13c8f5b3c145?w=400", unit: "kg", category: "legumes" },
  { id: 19, name: "Chou Vert", price: 6, image: "https://images.unsplash.com/photo-1594282554782-e637aae10c05?w=400", unit: "kg", category: "legumes" },
  { id: 20, name: "Chou Rouge", price: 8, image: "https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?w=400", unit: "kg", category: "legumes" },
  { id: 21, name: "Citrouille rouge", price: 8, image: "https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=400", unit: "kg", category: "legumes" },
  { id: 22, name: "Concombre", price: 8, image: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400", unit: "kg", category: "legumes" },
  { id: 23, name: "Cardon", price: 5, image: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=400", unit: "potte", category: "legumes" },
  { id: 24, name: "Fenouil", price: 5, image: "https://images.unsplash.com/photo-1588167162879-483e8f5fdf6b?w=400", unit: "potte", category: "legumes" },
  { id: 25, name: "Haricot vert", price: 18, image: "https://images.unsplash.com/photo-1572359291411-f1c5b9e3c1fc?w=400", unit: "potte", category: "legumes" },
  { id: 26, name: "Petit pois", price: 12, image: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400", unit: "potte", category: "legumes" },
  { id: 27, name: "Fève", price: 7, image: "https://images.unsplash.com/photo-1589927986089-35812378b241?w=400", unit: "potte", category: "legumes" },
  { id: 28, name: "Navet", price: 7, image: "https://images.unsplash.com/photo-1602520332239-e27241cfd148?w=400", unit: "kg", category: "legumes" },
  { id: 29, name: "Artichaud Beldi", price: 9, image: "https://images.unsplash.com/photo-1604954488605-3c44c9f3c97d?w=400", unit: "kg", category: "legumes" },
  { id: 30, name: "Artichaud", price: 10, image: "https://images.unsplash.com/photo-1617715463127-8890f1c935c9?w=400", unit: "kg", category: "legumes" },
  
  // Fruits (exemples à compléter)
  { id: 31, name: "Pomme", price: 10, image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400", unit: "kg", category: "fruits" },
  { id: 32, name: "Orange", price: 8, image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400", unit: "kg", category: "fruits" },
  { id: 33, name: "Banane", price: 7, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400", unit: "kg", category: "fruits" },
  { id: 34, name: "Fraise", price: 15, image: "https://images.unsplash.com/photo-1543528176-61b239494933?w=400", unit: "kg", category: "fruits" },
  { id: 35, name: "Raisin", price: 18, image: "https://images.unsplash.com/photo-1599819177303-c6d1f8b3f95c?w=400", unit: "kg", category: "fruits" },
  { id: 36, name: "Pastèque", price: 5, image: "https://images.unsplash.com/photo-1587049352846-4a222e784830?w=400", unit: "kg", category: "fruits" },
  
  // Herbes
  { id: 37, name: "Persil", price: 2, image: "https://images.unsplash.com/photo-1616781973119-2e0d27b26e91?w=400", unit: "botte", category: "herbes" },
  { id: 38, name: "Coriandre", price: 2, image: "https://images.unsplash.com/photo-1592415486689-125cbbfcbee2?w=400", unit: "botte", category: "herbes" },
  { id: 39, name: "Menthe", price: 2, image: "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400", unit: "botte", category: "herbes" },
  { id: 40, name: "Basilic", price: 3, image: "https://images.unsplash.com/photo-1618375569909-3c8616cf7122?w=400", unit: "botte", category: "herbes" },
  { id: 41, name: "Thym", price: 3, image: "https://images.unsplash.com/photo-1598210249730-f7ab092e5ae3?w=400", unit: "botte", category: "herbes" },
  
  // Salades
  { id: 42, name: "Laitue", price: 4, image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400", unit: "pièce", category: "salades" },
  { id: 43, name: "Laitue Romaine", price: 5, image: "https://images.unsplash.com/photo-1640958476606-d5e7c0cdcd23?w=400", unit: "pièce", category: "salades" },
  { id: 44, name: "Roquette", price: 6, image: "https://images.unsplash.com/photo-1591368876792-f0e9eec1f05f?w=400", unit: "botte", category: "salades" },
  { id: 45, name: "Mâche", price: 7, image: "https://images.unsplash.com/photo-1647241679799-6fe40c86c5b1?w=400", unit: "botte", category: "salades" },
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

  // Filtrer les produits selon la catégorie active
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => product.category === activeCategory);
  }, [activeCategory]);

  const cartCount = Object.values(cart).filter((qty) => qty > 0).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header cartCount={cartCount} />
      <CategoryNav
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      <ProductGrid
        products={filteredProducts}
        onQuantityChange={handleQuantityChange}
      />
      <ValidateButton cartCount={cartCount} />
    </div>
  );
};

export default Index;
