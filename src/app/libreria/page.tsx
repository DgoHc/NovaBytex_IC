"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  Filter,
  RotateCcw,
  ArrowUpDown,
  BookOpen,
  Notebook,
  Calendar,
  Pen,
  Palette,
  Briefcase,
  Backpack,
  Paperclip,
} from "lucide-react";
import { PRODUCTS_DATA, LIBRARY_CATEGORIES } from "@/lib/products";
import { useCatalog } from "@/contexts/CatalogContext";
import { ProductCard } from "@/components/ui/ProductCard";
import LibraryHero from "@/components/sections/LibraryHero";
import { cn } from "@/lib/utils";

const categories = ["Todos", ...LIBRARY_CATEGORIES];
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Libros: BookOpen,
  Cuadernos: Notebook,
  Agendas: Calendar,
  Escritura: Pen,
  Arte: Palette,
  Oficina: Briefcase,
  Escolar: Backpack,
  Accesorios: Paperclip,
};

export default function LibreriaPage() {
  const { products, hydrated } = useCatalog();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"default" | "asc" | "desc">("default");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const libraryProducts = useMemo(() => {
    const list = hydrated && products.length > 0 ? products : PRODUCTS_DATA;
    return list.filter((p) => p.type === "library" && p.available !== false);
  }, [hydrated, products]);

  const priceBounds = useMemo(() => {
    const prices = libraryProducts.map((p) => p.price);
    const min = prices.length ? Math.floor(Math.min(...prices) / 10) * 10 : 0;
    const max = prices.length ? Math.ceil(Math.max(...prices) / 10) * 10 : 500;
    return [min, max] as [number, number];
  }, [libraryProducts]);

  useEffect(() => {
    setPriceRange(priceBounds);
  }, [priceBounds]);

  const filteredProducts = useMemo(() => {
    let result = libraryProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === "Todos" || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesAvailability = !onlyAvailable || (product.available && product.inStock);
      return matchesCategory && matchesSearch && matchesPrice && matchesAvailability;
    });

    if (sortOrder === "asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortOrder === "desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [selectedCategory, searchQuery, sortOrder, priceRange, onlyAvailable, libraryProducts]);

  const resetFilters = () => {
    setSelectedCategory("Todos");
    setSearchQuery("");
    setSortOrder("default");
    setPriceRange(priceBounds);
    setOnlyAvailable(true);
  };

  return (
    <main className="bg-[hsl(var(--library-paper))] min-h-screen">
      <LibraryHero />

      <section id="categorias-libreria" className="py-10 lg:py-14 border-b border-library-beige/50 bg-white/60">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <Badge
                variant="outline"
                className="h-6 px-3 text-[11px] font-semibold tracking-wide border-library-sage/60 bg-library-sage/15 text-library-sage-foreground"
              >
                Explora por categoría
              </Badge>
              <h2 className="font-bodoni text-3xl md:text-4xl mt-3 text-slate-900 tracking-tight">
                Categorías destacadas
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
            {LIBRARY_CATEGORIES.map((cat) => {
              const Icon = categoryIcons[cat] ?? BookOpen;
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "group flex flex-col items-center gap-3 rounded-2xl px-4 py-5 border transition-all duration-300",
                    active
                      ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10 -translate-y-0.5"
                      : "bg-white text-slate-700 border-library-beige/70 hover:border-library-sage/60 hover:shadow-[0_8px_20px_-8px_hsla(145,30%,50%,0.25)] hover:-translate-y-0.5"
                  )}
                >
                  <div
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                      active
                        ? "bg-white/10 text-white"
                        : "bg-library-cream/80 text-library-sage-foreground group-hover:bg-library-sage/20"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[12.5px] font-semibold text-center leading-tight">
                    {cat}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="library-catalog" className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3">
              <Card className="bg-white border-library-beige/70 shadow-[0_10px_40px_-20px_rgba(30,41,59,0.15)] sticky top-24 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-white to-library-cream/70 border-b border-library-beige/60 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-library-sage-foreground">
                      <Filter className="w-4 h-4" />
                      <h3 className="font-semibold text-sm text-slate-900">
                        Filtros de Búsqueda
                      </h3>
                    </div>
                    {(selectedCategory !== "Todos" ||
                      searchQuery ||
                      onlyAvailable ||
                      priceRange[0] !== priceBounds[0] ||
                      priceRange[1] !== priceBounds[1] ||
                      sortOrder !== "default") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="text-slate-500 hover:text-slate-900 hover:bg-library-cream/60 text-xs h-8 px-3"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Limpiar
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-6">
                  <div className="space-y-2.5">
                    <Label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                      Buscar
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Nombre, SKU, descripción..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white border-library-beige/70 text-slate-900 placeholder:text-slate-400 focus:border-library-sage focus-visible:ring-library-sage/40 text-sm h-11 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                      Categoría
                    </Label>
                    <div className="space-y-1.5 max-h-[240px] pr-1 overflow-y-auto">
                      {categories.map((cat) => {
                        const Icon = categoryIcons[cat];
                        const active = selectedCategory === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                              "w-full flex items-center gap-3 text-left px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all",
                              active
                                ? "bg-library-sage/20 text-library-sage-foreground border border-library-sage/50"
                                : "text-slate-600 hover:bg-library-cream/70 hover:text-slate-900 border border-transparent"
                            )}
                          >
                            {Icon && <Icon className="w-4 h-4 opacity-80 shrink-0" />}
                            <span className="flex-1 min-w-0 truncate">{cat}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                        Rango de Precio
                      </Label>
                      <span className="text-[11px] font-semibold text-library-sage-foreground tabular-nums">
                        S/ {priceRange[0].toLocaleString("es-PE")} — S/{" "}
                        {priceRange[1].toLocaleString("es-PE")}
                      </span>
                    </div>
                    <div className="space-y-3 px-1">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={priceBounds[0]}
                          max={priceRange[1]}
                          value={priceRange[0]}
                          onChange={(e) =>
                            setPriceRange([
                              Math.min(Number(e.target.value) || 0, priceRange[1]),
                              priceRange[1],
                            ])
                          }
                          className="h-10 rounded-lg text-sm bg-library-cream/60 border-library-beige/70 text-slate-900"
                        />
                        <span className="text-slate-400 text-sm">—</span>
                        <Input
                          type="number"
                          min={priceRange[0]}
                          max={priceBounds[1]}
                          value={priceRange[1]}
                          onChange={(e) =>
                            setPriceRange([
                              priceRange[0],
                              Math.max(Number(e.target.value) || 0, priceRange[0]),
                            ])
                          }
                          className="h-10 rounded-lg text-sm bg-library-cream/60 border-library-beige/70 text-slate-900"
                        />
                      </div>
                      <input
                        type="range"
                        min={priceBounds[0]}
                        max={priceBounds[1]}
                        step={5}
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([priceRange[0], Number(e.target.value)])
                        }
                        className="w-full accent-library-sage"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-library-beige/60">
                    <Label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                      Disponibilidad
                    </Label>
                    <label className="flex items-start gap-3 px-3 py-3 rounded-xl bg-library-cream/60 border border-library-beige/70 cursor-pointer hover:bg-library-cream transition-colors">
                      <input
                        type="checkbox"
                        checked={onlyAvailable}
                        onChange={(e) => setOnlyAvailable(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-library-sage border-library-beige focus:ring-library-sage/40 accent-library-sage"
                      />
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-slate-900">
                          Mostrar solo disponibles
                        </p>
                        <p className="text-[11.5px] text-slate-500 leading-snug mt-0.5">
                          Oculta productos agotados o inactivos.
                        </p>
                      </div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-9 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-bodoni text-2xl md:text-3xl text-slate-900 tracking-tight">
                    {selectedCategory === "Todos"
                      ? "Catálogo de Librería"
                      : selectedCategory}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1.5">
                    Selección curada con entrega inmediata en todo el Perú
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSortOrder((prev) =>
                      prev === "asc"
                        ? "desc"
                        : prev === "desc"
                        ? "default"
                        : "asc"
                    )
                  }
                  className="border-library-beige/70 bg-white text-slate-800 hover:text-slate-900 hover:border-library-sage/60 hover:bg-library-cream/60 text-xs h-11 px-4 rounded-xl font-semibold"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 mr-2 text-library-sage-foreground" />
                  {sortOrder === "asc"
                    ? "Precio: Menor a Mayor"
                    : sortOrder === "desc"
                    ? "Precio: Mayor a Menor"
                    : "Ordenar por Precio"}
                </Button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  Mostrando{" "}
                  <strong className="text-library-sage-foreground font-semibold">
                    {filteredProducts.length}
                  </strong>{" "}
                  productos
                </span>
                {selectedCategory !== "Todos" && (
                  <Badge
                    variant="outline"
                    className="border-library-sage/60 bg-library-sage/20 text-library-sage-foreground"
                  >
                    {selectedCategory}
                  </Badge>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <motion.div
                  initial={mounted ? { opacity: 0, y: 14 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border-library-beige/70 rounded-2xl p-12 text-center space-y-5"
                >
                  <div className="w-16 h-16 rounded-2xl bg-library-cream border border-library-beige/70 flex items-center justify-center mx-auto">
                    <BookOpen className="w-7 h-7 text-library-sage-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-bodoni text-2xl text-slate-900">
                      Sin resultados por el momento
                    </p>
                    <p className="text-slate-500">
                      Ajusta tus filtros de búsqueda o limpia para explorar más.
                    </p>
                  </div>
                  <Button
                    onClick={resetFilters}
                    className="bg-slate-900 hover:bg-blue-800 text-white font-semibold rounded-xl h-11 px-6"
                  >
                    Restablecer Filtros
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={mounted ? { opacity: 0, y: 12 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6"
                >
                  {filteredProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      variant="light"
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
