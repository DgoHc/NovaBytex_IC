"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, RotateCcw, ArrowUpDown } from "lucide-react";
import { PRODUCTS_DATA } from "@/lib/products";
import { ProductCard } from "@/components/ui/ProductCard";

const categories = ["Todos", "Redes", "Servidores", "Seguridad", "Equipos", "Almacenamiento"];
const brands = ["Cisco", "Dell", "Fortinet", "HP", "Lenovo", "Ubiquiti", "Mikrotik"];

export default function ProductosPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"default" | "asc" | "desc">("default");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredProducts = useMemo(() => {
    let result = PRODUCTS_DATA.filter(product => {
      const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
      const matchesBrand = !selectedBrand || product.brand === selectedBrand;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesBrand && matchesSearch;
    });

    if (sortOrder === "asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortOrder === "desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [selectedCategory, selectedBrand, searchQuery, sortOrder]);

  const resetFilters = () => {
    setSelectedCategory("Todos");
    setSelectedBrand(null);
    setSearchQuery("");
    setSortOrder("default");
  };

  return (
    <section className="py-14 lg:py-20 bg-slate-950 text-white min-h-screen">
      <div className="container mx-auto px-4">
        <motion.div
          initial={mounted ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center md:text-left max-w-4xl"
        >
          <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4 px-3.5 py-1 font-medium">
            Catálogo Corporativo
          </Badge>
          <h1 className="font-editorial text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.18] tracking-[-0.015em] mb-4 text-white">
            Equipamiento &amp; Hardware TI
          </h1>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl">
            Stock real garantizado con entrega inmediata, factura RUC 20 y soporte técnico especializado.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <Card className="bg-slate-900/60 border-slate-800 shadow-xl sticky top-24 rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-900 border-b border-slate-800/60 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Filter className="w-4 h-4" />
                    <h3 className="font-semibold text-sm text-white">Filtros de Búsqueda</h3>
                  </div>
                  {(selectedCategory !== "Todos" || selectedBrand || searchQuery) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={resetFilters}
                      className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs h-8 px-3"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Limpiar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-6">
                <div className="space-y-2.5">
                  <label className="text-xs font-medium text-slate-300 tracking-wide uppercase">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <Input 
                      placeholder="Nombre, SKU, descripción..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500 text-sm h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-xs font-medium text-slate-300 tracking-wide uppercase">Categoría</label>
                  <div className="space-y-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          selectedCategory === cat
                            ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                            : "text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-xs font-medium text-slate-300 tracking-wide uppercase">Marca</label>
                  <div className="flex flex-wrap gap-2">
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          selectedBrand === brand
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                            : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-9 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white tracking-tight">Listado de Productos</h2>
                <p className="text-xs text-slate-500 mt-0.5">Hardware certificado, entrega inmediata en todo Perú</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : prev === "desc" ? "default" : "asc")}
                className="border-slate-800 bg-slate-950 text-slate-300 hover:text-white text-xs h-11 px-4 rounded-xl font-medium"
              >
                <ArrowUpDown className="w-3.5 h-3.5 mr-2 text-blue-400" />
                {sortOrder === "asc" ? "Precio: Menor a Mayor" : sortOrder === "desc" ? "Precio: Mayor a Menor" : "Ordenar por Precio"}
              </Button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Mostrando <strong className="text-blue-400 font-semibold">{filteredProducts.length}</strong> productos</span>
              {selectedBrand && <span>Filtrado por marca: <strong className="text-white">{selectedBrand}</strong></span>}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
                <p className="text-slate-400 text-lg">No encontramos productos que coincidan con tu búsqueda.</p>
                <Button onClick={resetFilters} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl">
                  Restablecer Filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    variant="dark"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
