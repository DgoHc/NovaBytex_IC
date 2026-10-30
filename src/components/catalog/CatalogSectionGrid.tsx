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

  // Cada sección muestra exactamente 6 productos (3x2 en escritorio, 2x3 en tablet, 1 en móvil)
  const itemsPerSection = 6;
  const totalSections = Math.max(1, Math.ceil(totalProducts / itemsPerSection));

  // Leer sección de URL (?seccion=X)
  const seccionParam = searchParams.get("seccion");
  const parsedSection = seccionParam ? parseInt(seccionParam, 10) : 1;
  const initialSection = isNaN(parsedSection) || parsedSection < 1 ? 1 : parsedSection;

  const [currentSection, setCurrentSection] = useState(initialSection);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Estado para el salto directo a sección ("Ir a la sección...")
  const [jumpOpen, setJumpOpen] = useState(false);
  const [jumpVal, setJumpVal] = useState("");

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

  // Gesto swipe horizontal táctil en móvil/tablet (umbral 40px)
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

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
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

  // Productos de la sección actual
  const currentProducts = useMemo(() => {
    const offset = (currentSection - 1) * itemsPerSection;
    return products.slice(offset, offset + itemsPerSection);
  }, [products, currentSection, itemsPerSection]);

  // Rango visible de productos
  const startItem = totalProducts === 0 ? 0 : (currentSection - 1) * itemsPerSection + 1;
  const endItem = Math.min(currentSection * itemsPerSection, totalProducts);

  // Generador de números con vecindad:
  // Con <= 7 secciones: muestra todas
  // Con > 7: siempre primera y última, y 2 a cada lado de la actual con elipsis (1 … 19 20 21 … 56)
  const paginationItems = useMemo(() => {
    if (totalSections <= 7) {
      return Array.from({ length: totalSections }, (_, i) => i + 1);
    }

    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalSections);

    for (let i = currentSection - 2; i <= currentSection + 2; i++) {
      if (i >= 1 && i <= totalSections) {
        pages.add(i);
      }
    }

    const sorted = Array.from(pages).sort((a, b) => a - b);
    const result: (number | "ellipsis-left" | "ellipsis-right")[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const cur = sorted[i];
      const prev = sorted[i - 1];

      if (prev !== undefined && cur - prev > 1) {
        if (cur <= currentSection) {
          result.push("ellipsis-left");
        } else {
          result.push("ellipsis-right");
        }
      }
      result.push(cur);
    }

    return result;
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
          <AlertTriangle width={24} height={24} className="w-6 h-6" />
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
              <RotateCcw width={14} height={14} className="w-3.5 h-3.5 mr-1.5" />
              Reintentar
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ESTADO DE CARGA: SKELETONS
  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full min-h-[580px]">
          {Array.from({ length: itemsPerSection }).map((_, idx) => (
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
                    "w-9 h-9 rounded-xl",
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
          <PackageOpen width={24} height={24} className="w-6 h-6" />
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
              <RotateCcw width={14} height={14} className="w-3.5 h-3.5 mr-1.5" />
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
      aria-label="Catálogo de productos organizado por secciones"
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

      {/* Grilla animada con altura mínima */}
      <div className="min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex flex-col justify-start">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`section-${currentSection}`}
            custom={direction}
            variants={animVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full items-stretch"
          >
            {currentProducts.map((product, idx) => (
              <div key={product.id} className="min-w-0 w-full h-full flex">
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

      {/* PAGINADOR (mismo ancho que la grilla, separación 48px arriba y 64px abajo) */}
      {totalSections > 1 && (
        <nav
          aria-label="Secciones del catálogo"
          className="mt-12 mb-16 w-full select-none"
        >
          {/* MÓVIL (<640px): Dos filas centradas; arriba ‹ 2 / 5 › con botones de 48px, debajo Productos 7-12 de 14 */}
          <div className="flex sm:hidden flex-col items-center justify-center gap-3 w-full">
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={prevSection}
                disabled={currentSection <= 1}
                aria-label="Sección anterior"
                aria-disabled={currentSection <= 1}
                className={cn(
                  "w-12 h-12 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-xs",
                  isDark
                    ? "bg-white/[0.04] border-white/[0.08] text-white hover:bg-white/[0.08]"
                    : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50",
                  currentSection <= 1 && "opacity-35 cursor-not-allowed hover:bg-transparent"
                )}
              >
                <ChevronLeft width={20} height={20} className="w-5 h-5 shrink-0" />
              </button>

              <span
                className={cn(
                  "text-[16px] font-semibold tabular-nums px-2",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                {currentSection} / {totalSections}
              </span>

              <button
                type="button"
                onClick={nextSection}
                disabled={currentSection >= totalSections}
                aria-label="Sección siguiente"
                aria-disabled={currentSection >= totalSections}
                className={cn(
                  "w-12 h-12 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-xs",
                  isDark
                    ? "bg-white/[0.04] border-white/[0.08] text-white hover:bg-white/[0.08]"
                    : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50",
                  currentSection >= totalSections && "opacity-35 cursor-not-allowed hover:bg-transparent"
                )}
              >
                <ChevronRight width={20} height={20} className="w-5 h-5 shrink-0" />
              </button>
            </div>

            <p
              className={cn(
                "text-[15px] tabular-nums text-center",
                isDark ? "text-slate-400" : "text-slate-500"
              )}
            >
              Productos {startItem}-{endItem} de {totalProducts}
            </p>

            {/* Enlace "Ir a la sección..." si hay más de 7 secciones en móvil */}
            {totalSections > 7 && (
              <div className="pt-1 text-center">
                {jumpOpen ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const val = parseInt(jumpVal, 10);
                      if (!isNaN(val) && val >= 1 && val <= totalSections) {
                        goToSection(val);
                        setJumpOpen(false);
                      }
                    }}
                    className="inline-flex items-center gap-1.5"
                  >
                    <span className="text-xs text-slate-400">Ir a sección:</span>
                    <input
                      type="number"
                      min={1}
                      max={totalSections}
                      value={jumpVal}
                      onChange={(e) => setJumpVal(e.target.value)}
                      autoFocus
                      className={cn(
                        "w-14 h-8 px-2 text-center text-xs font-semibold rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 tabular-nums",
                        isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
                      )}
                    />
                    <button type="submit" className="h-8 px-2.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer">
                      Ir
                    </button>
                    <button type="button" onClick={() => setJumpOpen(false)} className="h-8 px-2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
                      ✕
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setJumpVal(currentSection.toString());
                      setJumpOpen(true);
                    }}
                    className="text-xs text-blue-500 hover:underline font-medium cursor-pointer"
                  >
                    Ir a la sección…
                  </button>
                )}
              </div>
            )}
          </div>

          {/* TABLET Y ESCRITORIO (>=640px): Una sola fila, ancho completo, justify-between y align-items: center */}
          <div className="hidden sm:flex w-full items-center justify-between gap-4">
            {/* Izquierda: "Productos 1-6 de 14" (15px, gris azulado) */}
            <div className="shrink-0 min-w-0">
              <span
                className={cn(
                  "text-[15px] font-medium tabular-nums",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}
              >
                Productos {startItem}-{endItem} de {totalProducts}
              </span>
            </div>

            {/* Centro: Botón anterior (48x48px, icono 20px), Números (48x48px, gap 8px), Botón siguiente */}
            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="flex items-center justify-center gap-2">
                {/* Botón anterior: 48x48px, solo icono de 20px, radio 12px, borde sutil */}
                <button
                  type="button"
                  onClick={prevSection}
                  disabled={currentSection <= 1}
                  aria-label="Sección anterior"
                  aria-disabled={currentSection <= 1}
                  className={cn(
                    "w-12 h-12 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-xs",
                    isDark
                      ? "bg-white/[0.04] border-white/[0.08] text-white hover:bg-white/[0.08]"
                      : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50",
                    currentSection <= 1 && "opacity-35 cursor-not-allowed hover:bg-transparent"
                  )}
                >
                  <ChevronLeft width={20} height={20} className="w-5 h-5 shrink-0" />
                </button>

                {/* Números con vecindad: botones de 48x48px, 16px semibold, gap 8px */}
                {paginationItems.map((item, idx) => {
                  if (typeof item !== "number") {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className={cn(
                          "w-12 h-12 flex items-center justify-center text-[16px] tracking-wider select-none",
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
                        "w-12 h-12 rounded-xl flex items-center justify-center text-[16px] font-semibold transition-all cursor-pointer",
                        isActive
                          ? "bg-[#2563eb] text-white font-bold shadow-md shadow-blue-500/20 border-0"
                          : isDark
                          ? "bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      {item}
                    </button>
                  );
                })}

                {/* Botón siguiente: 48x48px, solo icono de 20px, radio 12px, borde sutil */}
                <button
                  type="button"
                  onClick={nextSection}
                  disabled={currentSection >= totalSections}
                  aria-label="Sección siguiente"
                  aria-disabled={currentSection >= totalSections}
                  className={cn(
                    "w-12 h-12 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-xs",
                    isDark
                      ? "bg-white/[0.04] border-white/[0.08] text-white hover:bg-white/[0.08]"
                      : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50",
                    currentSection >= totalSections && "opacity-35 cursor-not-allowed hover:bg-transparent"
                  )}
                >
                  <ChevronRight width={20} height={20} className="w-5 h-5 shrink-0" />
                </button>
              </div>

              {/* Enlace "Ir a la sección..." si hay más de 7 secciones */}
              {totalSections > 7 && (
                <div className="pt-1 text-center">
                  {jumpOpen ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const val = parseInt(jumpVal, 10);
                        if (!isNaN(val) && val >= 1 && val <= totalSections) {
                          goToSection(val);
                          setJumpOpen(false);
                        }
                      }}
                      className="inline-flex items-center gap-1.5"
                    >
                      <span className="text-xs text-slate-400">Ir a sección:</span>
                      <input
                        type="number"
                        min={1}
                        max={totalSections}
                        value={jumpVal}
                        onChange={(e) => setJumpVal(e.target.value)}
                        autoFocus
                        className={cn(
                          "w-14 h-8 px-2 text-center text-xs font-semibold rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 tabular-nums",
                          isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
                        )}
                      />
                      <button type="submit" className="h-8 px-2.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer">
                        Ir
                      </button>
                      <button type="button" onClick={() => setJumpOpen(false)} className="h-8 px-2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
                        ✕
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setJumpVal(currentSection.toString());
                        setJumpOpen(true);
                      }}
                      className="text-xs text-blue-500 hover:underline font-medium cursor-pointer"
                    >
                      Ir a la sección…
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Derecha: "Sección 1 de 3" (15px semibold) */}
            <div className="shrink-0 min-w-0 text-right">
              <span
                className={cn(
                  "text-[15px] font-semibold tabular-nums",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                Sección {currentSection} de {totalSections}
              </span>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
