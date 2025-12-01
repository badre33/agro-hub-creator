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
  { id: 1, name: "Artichaud", price: 10, image: "https://images.unsplash.com/photo-1617715463127-8890f1c935c9?w=400", unit: "kg", category: "legumes" },
  { id: 2, name: "Artichaud Beldi", price: 9, image: "https://images.unsplash.com/photo-1604954488605-3c44c9f3c97d?w=400", unit: "kg", category: "legumes" },
  { id: 3, name: "Asperge", price: 25, image: "https://images.unsplash.com/photo-1617633389437-b211b89e7ae8?w=400", unit: "kg", category: "legumes" },
  { id: 4, name: "Aubergine", price: 5, image: "https://images.unsplash.com/photo-1659261200833-ec8761558af7?w=400", unit: "kg", category: "legumes" },
  { id: 5, name: "Broccoli", price: 6, image: "https://images.unsplash.com/photo-1584868356733-4aec97099004?w=400", unit: "kg", category: "legumes" },
  { id: 6, name: "Cardon", price: 5, image: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=400", unit: "botte", category: "legumes" },
  { id: 7, name: "Carotte", price: 5, image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400", unit: "kg", category: "legumes" },
  { id: 8, name: "Champignon", price: 20, image: "https://images.unsplash.com/photo-1565192281544-2c7f9f2e0f8d?w=400", unit: "kg", category: "legumes" },
  { id: 9, name: "Chou Fleure", price: 8, image: "https://images.unsplash.com/photo-1568584711271-13c8f5b3c145?w=400", unit: "kg", category: "legumes" },
  { id: 10, name: "Chou Rouge", price: 8, image: "https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?w=400", unit: "kg", category: "legumes" },
  { id: 11, name: "Chou Vert", price: 6, image: "https://images.unsplash.com/photo-1594282554782-e637aae10c05?w=400", unit: "kg", category: "legumes" },
  { id: 12, name: "Citrouille rouge", price: 8, image: "https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=400", unit: "kg", category: "legumes" },
  { id: 13, name: "Concombre", price: 8, image: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400", unit: "kg", category: "legumes" },
  { id: 14, name: "Courgette", price: 5, image: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400", unit: "kg", category: "legumes" },
  { id: 15, name: "Endive", price: 12, image: "https://images.unsplash.com/photo-1619880409379-c3c4fc6e7b6c?w=400", unit: "kg", category: "legumes" },
  { id: 16, name: "Epinard", price: 5, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400", unit: "kg", category: "legumes" },
  { id: 17, name: "Epinard Pottes", price: 5, image: "https://images.unsplash.com/photo-1605933231083-2a818b2b1dae?w=400", unit: "botte", category: "legumes" },
  { id: 18, name: "Fenouil", price: 5, image: "https://images.unsplash.com/photo-1588167162879-483e8f5fdf6b?w=400", unit: "botte", category: "legumes" },
  { id: 19, name: "Fève", price: 7, image: "https://images.unsplash.com/photo-1589927986089-35812378b241?w=400", unit: "kg", category: "legumes" },
  { id: 20, name: "Haricot vert", price: 18, image: "https://images.unsplash.com/photo-1572359291411-f1c5b9e3c1fc?w=400", unit: "kg", category: "legumes" },
  { id: 21, name: "Navet", price: 7, image: "https://images.unsplash.com/photo-1602520332239-e27241cfd148?w=400", unit: "kg", category: "legumes" },
  { id: 22, name: "Oignon", price: 12, image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400", unit: "kg", category: "legumes" },
  { id: 23, name: "Oignon Rouge", price: 12, image: "https://images.unsplash.com/photo-1587411768788-f04e46934bc6?w=400", unit: "kg", category: "legumes" },
  { id: 24, name: "Oignon Verte", price: 7, image: "https://images.unsplash.com/photo-1629114529792-6f0ebb53d8d1?w=400", unit: "kg", category: "legumes" },
  { id: 25, name: "Petit pois", price: 12, image: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400", unit: "kg", category: "legumes" },
  { id: 26, name: "Poivron Douce", price: 12, image: "https://images.unsplash.com/photo-1601398496181-03fb48fd43c7?w=400", unit: "kg", category: "legumes" },
  { id: 27, name: "Poivron Rouge", price: 6, image: "https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=400", unit: "kg", category: "legumes" },
  { id: 28, name: "Poivron vert", price: 6, image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400", unit: "kg", category: "legumes" },
  { id: 29, name: "Pomme de terre Blanche", price: 6, image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400", unit: "kg", category: "legumes" },
  { id: 30, name: "Pomme de terre Pt", price: 6, image: "https://images.unsplash.com/photo-1552507911-3d1b65a8a4a5?w=400", unit: "kg", category: "legumes" },
  { id: 31, name: "Pomme de terre Rouge", price: 6, image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400", unit: "kg", category: "legumes" },
  { id: 32, name: "Pomme de terre frite", price: 6, image: "https://images.unsplash.com/photo-1533326523521-f74c0420ca6e?w=400", unit: "kg", category: "legumes" },
  { id: 33, name: "TOPINAMBOUR", price: 8, image: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400", unit: "kg", category: "legumes" },
  { id: 34, name: "Tomate", price: 6, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400", unit: "kg", category: "legumes" },
  { id: 35, name: "Betterave", price: 5, image: "https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=400", unit: "kg", category: "legumes" },

  // Fruits
  { id: 36, name: "Ananas", price: 15, image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400", unit: "kg", category: "fruits" },
  { id: 37, name: "Avocat", price: 20, image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400", unit: "kg", category: "fruits" },
  { id: 38, name: "Banane Importé", price: 12, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400", unit: "kg", category: "fruits" },
  { id: 39, name: "Banane Local", price: 10, image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400", unit: "kg", category: "fruits" },
  { id: 40, name: "Citron", price: 8, image: "https://images.unsplash.com/photo-1590502593747-42a996133562?w=400", unit: "kg", category: "fruits" },
  { id: 41, name: "Fraise", price: 15, image: "https://images.unsplash.com/photo-1543528176-61b239494933?w=400", unit: "kg", category: "fruits" },
  { id: 42, name: "Kaki", price: 12, image: "https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=400", unit: "kg", category: "fruits" },
  { id: 43, name: "Kiwi", price: 15, image: "https://images.unsplash.com/photo-1585059895524-72359e9d7a05?w=400", unit: "kg", category: "fruits" },
  { id: 44, name: "Mangue", price: 18, image: "https://images.unsplash.com/photo-1605528355762-9aec09c26c45?w=400", unit: "kg", category: "fruits" },
  { id: 45, name: "Orange Clementine", price: 8, image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400", unit: "kg", category: "fruits" },
  { id: 46, name: "Orange Nafel", price: 8, image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400", unit: "kg", category: "fruits" },
  { id: 47, name: "Orange à jus", price: 7, image: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=400", unit: "kg", category: "fruits" },
  { id: 48, name: "Poire", price: 12, image: "https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?w=400", unit: "kg", category: "fruits" },
  { id: 49, name: "Pomme Import", price: 12, image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400", unit: "kg", category: "fruits" },
  { id: 50, name: "Pomme Local Calibre Grand", price: 10, image: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400", unit: "kg", category: "fruits" },
  { id: 51, name: "Pomme Local Calibre Moyen", price: 9, image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400", unit: "kg", category: "fruits" },
  { id: 52, name: "Pomme douce", price: 7, image: "https://images.unsplash.com/photo-1592940296197-fbb84fc902fc?w=400", unit: "kg", category: "fruits" },

  // Salades
  { id: 53, name: "Batavia Rouge", price: 5, image: "https://images.unsplash.com/photo-1622450783272-16ac44b2d8b9?w=400", unit: "pièce", category: "salades" },
  { id: 54, name: "Batavia Verte", price: 5, image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400", unit: "pièce", category: "salades" },
  { id: 55, name: "Chêne Verte", price: 6, image: "https://images.unsplash.com/photo-1640958476606-d5e7c0cdcd23?w=400", unit: "pièce", category: "salades" },
  { id: 56, name: "Chêne rouge", price: 6, image: "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=400", unit: "pièce", category: "salades" },
  { id: 57, name: "Céleri-rave", price: 7, image: "https://images.unsplash.com/photo-1599375986783-b1f9d088f8b6?w=400", unit: "kg", category: "salades" },
  { id: 58, name: "Germe Alfafa", price: 8, image: "https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400", unit: "botte", category: "salades" },
  { id: 59, name: "Germe Betterave", price: 8, image: "https://images.unsplash.com/photo-1625756753264-96d7f6327e1e?w=400", unit: "botte", category: "salades" },
  { id: 60, name: "Germe Poireau", price: 8, image: "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400", unit: "botte", category: "salades" },
  { id: 61, name: "Iceberg", price: 5, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400", unit: "pièce", category: "salades" },
  { id: 62, name: "Laitue Romain", price: 5, image: "https://images.unsplash.com/photo-1640958476606-d5e7c0cdcd23?w=400", unit: "pièce", category: "salades" },
  { id: 63, name: "Laitue Rouge", price: 5, image: "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=400", unit: "pièce", category: "salades" },
  { id: 64, name: "Laitue Verte", price: 4, image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400", unit: "pièce", category: "salades" },
  { id: 65, name: "Lolo Rouge", price: 6, image: "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=400", unit: "pièce", category: "salades" },
  { id: 66, name: "Mesclun", price: 9, image: "https://images.unsplash.com/photo-1591368876792-f0e9eec1f05f?w=400", unit: "botte", category: "salades" },
  { id: 67, name: "Mâche", price: 7, image: "https://images.unsplash.com/photo-1647241679799-6fe40c86c5b1?w=400", unit: "botte", category: "salades" },
  { id: 68, name: "Pousse Betterave", price: 8, image: "https://images.unsplash.com/photo-1625756753264-96d7f6327e1e?w=400", unit: "botte", category: "salades" },
  { id: 69, name: "Pousse Epinard", price: 8, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400", unit: "botte", category: "salades" },
  { id: 70, name: "Roquette", price: 6, image: "https://images.unsplash.com/photo-1591368876792-f0e9eec1f05f?w=400", unit: "botte", category: "salades" },
  { id: 71, name: "Salade Frisé", price: 5, image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400", unit: "pièce", category: "salades" },
  { id: 72, name: "Tomate Cerise", price: 12, image: "https://images.unsplash.com/photo-1623231612899-418ed41420d5?w=400", unit: "kg", category: "salades" },

  // Herbes
  { id: 73, name: "Aneth", price: 3, image: "https://images.unsplash.com/photo-1585411241865-99a2e788cfb8?w=400", unit: "botte", category: "herbes" },
  { id: 74, name: "Basilic", price: 3, image: "https://images.unsplash.com/photo-1618375569909-3c8616cf7122?w=400", unit: "botte", category: "herbes" },
  { id: 75, name: "Celeri", price: 4, image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400", unit: "botte", category: "herbes" },
  { id: 76, name: "Chiba", price: 3, image: "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400", unit: "botte", category: "herbes" },
  { id: 77, name: "Ciboulette", price: 3, image: "https://images.unsplash.com/photo-1625875098370-790e32ea5efe?w=400", unit: "botte", category: "herbes" },
  { id: 78, name: "Coriandre", price: 2, image: "https://images.unsplash.com/photo-1592415486689-125cbbfcbee2?w=400", unit: "botte", category: "herbes" },
  { id: 79, name: "Mauve des Bois", price: 4, image: "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400", unit: "botte", category: "herbes" },
  { id: 80, name: "Menthe", price: 2, image: "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400", unit: "botte", category: "herbes" },
  { id: 81, name: "Persil", price: 2, image: "https://images.unsplash.com/photo-1616781973119-2e0d27b26e91?w=400", unit: "botte", category: "herbes" },
  { id: 82, name: "Romarin", price: 3, image: "https://images.unsplash.com/photo-1592324626710-6ab66e1e1b7b?w=400", unit: "botte", category: "herbes" },
  { id: 83, name: "Thym", price: 3, image: "https://images.unsplash.com/photo-1598210249730-f7ab092e5ae3?w=400", unit: "botte", category: "herbes" },
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
