"use client";

import React from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, ChevronLeft, Check, ShoppingCart, ShieldCheck, Truck, Clock } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { PRODUCTS_DATA } from "@/lib/products";
import { ProductImage } from "@/components/ui/ProductImage";
import { ProductCard } from "@/components/ui/ProductCard";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = parseInt(params.id as string);
  const product = PRODUCTS_DATA.find(p => p.id === productId) || PRODUCTS_DATA[0];
  const { addToCart } = useCart();

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `¡Hola! Quisiera cotizar el producto: ${product.name} (SKU: ${product.sku})`
    );
    window.open(`https://wa.me/51999999999?text=${message}`, "_blank");
  };

  const relatedProducts = PRODUCTS_DATA
    .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .slice(0, 3);

  return (
    <section className="py-14 lg:py-20 bg-slate-950 text-white min-h-screen">
      <div className="container mx-auto px-4">
        <Link href="/productos" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 font-medium mb-8 transition-colors text-sm">
          <ChevronLeft className="w-4 h-4" />
          Volver al Catálogo Corporativo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6"
          >
            <Card className="bg-slate-900/50 border-slate-800 shadow-2xl p-6 rounded-[28px] relative overflow-hidden">
              <div className="w-full h-80 sm:h-96 rounded-[24px] overflow-hidden bg-slate-950 p-4">
                <ProductImage type={product.imageType} name={product.name} className="h-full" />
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800 text-center">
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-5 h-5 text-blue-400 mb-1.5" />
                  <span className="text-[12px] font-semibold text-slate-200">Garantía Directa</span>
                  <span className="text-[10px] text-slate-500">Respaldo de Fábrica</span>
                </div>
                <div className="flex flex-col items-center">
                  <Truck className="w-5 h-5 text-emerald-400 mb-1.5" />
                  <span className="text-[12px] font-semibold text-slate-200">Envíos a Todo el Perú</span>
                  <span className="text-[10px] text-slate-500">Despacho en 24h</span>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="w-5 h-5 text-indigo-400 mb-1.5" />
                  <span className="text-[12px] font-semibold text-slate-200">Soporte NBD/24h</span>
                  <span className="text-[10px] text-slate-500">Atención Post-Venta</span>
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
                <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs font-medium">
                  {product.category}
                </Badge>
                <Badge className="bg-slate-800 text-slate-300 text-xs font-medium">
                  {product.brand}
                </Badge>
                <span className="text-xs font-medium text-slate-500 ml-auto tracking-wide">SKU: {product.sku}</span>
              </div>

              <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-[-0.02em] mb-5 text-white">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 mb-5">
                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  S/ {product.price.toLocaleString("es-PE")}
                </span>
                <span className="text-xs text-slate-500 font-medium">+ IGV Facturado</span>
              </div>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {product.fullDescription}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-1">
              <Button 
                size="lg"
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold h-13 text-sm shadow-xl shadow-blue-600/20 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                onClick={() => addToCart({
                  id: product.id,
                  name: product.name,
                  category: product.category,
                  price: product.price,
                  image: ""
                })}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Agregar al Carrito
              </Button>
              <Button 
                size="lg"
                variant="outline" 
                className="flex-1 border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-300 font-semibold h-13 text-sm rounded-2xl"
                onClick={openWhatsApp}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Cotización Formal WhatsApp
              </Button>
            </div>

            <Card className="bg-slate-900/50 border-slate-800 p-6 space-y-5 rounded-[24px]">
              <h3 className="text-base font-semibold text-white border-b border-slate-800 pb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Ficha Técnica &amp; Especificaciones
              </h3>
              <ul className="space-y-3.5">
                {product.specifications.map((spec, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                    <div className="bg-blue-500/10 p-1.5 rounded-lg text-blue-400 shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 text-xs font-medium text-blue-400/90 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <strong>Garantía Oficial:</strong> {product.warranty}
              </div>
            </Card>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-slate-800 space-y-10">
            <div className="text-center md:text-left">
              <h2 className="font-editorial text-3xl md:text-4xl leading-[1.1] tracking-[-0.02em] text-white">
                Productos Relacionados
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((rel, index) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  index={index}
                  variant="dark"
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
