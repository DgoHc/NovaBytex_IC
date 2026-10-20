"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AVAILABLE_COUPONS, type Coupon } from "@/lib/coupons";

// Type definitions
export interface CartItem {
  id: number;
  name: string;
  category: string;
  price?: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  cartTotal: number;
  cartCount: number;
  // Coupon support
  appliedCoupon: Coupon | null;
  discountAmount: number;
  discountedSubtotal: number;
  estimatedTotal: number; // without coupon (including IGV)
  finalTotal: number; // with coupon discount (including IGV)
  availableCoupons: Coupon[];
  applyCoupon: (coupon: Coupon) => { success: boolean; message: string };
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Add item to cart
  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  // Remove item from cart
  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Update item quantity
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Toggle cart sidebar
  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  // Calculate cart subtotal
  const cartTotal = cart.reduce((total, item) => {
    const itemPrice = item.price || 0;
    return total + itemPrice * item.quantity;
  }, 0);

  // Calculate total items in cart
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Calculate discount amount based on applied coupon
  let discountAmount = 0;
  if (appliedCoupon && cartTotal > 0) {
    if (appliedCoupon.discountType === "percentage") {
      discountAmount = Math.round((cartTotal * appliedCoupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(appliedCoupon.discountValue, cartTotal);
    }
  }

  // Auto-remove or warn if cart drops to 0
  useEffect(() => {
    if (cart.length === 0 && appliedCoupon) {
      setAppliedCoupon(null);
    }
  }, [cart.length, appliedCoupon]);

  const discountedSubtotal = Math.max(0, cartTotal - discountAmount);
  const estimatedTotal = cartTotal + cartTotal * 0.18; // Subtotal + IGV
  const finalTotal = discountedSubtotal + discountedSubtotal * 0.18;

  // Apply coupon
  const applyCoupon = (coupon: Coupon): { success: boolean; message: string } => {
    if (cartTotal <= 0) {
      return { success: false, message: "Agrega productos a tu carrito antes de aplicar un cupón." };
    }
    if (coupon.minPurchase > 0 && cartTotal < coupon.minPurchase) {
      return {
        success: false,
        message: `Este cupón requiere una compra mínima de S/ ${coupon.minPurchase.toLocaleString("es-PE")}.`,
      };
    }
    setAppliedCoupon(coupon);
    return {
      success: true,
      message: `¡Cupón "${coupon.name}" aplicado con éxito!`,
    };
  };

  // Cancel / remove coupon (the coupon returns/becomes available again)
  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCart,
        cartTotal,
        cartCount,
        appliedCoupon,
        discountAmount,
        discountedSubtotal,
        estimatedTotal,
        finalTotal,
        availableCoupons: AVAILABLE_COUPONS,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
