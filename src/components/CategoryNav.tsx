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
    <nav className="border-b bg-gradient-to-b from-card to-background/50 backdrop-blur-sm sticky top-[57px] sm:top-[65px] md:top-[81px] z-40">
      <div className="py-2 sm:py-3">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-3 sm:px-4 sm:justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`group flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 flex-shrink-0 ${
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-card hover:bg-accent border border-border/50 hover:border-primary/30"
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-300 ${
                  activeCategory === category.id 
                    ? "bg-primary-foreground/20" 
                    : "bg-primary/10 group-hover:bg-primary/20"
                }`}>
                  <div className="[&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5">
                    {category.icon}
                  </div>
                </div>
                <span className="font-semibold text-[9px] sm:text-xs">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
