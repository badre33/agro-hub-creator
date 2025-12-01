import { ProductCard, Product } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  onQuantityChange: (productId: number, quantity: number) => void;
}

export const ProductGrid = ({ products, onQuantityChange }: ProductGridProps) => {
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuantityChange={onQuantityChange}
          />
        ))}
      </div>
    </div>
  );
};
