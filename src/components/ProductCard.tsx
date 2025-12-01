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

  const handleIncrement = () => {
    const newQuantity = quantity + 0.5;
    setQuantity(newQuantity);
    onQuantityChange(product.id, newQuantity);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      const newQuantity = quantity - 0.5;
      setQuantity(newQuantity);
      onQuantityChange(product.id, newQuantity);
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in hover:scale-[1.03] border-2 hover:border-primary/30">
      <CardContent className="p-0">
        <div className="aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50 relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = placeholderImg;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
          <div className="flex items-baseline gap-1">
            <p className="text-primary font-bold text-xl">{product.price.toFixed(2)} DH</p>
            <span className="text-muted-foreground text-sm">/{product.unit}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDecrement}
            disabled={quantity === 0}
            className="rounded-full hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg min-w-[3rem] text-center">
              {quantity}
            </span>
            {quantity > 0 && (
              <span className="text-xs text-muted-foreground">{product.unit}</span>
            )}
          </div>
          <Button
            size="icon"
            onClick={handleIncrement}
            className="rounded-full hover:shadow-lg hover:scale-110 transition-all"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
