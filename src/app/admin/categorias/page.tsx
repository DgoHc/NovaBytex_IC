"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Cpu, BookOpen, Tag, Plus, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCatalog } from "@/contexts/CatalogContext";
import {
  TECHNOLOGY_CATEGORIES,
  LIBRARY_CATEGORIES,
  getStoredCustomCategories,
  saveCustomCategory,
  type CatalogType,
  type CustomCategory,
} from "@/lib/products";
import { cn } from "@/lib/utils";

export default function AdminCategoriasPage() {
  const { products, stats, pushToast } = useCatalog();
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState<CatalogType>("technology");

  useEffect(() => {
    setCustomCategories(getStoredCustomCategories());
  }, []);

  const techCategories = useMemo(() => {
    const customTech = customCategories
      .filter((c) => c.type === "technology")
      .map((c) => c.name);
    return Array.from(new Set([...TECHNOLOGY_CATEGORIES, ...customTech]));
  }, [customCategories]);

  const libraryCategories = useMemo(() => {
    const customLib = customCategories
      .filter((c) => c.type === "library")
      .map((c) => c.name);
    return Array.from(new Set([...LIBRARY_CATEGORIES, ...customLib]));
  }, [customCategories]);

  const breakdown = useMemo(() => {
    const counts = new Map<string, { count: number; active: number; type: string }>();
    products.forEach((p) => {
      const existing = counts.get(p.category);
      if (existing) {
        existing.count += 1;
        if (p.available) existing.active += 1;
      } else {
        counts.set(p.category, {
          count: 1,
          active: p.available ? 1 : 0,
          type: p.type,
        });
      }
    });
    return counts;
  }, [products]);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCatName.trim();
    if (!name) return;

    const allExisting = [...techCategories, ...libraryCategories].map((c) =>
      c.toLowerCase()
    );
    if (allExisting.includes(name.toLowerCase())) {
      pushToast({
        title: "Categoría ya existe",
        description: `La categoría «${name}» ya está registrada.`,
        variant: "error",
      });
      return;
    }

    const updated = saveCustomCategory({ name, type: newCatType });
    setCustomCategories(updated);
    pushToast({
      title: "Categoría creada",
      description: `Se registró «${name}» en catálogo de ${
        newCatType === "technology" ? "Tecnología" : "Librería"
      }.`,
      variant: "success",
    });
    setNewCatName("");
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Categorías del Catálogo
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Administra las clasificaciones de Tecnología y Librería para organizar tus productos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <form onSubmit={handleCreateCategory}>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-slate-900">
                    Crear nueva categoría
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 text-xs">
                    Agrega una nueva clasificación a Tecnología o Librería.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Tipo de Catálogo
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setNewCatType("technology")}
                        className={cn(
                          "flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all",
                          newCatType === "technology"
                            ? "border-blue-600 bg-blue-50 text-blue-900 font-semibold"
                            : "border-slate-200 hover:border-slate-300 text-slate-700"
                        )}
                      >
                        <Cpu className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="text-xs">Tecnología</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewCatType("library")}
                        className={cn(
                          "flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all",
                          newCatType === "library"
                            ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold"
                            : "border-slate-200 hover:border-slate-300 text-slate-700"
                        )}
                      >
                        <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="text-xs">Librería</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Nombre de la categoría *
                    </label>
                    <Input
                      placeholder="Ej. Impresoras, Mochilas, Cables..."
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 text-sm"
                      autoFocus
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalOpen(false)}
                    className="h-11 rounded-xl border-slate-200 text-slate-700"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={!newCatName.trim()}
                    className="h-11 rounded-xl bg-slate-900 hover:bg-blue-800 text-white font-semibold"
                  >
                    Guardar categoría
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Band */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-200/90">
        <div className="flex-1 p-4 lg:p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Categorías Tecnología
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-slate-900 font-mono">
              {techCategories.length}
            </p>
            <p className="text-xs text-slate-500">{stats.technology} productos</p>
          </div>
        </div>
        <div className="flex-1 p-4 lg:p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Categorías Librería
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-slate-900 font-mono">
              {libraryCategories.length}
            </p>
            <p className="text-xs text-slate-500">{stats.library} productos</p>
          </div>
        </div>
        <div className="flex-1 p-4 lg:p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            En uso con stock
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-slate-900 font-mono">
              {breakdown.size}
            </p>
            <p className="text-xs text-slate-500">con productos</p>
          </div>
        </div>
        <div className="flex-1 p-4 lg:p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Productos totales
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-slate-900 font-mono">
              {stats.total}
            </p>
            <p className="text-xs text-slate-500">{stats.active} activos</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="technology" className="w-full">
        <TabsList className="h-12 bg-transparent border-b border-slate-200 w-full justify-start rounded-none p-0">
          <TabsTrigger
            value="technology"
            className="rounded-none border-b-2 border-transparent px-4 h-full text-sm font-semibold text-slate-500 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Tecnología ({techCategories.length})
          </TabsTrigger>
          <TabsTrigger
            value="library"
            className="rounded-none border-b-2 border-transparent px-4 h-full text-sm font-semibold text-slate-500 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Librería ({libraryCategories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="technology">
          <CategoryGrid
            categories={techCategories}
            customs={customCategories.filter((c) => c.type === "technology")}
            data={breakdown}
            tone="blue"
            type="technology"
          />
        </TabsContent>
        <TabsContent value="library">
          <CategoryGrid
            categories={libraryCategories}
            customs={customCategories.filter((c) => c.type === "library")}
            data={breakdown}
            tone="sage"
            type="library"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CategoryGrid({
  categories,
  customs,
  data,
  tone,
  type,
}: {
  categories: string[];
  customs: CustomCategory[];
  data: Map<string, { count: number; active: number; type: string }>;
  tone: "blue" | "sage";
  type: CatalogType;
}) {
  const customSet = new Set(customs.map((c) => c.name));

  return (
    <div className="overflow-x-auto pt-4">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-slate-200/90 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <th className="px-4 py-3 font-medium">Categoría</th>
            <th className="px-4 py-3 font-medium text-right">Productos</th>
            <th className="px-4 py-3 font-medium text-right">Activos</th>
            <th className="px-4 py-3 font-medium w-48">% del catálogo</th>
            <th className="px-4 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {categories.map((cat) => {
            const info = data.get(cat);
            const isCustom = customSet.has(cat);
            const totalForType = statsTotalFrom(data);
            const rawPct = totalForType === 0 ? 0 : ((info?.count ?? 0) / totalForType) * 100;
            const pct = Math.round(rawPct);
            const barWidth = Math.max(pct, info?.count ? 4 : 0); // min 4% if count > 0

            return (
              <tr key={cat} className="hover:bg-blue-50/50 group transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[14px] text-slate-900">{cat}</span>
                    {isCustom && (
                      <Badge className="h-5 px-1.5 rounded bg-slate-100 text-slate-600 border-none text-[9px] font-bold">
                        NUEVA
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-900">
                  {info?.count ?? 0}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-emerald-700 font-medium">
                  {info?.active ?? 0}
                </td>
                <td className="px-4 py-3 w-48">
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums text-slate-600 text-xs min-w-[28px] text-right">
                      {pct}%
                    </span>
                    <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", tone === "blue" ? "bg-blue-600" : "bg-emerald-600")}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/productos/nuevo?type=${type}&category=${encodeURIComponent(cat)}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-900"
                      title="Agregar producto"
                    >
                      <Plus className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/productos?type=${type}&category=${encodeURIComponent(cat)}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Ver productos
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function statsTotalFrom(
  map: Map<string, { count: number; active: number; type: string }>
): number {
  let sum = 0;
  map.forEach((v) => (sum += v.count));
  return sum;
}

function MiniStat({
  label,
  value,
  tone,
  subtitle,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: "blue" | "sage" | "emerald" | "indigo";
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const map: Record<string, string> = {
    blue: "from-blue-50 to-white border-blue-100",
    sage: "from-library-cream to-white border-library-beige/80",
    emerald: "from-emerald-50 to-white border-emerald-100",
    indigo: "from-indigo-50 to-white border-indigo-100",
  };
  const iconTone: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700",
    sage: "bg-library-sage/25 text-library-sage-foreground",
    emerald: "bg-emerald-100 text-emerald-700",
    indigo: "bg-indigo-100 text-indigo-700",
  };
  return (
    <div className={`rounded-2xl border p-5 bg-gradient-to-br ${map[tone]}`}>
      <div className="flex items-center justify-between">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconTone[tone]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-[11.5px] font-bold uppercase tracking-[0.18em] text-slate-500 mt-5">
        {label}
      </p>
      <p className="text-3xl font-black tracking-tight text-slate-900 mt-1.5 tabular-nums leading-none">
        {value}
      </p>
      {subtitle && (
        <p className="text-[11.5px] text-slate-500 mt-2 leading-snug">
          {subtitle}
        </p>
      )}
    </div>
  );
}
