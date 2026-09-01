"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Star } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: "light" | "dark";
  showTopBadge?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index = 0,
  variant = "light",
  showTopBadge = true,
}) => {
  const { addToCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      image: "",
    });
  };

  const isDark = variant === "dark";

  return (
    <motion.div
      initial={mounted ? { opacity: 0, y: 24 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="flex min-w-0 h-full w-full"
    >
      <Link
        href={`/productos/${product.id}`}
        className={cn(
          "w-full flex flex-col rounded-[24px] overflow-hidden group transition-all duration-300",
          isDark
            ? "bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 shadow-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
            : "bg-white border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-[0_8px_30px_rgba(30,64,175,0.08)]"
        )}
      >
        <div className="relative p-4">
          <div
            className={cn(
              "relative w-full aspect-[1/1] rounded-[20px] overflow-hidden",
              isDark ? "bg-slate-950" : "bg-slate-50"
            )}
          >
            <div className="absolute inset-0 transition-transform duration-[320ms] ease-out group-hover:scale-[1.03]">
              <ProductImage type={product.imageType} name={product.name} />
            </div>

            {showTopBadge && product.featured && (
              <div className="absolute top-3 left-3 z-10">
                <Badge
                  className={cn(
                    "h-6 px-2.5 gap-1 text-[10px] font-semibold",
                    isDark
                      ? "bg-amber-500/90 text-slate-950"
                      : "bg-amber-500 text-white"
                  )}
                >
                  <Star className="w-3 h-3 fill-current" /> TOP
                </Badge>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 pb-5 pt-1 flex flex-col flex-1 justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] font-medium h-5 px-2",
                  isDark
                    ? "border-blue-500/30 text-blue-400"
                    : "border-blue-100 text-blue-700 bg-blue-50/50"
                )}
              >
                {product.category}
              </Badge>
              <span
                className={cn(
                  "text-[11px] font-medium tracking-wide",
                  isDark ? "text-slate-500" : "text-slate-400"
                )}
              >
                {product.brand}
              </span>
            </div>

            <h3
              className={cn(
                "font-semibold leading-[1.25] line-clamp-2 text-left text-[17px]",
                isDark
                  ? "text-white group-hover:text-blue-400"
                  : "text-slate-900 group-hover:text-blue-700",
                "transition-colors duration-200"
              )}
              style={{ minHeight: "40px" }}
            >
              {product.name}
            </h3>

            <p
              className={cn(
                "font-normal leading-[1.5] line-clamp-2 text-[14px] text-left",
                isDark ? "text-slate-400" : "text-slate-500"
              )}
              style={{ minHeight: "40px" }}
            >
              {product.description}
            </p>
          </div>

          <div className="mt-5 flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span
                className={cn(
                  "block text-[11px] font-medium mb-0.5 tracking-wide uppercase",
                  isDark ? "text-slate-600" : "text-slate-400"
                )}
              >
                Precio
              </span>
              <span
                className={cn(
                  "font-bold text-[18px] tracking-tight",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                S/ {product.price.toLocaleString("es-PE")}
              </span>
              {product.inStock && (
                <span
                  className={cn(
                    "block text-[10px] font-medium mt-1",
                    isDark ? "text-emerald-400" : "text-emerald-700"
                  )}
                >
                  En Stock
                </span>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <Button
                type="button"
                size="icon"
                onClick={handleAddToCart}
                aria-label="Agregar al carrito"
                className={cn(
                  "w-11 h-11 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95",
                  isDark
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                    : "bg-blue-700 hover:bg-blue-800 text-white shadow-blue-700/25"
                )}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
