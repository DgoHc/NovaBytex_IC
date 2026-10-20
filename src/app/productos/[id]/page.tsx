"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  ChevronLeft,
  Check,
  ShoppingCart,
  ShieldCheck,
  Truck,
  Clock,
  AlertTriangle,
  Star,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useCatalog } from "@/contexts/CatalogContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { PRODUCTS_DATA, type Product, LICENSE_CATEGORIES } from "@/lib/products";
import { ProductImage } from "@/components/ui/ProductImage";
import { ProductCard } from "@/components/ui/ProductCard";
import { cn } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams();
  const { products, hydrated, findById } = useCatalog();
  const { isAdmin } = useAuth();
  const [ready, setReady] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const productId = Number(params?.id);
  let product: Product | undefined = hydrated
    ? findById(productId)
    : undefined;
  if (!product) product = PRODUCTS_DATA.find((p) => p.id === productId);
  if (!product) product = PRODUCTS_DATA[0];

  useEffect(() => {
    if (hydrated) setReady(true);
  }, [hydrated]);

  const isFav = product ? isInWishlist(product.id) : false;

  const galleryViews = React.useMemo(() => {
    if (!product) return [];

    // Para licencias y suscripciones digitales no mostramos tira de perspectivas
    const isLicenseProduct =
      product.techSubtype === "license" ||
      LICENSE_CATEGORIES.includes(product.category);

    if (isLicenseProduct) {
      return [
        {
          id: "main",
          image: product.image || "",
        },
      ];
    }

    const customGallery = product.gallery && product.gallery.length > 0 ? product.gallery : [];
    
    if (customGallery.length > 0) {
      return [
        {
          id: "main",
          image: product.image,
        },
        ...customGallery.map((imgUrl, i) => ({
          id: `custom-${i}`,
          image: imgUrl,
        })),
      ];
    }

    return [
      {
        id: "front",
        image: product.image || "",
      },
      {
        id: "angle",
        image: product.image || "",
      },
      {
        id: "details",
        image: product.image || "",
      },
    ];
  }, [product]);

  const currentView = galleryViews[activeImageIndex] || galleryViews[0];

  const isLibrary = product?.type === "library";
  const hasDiscount =
    typeof product?.previousPrice === "number" &&
    product.previousPrice > product.price;
  const canBuy = product?.available && product?.inStock;

  const openWhatsApp = () => {
    if (!product) return;
    const message = encodeURIComponent(
      `¡Hola! Quisiera cotizar el producto: ${product.name} (SKU: ${product.sku})`
    );
    window.open(`https://wa.me/51990804482?text=${message}`, "_blank");
  };

  const relatedProducts = (ready && hydrated ? products : PRODUCTS_DATA)
    .filter(
      (p) =>
        p.id !== product?.id &&
        p.type === product?.type &&
        p.available !== false &&
        (p.category === product?.category || p.brand === product?.brand)
    )
    .slice(0, 3);

  return (
    <section
      className={cn(
        "py-10 lg:py-16 min-h-screen pb-28",
        isLibrary ? "bg-[hsl(var(--library-paper))] text-slate-900" : "bg-slate-950 text-white"
      )}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Enlace Volver */}
        <Link
          href={isLibrary ? "/libreria" : "/productos"}
          className={cn(
            "inline-flex items-center gap-1.5 font-medium mb-6 transition-colors text-sm",
            isLibrary
              ? "text-slate-600 hover:text-library-sage-foreground"
              : "text-slate-400 hover:text-blue-400"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          {isLibrary ? "Volver a Librería" : "Volver al Catálogo"}
        </Link>

        {/* Alerta de no disponible */}
        {!product?.available && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-amber-900">
                Producto no disponible temporalmente
              </p>
              <p className="text-[13px] text-amber-800/90 leading-snug mt-0.5">
                Este artículo está inactivo o fuera de stock. Puedes pedir una
                cotización por WhatsApp o explorar productos relacionados.
              </p>
            </div>
          </motion.div>
        )}

        {/* Cuadrícula Principal de Producto */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 items-start">
          {/* ========================================================= */}
          {/* COLUMNA IZQUIERDA: IMAGEN & MINIATURAS                   */}
          {/* ========================================================= */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-6"
          >
            <div
              className={cn(
                "rounded-2xl border p-4 sm:p-6 shadow-xl relative overflow-hidden",
                isLibrary
                  ? "bg-white border-library-beige/80"
                  : "bg-gradient-to-b from-slate-900/80 to-slate-950 border-slate-800"
              )}
            >
              {/* Contenedor de la Imagen Principal (~80% del área, centrada, sin fondo duro) */}
              <div className="w-full h-72 sm:h-96 rounded-xl flex items-center justify-center relative overflow-hidden">
                {/* Degradado oscuro sutil detrás de la caja */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)] pointer-events-none" />
                {currentView?.image || product.image ? (
                  <img
                    src={currentView?.image || product.image}
                    alt={product.name}
                    className="max-h-[85%] max-w-[85%] object-contain rounded-2xl shadow-2xl transition-transform duration-300 hover:scale-105 relative z-10"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-4 relative z-10">
                    <ProductImage
                      type={product.imageType}
                      name={product.name}
                      className="h-full bg-transparent border-0"
                    />
                  </div>
                )}
              </div>

              {/* Tira de Miniaturas (Solo miniaturas con borde azul en la activa, sin texto ni encabezado) */}
              {galleryViews.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pt-4 border-t border-slate-800/60 no-scrollbar justify-start">
                  {galleryViews.map((view, idx) => {
                    const isActive = activeImageIndex === idx;
                    return (
                      <button
                        key={view.id}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        aria-label={`Ver imagen ${idx + 1}`}
                        className={cn(
                          "relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all p-1 flex items-center justify-center bg-slate-900/60 cursor-pointer focus:outline-none",
                          isActive
                            ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md scale-105"
                            : "border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-100"
                        )}
                      >
                        {view.image ? (
                          <img
                            src={view.image}
                            alt=""
                            className="w-full h-full object-contain rounded-lg"
                          />
                        ) : (
                          <ProductImage
                            type={product.imageType}
                            name={product.name}
                            className="w-full h-full bg-transparent border-0"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Beneficios Inferiores */}
              <div
                className={cn(
                  "grid grid-cols-3 gap-3 mt-5 pt-5 border-t text-center",
                  isLibrary ? "border-library-beige/70" : "border-slate-800/80"
                )}
              >
                <div className="flex flex-col items-center">
                  <ShieldCheck
                    className={cn(
                      "w-4 h-4 mb-1",
                      isLibrary ? "text-library-sage-foreground" : "text-blue-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      isLibrary ? "text-slate-800" : "text-slate-200"
                    )}
                  >
                    Garantía Directa
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Respaldo de Fábrica
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <Truck
                    className={cn(
                      "w-4 h-4 mb-1",
                      isLibrary ? "text-library-terracotta" : "text-emerald-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      isLibrary ? "text-slate-800" : "text-slate-200"
                    )}
                  >
                    Envíos a Todo el Perú
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Despacho en 24h
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <Clock
                    className={cn(
                      "w-4 h-4 mb-1",
                      isLibrary ? "text-library-sage-foreground" : "text-indigo-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      isLibrary ? "text-slate-800" : "text-slate-200"
                    )}
                  >
                    Soporte &amp; Atención
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Post-Venta Rápida
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ========================================================= */}
          {/* COLUMNA DERECHA: INFORMACIÓN, PRECIO, BOTONES & FICHA     */}
          {/* ========================================================= */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="lg:col-span-6 space-y-4"
          >
            {/* 1. Etiquetas Superiores Unificadas (Misma altura h-6, mismo radio rounded-lg, mismo tamaño text-xs) */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={cn(
                  "h-6 px-2.5 rounded-lg text-xs font-semibold border flex items-center leading-none",
                  isLibrary
                    ? "border-library-sage/70 text-library-sage-foreground bg-library-sage/25"
                    : "border-blue-500/30 text-blue-400 bg-blue-500/10"
                )}
              >
                {product.category}
              </Badge>

              <Badge
                className={cn(
                  "h-6 px-2.5 rounded-lg text-xs font-semibold border flex items-center leading-none",
                  isLibrary
                    ? "bg-library-cream text-slate-800 border-library-beige/80"
                    : "bg-slate-800/90 text-slate-200 border-slate-700"
                )}
              >
                {product.brand}
              </Badge>

              {product.featured && (
                <Badge
                  title="Producto Destacado"
                  className={cn(
                    "h-6 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center leading-none",
                    isLibrary
                      ? "bg-library-terracotta text-white border-library-terracotta"
                      : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  )}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </Badge>
              )}

              {product?.inStock ? (
                <Badge
                  title="En Stock"
                  className={cn(
                    "h-6 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center leading-none",
                    isLibrary
                      ? "bg-library-sage/30 text-library-sage-foreground border-library-sage/50"
                      : "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
                  )}
                >
                  {/* Solo punto verde pequeño */}
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                </Badge>
              ) : (
                <Badge
                  title="Agotado"
                  className="h-6 px-2 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center leading-none"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                </Badge>
              )}
            </div>

            {/* 2. Título (Único con tipografía Serif) */}
            <h1
              className={cn(
                "text-2xl sm:text-3xl lg:text-4xl leading-tight tracking-[-0.015em]",
                isLibrary
                  ? "font-bodoni text-slate-900"
                  : "font-editorial text-white"
              )}
            >
              {product.name}
            </h1>

            {/* 3. Bloque de Precio en UNA SOLA LÍNEA */}
            <div className="flex items-baseline gap-2.5 sm:gap-3 flex-wrap pt-0.5">
              {/* Precio grande y en negrita (mayor peso visual) */}
              <span
                className={cn(
                  "text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none",
                  isLibrary ? "text-slate-900" : "text-white"
                )}
              >
                S/ {product.price.toLocaleString("es-PE")}
              </span>

              {/* Precio tachado con más contraste */}
              {hasDiscount && (
                <>
                  <span
                    className={cn(
                      "text-base sm:text-lg font-semibold line-through",
                      isLibrary ? "text-slate-400" : "text-slate-400"
                    )}
                  >
                    S/ {product.previousPrice!.toLocaleString("es-PE")}
                  </span>

                  {/* Badge de descuento pegado al precio */}
                  <Badge className="h-5 px-1.5 rounded text-[11px] font-black bg-rose-500 text-white border-0 flex items-center leading-none">
                    -{Math.round(((product.previousPrice! - product.price) / product.previousPrice!) * 100)}% OFF
                  </Badge>
                </>
              )}
            </div>

            {/* 4. Descripción con alto contraste (WCAG AA, mínimo 14px) */}
            <p
              className={cn(
                "text-sm sm:text-base leading-relaxed pt-1",
                isLibrary ? "text-slate-700" : "text-slate-200"
              )}
            >
              {product.fullDescription || product.description}
            </p>

            {/* 5. Bloque de Botones (Misma altura, mismo radio, mismo ancho total exacto) */}
            <div className="pt-2 space-y-2.5 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {/* Botón Principal: Sólido Azul */}
                <Button
                  disabled={!canBuy}
                  className={cn(
                    "w-full h-12 text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2",
                    isLibrary
                      ? "bg-slate-900 hover:bg-blue-800 text-white shadow-slate-900/15 disabled:opacity-50"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25 disabled:opacity-50"
                  )}
                  onClick={() => {
                    if (!canBuy) return;
                    addToCart({
                      id: product.id,
                      name: product.name,
                      category: product.category,
                      price: product.price,
                      image: product.image,
                    });
                  }}
                >
                  <ShoppingCart className="w-4 h-4 shrink-0" />
                  <span>
                    {canBuy
                      ? "Agregar al Carrito"
                      : !product.available
                      ? "No disponible"
                      : "Sin stock"}
                  </span>
                </Button>

                {/* Botón Secundario: Borde Verde visible y texto verde brillante */}
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 border-2",
                    isLibrary
                      ? "border-emerald-600 text-emerald-800 hover:bg-emerald-50 bg-white"
                      : "border-emerald-500 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/40 hover:text-emerald-300 shadow-sm"
                  )}
                  onClick={openWhatsApp}
                >
                  <MessageCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>
                    {canBuy ? "Cotización por WhatsApp" : "Consultar disponibilidad"}
                  </span>
                </Button>
              </div>

              {/* Guardar en Deseados */}
              {!isAdmin && (
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={cn(
                    "w-full h-9 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors",
                    isFav
                      ? "bg-rose-950/30 border-rose-500/40 text-rose-300"
                      : isLibrary
                      ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                      : "border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200"
                  )}
                >
                  <Heart className={cn("w-3.5 h-3.5", isFav && "fill-current text-rose-500")} />
                  <span>{isFav ? "Guardado en Lista de Deseados" : "Guardar en Lista de Deseados"}</span>
                </button>
              )}
            </div>

            {/* 6. Ficha Técnica & Especificaciones (Asomada más arriba, sin punto azul decorativo) */}
            <Card
              className={cn(
                "p-5 space-y-4 rounded-2xl border mt-2",
                isLibrary
                  ? "bg-white border-library-beige/80"
                  : "bg-slate-900/60 border-slate-800"
              )}
            >
              <h3
                className={cn(
                  "text-sm sm:text-base font-bold border-b pb-3",
                  isLibrary
                    ? "text-slate-900 border-library-beige/70"
                    : "text-white border-slate-800"
                )}
              >
                Ficha Técnica &amp; Especificaciones
              </h3>

              <ul className="space-y-3">
                {(product.specifications ?? []).map((spec, index) => (
                  <li
                    key={index}
                    className={cn(
                      "flex items-start gap-2.5 text-sm leading-relaxed",
                      isLibrary ? "text-slate-700" : "text-slate-200"
                    )}
                  >
                    <div
                      className={cn(
                        "p-1 rounded-md shrink-0 mt-0.5",
                        isLibrary
                          ? "bg-library-sage/25 text-library-sage-foreground"
                          : "bg-blue-500/15 text-blue-400"
                      )}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{spec}</span>
                  </li>
                ))}

                {(product.features ?? []).length > 0 && (
                  <>
                    <li
                      className={cn(
                        "pt-2 mt-1 border-t text-[11px] font-bold uppercase tracking-wider",
                        isLibrary
                          ? "text-slate-500 border-library-beige/60"
                          : "text-slate-400 border-slate-800"
                      )}
                    >
                      Características destacadas
                    </li>
                    {(product.features ?? []).map((feature, index) => (
                      <li
                        key={`feat-${index}`}
                        className={cn(
                          "flex items-start gap-2.5 text-sm leading-relaxed",
                          isLibrary ? "text-slate-700" : "text-slate-200"
                        )}
                      >
                        <div
                          className={cn(
                            "p-1 rounded-md shrink-0 mt-0.5",
                            isLibrary
                              ? "bg-library-terracotta/20 text-library-terracotta"
                              : "bg-cyan-500/15 text-cyan-300"
                          )}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </>
                )}
              </ul>

              <div
                className={cn(
                  "pt-2 text-xs font-medium p-3.5 rounded-xl border",
                  isLibrary
                    ? "text-library-sage-foreground bg-library-cream/70 border-library-beige/70"
                    : "text-blue-300 bg-slate-950/70 border-slate-800/80"
                )}
              >
                <strong className="text-white">Garantía Oficial:</strong> {product.warranty}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Productos Relacionados */}
        {relatedProducts.length > 0 && (
          <div
            className={cn(
              "pt-10 border-t space-y-8",
              isLibrary ? "border-library-beige/60" : "border-slate-800"
            )}
          >
            <div className="text-center md:text-left">
              <h2
                className={cn(
                  "text-2xl md:text-3xl leading-[1.1] tracking-[-0.015em]",
                  isLibrary
                    ? "font-bodoni text-slate-900"
                    : "font-editorial text-white"
                )}
              >
                Productos Relacionados
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((rel, index) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  index={index}
                  variant={isLibrary ? "light" : "dark"}
                  showTopBadge={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
