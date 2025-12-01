import { Carrot, Apple, Leaf, Salad, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 10);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 200;
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;
    
    container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  };

  return (
    <nav className="border-b bg-gradient-to-b from-card to-background/50 backdrop-blur-sm sticky top-[57px] sm:top-[65px] md:top-[81px] z-40">
      <div className="py-4 sm:py-6 md:py-8 relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('left')}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-card/95 backdrop-blur-sm shadow-lg hover:bg-card border-2 border-border sm:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('right')}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-card/95 backdrop-blur-sm shadow-lg hover:bg-card border-2 border-border sm:hidden"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}

        {/* Gradient Fade Effects */}
        {showLeftArrow && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none z-[5] sm:hidden" />
        )}
        {showRightArrow && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none z-[5] sm:hidden" />
        )}

        <div 
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="overflow-x-auto scrollbar-hide"
        >
          <div className="flex gap-3 sm:gap-4 justify-start sm:justify-center px-3 sm:px-4 sm:flex-wrap min-w-max sm:min-w-0 mx-auto sm:container">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`group flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 w-[90px] sm:w-[110px] md:w-[120px] flex-shrink-0 ${
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
      </div>
    </nav>
  );
};
