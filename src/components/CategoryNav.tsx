import { Carrot, Apple, Leaf, Salad } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const categories: Category[] = [
  { id: "legumes", name: "Légumes", icon: <Carrot className="h-8 w-8" /> },
  { id: "fruits", name: "Fruits", icon: <Apple className="h-8 w-8" /> },
  { id: "herbes", name: "Herbes", icon: <Leaf className="h-8 w-8" /> },
  { id: "salades", name: "Salades", icon: <Salad className="h-8 w-8" /> },
];

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryNav = ({ activeCategory, onCategoryChange }: CategoryNavProps) => {
  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-4 justify-center flex-wrap">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300 hover:scale-105 ${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted hover:bg-muted/70"
              }`}
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-background/20">
                {category.icon}
              </div>
              <span className="font-semibold text-sm">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
