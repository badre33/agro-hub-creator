import { ProductCard, Product } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  onQuantityChange: (productId: number, quantity: number) => void;
}

export const ProductGrid = ({ products, onQuantityChange }: ProductGridProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
