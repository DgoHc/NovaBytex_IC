"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Filter, Search, X, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface LibraryFilterPanelProps {
  categories: string[];
  categoryIcons: Record<string, React.ComponentType<{ width?: number; height?: number; className?: string }>>;
  categoryCounts: Record<string, number>;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priceRange: [number, number];
  priceBounds: [number, number];
  onPriceChange: (range: [number, number]) => void;
  activeFiltersCount: number;
  onResetFilters: () => void;
  idPrefix?: string;
  hideHeader?: boolean;
}

export function LibraryFilterPanel({
  categories,
  categoryIcons,
  categoryCounts,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  priceRange,
  priceBounds,
  onPriceChange,
  activeFiltersCount,
  onResetFilters,
  idPrefix = "filter",
  hideHeader = false,
}: LibraryFilterPanelProps) {
  // Búsqueda con debounce local de 300ms
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const searchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchInput = (val: string) => {
    setLocalSearch(val);
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }
    searchDebounceTimerRef.current = setTimeout(() => {
      onSearchChange(val);
    }, 300);
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }
    onSearchChange("");
  };

  // Categorías expandibles sin scroll interno
  const [showAllCategories, setShowAllCategories] = useState(false);
  const categoriesToDisplay = useMemo(() => {
    // Si hay más de 7 categorías, mostrar 6 inicialmente + botón "Ver todas"
    if (categories.length > 7 && !showAllCategories) {
      return categories.slice(0, 6);
    }
    return categories;
  }, [categories, showAllCategories]);

  // Rango de precio local para slider fluido e inputs numéricos
  const [tempMin, setTempMin] = useState(priceRange[0]);
  const [tempMax, setTempMax] = useState(priceRange[1]);
  const priceDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTempMin(priceRange[0]);
    setTempMax(priceRange[1]);
  }, [priceRange]);

  const commitPrice = (newMin: number, newMax: number) => {
    const validMin = Math.max(priceBounds[0], Math.min(newMin, newMax));
    const validMax = Math.min(priceBounds[1], Math.max(newMin, newMax));
    setTempMin(validMin);
    setTempMax(validMax);
    onPriceChange([validMin, validMax]);
  };

  const handleSliderChange = (vals: number[]) => {
    const [min, max] = vals;
    setTempMin(min);
    setTempMax(max);
    if (priceDebounceTimerRef.current) {
      clearTimeout(priceDebounceTimerRef.current);
    }
    priceDebounceTimerRef.current = setTimeout(() => {
      commitPrice(min, max);
    }, 300);
  };

  const handleSliderCommit = (vals: number[]) => {
    if (priceDebounceTimerRef.current) {
      clearTimeout(priceDebounceTimerRef.current);
    }
    commitPrice(vals[0], vals[1]);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setTempMin(val);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setTempMax(val);
  };

  const handleInputBlur = () => {
    commitPrice(tempMin || priceBounds[0], tempMax || priceBounds[1]);
  };

  return (
    <div className="space-y-6">
      {/* 1. CABECERA: Icono 16px + 'Filtros' (16px semibold) | 'Limpiar (N)' (13px) */}
      {!hideHeader && (
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <Filter width={16} height={16} className="w-4 h-4 text-[#0f172a] shrink-0" />
            <h3 className="text-[16px] font-semibold text-[#0f172a] tracking-tight">
              Filtros
            </h3>
          </div>
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[13px] font-medium text-slate-600 hover:text-[#0f172a] transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
            >
              Limpiar ({activeFiltersCount})
            </button>
          )}
        </div>
      )}

      {/* 2. BÚSQUEDA: Input 40px, lupa 16px a 12px con pl-38px, botón de borrar X (14px) */}
      <div className="space-y-2">
        <label
          htmlFor={`${idPrefix}-search-input`}
          className="text-[13px] font-semibold text-slate-900 block"
        >
          Búsqueda
        </label>
        <div className="relative">
          <Search
            width={16}
            height={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none shrink-0"
          />
          <input
            id={`${idPrefix}-search-input`}
            type="text"
            placeholder="Buscar productos"
            value={localSearch}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="h-10 pl-[38px] pr-9 bg-white border border-[#e8e2d8] rounded-xl text-[16px] lg:text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none transition-all w-full"
          />
          {localSearch.length > 0 && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Borrar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
            >
              <X width={14} height={14} className="w-3.5 h-3.5 shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* 3. CATEGORÍA: Lista sin scroll interno, 40px altura, 16px icono, nombre 14px, conteo 12px */}
      <div className="space-y-2">
        <h4 className="text-[13px] font-semibold text-slate-900">
          Categoría
        </h4>
        <div
          role="radiogroup"
          aria-label="Filtrar por categoría"
          className="space-y-1"
        >
          {/* Opción 'Todas' */}
          <button
            type="button"
            role="radio"
            aria-checked={selectedCategory === "Todos"}
            onClick={() => onSelectCategory("Todos")}
            className={cn(
              "w-full h-10 flex items-center justify-between px-3 rounded-xl transition-all cursor-pointer text-left text-sm",
              selectedCategory === "Todos"
                ? "bg-[#EBF3ED] text-[#0f172a] font-semibold border-l-[3px] border-[#0f172a] rounded-l-none"
                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-l-[3px] border-transparent"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <Sparkles width={16} height={16} className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-[14px] truncate">Todas</span>
            </div>
            {categoryCounts["Todos"] !== undefined && (
              <span className="text-[12px] text-slate-400 tabular-nums ml-2 shrink-0">
                {categoryCounts["Todos"]}
              </span>
            )}
          </button>

          {/* Categorías dinámicas */}
          {categoriesToDisplay.map((cat) => {
            const Icon = categoryIcons[cat];
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat] ?? 0;

            return (
              <button
                key={cat}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectCategory(cat)}
                className={cn(
                  "w-full h-10 flex items-center justify-between px-3 rounded-xl transition-all cursor-pointer text-left text-sm",
                  isSelected
                    ? "bg-[#EBF3ED] text-[#0f172a] font-semibold border-l-[3px] border-[#0f172a] rounded-l-none"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-l-[3px] border-transparent"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {Icon ? (
                    <Icon width={16} height={16} className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 shrink-0" />
                  )}
                  <span className="text-[14px] truncate">{cat}</span>
                </div>
                <span className="text-[12px] text-slate-400 tabular-nums ml-2 shrink-0">
                  {count}
                </span>
              </button>
            );
          })}

          {/* Enlace 'Ver todas' / 'Ver menos' si hay más de 7 categorías */}
          {categories.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="w-full text-left pt-1.5 px-3 text-[13px] font-semibold text-slate-600 hover:text-[#0f172a] transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>{showAllCategories ? "Ver menos" : `Ver todas (${categories.length})`}</span>
              {showAllCategories ? (
                <ChevronUp width={14} height={14} className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown width={14} height={14} className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 4. RANGO DE PRECIO: Título 13px, dos inputs 40px con prefijo S/, slider doble punto azul marino */}
      <div className="space-y-3">
        <h4 className="text-[13px] font-semibold text-slate-900">
          Rango de precio
        </h4>

        {/* Dos inputs numéricos de 40px con prefijo 'S/' fijo */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none select-none">
              S/
            </span>
            <input
              id={`${idPrefix}-min-price`}
              type="number"
              min={priceBounds[0]}
              max={tempMax}
              value={tempMin || ""}
              onChange={handleMinInputChange}
              onBlur={handleInputBlur}
              aria-label="Precio mínimo en soles"
              className="h-10 w-full pl-8 pr-2 bg-white border border-[#e8e2d8] rounded-xl text-[16px] lg:text-[14px] text-slate-900 tabular-nums focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none transition-all"
            />
          </div>
          <span className="text-slate-400 font-medium select-none">–</span>
          <div className="relative flex-1 min-w-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none select-none">
              S/
            </span>
            <input
              id={`${idPrefix}-max-price`}
              type="number"
              min={tempMin}
              max={priceBounds[1]}
              value={tempMax || ""}
              onChange={handleMaxInputChange}
              onBlur={handleInputBlur}
              aria-label="Precio máximo en soles"
              className="h-10 w-full pl-8 pr-2 bg-white border border-[#e8e2d8] rounded-xl text-[16px] lg:text-[14px] text-slate-900 tabular-nums focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none transition-all"
            />
          </div>
        </div>

        {/* Slider de doble punto (@radix-ui/react-slider) */}
        <div className="pt-2 px-1">
          <Slider
            min={priceBounds[0]}
            max={priceBounds[1]}
            step={1}
            value={[tempMin, tempMax]}
            onValueChange={handleSliderChange}
            onValueCommit={handleSliderCommit}
            aria-label="Rango de precios del catálogo"
          />
          {/* Límites reales del catálogo abajo */}
          <div className="flex items-center justify-between text-[12px] text-slate-400 tabular-nums mt-2 select-none">
            <span>S/ {priceBounds[0]}</span>
            <span>S/ {priceBounds[1]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

