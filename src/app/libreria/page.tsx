"use client";

import React, { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Filter,
  ArrowUpDown,
  BookOpen,
  Notebook,
  Calendar,
  Pen,
  Palette,
  Briefcase,
  Backpack,
  Paperclip,
  FileText,
  FolderArchive,
  X,
  RotateCcw,
  PackageOpen,
} from "lucide-react";
import { PRODUCTS_DATA, LIBRARY_CATEGORIES } from "@/lib/products";
import { useCatalog } from "@/contexts/CatalogContext";
import { CatalogSectionGrid } from "@/components/catalog/CatalogSectionGrid";
import { LibraryFilterPanel } from "@/components/catalog/LibraryFilterPanel";
import LibraryHero from "@/components/sections/LibraryHero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const categoryIcons: Record<
  string,
  React.ComponentType<{ width?: number; height?: number; className?: string }>
> = {
  Papelería: FileText,
  Cuadernos: Notebook,
  Archivadores: FolderArchive,
  Escritura: Pen,
  Oficina: Briefcase,
  Arte: Palette,
  Accesorios: Paperclip,
  Escolar: Backpack,
  Libros: BookOpen,
  Agendas: Calendar,
};

function LibreriaContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { products, hydrated } = useCatalog();

  // 1. Productos de Librería (Solo productos activos, disponibles en tienda pública)
  const libraryProducts = useMemo(() => {
    const list = hydrated && products.length > 0 ? products : PRODUCTS_DATA;
    return list.filter((p) => p.type === "library" && p.available !== false);
  }, [hydrated, products]);

  // 2. Límites reales de precio del catálogo
  const priceBounds = useMemo(() => {
    const prices = libraryProducts.map((p) => p.price);
    const min = prices.length ? Math.floor(Math.min(...prices)) : 0;
    const max = prices.length ? Math.ceil(Math.max(...prices)) : 220;
    return [min, max] as [number, number];
  }, [libraryProducts]);

  // 3. Inicialización desde URL (?categoria=...&min=...&max=...&q=...)
  const paramCat = searchParams.get("categoria");
  const paramQ = searchParams.get("q");
  const paramMin = searchParams.get("min");
  const paramMax = searchParams.get("max");

  const [selectedCategory, setSelectedCategory] = useState<string>(
    paramCat && (LIBRARY_CATEGORIES.includes(paramCat) || paramCat === "Todos")
      ? paramCat
      : "Todos"
  );
  const [searchQuery, setSearchQuery] = useState<string>(paramQ ?? "");
  const [sortOrder, setSortOrder] = useState<"default" | "asc" | "desc">("default");
  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    const min = paramMin ? Math.max(priceBounds[0], Number(paramMin)) : priceBounds[0];
    const max = paramMax ? Math.min(priceBounds[1], Number(paramMax)) : priceBounds[1];
    return [min, max];
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sincronizar límites de precio si el catálogo cambia
  useEffect(() => {
    setPriceRange((prev) => {
      const min = Math.max(priceBounds[0], Math.min(prev[0], priceBounds[1]));
      const max = Math.min(priceBounds[1], Math.max(prev[1], priceBounds[0]));
      return [min, max];
    });
  }, [priceBounds]);

  // Sincronizar estado local si cambian los searchParams de la URL (p.ej. al hacer click en enlaces del Hero)
  useEffect(() => {
    const urlCat = searchParams.get("categoria");
    if (urlCat && LIBRARY_CATEGORIES.includes(urlCat) && urlCat !== selectedCategory) {
      setSelectedCategory(urlCat);
    }
    const urlQ = searchParams.get("q") ?? "";
    if (urlQ !== searchQuery) {
      setSearchQuery(urlQ);
    }
  }, [searchParams, selectedCategory, searchQuery]);

  // 4. Sincronización bidireccional con la URL
  const updateUrlParams = useCallback(
    (cat: string, q: string, range: [number, number]) => {
      const params = new URLSearchParams();
      if (cat && cat !== "Todos") {
        params.set("categoria", cat);
      }
      if (q && q.trim()) {
        params.set("q", q.trim());
      }
      if (range[0] > priceBounds[0]) {
        params.set("min", range[0].toString());
      }
      if (range[1] < priceBounds[1]) {
        params.set("max", range[1].toString());
      }
      const qs = params.toString();
      const newUrl = pathname + (qs ? `?${qs}` : "");
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router, priceBounds]
  );

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    updateUrlParams(cat, searchQuery, priceRange);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    updateUrlParams(selectedCategory, q, priceRange);
  };

  const handlePriceChange = (range: [number, number]) => {
    setPriceRange(range);
    updateUrlParams(selectedCategory, searchQuery, range);
  };

  const resetFilters = () => {
    setSelectedCategory("Todos");
    setSearchQuery("");
    setPriceRange(priceBounds);
    setSortOrder("default");
    router.replace(pathname, { scroll: false });
  };

  // 5. Conteo por categoría para la lista de filtros
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Todos: libraryProducts.length,
    };
    LIBRARY_CATEGORIES.forEach((cat) => {
      counts[cat] = libraryProducts.filter((p) => p.category === cat).length;
    });
    return counts;
  }, [libraryProducts]);

  // Conteo de filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "Todos") count++;
    if (searchQuery.trim() !== "") count++;
    if (priceRange[0] > priceBounds[0] || priceRange[1] < priceBounds[1]) count++;
    return count;
  }, [selectedCategory, searchQuery, priceRange, priceBounds]);

  // 6. Filtrado y ordenamiento con Regla de Negocio:
  // - Inactivos nunca se muestran (ya filtrados en libraryProducts).
  // - Activos siempre se muestran.
  // - Agotados (inStock === false) van al final de la lista con etiqueta y botón desactivado.
  const filteredProducts = useMemo(() => {
    let result = libraryProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === "Todos" || product.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q);
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesCategory && matchesSearch && matchesPrice;
    });

    // Ordenamiento: Productos en stock van primero; agotados van al final
    result = [...result].sort((a, b) => {
      if (a.inStock && !b.inStock) return -1;
      if (!a.inStock && b.inStock) return 1;

      if (sortOrder === "asc") return a.price - b.price;
      if (sortOrder === "desc") return b.price - a.price;
      return 0;
    });

    return result;
  }, [libraryProducts, selectedCategory, searchQuery, priceRange, sortOrder]);

  // Bloqueo de scroll cuando el bottom sheet móvil está abierto
  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMobileFiltersOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileFiltersOpen]);

  return (
    <main className="bg-[hsl(var(--library-paper))] min-h-screen">
      {/* HERO con franja inferior optimizada (enlaces directos, iconos suaves, sin alterar el resto) */}
      <LibraryHero onSelectCategory={handleSelectCategory} />

      {/* SECCIÓN CATEGORÍAS DESTACADAS (Conserva el diseño existente y sincroniza categoría) */}
      <section
        id="categorias-libreria"
        className="py-10 lg:py-14 border-b border-library-beige/50 bg-white/60"
      >
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
                  onClick={() => {
                    handleSelectCategory(cat);
                    const el = document.getElementById("library-catalog");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={cn(
                    "group flex flex-col items-center gap-3 rounded-2xl px-4 py-5 border transition-all duration-300 cursor-pointer",
                    active
                      ? "bg-[#0f172a] text-white border-[#0f172a] shadow-lg shadow-slate-900/10 -translate-y-0.5"
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
                    <Icon width={20} height={20} className="w-5 h-5" />
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

      {/* CATÁLOGO PRINCIPAL & PANEL DE FILTROS */}
      <section id="library-catalog" className="py-10 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* PANEL DE FILTROS LATERAL (Escritorio >= 1024px: ancho 280-300px, sticky top-6) */}
            <aside className="hidden lg:block w-[290px] shrink-0 sticky top-[24px]">
              <div className="bg-white rounded-[16px] border border-[#e8e2d8] p-5 shadow-xs">
                <LibraryFilterPanel
                  categories={LIBRARY_CATEGORIES}
                  categoryIcons={categoryIcons}
                  categoryCounts={categoryCounts}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleSelectCategory}
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  priceRange={priceRange}
                  priceBounds={priceBounds}
                  onPriceChange={handlePriceChange}
                  activeFiltersCount={activeFiltersCount}
                  onResetFilters={resetFilters}
                  idPrefix="desktop"
                />
              </div>
            </aside>

            {/* CONTENIDO DEL CATÁLOGO */}
            <div className="flex-1 min-w-0 space-y-5 w-full">
              {/* Cabecera del catálogo: Título, botón de filtros móvil y selector de orden */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-bodoni text-2xl md:text-3xl text-slate-900 tracking-tight">
                    {selectedCategory === "Todos"
                      ? "Catálogo de Librería"
                      : selectedCategory}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Precios en soles. Pide por WhatsApp o en la web.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Botón Filtros móvil (<1024px, 44px de alto) */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden h-11 px-3.5 rounded-xl border-[#e8e2d8] bg-white text-slate-800 hover:bg-slate-50 text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Filter width={16} height={16} className="w-4 h-4 text-[#0f172a] shrink-0" />
                    <span>Filtros</span>
                    {activeFiltersCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#0f172a] text-white text-[11px] font-bold flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>

                  {/* Orden por Precio */}
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
                    className="border-library-beige/70 bg-white text-slate-800 hover:text-slate-900 hover:border-library-sage/60 hover:bg-library-cream/60 text-xs h-11 px-4 rounded-xl font-semibold cursor-pointer"
                  >
                    <ArrowUpDown width={14} height={14} className="w-3.5 h-3.5 mr-2 text-library-sage-foreground shrink-0" />
                    {sortOrder === "asc"
                      ? "Precio: Menor a Mayor"
                      : sortOrder === "desc"
                      ? "Precio: Mayor a Menor"
                      : "Ordenar por Precio"}
                  </Button>
                </div>
              </div>

              {/* Barra de estado: Contador de productos y categoría activa */}
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  Mostrando{" "}
                  <strong className="text-slate-900 font-semibold">
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

              {/* Chips de filtros activos (para quitar uno a uno) */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                  {selectedCategory !== "Todos" && (
                    <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium bg-[#EBF3ED] text-[#0f172a] border border-[#d2e3d6]">
                      <span>Categoría: {selectedCategory}</span>
                      <button
                        type="button"
                        onClick={() => handleSelectCategory("Todos")}
                        aria-label="Quitar filtro de categoría"
                        className="text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        <X width={14} height={14} className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}

                  {(priceRange[0] > priceBounds[0] || priceRange[1] < priceBounds[1]) && (
                    <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium bg-[#EBF3ED] text-[#0f172a] border border-[#d2e3d6]">
                      <span>
                        S/ {priceRange[0]} – S/ {priceRange[1]}
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePriceChange(priceBounds)}
                        aria-label="Quitar filtro de precio"
                        className="text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        <X width={14} height={14} className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}

                  {searchQuery.trim() !== "" && (
                    <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium bg-[#EBF3ED] text-[#0f172a] border border-[#d2e3d6]">
                      <span>Búsqueda: «{searchQuery}»</span>
                      <button
                        type="button"
                        onClick={() => handleSearchChange("")}
                        aria-label="Quitar búsqueda"
                        className="text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        <X width={14} height={14} className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-[12px] font-semibold text-slate-500 hover:text-slate-900 underline decoration-slate-300 ml-1 cursor-pointer"
                  >
                    Limpiar todos
                  </button>
                </div>
              )}

              {/* LISTADO POR SECCIONES DE 6 PRODUCTOS */}
              <CatalogSectionGrid
                products={filteredProducts}
                variant="light"
                loading={!hydrated}
                onResetFilters={resetFilters}
                resetFilterDependency={`${selectedCategory}-${searchQuery}-${sortOrder}-${priceRange.join("-")}`}
                emptyContent={
                  <div className="bg-white rounded-2xl border border-[#e8e2d8] p-10 sm:p-14 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center mx-auto mb-2">
                      <PackageOpen width={24} height={24} className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      No encontramos productos
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                      No hay artículos que coincidan con los filtros seleccionados. Prueba a ajustar tu búsqueda o limpiar los filtros.
                    </p>
                    <div className="pt-2">
                      <Button
                        type="button"
                        onClick={resetFilters}
                        className="bg-[#0f172a] hover:bg-slate-800 text-white font-semibold rounded-xl text-xs h-10 px-5 shadow-sm cursor-pointer"
                      >
                        <RotateCcw width={14} height={14} className="w-3.5 h-3.5 mr-1.5" />
                        Limpiar filtros
                      </Button>
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM SHEET MÓVIL (< 1024px: max 85vh, scroll propio, footer fijo) */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Sheet Content */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-label="Filtros del catálogo"
              className="relative z-10 w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-[#e8e2d8] flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <Filter width={16} height={16} className="w-4 h-4 text-[#0f172a] shrink-0" />
                  <span className="text-[16px] font-semibold text-[#0f172a]">
                    Filtros
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Cerrar filtros"
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <X width={16} height={16} className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <LibraryFilterPanel
                  categories={LIBRARY_CATEGORIES}
                  categoryIcons={categoryIcons}
                  categoryCounts={categoryCounts}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleSelectCategory}
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  priceRange={priceRange}
                  priceBounds={priceBounds}
                  onPriceChange={handlePriceChange}
                  activeFiltersCount={activeFiltersCount}
                  onResetFilters={resetFilters}
                  idPrefix="mobile"
                  hideHeader
                />
              </div>

              {/* Sticky / Fixed Footer */}
              <div className="p-4 border-t border-[#e8e2d8] bg-white flex items-center gap-3 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetFilters}
                  className="h-11 px-4 rounded-xl border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Limpiar
                </Button>
                <Button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Ver {filteredProducts.length} productos
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function LibreriaPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 min-h-screen bg-[#FDFBF7] flex items-center justify-center text-slate-400">
          Cargando librería...
        </div>
      }
    >
      <LibreriaContent />
    </Suspense>
  );
}
