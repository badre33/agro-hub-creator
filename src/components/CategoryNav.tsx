import { Carrot, Apple, Leaf, Salad } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  activeColor: string;
}

const categories: Category[] = [
  { 
    id: "legumes", 
    name: "Légumes", 
    icon: <Carrot className="h-8 w-8" />,
    color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
    hoverColor: "group-hover:text-emerald-700",
    activeColor: "bg-emerald-600 text-white shadow-emerald-600/30"
  },
  { 
    id: "fruits", 
    name: "Fruits", 
    icon: <Apple className="h-8 w-8" />,
    color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
    hoverColor: "group-hover:text-orange-700",
    activeColor: "bg-orange-600 text-white shadow-orange-600/30"
  },
  { 
    id: "herbes", 
    name: "Herbes", 
    icon: <Leaf className="h-8 w-8" />,
    color: "bg-lime-50 hover:bg-lime-100 border-lime-200",
    hoverColor: "group-hover:text-lime-700",
    activeColor: "bg-lime-600 text-white shadow-lime-600/30"
  },
  { 
    id: "salades", 
    name: "Salades", 
    icon: <Salad className="h-8 w-8" />,
    color: "bg-teal-50 hover:bg-teal-100 border-teal-200",
    hoverColor: "group-hover:text-teal-700",
    activeColor: "bg-teal-600 text-white shadow-teal-600/30"
  },
];

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryNav = ({ activeCategory, onCategoryChange }: CategoryNavProps) => {
  return (
    <nav className="border-b bg-gradient-to-b from-card to-background/50 backdrop-blur-sm sticky top-[57px] sm:top-[65px] md:top-[81px] z-40">
      <div className="py-2 sm:py-3">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex gap-2 justify-between sm:justify-center sm:gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`group flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 flex-1 sm:flex-initial ${
                  activeCategory === category.id
                    ? `${category.activeColor} shadow-md`
                    : `${category.color} border`
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-300 ${
                  activeCategory === category.id 
                    ? "bg-white/20" 
                    : "bg-white/50"
                }`}>
                  <div className={`[&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5 ${activeCategory !== category.id && category.hoverColor}`}>
                    {category.icon}
                  </div>
                </div>
                <span className="font-semibold text-[9px] sm:text-xs whitespace-nowrap">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
