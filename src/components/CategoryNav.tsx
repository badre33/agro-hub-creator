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
      <div className="py-3 sm:py-4 md:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3 md:gap-4 sm:justify-center sm:flex-wrap">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`group flex flex-col items-center gap-1.5 sm:gap-2 md:gap-3 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300 hover:scale-105 ${
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-2 ring-primary/50"
                    : "bg-card hover:bg-accent hover:shadow-md border-2 border-border/50 hover:border-primary/30"
                }`}
              >
                <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full transition-all duration-300 ${
                  activeCategory === category.id 
                    ? "bg-primary-foreground/20 group-hover:scale-110" 
                    : "bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110"
                }`}>
                  <div className="[&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6 md:[&>svg]:w-7 md:[&>svg]:h-7">
                    {category.icon}
                  </div>
                </div>
                <span className="font-bold text-[10px] sm:text-xs md:text-sm tracking-wide">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
