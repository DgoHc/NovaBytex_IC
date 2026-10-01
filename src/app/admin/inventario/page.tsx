"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Warehouse,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  ArrowUpDown,
  Edit3,
  ExternalLink,
  Package,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCatalog } from "@/contexts/CatalogContext";
import { cn } from "@/lib/utils";

export default function AdminInventarioPage() {
  const { products, stats, updateProduct, loading } = useCatalog();
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "inStock" | "outOfStock">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "technology" | "library">("all");
  const [sortOrder, setSortOrder] = useState<"name" | "price_desc" | "price_asc">("name");

  const toggleStock = (id: number, current: boolean) => {
    updateProduct({ id, inStock: !current });
  };

  const filtered = useMemo(() => {
    let list = [...products];

    if (stockFilter === "inStock") list = list.filter((p) => p.inStock);
    if (stockFilter === "outOfStock") list = list.filter((p) => !p.inStock);

    if (typeFilter !== "all") list = list.filter((p) => p.type === typeFilter);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (sortOrder === "price_desc") list.sort((a, b) => b.price - a.price);
    else if (sortOrder === "price_asc") list.sort((a, b) => a.price - b.price);
    else list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [products, stockFilter, typeFilter, search, sortOrder]);

  const outOfStockCount = stats.outOfStock;
  const inStockCount = stats.inStock;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Control de Inventario &amp; Stock
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Supervisa existencias y alterna la disponibilidad en tienda en un solo clic.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            asChild
            className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
          >
            <Link href="/admin/productos/nuevo">
              <Package className="w-3.5 h-3.5 mr-1.5" />
              Nuevo Producto
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Band */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-200/90">
        <div className="flex-1 p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Artículos
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {stats.total}
          </p>
        </div>
        <div className="flex-1 p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Disponibles (Stock)
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {inStockCount}
          </p>
        </div>
        <div className="flex-1 p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Estado General
          </p>
          {outOfStockCount === 0 ? (
            <p className="text-sm font-semibold text-emerald-700 mt-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Todo abastecido
            </p>
          ) : (
            <div className="mt-2">
              <p className="text-2xl font-extrabold text-rose-600 font-mono">
                {outOfStockCount}
              </p>
              <p className="text-[11px] text-rose-600/80 mt-1">agotados/sin stock</p>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Table Container */}
      <Card className="overflow-hidden border-slate-200 rounded-2xl bg-white shadow-sm">
        <CardContent className="p-4 lg:p-5 space-y-4 border-b border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Buscar por SKU o Nombre
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="SKU, producto, marca..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Estado de Stock
              </label>
              <Select
                value={stockFilter}
                onValueChange={(v) =>
                  setStockFilter(v as "all" | "inStock" | "outOfStock")
                }
              >
                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos ({stats.total})</SelectItem>
                  <SelectItem value="inStock">Solo En Stock ({inStockCount})</SelectItem>
                  <SelectItem value="outOfStock">
                    Agotados ({outOfStockCount})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Tipo de Catálogo
              </label>
              <Select
                value={typeFilter}
                onValueChange={(v) =>
                  setTypeFilter(v as "all" | "technology" | "library")
                }
              >
                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tecnología + Librería</SelectItem>
                  <SelectItem value="technology">Solo Tecnología</SelectItem>
                  <SelectItem value="library">Solo Librería</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              {(search.trim() || stockFilter !== "all" || typeFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setStockFilter("all");
                    setTypeFilter("all");
                  }}
                  className="w-full h-11 rounded-xl border-slate-200 text-xs font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </CardContent>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <th className="px-5 py-3 text-left w-16">Item</th>
                <th className="px-5 py-3 text-left">Producto</th>
                <th className="px-5 py-3 text-left w-32">SKU</th>
                <th className="px-5 py-3 text-left w-28">Tipo</th>
                <th className="px-5 py-3 text-right w-32">Precio</th>
                <th className="px-5 py-3 text-center w-40">Estado Stock</th>
                <th className="px-5 py-3 text-right w-28">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    No se encontraron productos con los filtros de stock seleccionados.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden">
                        <ProductImage
                          type={item.imageType}
                          name={item.name}
                          image={item.image}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 min-w-0">
                      <p className="font-semibold text-slate-900 truncate max-w-sm">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {item.brand} · {item.category}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                      {item.sku}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 border",
                          item.type === "technology"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-library-sage/25 text-library-sage-foreground border-library-sage/50"
                        )}
                      >
                        {item.type === "technology" ? "Tecnología" : "Librería"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900 tabular-nums">
                      S/ {item.price.toLocaleString("es-PE")}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleStock(item.id, item.inStock)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm",
                          item.inStock
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-200 group/btn"
                            : "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 group/btn"
                        )}
                        title="Haz clic para alternar el estado de stock"
                      >
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full",
                            item.inStock ? "bg-emerald-500" : "bg-rose-500"
                          )}
                        />
                        <span>{item.inStock ? "En Stock" : "Agotado"}</span>
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Link href={`/admin/productos/${item.id}`} title="Editar">
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        >
                          <a
                            href={`/productos/${item.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver en tienda"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
