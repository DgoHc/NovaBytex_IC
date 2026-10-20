"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Product } from "@/lib/products";
import { useCatalog } from "@/contexts/CatalogContext";

const STORAGE_KEY = "nova:wishlist:v1";

interface WishlistContextType {
  wishlistIds: number[];
  wishlistItems: Product[];
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (product: Product) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { products, pushToast } = useCatalog();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setWishlistIds(parsed);
        }
      }
    } catch {
      // ignore
    } finally {
      setHydrated(true);
    }
  }, []);

  // Save to localStorage
  const saveWishlist = (ids: number[]) => {
    setWishlistIds(ids);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
      } catch {
        // ignore
      }
    }
  };

  const isInWishlist = (productId: number): boolean => {
    return wishlistIds.includes(productId);
  };

  const addToWishlist = (product: Product) => {
    if (!isInWishlist(product.id)) {
      const next = [...wishlistIds, product.id];
      saveWishlist(next);
      pushToast({
        title: "Agregado a Deseados",
        description: `«${product.name}» se guardó en tu lista de deseos.`,
        variant: "success",
      });
    }
  };

  const removeFromWishlist = (productId: number) => {
    const next = wishlistIds.filter((id) => id !== productId);
    saveWishlist(next);
    pushToast({
      title: "Eliminado de Deseados",
      description: "Producto retirado de tu lista de deseos.",
      variant: "info",
    });
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const clearWishlist = () => {
    saveWishlist([]);
  };

  // Get matching product objects
  const wishlistItems = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistItems,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        wishlistCount: wishlistIds.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
