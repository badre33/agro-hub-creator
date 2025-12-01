import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import placeholderImg from "@/assets/product-placeholder.jpg";

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  unit: string;
}

interface ProductCardProps {
  product: Product;
  onQuantityChange: (productId: number, quantity: number) => void;
}

export const ProductCard = ({ product, onQuantityChange }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const handleIncrement = () => {
    const newQuantity = quantity + 0.5;
    setQuantity(newQuantity);
    onQuantityChange(product.id, newQuantity);
    
    // Trigger animation
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 600);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      const newQuantity = quantity - 0.5;
      setQuantity(newQuantity);
      onQuantityChange(product.id, newQuantity);
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in hover:scale-[1.02] sm:hover:scale-[1.03] border-2 hover:border-primary/30 relative">
      <CardContent className="p-0">
        <div className="aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50 relative flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ${
              isAdding ? 'animate-[scale-in_0.3s_ease-out]' : ''
            }`}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = placeholderImg;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {isAdding && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-primary text-primary-foreground rounded-full p-3 animate-[scale-in_0.3s_ease-out] shadow-lg">
                <Plus className="h-6 w-6" />
              </div>
            </div>
          )}
        </div>
        <div className="p-2 sm:p-3 md:p-4">
          <h3 className="font-bold text-sm sm:text-base md:text-lg mb-1 sm:mb-2 group-hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
          <div className="flex items-baseline gap-1">
            <p className="text-primary font-bold text-base sm:text-lg md:text-xl">{product.price.toFixed(2)} DH</p>
            <span className="text-muted-foreground text-xs sm:text-sm">/{product.unit}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-2 sm:p-3 md:p-4 pt-0">
        <div className="flex items-center justify-between w-full gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDecrement}
            disabled={quantity === 0}
            className="rounded-full hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 flex-shrink-0"
          >
            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <div className="flex flex-col items-center min-w-[2rem] sm:min-w-[3rem]">
            <span className="font-bold text-base sm:text-lg text-center">
              {quantity}
            </span>
            {quantity > 0 && (
              <span className="text-[10px] sm:text-xs text-muted-foreground">{product.unit}</span>
            )}
          </div>
          <Button
            size="icon"
            onClick={handleIncrement}
            className={`rounded-full hover:shadow-lg hover:scale-110 transition-all h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 flex-shrink-0 ${
              isAdding ? 'scale-90' : ''
            }`}
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
