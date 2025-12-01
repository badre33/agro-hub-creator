import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "@/components/ProductCard";

interface CartContextType {
  cart: Record<number, number>;
  setCart: (cart: Record<number, number>) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  getCartItems: (allProducts: Product[]) => CartItem[];
  clearCart: () => void;
  cartCount: number;
}

export interface CartItem extends Product {
  quantity: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Record<number, number>>({});

  const updateQuantity = (productId: number, quantity: number) => {
    setCart((prev) => ({
      ...prev,
      [productId]: quantity,
    }));
  };

  const getCartItems = (allProducts: Product[]): CartItem[] => {
    return Object.entries(cart)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = allProducts.find((p) => p.id === parseInt(productId));
        if (!product) return null;
        return {
          ...product,
          quantity,
          total: product.price * quantity,
        };
      })
      .filter((item): item is CartItem => item !== null);
  };

  const clearCart = () => {
    setCart({});
  };

  const cartCount = Object.values(cart).filter((qty) => qty > 0).length;

  return (
    <CartContext.Provider
      value={{ cart, setCart, updateQuantity, getCartItems, clearCart, cartCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
