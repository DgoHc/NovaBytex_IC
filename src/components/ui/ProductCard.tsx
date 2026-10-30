"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Heart, Check } from "lucide-react";
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
  const [added, setAdded] = useState(false);

  const isLibrary = product.type === "library";
  const isDark = variant === "dark";
  const isFav = isInWishlist(product.id);
  const hasDiscount = typeof product.previousPrice === "number" && product.previousPrice > product.price;

  // Detección de Adobe Acrobat PRO DC para parche temporal de encuadre
  const isAdobeAcrobatDC = product.name?.toLowerCase().includes("adobe acrobat pro dc");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;

    addToCart({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image,
    });

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  // Formato de precio: sin decimales si es entero ("S/ 60"), o 2 decimales si tiene centavos ("S/ 25.50")
  const formatPrice = (val: number) => {
    return Number.isInteger(val)
      ? `S/ ${val.toLocaleString("es-PE")}`
      : `S/ ${val.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <motion.div
      initial={mounted ? { opacity: 0, y: 16 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="min-w-0 w-full h-full flex"
    >
      <Link
        href={`/productos/${product.id}`}
        className={cn(
          "w-full h-full flex flex-col justify-between rounded-2xl overflow-hidden group transition-all duration-200 p-2.5 sm:p-3 hover:-translate-y-0.5",
          isDark
            ? "bg-slate-900 border border-slate-800/80 hover:border-blue-500/60 shadow-sm hover:shadow-lg hover:shadow-blue-500/10"
            : isLibrary
              ? "bg-white border border-[#e8e2d8] hover:border-amber-700/40 shadow-sm hover:shadow-md"
              : "bg-white border border-slate-200/80 hover:border-blue-300 shadow-sm hover:shadow-md hover:shadow-blue-600/5"
        )}
      >
        {/* Zona de imagen en recuadro blanco con esquinas redondeadas: aspect 1/1, máx. 258px, padding 16px, object-fit contain */}
        <div className="relative w-full aspect-square max-h-[258px] rounded-xl overflow-hidden bg-white flex items-center justify-center p-4 select-none shrink-0 transition-colors">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              style={isAdobeAcrobatDC ? { objectPosition: "center", clipPath: "inset(0 8% 0 0)" } : undefined}
              className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.04]"
            />
          ) : (
            <ProductImage
              type={product.imageType}
              name={product.name}
              className="w-full h-full bg-transparent border-0 transition-transform duration-200 group-hover:scale-[1.04]"
            />
          )}

          {/* Badge de Descuento: pill de 24px de alto, 12px semibold, top/left 10px dentro del recuadro blanco */}
          {hasDiscount && (
            <div className="absolute top-[10px] left-[10px] z-10">
              <Badge className="h-6 px-2 rounded-md text-[12px] font-semibold tracking-wide bg-rose-600 text-white shadow-xs border-0 inline-flex items-center justify-center leading-none select-none">
                -{Math.round(((product.previousPrice! - product.price) / product.previousPrice!) * 100)}%
              </Badge>
            </div>
          )}

          {/* Corazón de Favoritos: círculo de 32px, fondo translúcido con blur, icono de 16px, top/right 10px */}
          {!isAdmin && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product);
              }}
              aria-pressed={isFav}
              aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
              className={cn(
                "absolute top-[10px] right-[10px] z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-xs border select-none backdrop-blur-md",
                isFav
                  ? "bg-rose-600 text-white border-rose-600 shadow-rose-600/30 scale-105"
                  : "bg-white/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-300 border-white/40 dark:border-slate-700/60 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-900"
              )}
            >
              <Heart
                width={16}
                height={16}
                className={cn(
                  "w-4 h-4 transition-transform",
                  isFav ? "fill-rose-500 text-white scale-110" : ""
                )}
              />
            </button>
          )}
        </div>

        {/* Contenido de la Card: Textos y Precios */}
        <div className="pt-3 px-1 flex flex-col flex-1 justify-between gap-2.5 min-w-0">
          <div className="space-y-1.5 min-w-0">
            {/* Categoría en chip nowrap + Marca sin cortar. Si no caben en una línea, la marca pasa a la siguiente */}
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 min-w-0">
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap shrink-0",
                  isDark
                    ? "bg-blue-500/10 text-blue-300"
                    : isLibrary
                      ? "bg-library-cream/80 text-library-sage-foreground"
                      : "bg-slate-100 text-slate-600"
                )}
              >
                {product.category}
              </span>

              {product.brand && (
                <span
                  className={cn(
                    "text-[12px] font-medium min-w-0 shrink-0",
                    isDark ? "text-slate-400" : "text-slate-500"
                  )}
                  title={product.brand}
                >
                  {product.brand}
                </span>
              )}
            </div>

            {/* Título en máximo 2 líneas */}
            <h3
              className={cn(
                "font-semibold text-sm sm:text-[15px] leading-snug line-clamp-2 text-left min-h-[40px] transition-colors duration-200 min-w-0",
                isDark
                  ? "text-white group-hover:text-blue-400"
                  : isLibrary
                    ? "text-slate-900 group-hover:text-amber-900"
                    : "text-slate-900 group-hover:text-blue-700"
              )}
              title={product.name}
            >
              {product.name}
            </h3>

            {/* Descripción en máximo 2 líneas */}
            <p
              className={cn(
                "text-xs leading-relaxed line-clamp-2 text-left min-w-0",
                isDark ? "text-slate-300" : "text-slate-600"
              )}
            >
              {product.description}
            </p>
          </div>

          {/* Bloque Inferior Original: Precio + Precio Anterior + Punto de Stock Verde + Botón "+" de 40px */}
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
                {/* Precio actual: sin decimales si es entero */}
                <span
                  className={cn(
                    "font-semibold text-[16px] sm:text-[18px] tracking-tight tabular-nums whitespace-nowrap",
                    isDark ? "text-white" : "text-slate-900"
                  )}
                >
                  {formatPrice(product.price)}
                </span>

                {/* Precio anterior tachado en 13px gris */}
                {hasDiscount && (
                  <span className="text-[13px] font-medium text-slate-400 line-through tabular-nums whitespace-nowrap">
                    {formatPrice(product.previousPrice!)}
                  </span>
                )}

                {/* Punto verde de stock con halo suave y accesibilidad */}
                {product.inStock ? (
                  <span
                    className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 ml-0.5 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                    title="En stock"
                    aria-label="En stock"
                  />
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 ml-1 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    Agotado
                  </span>
                )}
              </div>
            </div>

            {/* Botón "+" de 40px con icono de 16px, alineado al centro */}
            <Button
              type="button"
              size="icon"
              disabled={!product.inStock}
              onClick={handleAddToCart}
              aria-label={product.inStock ? (added ? "Agregado al carrito" : "Agregar al carrito") : "Producto agotado"}
              className={cn(
                "w-10 h-10 rounded-xl shadow-md transition-all duration-200 shrink-0 flex items-center justify-center border-0",
                product.inStock ? "hover:scale-105 active:scale-95 cursor-pointer" : "opacity-35 cursor-not-allowed shadow-none",
                added
                  ? "bg-emerald-600 text-white shadow-emerald-600/20"
                  : isDark
                    ? "bg-[#2563eb] hover:bg-blue-600 text-white shadow-blue-500/20"
                    : isLibrary
                      ? "bg-slate-900 hover:bg-blue-800 text-white shadow-slate-900/10"
                      : "bg-blue-700 hover:bg-blue-800 text-white shadow-blue-700/20"
              )}
            >
              {added ? (
                <Check width={16} height={16} className="w-4 h-4 stroke-[2.5] text-white animate-in zoom-in-75 duration-200" />
              ) : (
                <Plus width={16} height={16} className="w-4 h-4 stroke-[2.5]" />
              )}
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
