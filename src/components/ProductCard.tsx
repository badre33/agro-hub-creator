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
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in hover:scale-[1.02]">
      <CardContent className="p-0">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = placeholderImg;
            }}
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
          <p className="text-primary font-bold text-xl">{product.price.toFixed(2)}DH/{product.unit}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDecrement}
            disabled={quantity === 0}
            className="rounded-full"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-lg min-w-[3rem] text-center">
            {quantity}
          </span>
          <Button
            size="icon"
            onClick={handleIncrement}
            className="rounded-full"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
