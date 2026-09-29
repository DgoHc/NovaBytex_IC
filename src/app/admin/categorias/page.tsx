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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5">
        <MiniStat
          label="Categorías Tecnología"
          value={techCategories.length}
          tone="blue"
          icon={Cpu}
          subtitle={`${stats.technology} productos`}
        />
        <MiniStat
          label="Categorías Librería"
          value={libraryCategories.length}
          tone="sage"
          icon={BookOpen}
          subtitle={`${stats.library} productos`}
        />
        <MiniStat
          label="En uso con stock"
          value={breakdown.size}
          tone="emerald"
          icon={Tag}
          subtitle="con productos asignados"
        />
        <MiniStat
          label="Productos totales"
          value={stats.total}
          tone="indigo"
          icon={Tag}
          subtitle={`${stats.active} activos · ${stats.inactive} inactivos`}
        />
      </div>

      <Tabs defaultValue="technology" className="w-full">
        <TabsList className="h-11 rounded-xl bg-slate-100 p-1">
          <TabsTrigger
            value="technology"
            className="rounded-lg px-4 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            <Cpu className="w-4 h-4 mr-2 text-blue-600" />
            Tecnología ({techCategories.length})
          </TabsTrigger>
          <TabsTrigger
            value="library"
            className="rounded-lg px-4 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            <BookOpen className="w-4 h-4 mr-2 text-emerald-700" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5 pt-5">
      {categories.map((cat) => {
        const info = data.get(cat);
        const isCustom = customSet.has(cat);
        const totalForType = statsTotalFrom(data);
        const pct =
          totalForType === 0
            ? 0
            : Math.round(((info?.count ?? 0) / totalForType) * 100);

        return (
          <Card
            key={cat}
            className={cn(
              "overflow-hidden border rounded-2xl shadow-sm bg-white flex flex-col justify-between",
              tone === "blue" ? "border-blue-100" : "border-library-beige/80"
            )}
          >
            <CardHeader
              className={cn(
                "px-5 py-4 border-b",
                tone === "blue"
                  ? "bg-gradient-to-br from-blue-50/80 to-white border-blue-100"
                  : "bg-gradient-to-br from-library-cream/70 to-white border-library-beige/70"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Badge
                    className={cn(
                      "h-6 px-2.5 rounded-md text-[10.5px] font-bold border",
                      tone === "blue"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-library-sage-foreground text-white border-library-sage-foreground"
                    )}
                  >
                    {tone === "blue" ? "Tech" : "Librería"}
                  </Badge>
                  {isCustom && (
                    <Badge className="h-6 px-2 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                      <Sparkles className="w-2.5 h-2.5 mr-1" />
                      Nueva
                    </Badge>
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-500 tabular-nums">
                  {pct}%
                </span>
              </div>
              <h3 className="font-bodoni text-xl text-slate-900 mt-3 leading-none">
                {cat}
              </h3>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Productos
                  </p>
                  <p className="text-2xl font-black text-slate-900 leading-none mt-1 tabular-nums">
                    {info?.count ?? 0}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Activos
                  </p>
                  <p className="text-lg font-black text-emerald-700 leading-none mt-1 tabular-nums">
                    {info?.active ?? 0}
                  </p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    tone === "blue"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-500"
                      : "bg-gradient-to-r from-library-sage-foreground to-library-terracotta"
                  )}
                  style={{ width: `${Math.max(pct, info?.count ? 8 : 0)}%` }}
                />
              </div>
              <div className="space-y-1.5 pt-1">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="w-full h-9 rounded-xl text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <Link href={`/admin/productos?type=${type}&category=${encodeURIComponent(cat)}`}>
                    Ver {info?.count ?? 0} productos
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="w-full h-9 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-blue-800 text-white"
                >
                  <Link href={`/admin/productos/nuevo?type=${type}&category=${encodeURIComponent(cat)}`}>
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Agregar producto aquí
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
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
