"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  PackageOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/ProductCard";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

const ITEMS_PER_SECTION = 6;

interface CatalogSectionGridProps {
  products: Product[];
  variant?: "dark" | "light";
  loading?: boolean;
  onResetFilters?: () => void;
  emptyContent?: React.ReactNode;
  onRetry?: () => void;
  error?: string | null;
  resetFilterDependency?: any;
}

export function CatalogSectionGrid({
  products,
  variant = "dark",
  loading = false,
  onResetFilters,
  emptyContent,
  onRetry,
  error = null,
  resetFilterDependency,
}: CatalogSectionGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isDark = variant === "dark";
  const totalProducts = products.length;
  const totalSections = Math.max(1, Math.ceil(totalProducts / ITEMS_PER_SECTION));

  // Leer sección de URL (?seccion=X)
  const seccionParam = searchParams.get("seccion");
  const parsedSection = seccionParam ? parseInt(seccionParam, 10) : 1;
  const initialSection = isNaN(parsedSection) || parsedSection < 1 ? 1 : parsedSection;

  const [currentSection, setCurrentSection] = useState(initialSection);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const sectionAnnouncementRef = useRef<HTMLDivElement>(null);

  // Detección de prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(media.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  // Sincronizar URL cuando cambia la sección
  const updateUrlSection = useCallback(
    (newSec: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newSec === 1) {
        params.delete("seccion");
      } else {
        params.set("seccion", newSec.toString());
      }
      const qs = params.toString();
      const targetUrl = pathname + (qs ? `?${qs}` : "");
      router.replace(targetUrl, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  // Si cambia el filtro, búsqueda, categoría u orden (resetFilterDependency), volver a sección 1
  const prevDependencyRef = useRef(resetFilterDependency);
  useEffect(() => {
    if (prevDependencyRef.current !== resetFilterDependency) {
      prevDependencyRef.current = resetFilterDependency;
      if (currentSection !== 1) {
        setDirection(-1);
        setCurrentSection(1);
        updateUrlSection(1);
      }
    }
  }, [resetFilterDependency, currentSection, updateUrlSection]);

  // Si ?seccion supera el total de secciones, redirigir a la última sección válida
  useEffect(() => {
    if (totalProducts > 0 && currentSection > totalSections) {
      setDirection(-1);
      setCurrentSection(totalSections);
      updateUrlSection(totalSections);
    }
  }, [currentSection, totalSections, totalProducts, updateUrlSection]);

  // Navegar a una sección específica
  const goToSection = useCallback(
    (target: number) => {
      const clamped = Math.max(1, Math.min(target, totalSections));
      if (clamped === currentSection) return;

      const newDir = clamped > currentSection ? 1 : -1;
      setDirection(newDir);
      setCurrentSection(clamped);
      updateUrlSection(clamped);

      // Scroll suave al inicio de la grilla (sin saltar al top de la página)
      if (gridContainerRef.current) {
        gridContainerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        // Mover foco accesible
        gridContainerRef.current.focus({ preventScroll: true });
      }
    },
    [currentSection, totalSections, updateUrlSection]
  );

  const prevSection = useCallback(() => {
    if (currentSection > 1) {
      goToSection(currentSection - 1);
    }
  }, [currentSection, goToSection]);

  const nextSection = useCallback(() => {
    if (currentSection < totalSections) {
      goToSection(currentSection + 1);
    }
  }, [currentSection, totalSections, goToSection]);

  // Gesto swipe táctil en móvil/tablet (umbral 50px sin interferir con scroll vertical)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const deltaX = t.clientX - touchStartRef.current.x;
    const deltaY = t.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Solo si el movimiento horizontal es dominante (1.5x mayor que vertical) y supera 50px
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        nextSection();
      } else {
        prevSection();
      }
    }
  };

  // Navegación por teclado (← / → / Inicio / Fin)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSection();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSection();
    } else if (e.key === "Home") {
      e.preventDefault();
      goToSection(1);
    } else if (e.key === "End") {
      e.preventDefault();
      goToSection(totalSections);
    }
  };

  // Productos de la sección actual (6 productos exactos)
  const currentProducts = useMemo(() => {
    const offset = (currentSection - 1) * ITEMS_PER_SECTION;
    return products.slice(offset, offset + ITEMS_PER_SECTION);
  }, [products, currentSection]);

  // Rango visible de productos
  const startItem = totalProducts === 0 ? 0 : (currentSection - 1) * ITEMS_PER_SECTION + 1;
  const endItem = Math.min(currentSection * ITEMS_PER_SECTION, totalProducts);

  // Generador de pastillas del paginador con elipsis
  const paginationItems = useMemo(() => {
    if (totalSections <= 7) {
      return Array.from({ length: totalSections }, (_, i) => i + 1);
    }
    const items: (number | "ellipsis-left" | "ellipsis-right")[] = [1];
    if (currentSection > 3) {
      items.push("ellipsis-left");
    }

    const start = Math.max(2, currentSection - 1);
    const end = Math.min(totalSections - 1, currentSection + 1);

    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    if (currentSection < totalSections - 2) {
      items.push("ellipsis-right");
    }
    items.push(totalSections);
    return items;
  }, [totalSections, currentSection]);

  // Animaciones Framer Motion
  const animVariants: Variants = {
    enter: (dir: number) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? 24 : -24,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0.05 : 0.25,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
    exit: (dir: number) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? -24 : 24,
      opacity: 0,
      transition: {
        duration: prefersReducedMotion ? 0.05 : 0.2,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };

  // ESTADO DE ERROR
  if (error) {
    return (
      <div
        className={cn(
          "rounded-2xl p-10 sm:p-14 text-center space-y-4 border",
          isDark
            ? "bg-slate-900/60 border-rose-900/40 text-slate-300"
            : "bg-rose-50/60 border-rose-200 text-slate-700"
        )}
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-2 border border-rose-500/20">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3
          className={cn(
            "text-lg font-bold",
            isDark ? "text-white" : "text-slate-900"
          )}
        >
          No se pudieron cargar los productos
        </h3>
        <p className="text-xs sm:text-sm max-w-md mx-auto text-slate-400">
          {error}
        </p>
        {onRetry && (
          <div className="pt-2">
            <Button
              type="button"
              onClick={onRetry}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs h-10 px-5 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reintentar
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ESTADO DE CARGA: 6 SKELETONS EXACTOS
  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 min-h-[660px]">
          {Array.from({ length: ITEMS_PER_SECTION }).map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-2xl p-3 flex flex-col justify-between border animate-pulse",
                isDark
                  ? "bg-slate-900/60 border-slate-800"
                  : "bg-white border-slate-200"
              )}
            >
              <div
                className={cn(
                  "w-full aspect-square rounded-xl",
                  isDark ? "bg-slate-800/70" : "bg-slate-100"
                )}
              />
              <div className="pt-3 space-y-2 flex-1">
                <div
                  className={cn(
                    "h-3 w-1/3 rounded",
                    isDark ? "bg-slate-800" : "bg-slate-200"
                  )}
                />
                <div
                  className={cn(
                    "h-4 w-4/5 rounded",
                    isDark ? "bg-slate-800" : "bg-slate-200"
                  )}
                />
                <div
                  className={cn(
                    "h-3 w-full rounded",
                    isDark ? "bg-slate-800/60" : "bg-slate-100"
                  )}
                />
              </div>
              <div
                className={cn(
                  "pt-3 border-t flex items-center justify-between mt-2",
                  isDark ? "border-slate-800" : "border-slate-100"
                )}
              >
                <div
                  className={cn(
                    "h-5 w-20 rounded",
                    isDark ? "bg-slate-800" : "bg-slate-200"
                  )}
                />
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl",
                    isDark ? "bg-slate-800" : "bg-slate-200"
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ESTADO VACÍO
  if (totalProducts === 0) {
    if (emptyContent) return <>{emptyContent}</>;
    return (
      <div
        className={cn(
          "rounded-2xl p-10 sm:p-14 text-center space-y-4 border",
          isDark
            ? "bg-slate-900/50 border-slate-800"
            : "bg-white border-slate-200"
        )}
      >
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2 border",
            isDark
              ? "bg-slate-800 text-slate-400 border-slate-700"
              : "bg-slate-100 text-slate-500 border-slate-200"
          )}
        >
          <PackageOpen className="w-6 h-6" />
        </div>
        <p
          className={cn(
            "text-base sm:text-lg font-semibold",
            isDark ? "text-slate-200" : "text-slate-800"
          )}
        >
          No encontramos productos
        </p>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          Prueba con otros términos de búsqueda o restablece los filtros para ver más artículos.
        </p>
        {onResetFilters && (
          <div className="pt-2">
            <Button
              type="button"
              onClick={onResetFilters}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs h-10 px-5 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={gridContainerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Catálogo de productos organizado por secciones de 6"
      className="relative outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl"
      style={{ touchAction: "pan-y" }}
    >
      {/* Región aria-live para anunciar cambio de sección a lectores de pantalla */}
      <div
        ref={sectionAnnouncementRef}
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        Sección {currentSection} de {totalSections}, productos {startItem} a {endItem} de {totalProducts}
      </div>

      {/* Contenedor relativo para flechas laterales de escritorio (>=1200px) */}
      <div className="relative">
        {/* Flecha Lateral Izquierda en Escritorio (>=1200px / xl) */}
        {totalSections > 1 && (
          <button
            type="button"
            onClick={prevSection}
            disabled={currentSection <= 1}
            aria-label="Sección anterior"
            className={cn(
              "hidden xl:flex absolute -left-5 2xl:-left-7 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full items-center justify-center border shadow-lg transition-all duration-200 cursor-pointer",
              isDark
                ? "bg-slate-900 border-slate-700 text-white hover:bg-slate-800 hover:border-blue-500 shadow-slate-950/60"
                : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-blue-400 shadow-slate-300/50",
              currentSection <= 1 && "opacity-30 cursor-not-allowed hover:border-slate-700 hover:bg-transparent"
            )}
          >
            <ChevronLeft className="w-[18px] h-[18px] shrink-0" />
          </button>
        )}

        {/* Grilla animada: 3 cols x 2 filas en desktop, 2 x 3 en tablet, 1 col en móvil con altura mínima */}
        <div className="min-h-[640px] sm:min-h-[720px] lg:min-h-[760px] flex flex-col justify-start">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`section-${currentSection}`}
              custom={direction}
              variants={animVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full"
            >
              {currentProducts.map((product, idx) => (
                <div key={product.id} className="h-full">
                  <ProductCard
                    product={product}
                    index={idx}
                    variant={variant}
                  />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Flecha Lateral Derecha en Escritorio (>=1200px / xl) */}
        {totalSections > 1 && (
          <button
            type="button"
            onClick={nextSection}
            disabled={currentSection >= totalSections}
            aria-label="Sección siguiente"
            className={cn(
              "hidden xl:flex absolute -right-5 2xl:-right-7 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full items-center justify-center border shadow-lg transition-all duration-200 cursor-pointer",
              isDark
                ? "bg-slate-900 border-slate-700 text-white hover:bg-slate-800 hover:border-blue-500 shadow-slate-950/60"
                : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-blue-400 shadow-slate-300/50",
              currentSection >= totalSections && "opacity-30 cursor-not-allowed hover:border-slate-700 hover:bg-transparent"
            )}
          >
            <ChevronRight className="w-[18px] h-[18px] shrink-0" />
          </button>
        )}
      </div>

      {/* Navegación e indicador solo si el total es > 6 (más de 1 sección) */}
      {totalSections > 1 && (
        <div className="mt-6 pt-2">
          {/* Barra de progreso de 2px azul bajo la grilla */}
          <div
            className={cn(
              "w-full h-[2px] rounded-full overflow-hidden mb-5",
              isDark ? "bg-slate-800" : "bg-slate-200"
            )}
          >
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${(currentSection / totalSections) * 100}%` }}
            />
          </div>

          {/* Bloque central: flechas móviles/tablet + texto indicador */}
          <div className="flex flex-col items-center justify-center gap-3.5 select-none">
            {/* Navegación compacta [‹] Sección X de Y [›] */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={prevSection}
                disabled={currentSection <= 1}
                aria-label="Sección anterior"
                className={cn(
                  "h-11 sm:h-9 px-3 rounded-xl border flex items-center justify-center text-xs font-semibold transition-all cursor-pointer shadow-xs",
                  isDark
                    ? "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300",
                  currentSection <= 1 && "opacity-30 cursor-not-allowed hover:border-slate-800 hover:bg-transparent"
                )}
              >
                <ChevronLeft className="w-4 h-4 mr-1 shrink-0" />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              <div className="text-center px-2">
                <p
                  className={cn(
                    "text-[14px] font-semibold tracking-tight",
                    isDark ? "text-white" : "text-slate-900"
                  )}
                >
                  Sección {currentSection} de {totalSections}
                </p>
                <p
                  className={cn(
                    "text-[12px] mt-0.5 tabular-nums",
                    isDark ? "text-slate-400" : "text-slate-500"
                  )}
                >
                  Productos {startItem}-{endItem} de {totalProducts}
                </p>
              </div>

              <button
                type="button"
                onClick={nextSection}
                disabled={currentSection >= totalSections}
                aria-label="Sección siguiente"
                className={cn(
                  "h-11 sm:h-9 px-3 rounded-xl border flex items-center justify-center text-xs font-semibold transition-all cursor-pointer shadow-xs",
                  isDark
                    ? "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300",
                  currentSection >= totalSections && "opacity-30 cursor-not-allowed hover:border-slate-800 hover:bg-transparent"
                )}
              >
                <span className="hidden sm:inline">Siguiente</span>
                <ChevronRight className="w-4 h-4 ml-1 shrink-0" />
              </button>
            </div>

            {/* Paginador numerado / dots en móvil */}
            <nav
              aria-label="Secciones del catálogo"
              className="flex items-center justify-center gap-1.5 pt-1"
            >
              {/* En móvil (<640px): puntos (dots) de 8px más texto 'X / Y' */}
              <div className="flex sm:hidden items-center gap-1.5 py-1">
                {Array.from({ length: Math.min(totalSections, 10) }).map((_, idx) => {
                  const secNum = idx + 1;
                  const isActive = secNum === currentSection;
                  return (
                    <button
                      key={secNum}
                      type="button"
                      onClick={() => goToSection(secNum)}
                      aria-label={`Ir a la sección ${secNum}`}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-200",
                        isActive
                          ? "bg-blue-600 scale-125 ring-2 ring-blue-500/30"
                          : isDark
                          ? "bg-slate-700 hover:bg-slate-600"
                          : "bg-slate-300 hover:bg-slate-400"
                      )}
                    />
                  );
                })}
                <span
                  className={cn(
                    "text-xs font-semibold ml-2 tabular-nums",
                    isDark ? "text-slate-400" : "text-slate-500"
                  )}
                >
                  {currentSection} / {totalSections}
                </span>
              </div>

              {/* En tablet y escritorio (>=640px): botones de 36px con número de sección */}
              <div className="hidden sm:flex items-center gap-1.5">
                {paginationItems.map((item, idx) => {
                  if (typeof item !== "number") {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className={cn(
                          "w-9 h-9 flex items-center justify-center text-xs tracking-wider",
                          isDark ? "text-slate-500" : "text-slate-400"
                        )}
                      >
                        …
                      </span>
                    );
                  }

                  const isActive = item === currentSection;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => goToSection(item)}
                      aria-label={`Ir a la sección ${item}`}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold transition-all duration-150 cursor-pointer shadow-xs",
                        isActive
                          ? "bg-[#2563eb] text-white font-bold shadow-md shadow-blue-600/30 ring-2 ring-blue-400/20"
                          : isDark
                          ? "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
