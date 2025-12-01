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
    <nav className="border-b bg-gradient-to-b from-card to-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-4 justify-center flex-wrap">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`group flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 min-w-[120px] ${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 ring-2 ring-primary/50"
                  : "bg-card hover:bg-accent hover:shadow-lg border-2 border-border/50 hover:border-primary/30"
              }`}
            >
              <div className={`flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${
                activeCategory === category.id 
                  ? "bg-primary-foreground/20 group-hover:scale-110" 
                  : "bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110"
              }`}>
                {category.icon}
              </div>
              <span className="font-bold text-sm tracking-wide">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
