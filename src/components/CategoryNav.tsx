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
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="flex gap-3 sm:gap-4 justify-start sm:justify-center overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`group flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 min-w-[90px] sm:min-w-[110px] md:min-w-[120px] flex-shrink-0 ${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 ring-2 ring-primary/50"
                  : "bg-card hover:bg-accent hover:shadow-lg border-2 border-border/50 hover:border-primary/30"
              }`}
            >
              <div className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full transition-all duration-300 ${
                activeCategory === category.id 
                  ? "bg-primary-foreground/20 group-hover:scale-110" 
                  : "bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110"
              }`}>
                <div className="[&>svg]:w-6 [&>svg]:h-6 sm:[&>svg]:w-7 sm:[&>svg]:h-7 md:[&>svg]:w-8 md:[&>svg]:h-8">
                  {category.icon}
                </div>
              </div>
              <span className="font-bold text-xs sm:text-sm tracking-wide whitespace-nowrap">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
