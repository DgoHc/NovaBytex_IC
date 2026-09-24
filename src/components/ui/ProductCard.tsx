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
  const isLibrary = product.type === "library";

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
      image: product.image,
    });
  };

  const isDark = variant === "dark";
  const hasDiscount = typeof product.previousPrice === "number" && product.previousPrice > product.price;

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
          "w-full flex flex-col rounded-[20px] overflow-hidden group transition-all duration-300",
          isDark
            ? "bg-slate-900/80 border border-slate-800/90 hover:border-blue-500/50 hover:bg-slate-900 shadow-md hover:shadow-[0_16px_36px_rgba(0,0,0,0.45)]"
            : isLibrary
              ? "bg-white border border-library-beige/60 hover:border-library-sage/60 shadow-sm hover:shadow-[0_12px_30px_hsla(145,30%,50%,0.10)]"
              : "bg-white border border-slate-200/80 hover:border-blue-200 shadow-sm hover:shadow-[0_12px_30px_rgba(30,64,175,0.08)]"
        )}
      >
        <div className="relative p-3 pb-1.5">
          <div
            className={cn(
              "relative w-full aspect-[1/1] rounded-[15px] overflow-hidden",
              isDark
                ? "bg-slate-950/80 border border-slate-800/60"
                : isLibrary
                  ? "library-card-image"
                  : "bg-slate-50"
            )}
          >
            <div className="absolute inset-0 transition-transform duration-300 ease-out group-hover:scale-[1.04]">
              <ProductImage type={product.imageType} name={product.name} image={product.image} />
            </div>

            {showTopBadge && product.featured && (
              <div className="absolute top-2 left-2 z-10">
                <Badge
                  className={cn(
                    "h-4.5 px-1.5 py-0 gap-1 text-[9px] font-bold tracking-tight rounded-md backdrop-blur-md shadow-xs border inline-flex items-center leading-none select-none",
                    isDark
                      ? "bg-amber-400/20 text-amber-300 border-amber-400/35"
                      : isLibrary
                        ? "bg-library-terracotta/90 text-white border-transparent"
                        : "bg-amber-500/90 text-white border-transparent"
                  )}
                >
                  <Star className="w-2 h-2 fill-current shrink-0" />
                  <span>Destacado</span>
                </Badge>
              </div>
            )}

            {hasDiscount && (
              <div className="absolute top-2 right-2 z-10">
                <Badge
                  className="h-4.5 px-1.5 py-0 text-[9px] font-black tracking-wide rounded-md bg-rose-500/90 text-white backdrop-blur-md shadow-xs border-0 inline-flex items-center leading-none select-none"
                >
                  -{Math.round(((product.previousPrice! - product.price) / product.previousPrice!) * 100)}%
                </Badge>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pb-4 pt-1 flex flex-col flex-1 justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span
                className={cn(
                  "font-bold uppercase tracking-wider text-[10.5px] truncate",
                  isDark ? "text-slate-400" : isLibrary ? "text-library-sage-foreground font-semibold" : "text-slate-500"
                )}
              >
                {product.brand}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-semibold h-4.5 px-2 rounded-md shrink-0 border",
                  isDark
                    ? "border-blue-500/30 text-blue-300 bg-blue-500/10"
                    : isLibrary
                      ? "border-library-sage/50 text-library-sage-foreground bg-library-cream/60"
                      : "border-slate-200 text-slate-600 bg-slate-50"
                )}
              >
                {product.category}
              </Badge>
            </div>

            <h3
              className={cn(
                "font-bold text-[15px] leading-snug line-clamp-2 text-left min-h-[40px] transition-colors duration-200",
                isDark
                  ? "text-white group-hover:text-blue-400"
                  : isLibrary
                    ? "text-slate-900 group-hover:text-library-sage-foreground"
                    : "text-slate-900 group-hover:text-blue-700"
              )}
            >
              {product.name}
            </h3>

            <p
              className={cn(
                "text-[12.5px] leading-snug line-clamp-1 text-left",
                isDark ? "text-slate-400/80" : "text-slate-500"
              )}
            >
              {product.description}
            </p>
          </div>

          <div className="pt-2 border-t flex items-center justify-between gap-3 min-w-0 border-slate-100 dark:border-slate-800">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span
                  className={cn(
                    "font-extrabold text-[17px] tracking-tight tabular-nums",
                    isDark ? "text-white" : "text-slate-900"
                  )}
                >
                  S/ {product.price.toLocaleString("es-PE")}
                </span>
                {hasDiscount && (
                  <span className="text-[11px] font-medium text-slate-400 line-through tabular-nums">
                    S/ {product.previousPrice!.toLocaleString("es-PE")}
                  </span>
                )}
              </div>
              <div className="mt-0.5">
                {product.inStock ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-[10.5px] font-medium",
                      isDark ? "text-emerald-400" : isLibrary ? "text-emerald-700" : "text-emerald-600"
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    En stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    Agotado
                  </span>
                )}
              </div>
            </div>

            <Button
              type="button"
              size="icon"
              onClick={handleAddToCart}
              aria-label="Agregar al carrito"
              className={cn(
                "w-9 h-9 rounded-xl shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 shrink-0",
                isDark
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                  : isLibrary
                    ? "bg-slate-900 hover:bg-blue-800 text-white shadow-slate-900/10"
                    : "bg-blue-700 hover:bg-blue-800 text-white shadow-blue-700/20"
              )}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
