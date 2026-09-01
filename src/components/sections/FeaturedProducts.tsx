"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PRODUCTS_DATA } from "@/lib/products";
import { ProductCard } from "@/components/ui/ProductCard";

export const FeaturedProducts = () => {
  const featuredList = PRODUCTS_DATA.filter((p) => p.featured).slice(0, 4);
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white py-24 text-slate-900 lg:py-32">
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-16 max-w-3xl space-y-4 text-center lg:mb-20"
        >
          <Badge className="bg-blue-50 text-blue-700 border border-blue-100 px-3.5 py-1 mb-2 font-medium">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline text-blue-700" />
            Catálogo Estrellas
          </Badge>
          <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-medium leading-[1.2] tracking-[-0.015em] text-slate-900">
            Productos Corporativos Destacados
          </h2>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-normal">
            Hardware empresarial de alto rendimiento con garantía directa y entrega inmediata en todo el Perú
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
          {featuredList.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              variant="light"
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/productos">
            <Button
              size="lg"
              variant="outline"
              className="border-slate-200 text-blue-700 hover:bg-blue-50 hover:border-blue-200 font-semibold px-8 h-12 rounded-2xl text-sm"
            >
              Ver Todos los {PRODUCTS_DATA.length} Productos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
