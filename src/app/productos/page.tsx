"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  RotateCcw,
  ArrowUpDown,
  Cpu,
  KeyRound,
  Layers,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import {
  PRODUCTS_DATA,
  HARDWARE_CATEGORIES,
  LICENSE_CATEGORIES,
  TECHNOLOGY_CATEGORIES,
  type Product,
} from "@/lib/products";
import { useCatalog } from "@/contexts/CatalogContext";
import { ProductCard } from "@/components/ui/ProductCard";
import { cn } from "@/lib/utils";

type TechTabSection = "all" | "hardware" | "licenses";

function ProductosContent() {
  const { products, hydrated } = useCatalog();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";
  const initialTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<TechTabSection>(
    initialTab === "licenses" || initialTab === "licencias"
      ? "licenses"
      : initialTab === "hardware" || initialTab === "equipos"
      ? "hardware"
      : "all"
  );

  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortOrder, setSortOrder] = useState<"default" | "asc" | "desc">("default");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) {
      setSearchQuery(q);
    }
    const t = searchParams.get("tab");
    if (t === "licenses" || t === "licencias") {
      setActiveTab("licenses");
    } else if (t === "hardware" || t === "equipos") {
      setActiveTab("hardware");
    }
  }, [searchParams]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // All technology products from context or defaults
  const allTechProducts = useMemo(() => {
    const list = hydrated && products.length > 0 ? products : PRODUCTS_DATA;
    return list.filter((p) => p.type === "technology" && p.available !== false);
  }, [hydrated, products]);

  // Counts for tabs
  const hardwareCount = useMemo(
    () => allTechProducts.filter((p) => p.techSubtype !== "license").length,
    [allTechProducts]
  );
  const licensesCount = useMemo(
    () => allTechProducts.filter((p) => p.techSubtype === "license").length,
    [allTechProducts]
  );

  // Products filtered by the active sub-tab (Hardware vs Licencias vs Todos)
  const baseTabProducts = useMemo(() => {
    if (activeTab === "hardware") {
      return allTechProducts.filter((p) => p.techSubtype !== "license");
    }
    if (activeTab === "licenses") {
      return allTechProducts.filter((p) => p.techSubtype === "license");
    }
    return allTechProducts;
  }, [allTechProducts, activeTab]);

  // Dynamic categories based on active sub-tab
  const currentCategories = useMemo(() => {
    if (activeTab === "hardware") {
      return ["Todos", ...HARDWARE_CATEGORIES];
    }
    if (activeTab === "licenses") {
      return ["Todos", ...LICENSE_CATEGORIES];
    }
    return ["Todos", ...HARDWARE_CATEGORIES, ...LICENSE_CATEGORIES];
  }, [activeTab]);

  // Available brands in the active tab products
  const brands = useMemo(() => {
    const found = new Set(baseTabProducts.map((p) => p.brand).filter(Boolean));
    return Array.from(found);
  }, [baseTabProducts]);

  // Final filtered list
  const filteredProducts = useMemo(() => {
    let result = baseTabProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === "Todos" || product.category === selectedCategory;
      const matchesBrand = !selectedBrand || product.brand === selectedBrand;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
  }, [baseTabProducts, selectedCategory, selectedBrand, searchQuery, sortOrder]);

  const handleTabChange = (newTab: TechTabSection) => {
    setActiveTab(newTab);
    setSelectedCategory("Todos");
    setSelectedBrand(null);
  };

  const resetFilters = () => {
    setSelectedCategory("Todos");
    setSelectedBrand(null);
    setSearchQuery("");
    setSortOrder("default");
  };

  return (
    <section className="py-14 lg:py-20 bg-slate-950 text-white min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header Hero Section */}
        <motion.div
          initial={mounted ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center md:text-left max-w-4xl"
        >
          <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3.5 py-1 font-medium">
              Catálogo Tecnológico Nova Bytex
            </Badge>
            {activeTab === "licenses" && (
              <Badge className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-3 py-1 font-semibold">
                🔑 Entrega &amp; Activación Inmediata
              </Badge>
            )}
          </div>

          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.18] tracking-[-0.015em] mb-4 text-white">
            {activeTab === "hardware"
              ? "Equipamiento & Hardware TI"
              : activeTab === "licenses"
              ? "Licencias & Suscripciones Digitales"
              : "Tecnología: Equipos & Licencias TI"}
          </h1>

          <p className="text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
            {activeTab === "hardware"
              ? "Switches, servidores, firewalls, almacenamiento y laptops empresariales con stock garantizado y soporte especializado."
              : activeTab === "licenses"
              ? "Claves genuinas y suscripciones oficiales de Windows, Microsoft Office, antivirus ESET, Kaspersky, McAfee y software de productividad."
              : "Solución integral de infraestructura física y licencias de software oficial con factura RUC 20 para empresas y profesionales."}
          </p>
        </motion.div>

        {/* ------------------------------------------------------------- */}
        {/* DIVISION DE TECNOLOGIA: SUBTABS SEGMENTADOS                   */}
        {/* ------------------------------------------------------------- */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl w-fit mb-10 shadow-lg">
          <button
            type="button"
            onClick={() => handleTabChange("all")}
            className={cn(
              "px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 select-none",
              activeTab === "all"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Todo el Catálogo TI</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-md font-mono",
                activeTab === "all" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
              )}
            >
              {allTechProducts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("hardware")}
            className={cn(
              "px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 select-none",
              activeTab === "hardware"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Productos Tecnológicos / Hardware</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-md font-mono",
                activeTab === "hardware" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
              )}
            >
              {hardwareCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("licenses")}
            className={cn(
              "px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 select-none",
              activeTab === "licenses"
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Licencias &amp; Suscripciones</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-md font-mono",
                activeTab === "licenses" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
              )}
            >
              {licensesCount}
            </span>
          </button>
        </div>

        {/* Catalog Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Filters */}
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
                {/* Search */}
                <div className="space-y-2.5">
                  <label className="text-xs font-medium text-slate-300 tracking-wide uppercase">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <Input
                      placeholder={
                        activeTab === "licenses"
                          ? "Office, Windows, ESET, McAfee..."
                          : "Switch, servidor, laptop, SKU..."
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500 text-sm h-11 rounded-xl"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-2.5">
                  <label className="text-xs font-medium text-slate-300 tracking-wide uppercase">
                    {activeTab === "licenses"
                      ? "Tipo de Software / Licencia"
                      : activeTab === "hardware"
                      ? "Categoría Hardware"
                      : "Categorías"}
                  </label>
                  <div className="space-y-1.5">
                    {currentCategories.map((cat) => (
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

                {/* Brands */}
                {brands.length > 0 && (
                  <div className="space-y-2.5">
                    <label className="text-xs font-medium text-slate-300 tracking-wide uppercase">
                      Marca / Fabricante
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {brands.map((brand) => (
                        <button
                          key={brand}
                          onClick={() =>
                            setSelectedBrand(selectedBrand === brand ? null : brand)
                          }
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
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Products Grid */}
          <div className="lg:col-span-9 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                  <span>
                    {activeTab === "hardware"
                      ? "Equipos y Hardware TI"
                      : activeTab === "licenses"
                      ? "Licencias Digitales & Software"
                      : "Listado de Productos"}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeTab === "licenses"
                    ? "Activación inmediata oficial, facturación RUC 20 y soporte post-venta"
                    : "Hardware certificado para infraestructura corporativa"}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortOrder((prev) =>
                    prev === "asc" ? "desc" : prev === "desc" ? "default" : "asc"
                  )
                }
                className="border-slate-800 bg-slate-950 text-slate-300 hover:text-white text-xs h-11 px-4 rounded-xl font-medium"
              >
                <ArrowUpDown className="w-3.5 h-3.5 mr-2 text-blue-400" />
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
                <strong className="text-blue-400 font-semibold">
                  {filteredProducts.length}
                </strong>{" "}
                productos
              </span>
              {selectedBrand && (
                <span>
                  Filtrado por marca: <strong className="text-white">{selectedBrand}</strong>
                </span>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-10 sm:p-14 text-center space-y-4">
                {activeTab === "hardware" ? (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-2">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <h3 className="text-white text-lg font-bold">
                      Catálogo de Hardware en Preparación
                    </h3>
                    <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                      Actualmente estamos renovando nuestro stock de equipamiento físico. Por el momento contamos con licencias digitales y suscripciones oficiales con entrega inmediata.
                    </p>
                    <div className="pt-2">
                      <Button
                        onClick={() => handleTabChange("licenses")}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs px-5 h-10 shadow-lg shadow-blue-600/25"
                      >
                        Ver Licencias &amp; Suscripciones
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-slate-400 text-lg">
                      No encontramos productos que coincidan con tu búsqueda.
                    </p>
                    <Button
                      onClick={resetFilters}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl"
                    >
                      Restablecer Filtros
                    </Button>
                  </>
                )}
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

export default function ProductosPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          Cargando catálogo...
        </div>
      }
    >
      <ProductosContent />
    </Suspense>
  );
}
