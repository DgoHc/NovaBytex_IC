"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  RotateCcw,
  ArrowUpDown,
  Edit3,
  ExternalLink,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Boxes,
  DollarSign,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCatalog } from "@/contexts/CatalogContext";
import { type Product } from "@/lib/products";
import { cn } from "@/lib/utils";

type SortOption = "name_asc" | "price_desc" | "price_asc" | "out_of_stock_first" | "in_stock_first";

export default function AdminInventarioPage() {
  const { products, stats, updateProduct, deleteProduct, loading, refresh, pushToast } = useCatalog();
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "inStock" | "outOfStock">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "technology" | "library">("all");
  const [sortOrder, setSortOrder] = useState<SortOption>("name_asc");
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState<Product | null>(null);

  const toggleStock = (id: number, current: boolean, productName: string) => {
    const nextStock = !current;
    updateProduct({ id, inStock: nextStock });
    pushToast({
      title: nextStock ? "En Stock" : "Agotado",
      description: `«${productName}» marcado como ${nextStock ? "en stock" : "agotado"}.`,
      variant: nextStock ? "success" : "info",
    });
  };

  const handleDeleteProduct = () => {
    if (!confirmDeleteProduct) return;
    deleteProduct(confirmDeleteProduct.id);
    pushToast({
      title: "Producto eliminado",
      description: `«${confirmDeleteProduct.name}» fue removido del catálogo.`,
      variant: "info",
    });
    setConfirmDeleteProduct(null);
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

    switch (sortOrder) {
      case "price_desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "out_of_stock_first":
        list.sort((a, b) => (a.inStock === b.inStock ? 0 : a.inStock ? 1 : -1));
        break;
      case "in_stock_first":
        list.sort((a, b) => (a.inStock === b.inStock ? 0 : a.inStock ? -1 : 1));
        break;
      case "name_asc":
      default:
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return list;
  }, [products, stockFilter, typeFilter, search, sortOrder]);

  const outOfStockCount = stats.outOfStock;
  const inStockCount = stats.inStock;
  const stockPercentage = stats.total > 0 ? Math.round((inStockCount / stats.total) * 100) : 0;
  const totalStockValue = products
    .filter((p) => p.inStock)
    .reduce((sum, p) => sum + (p.price || 0), 0);

  const hasActiveFilters = search.trim() !== "" || stockFilter !== "all" || typeFilter !== "all";

  return (
    <div className="p-3.5 sm:p-5 lg:p-6 max-w-[1600px] mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Control de Inventario &amp; Stock
            </h1>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[11px] font-bold py-0 h-5">
              {inStockCount} En Stock
            </Badge>
            {outOfStockCount > 0 && (
              <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[11px] font-bold py-0 h-5">
                {outOfStockCount} Agotados
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Supervisa existencias en bodega y conmuta disponibilidad en tienda con un solo clic.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {refresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="h-8.5 px-3 rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs gap-1.5"
            >
              <RefreshCw className={cn("w-3 h-3 text-blue-600 shrink-0", loading && "animate-spin")} />
              Actualizar
            </Button>
          )}
          <Button
            asChild
            className="h-8.5 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs gap-1.5 border-0"
          >
            <Link href="/admin/productos/nuevo">
              <Plus className="w-3 h-3 shrink-0" />
              Nuevo Producto
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards Row - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3 bg-white border-slate-200/90 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total Artículos
            </span>
            <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Boxes className="w-3 h-3" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900 mt-0.5 font-mono">{stats.total}</p>
          <span className="text-[10px] text-slate-400">
            {stats.technology} TI · {stats.library} Librería
          </span>
        </Card>

        <Card className="p-3 bg-white border-slate-200/90 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Disponibles
            </span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-3 h-3" />
            </div>
          </div>
          <p className="text-xl font-black text-emerald-600 mt-0.5 font-mono">{inStockCount}</p>
          <span className="text-[10px] text-emerald-700 font-medium">
            {stockPercentage}% abastecido
          </span>
        </Card>

        <Card className="p-3 bg-white border-slate-200/90 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Sin Existencia
            </span>
            <div className="w-6 h-6 rounded-md bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-3 h-3" />
            </div>
          </div>
          <p className="text-xl font-black text-rose-600 mt-0.5 font-mono">{outOfStockCount}</p>
          <span className="text-[10px] text-slate-400">
            {outOfStockCount === 0 ? "Sin agotados" : "Requiere compra"}
          </span>
        </Card>

        <Card className="p-3 bg-white border-slate-200/90 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Valor Inventario
            </span>
            <div className="w-6 h-6 rounded-md bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <DollarSign className="w-3 h-3" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900 mt-0.5 font-mono">
            S/ {totalStockValue.toLocaleString("es-PE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-slate-400">
            Total en tienda activa
          </span>
        </Card>
      </div>

      {/* Main Table Card - STRICT TABLE-FIXED & ZERO OVERFLOW */}
      <Card className="overflow-hidden border-slate-200/90 rounded-xl bg-white shadow-2xs">
        {/* Clean Filter Controls (todos h-10, gap de 12px, alineados en una sola fila) */}
        <CardContent className="p-3 lg:px-4 lg:py-2.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search
                size={16}
                style={{ width: 16, height: 16 }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none shrink-0"
              />
              <Input
                placeholder="Buscar SKU, producto, marca o categoría..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-[38px] h-10 rounded-lg bg-white border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 w-full"
              />
            </div>

            {/* Stock Filter Select */}
            <div className="w-full sm:w-[190px] shrink-0 min-w-[160px]">
              <Select
                value={stockFilter}
                onValueChange={(v) => setStockFilter(v as "all" | "inStock" | "outOfStock")}
              >
                <SelectTrigger className="h-10 rounded-lg bg-white border-slate-200 text-xs w-full min-w-[160px]">
                  <SelectValue placeholder="Estado de Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">Stock: Todos ({stats.total})</SelectItem>
                  <SelectItem value="inStock" className="text-xs">Solo En Stock ({inStockCount})</SelectItem>
                  <SelectItem value="outOfStock" className="text-xs">Solo Agotados ({outOfStockCount})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Catalog Type Select */}
            <div className="w-full sm:w-[180px] shrink-0 min-w-[160px]">
              <Select
                value={typeFilter}
                onValueChange={(v) => setTypeFilter(v as "all" | "technology" | "library")}
              >
                <SelectTrigger className="h-10 rounded-lg bg-white border-slate-200 text-xs w-full min-w-[160px]">
                  <SelectValue placeholder="Catálogo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">Catálogo: Todos</SelectItem>
                  <SelectItem value="technology" className="text-xs">Solo Tecnología TI</SelectItem>
                  <SelectItem value="library" className="text-xs">Solo Librería</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Button */}
            <div className="w-full sm:w-[160px] shrink-0 min-w-[150px]">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortOrder((prev) => {
                    const order: SortOption[] = [
                      "name_asc",
                      "out_of_stock_first",
                      "in_stock_first",
                      "price_desc",
                      "price_asc",
                    ];
                    const idx = order.indexOf(prev);
                    return order[(idx + 1) % order.length];
                  })
                }
                className="w-full h-10 justify-start gap-2 rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium px-3"
              >
                <ArrowUpDown size={16} style={{ width: 16, height: 16 }} className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">
                  {sortOrder === "name_asc"
                    ? "Nombre A-Z"
                    : sortOrder === "out_of_stock_first"
                    ? "Agotados 1°"
                    : sortOrder === "in_stock_first"
                    ? "En stock 1°"
                    : sortOrder === "price_desc"
                    ? "Mayor precio"
                    : "Menor precio"}
                </span>
              </Button>
            </div>
          </div>
        </CardContent>

        {/* Counter & Reset Bar */}
        <div className="px-4 py-2 text-xs text-slate-500 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <span>
              Mostrando <strong className="text-slate-800 font-semibold">{filtered.length}</strong> de {products.length} productos
            </span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setStockFilter("all");
                  setTypeFilter("all");
                }}
                className="h-6 px-2 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
              >
                <RotateCcw size={12} style={{ width: 12, height: 12 }} className="w-3 h-3 mr-1 shrink-0" /> Restablecer filtros
              </Button>
            )}
          </div>
          {loading && <span className="text-slate-400">Actualizando…</span>}
        </div>

        {/* DESKTOP TABLE - FUSED PRODUCT COLUMN & NO OVERFLOW */}
        <div className="hidden md:block w-full overflow-hidden">
          <table className="w-full table-fixed text-xs border-collapse">
            <colgroup>
              <col style={{ width: "38%" }} />  {/* Producto: Imagen 38x38 + Nombre + Marca */}
              <col style={{ width: "14%" }} />  {/* SKU */}
              <col style={{ width: "13%" }} />  {/* Catálogo */}
              <col style={{ width: "11%" }} />  {/* Precio */}
              <col style={{ width: "12%" }} />  {/* Estado Stock */}
              <col style={{ width: "12%" }} />  {/* Acciones (espacio seguro sin desbordamiento) */}
            </colgroup>
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="text-left px-3 py-2">Producto</th>
                <th className="text-left px-2.5 py-2">SKU</th>
                <th className="text-left px-2.5 py-2">Catálogo</th>
                <th className="text-right px-2.5 py-2">Precio</th>
                <th className="text-center px-2 py-2">Stock</th>
                <th className="text-right px-2.5 py-2 whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-slate-500">
                    <div className="inline-flex flex-col items-center gap-1.5 max-w-sm">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">
                        No se encontraron productos
                      </p>
                      <p className="text-[11px] text-slate-400">
                        No hay artículos con los filtros de stock seleccionados.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="group hover:bg-slate-50/70 transition-colors h-[48px]"
                  >
                    {/* FUSED PRODUCT COLUMN: IMAGE (38x38) + NAME + BRAND (CLEAR DISTANCE & ZERO OVERLAP) */}
                    <td className="px-3 py-1.5 align-middle overflow-hidden max-w-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-[38px] h-[38px] rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-0.5 shrink-0 shadow-2xs">
                          <ProductImage
                            type={item.imageType}
                            name={item.name}
                            image={item.image}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900 truncate text-[12px] leading-tight" title={item.name}>
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate leading-tight">
                            {item.brand} · <span className="text-slate-500">{item.category}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="px-2.5 py-1.5 align-middle">
                      <span className="font-mono text-[10.5px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {item.sku}
                      </span>
                    </td>

                    {/* Catalog Type */}
                    <td className="px-2.5 py-1.5 align-middle">
                      <Badge
                        className={cn(
                          "text-[9px] font-bold px-1.5 py-0 h-4 border",
                          item.type === "technology"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-teal-50 text-teal-700 border-teal-200"
                        )}
                      >
                        {item.type === "technology" ? "TI" : "Librería"}
                      </Badge>
                    </td>

                    {/* Price */}
                    <td className="px-2.5 py-1.5 align-middle text-right font-mono font-bold text-slate-900 text-[11.5px] tabular-nums">
                      S/ {item.price.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Stock Switch Toggle - Compact */}
                    <td className="px-2 py-1.5 align-middle text-center">
                      <button
                        type="button"
                        onClick={() => toggleStock(item.id, item.inStock, item.name)}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all border shadow-2xs cursor-pointer",
                          item.inStock
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-200"
                            : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200"
                        )}
                        title="Clic para alternar disponibilidad"
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
                            item.inStock ? "bg-emerald-500" : "bg-rose-500"
                          )}
                        />
                        <span>{item.inStock ? "En Stock" : "Agotado"}</span>
                      </button>
                    </td>

                    {/* Actions - Icono 13.5px en recuadro compacto de 21px (sin desborde ni salto de columna) */}
                    <td className="px-2.5 py-1.5 align-middle text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 flex-nowrap shrink-0">
                        <Link
                          href={`/admin/productos/${item.id}`}
                          title="Editar producto"
                          className="w-[21px] h-[21px] rounded-[4px] flex items-center justify-center text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors shrink-0"
                        >
                          <Edit3 size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 shrink-0" />
                        </Link>
                        <a
                          href={`/productos/${item.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ver en tienda"
                          className="w-[21px] h-[21px] rounded-[4px] flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
                        >
                          <ExternalLink size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 shrink-0" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteProduct(item)}
                          className="w-[21px] h-[21px] rounded-[4px] flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* RESPONSIVE MOBILE VIEW (< 768px) */}
        <div className="md:hidden px-3 pb-3 pt-2.5 space-y-2.5 border-t border-slate-100">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <p className="text-xs font-semibold text-slate-700">No hay productos</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Ajusta los filtros o busca otro artículo.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-2"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-10 h-10 rounded-md bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-0.5 shrink-0">
                    <ProductImage
                      type={item.imageType}
                      name={item.name}
                      image={item.image}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate text-xs">{item.name}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {item.brand} · {item.category}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-mono text-[9.5px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {item.sku}
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-[11px]">
                        S/ {item.price.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => toggleStock(item.id, item.inStock, item.name)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold transition-all border shadow-2xs",
                      item.inStock
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-rose-50 text-rose-800 border-rose-200"
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        item.inStock ? "bg-emerald-500" : "bg-rose-500"
                      )}
                    />
                    <span>{item.inStock ? "En Stock" : "Agotado"}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/productos/${item.id}`}
                      title="Editar"
                      className="w-6 h-6 rounded-[4px] flex items-center justify-center text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors shrink-0"
                    >
                      <Edit3 size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 shrink-0" />
                    </Link>
                    <a
                      href={`/productos/${item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ver en tienda"
                      className="w-6 h-6 rounded-[4px] flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
                    >
                      <ExternalLink size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 shrink-0" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteProduct(item)}
                      className="w-6 h-6 rounded-[4px] flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* CONFIRM DELETE MODAL */}
      <AlertDialog
        open={!!confirmDeleteProduct}
        onOpenChange={(open) => !open && setConfirmDeleteProduct(null)}
      >
        <AlertDialogContent className="bg-white text-slate-900 border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              ¿Eliminar producto del inventario?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              Estás a punto de eliminar permanentemente{" "}
              <strong>«{confirmDeleteProduct?.name}»</strong> del catálogo. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-100">
            <AlertDialogCancel className="h-8.5 text-xs border-slate-200">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="h-8.5 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
