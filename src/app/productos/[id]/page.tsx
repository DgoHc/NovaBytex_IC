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
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useCatalog } from "@/contexts/CatalogContext";
import { PRODUCTS_DATA, type Product } from "@/lib/products";
import { ProductImage } from "@/components/ui/ProductImage";
import { ProductCard } from "@/components/ui/ProductCard";
import { cn } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams();
  const { products, hydrated, findById } = useCatalog();
  const [ready, setReady] = useState(false);
  const { addToCart } = useCart();

  const productId = Number(params?.id);
  let product: Product | undefined = hydrated
    ? findById(productId)
    : undefined;
  if (!product) product = PRODUCTS_DATA.find((p) => p.id === productId);
  if (!product) product = PRODUCTS_DATA[0];

  useEffect(() => {
    if (hydrated) setReady(true);
  }, [hydrated]);

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
    window.open(`https://wa.me/51999999999?text=${message}`, "_blank");
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
        "py-14 lg:py-20 min-h-screen",
        isLibrary ? "bg-[hsl(var(--library-paper))] text-slate-900" : "bg-slate-950 text-white"
      )}
    >
      <div className="container mx-auto px-4">
        <Link
          href={isLibrary ? "/libreria" : "/productos"}
          className={cn(
            "inline-flex items-center gap-2 font-medium mb-8 transition-colors text-sm",
            isLibrary
              ? "text-slate-600 hover:text-library-sage-foreground"
              : "text-slate-400 hover:text-blue-400"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          {isLibrary ? "Volver a Librería" : "Volver al Catálogo Corporativo"}
        </Link>

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6"
          >
            <Card
              className={cn(
                "shadow-2xl p-6 rounded-[28px] relative overflow-hidden border",
                isLibrary
                  ? "bg-white border-library-beige/80 shadow-[0_25px_80px_-25px_rgba(15,23,42,0.25)]"
                  : "bg-slate-900/50 border-slate-800"
              )}
            >
              <div
                className={cn(
                  "w-full h-80 sm:h-96 rounded-[24px] overflow-hidden p-4",
                  isLibrary ? "library-card-image" : "bg-slate-950"
                )}
              >
                <ProductImage
                  type={product.imageType}
                  name={product.name}
                  image={product.image}
                  className="h-full"
                />
              </div>

              <div
                className={cn(
                  "grid grid-cols-3 gap-4 mt-6 pt-6 border-t text-center",
                  isLibrary ? "border-library-beige/70" : "border-slate-800"
                )}
              >
                <div className="flex flex-col items-center">
                  <ShieldCheck
                    className={cn(
                      "w-5 h-5 mb-1.5",
                      isLibrary ? "text-library-sage-foreground" : "text-blue-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[12px] font-semibold",
                      isLibrary ? "text-slate-800" : "text-slate-200"
                    )}
                  >
                    Garantía Directa
                  </span>
                  <span
                    className={cn(
                      "text-[10px]",
                      isLibrary ? "text-slate-500" : "text-slate-500"
                    )}
                  >
                    Respaldo de Fábrica
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <Truck
                    className={cn(
                      "w-5 h-5 mb-1.5",
                      isLibrary ? "text-library-terracotta" : "text-emerald-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[12px] font-semibold",
                      isLibrary ? "text-slate-800" : "text-slate-200"
                    )}
                  >
                    Envíos a Todo el Perú
                  </span>
                  <span
                    className={cn(
                      "text-[10px]",
                      isLibrary ? "text-slate-500" : "text-slate-500"
                    )}
                  >
                    Despacho en 24h
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <Clock
                    className={cn(
                      "w-5 h-5 mb-1.5",
                      isLibrary ? "text-library-sage-foreground" : "text-indigo-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[12px] font-semibold",
                      isLibrary ? "text-slate-800" : "text-slate-200"
                    )}
                  >
                    Soporte &amp; Atención
                  </span>
                  <span
                    className={cn(
                      "text-[10px]",
                      isLibrary ? "text-slate-500" : "text-slate-500"
                    )}
                  >
                    Post-Venta Personalizada
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-6 space-y-7"
          >
            <div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium",
                    isLibrary
                      ? "border-library-sage/70 text-library-sage-foreground bg-library-sage/25"
                      : "border-blue-500/30 text-blue-400"
                  )}
                >
                  {product.category}
                </Badge>
                <Badge
                  className={cn(
                    "text-xs font-medium",
                    isLibrary
                      ? "bg-library-cream text-slate-800 border-library-beige/80"
                      : "bg-slate-800 text-slate-300"
                  )}
                >
                  {product.brand}
                </Badge>
                {product.featured && (
                  <Badge
                    className={cn(
                      "text-[10.5px] font-bold border",
                      isLibrary
                        ? "bg-library-terracotta text-white border-library-terracotta"
                        : "bg-amber-500 text-white"
                    )}
                  >
                    <Star className="w-3 h-3 mr-1 fill-current" /> Destacado
                  </Badge>
                )}
                {product?.inStock ? (
                  <Badge
                    className={cn(
                      "text-[10.5px] font-bold border",
                      isLibrary
                        ? "bg-library-sage/30 text-library-sage-foreground border-library-sage/50"
                        : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                    )}
                  >
                    <Sparkles className="w-3 h-3 mr-1" /> En Stock
                  </Badge>
                ) : (
                  <Badge className="text-[10.5px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Agotado
                  </Badge>
                )}
                <span
                  className={cn(
                    "text-xs font-medium ml-auto tracking-wide",
                    isLibrary ? "text-slate-500" : "text-slate-500"
                  )}
                >
                  SKU: {product.sku}
                </span>
              </div>

              <h1
                className={cn(
                  "text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-[-0.02em] mb-5",
                  isLibrary
                    ? "font-bodoni text-slate-900"
                    : "font-editorial text-white"
                )}
              >
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 mb-5 flex-wrap">
                {hasDiscount && (
                  <Badge className="bg-rose-500 text-white border border-rose-500 text-xs font-black tracking-wide">
                    -{Math.round(((product.previousPrice! - product.price) / product.previousPrice!) * 100)}% OFF
                  </Badge>
                )}
                <div className="flex items-baseline gap-3">
                  <span
                    className={cn(
                      "text-3xl sm:text-4xl font-bold tracking-tight",
                      isLibrary ? "text-slate-900" : "text-white"
                    )}
                  >
                    S/ {product.price.toLocaleString("es-PE")}
                  </span>
                  {hasDiscount && (
                    <span
                      className={cn(
                        "text-sm font-medium line-through",
                        isLibrary ? "text-slate-400" : "text-slate-500"
                      )}
                    >
                      S/ {product.previousPrice!.toLocaleString("es-PE")}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isLibrary ? "text-slate-500" : "text-slate-500"
                  )}
                >
                  + IGV Facturado
                </span>
              </div>

              <p
                className={cn(
                  "text-sm sm:text-base leading-relaxed",
                  isLibrary ? "text-slate-700" : "text-slate-300"
                )}
              >
                {product.fullDescription || product.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-1">
              <Button
                size="lg"
                disabled={!canBuy}
                className={cn(
                  "flex-1 font-semibold h-13 text-sm rounded-2xl transition-all duration-300 hover:-translate-y-0.5 shadow-xl",
                  isLibrary
                    ? "bg-slate-900 hover:bg-blue-800 text-white shadow-slate-900/15 disabled:opacity-50"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 disabled:opacity-50"
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
                <ShoppingCart className="w-4 h-4 mr-2" />
                {canBuy
                  ? "Agregar al Carrito"
                  : !product.available
                  ? "No disponible"
                  : "Sin stock"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className={cn(
                  "flex-1 font-semibold h-13 text-sm rounded-2xl",
                  isLibrary
                    ? "border-slate-200 bg-white hover:bg-library-cream text-slate-800 hover:text-library-sage-foreground hover:border-library-sage/60"
                    : "border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-300"
                )}
                onClick={openWhatsApp}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {canBuy ? "Cotización Formal WhatsApp" : "Consultar disponibilidad"}
              </Button>
            </div>

            <Card
              className={cn(
                "p-6 space-y-5 rounded-[24px] border",
                isLibrary
                  ? "bg-white border-library-beige/80"
                  : "bg-slate-900/50 border-slate-800"
              )}
            >
              <h3
                className={cn(
                  "text-base font-semibold border-b pb-4 flex items-center gap-2",
                  isLibrary
                    ? "text-slate-900 border-library-beige/70"
                    : "text-white border-slate-800"
                )}
              >
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    isLibrary ? "bg-library-sage-foreground" : "bg-blue-500"
                  )}
                />
                Ficha Técnica &amp; Especificaciones
              </h3>
              <ul className="space-y-3.5">
                {(product.specifications ?? []).map((spec, index) => (
                  <li
                    key={index}
                    className={cn(
                      "flex items-start gap-3 text-sm leading-relaxed",
                      isLibrary ? "text-slate-700" : "text-slate-300"
                    )}
                  >
                    <div
                      className={cn(
                        "p-1.5 rounded-lg shrink-0 mt-0.5",
                        isLibrary
                          ? "bg-library-sage/25 text-library-sage-foreground"
                          : "bg-blue-500/10 text-blue-400"
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
                        "pt-2 mt-2 border-t text-xs font-bold uppercase tracking-[0.2em]",
                        isLibrary
                          ? "text-slate-500 border-library-beige/60"
                          : "text-slate-500 border-slate-800"
                      )}
                    >
                      Características destacadas
                    </li>
                    {(product.features ?? []).map((feature, index) => (
                      <li
                        key={`feat-${index}`}
                        className={cn(
                          "flex items-start gap-3 text-sm leading-relaxed",
                          isLibrary ? "text-slate-700" : "text-slate-300"
                        )}
                      >
                        <div
                          className={cn(
                            "p-1.5 rounded-lg shrink-0 mt-0.5",
                            isLibrary
                              ? "bg-library-terracotta/20 text-library-terracotta"
                              : "bg-indigo-500/10 text-indigo-300"
                          )}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </>
                )}
              </ul>
              <div
                className={cn(
                  "pt-2 text-xs font-medium p-4 rounded-xl border",
                  isLibrary
                    ? "text-library-sage-foreground bg-library-cream/70 border-library-beige/70"
                    : "text-blue-400/90 bg-slate-950/60 border-slate-800"
                )}
              >
                <strong>Garantía Oficial:</strong> {product.warranty}
              </div>
            </Card>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <div
            className={cn(
              "pt-12 border-t space-y-10",
              isLibrary ? "border-library-beige/60" : "border-slate-800"
            )}
          >
            <div className="text-center md:text-left">
              <h2
                className={cn(
                  "text-3xl md:text-4xl leading-[1.1] tracking-[-0.02em]",
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
