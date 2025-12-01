import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

const CART_STORAGE_KEY = "broccagri_cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Record<number, number>>(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : {};
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cart]);

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
