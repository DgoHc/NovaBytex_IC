"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Heart } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
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
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAdmin } = useAuth();
  const [mounted, setMounted] = useState(false);
  const isLibrary = product.type === "library";
  const isFav = isInWishlist(product.id);

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
      initial={mounted ? { opacity: 0, y: 20 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-w-0 h-full w-full"
    >
      <Link
        href={`/productos/${product.id}`}
        className={cn(
          "w-full h-full flex flex-col justify-between rounded-2xl overflow-hidden group transition-all duration-300 p-2.5 sm:p-3",
          isDark
            ? "bg-slate-900 border border-slate-800/80 hover:border-blue-500/60 shadow-md hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
            : isLibrary
              ? "bg-white border border-library-beige/60 hover:border-library-sage/60 shadow-sm hover:shadow-[0_12px_30px_hsla(145,30%,50%,0.10)] hover:-translate-y-1"
              : "bg-white border border-slate-200/80 hover:border-blue-200 shadow-sm hover:shadow-[0_12px_30px_rgba(30,64,175,0.08)] hover:-translate-y-1"
        )}
      >
        {/* Contenedor Cuadrado de la Imagen (Aspect 1/1, fondo claro sólido, sin marco negro extra) */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white flex items-center justify-center p-3.5 sm:p-4 select-none shrink-0">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <ProductImage
              type={product.imageType}
              name={product.name}
              className="w-full h-full bg-transparent border-0"
            />
          )}

          {/* Badge de Descuento: Arriba a la izquierda, margen 8px, rojo sólido y texto blanco */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 z-10">
              <Badge className="h-6 px-2 rounded-md text-[10.5px] font-black tracking-wide bg-rose-600 text-white shadow-xs border-0 inline-flex items-center justify-center leading-none select-none">
                -{Math.round(((product.previousPrice! - product.price) / product.previousPrice!) * 100)}%
              </Badge>
            </div>
          )}

          {/* Corazón: Mismo tamaño y proporción del recuadro de descuento (h-6 w-6 rounded-md) */}
          {!isAdmin && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product);
              }}
              aria-label={isFav ? "Quitar de deseados" : "Agregar a deseados"}
              className={cn(
                "absolute top-2 right-2 z-10 h-6 w-6 rounded-md flex items-center justify-center transition-all duration-200 shadow-xs border select-none",
                isFav
                  ? "bg-rose-600 text-white border-rose-600 shadow-rose-600/30 scale-105"
                  : "bg-slate-900/80 backdrop-blur-sm text-slate-200 border-slate-700/60 hover:bg-slate-900 hover:text-rose-400 hover:border-slate-600"
              )}
            >
              <Heart
                className={cn(
                  "w-3.5 h-3.5 transition-transform",
                  isFav ? "fill-current scale-110" : ""
                )}
              />
            </button>
          )}
        </div>

        {/* Contenido de la Card: Textos y Precios */}
        <div className="pt-3 px-1 flex flex-col flex-1 justify-between gap-3">
          <div className="space-y-1.5">
            {/* Etiqueta de Categoría Discreta */}
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-medium w-fit",
                isDark
                  ? "bg-blue-500/10 text-blue-300"
                  : isLibrary
                    ? "bg-library-cream/80 text-library-sage-foreground"
                    : "bg-slate-100 text-slate-600"
              )}
            >
              {product.category}
            </span>

            {/* Título en máximo 2 líneas, blanco, peso 600 */}
            <h3
              className={cn(
                "font-semibold text-sm sm:text-[15px] leading-snug line-clamp-2 text-left min-h-[40px] transition-colors duration-200",
                isDark
                  ? "text-white group-hover:text-blue-400"
                  : isLibrary
                    ? "text-slate-900 group-hover:text-library-sage-foreground"
                    : "text-slate-900 group-hover:text-blue-700"
              )}
            >
              {product.name}
            </h3>

            {/* Descripción en máximo 2 líneas con contraste claro */}
            <p
              className={cn(
                "text-xs leading-relaxed line-clamp-2 text-left",
                isDark ? "text-slate-300" : "text-slate-600"
              )}
            >
              {product.description}
            </p>
          </div>

          {/* Bloque Inferior: Precio + Punto de Stock + Botón "+" de 40px */}
          <div
            className={cn(
              "pt-2 mt-auto flex items-center justify-between gap-3 min-w-0",
              isDark
                ? "border-t border-white/[0.08]"
                : isLibrary
                  ? "border-t border-library-beige/60"
                  : "border-t border-slate-100"
            )}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Precio Principal Grande y Negrita */}
                <span
                  className={cn(
                    "font-bold text-lg sm:text-xl tracking-tight tabular-nums",
                    isDark ? "text-white" : "text-slate-900"
                  )}
                >
                  S/ {product.price.toLocaleString("es-PE")}
                </span>

                {/* Precio Tachado con Mayor Contraste */}
                {hasDiscount && (
                  <span className="text-xs font-semibold text-slate-400 line-through tabular-nums">
                    S/ {product.previousPrice!.toLocaleString("es-PE")}
                  </span>
                )}

                {/* Stock: Solo punto verde pequeño junto al precio; muestra texto únicamente cuando esté agotado */}
                {product.inStock ? (
                  <span
                    className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 ml-0.5 shadow-[0_0_6px_rgba(52,211,153,0.6)]"
                    title="En stock"
                  />
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-rose-400 ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    Agotado
                  </span>
                )}
              </div>
            </div>

            {/* Botón "+" de 40px, esquinas redondeadas, alineado al precio */}
            <Button
              type="button"
              size="icon"
              onClick={handleAddToCart}
              aria-label="Agregar al carrito"
              className={cn(
                "w-10 h-10 rounded-xl shadow-md transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center border-0",
                isDark
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25"
                  : isLibrary
                    ? "bg-slate-900 hover:bg-blue-800 text-white shadow-slate-900/10"
                    : "bg-blue-700 hover:bg-blue-800 text-white shadow-blue-700/20"
              )}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
