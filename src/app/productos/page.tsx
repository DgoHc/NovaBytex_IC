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
import { CatalogSectionGrid } from "@/components/catalog/CatalogSectionGrid";
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

  const tabs = useMemo(
    () =>
      [
        {
          id: "all" as const,
          label: "Todo el Catálogo TI",
          count: allTechProducts.length,
          icon: Layers,
        },
        {
          id: "licenses" as const,
          label: "Licencias & Suscripciones",
          count: licensesCount,
          icon: KeyRound,
        },
        {
          id: "hardware" as const,
          label: "Equipos y Hardware",
          count: hardwareCount,
          icon: Cpu,
        },
      ].filter((tab) => tab.count > 0),
    [allTechProducts.length, licensesCount, hardwareCount]
  );

  return (
    <section className="bg-slate-950 text-white min-h-screen">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero Section */}
        <div className="pt-10 pb-6 text-left">
          <motion.div
            initial={mounted ? { opacity: 0, y: 15 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="font-editorial text-[36px] sm:text-[42px] md:text-[46px] lg:text-[48px] font-medium leading-[1.12] tracking-[-0.015em] text-white whitespace-nowrap truncate">
              Licencias &amp; Suscripciones
            </h1>

            <p className="mt-2.5 text-[16px] text-slate-400 leading-relaxed max-w-[640px] line-clamp-2">
              Claves genuinas y suscripciones oficiales de software de productividad, antivirus y herramientas TI con entrega digital inmediata y facturación RUC 20.
            </p>

            <div className="flex flex-wrap items-center gap-5 mt-4 text-[13px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Entrega inmediata</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Facturación RUC 20</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Soporte post-venta</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* PESTAÑAS: ESTILO UNDERLINE                                   */}
        {/* ------------------------------------------------------------- */}
        <div className="border-b border-slate-800 mb-6">
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "group relative flex items-center gap-2 h-[44px] text-sm font-medium transition-colors whitespace-nowrap outline-none",
                    isActive
                      ? "text-white border-b-2 border-[#2563eb] -mb-[1px]"
                      : "text-[#94a3b8] hover:text-white"
                  )}
                >
                  <tab.icon
                    className={cn(
                      "w-4 h-4 transition-colors shrink-0",
                      isActive ? "text-[#2563eb]" : "text-[#94a3b8] group-hover:text-white"
                    )}
                  />
                  <span>{tab.label}</span>
                  <span className="text-[12px] text-slate-400 bg-white/[0.08] px-2 py-0.5 rounded-full font-mono font-normal">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Catalog Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16">
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
            {/* Barra única sobre los productos */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-1">
              <div className="text-xs sm:text-sm text-slate-400">
                Mostrando{" "}
                <strong className="text-white font-semibold">
                  {filteredProducts.length}
                </strong>{" "}
                productos
                {selectedBrand && (
                  <span className="ml-2 text-slate-500">
                    · Marca: <strong className="text-slate-300 font-medium">{selectedBrand}</strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                {/* Buscador */}
                <div className="relative flex-1 sm:w-56 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 pl-9 pr-3 text-xs sm:text-sm bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:border-blue-500 focus:ring-0"
                  />
                </div>

                {/* Selector Ordenar: Recientes */}
                <div className="relative shrink-0">
                  <div className="flex items-center gap-2 h-10 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-300 hover:border-slate-700 transition-colors">
                    <ArrowUpDown className="w-4 h-4 text-blue-500 shrink-0" />
                    <select
                      value={sortOrder}
                      onChange={(e) =>
                        setSortOrder(e.target.value as "default" | "asc" | "desc")
                      }
                      aria-label="Ordenar productos"
                      className="bg-transparent text-slate-300 focus:outline-none cursor-pointer pr-1 text-xs sm:text-sm"
                    >
                      <option value="default" className="bg-slate-900 text-white">
                        Ordenar: Recientes
                      </option>
                      <option value="asc" className="bg-slate-900 text-white">
                        Precio: Menor a Mayor
                      </option>
                      <option value="desc" className="bg-slate-900 text-white">
                        Precio: Mayor a Menor
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <CatalogSectionGrid
              products={filteredProducts}
              variant="dark"
              loading={!hydrated}
              onResetFilters={resetFilters}
              resetFilterDependency={`${activeTab}-${selectedCategory}-${selectedBrand}-${searchQuery}-${sortOrder}`}
              emptyContent={
                activeTab === "hardware" ? (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-10 sm:p-14 text-center space-y-4">
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
                        type="button"
                        onClick={() => handleTabChange("licenses")}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs px-5 h-10 shadow-lg shadow-blue-600/25"
                      >
                        Ver Licencias &amp; Suscripciones
                      </Button>
                    </div>
                  </div>
                ) : undefined
              }
            />
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
