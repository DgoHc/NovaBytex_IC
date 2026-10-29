"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Package,
  ArrowUpDown,
  FileSpreadsheet,
  Download,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { ExcelManagerModal } from "@/components/admin/ExcelManagerModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCatalog } from "@/contexts/CatalogContext";
import {
  ALL_CATEGORIES,
  TECHNOLOGY_CATEGORIES,
  LIBRARY_CATEGORIES,
  type CatalogType,
  type Product,
} from "@/lib/products";
import { cn } from "@/lib/utils";

type SortKey = "default" | "price_asc" | "price_desc" | "newest" | "name_asc";
type TypeFilter = "all" | CatalogType;

function formatPrice(val: number): string {
  if (val % 1 === 0) {
    return `S/ ${val.toLocaleString("es-PE")}`;
  }
  return `S/ ${val.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ProductList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as TypeFilter | null) ?? "all";
  const initialCategory = searchParams.get("category") ?? "Todos";

  const {
    products,
    loading,
    toggleAvailable,
    updateProduct,
    deleteProduct,
    stats,
  } = useCatalog();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(initialType);
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [confirmTarget, setConfirmTarget] = useState<Product | null>(null);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [excelModalTab, setExcelModalTab] = useState<"import" | "export">("import");

  const toggleStock = (id: number, current: boolean) => {
    updateProduct({ id, inStock: !current });
  };

  useEffect(() => {
    const t = (searchParams.get("type") as TypeFilter | null) ?? "all";
    const c = searchParams.get("category") ?? "Todos";
    setTypeFilter(t);
    setCategoryFilter(c);
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (categoryFilter !== "Todos") params.set("category", categoryFilter);
    const str = params.toString();
    const newUrl = "/admin/productos" + (str ? `?${str}` : "");
    router.replace(newUrl, { scroll: false });
  }, [typeFilter, categoryFilter, router]);

  const availableCategories = useMemo(() => {
    const base = ["Todos"];
    if (typeFilter === "all") return [...base, ...ALL_CATEGORIES];
    if (typeFilter === "technology") return [...base, ...TECHNOLOGY_CATEGORIES];
    return [...base, ...LIBRARY_CATEGORIES];
  }, [typeFilter]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (typeFilter !== "all") list = list.filter((p) => p.type === typeFilter);
    if (categoryFilter !== "Todos")
      list = list.filter((p) => p.category === categoryFilter);
    if (statusFilter === "active") list = list.filter((p) => p.available);
    if (statusFilter === "inactive") list = list.filter((p) => !p.available);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }
    switch (sortKey) {
      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name_asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        list.sort(
          (a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
        );
        break;
    }
    return list;
  }, [products, typeFilter, categoryFilter, statusFilter, search, sortKey]);

  const counts = {
    all: stats.total,
    technology: stats.technology,
    library: stats.library,
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Productos del Catálogo
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consulta, filtra y gestiona el inventario de tecnología y librería.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setExcelModalTab("import");
              setExcelModalOpen(true);
            }}
            className="h-10 px-3.5 rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold shadow-xs"
          >
            <FileSpreadsheet size={16} style={{ width: 16, height: 16 }} className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
            Cargar Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setExcelModalTab("export");
              setExcelModalOpen(true);
            }}
            className="h-10 px-3.5 rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold shadow-xs"
          >
            <Download size={16} style={{ width: 16, height: 16 }} className="w-4 h-4 mr-2 text-blue-600 shrink-0" />
            Exportar
          </Button>
          <Button
            asChild
            className={cn(
              "h-10 px-4 rounded-lg text-white text-xs font-semibold shadow-xs border-0 transition-all",
              typeFilter === "library"
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
            )}
          >
            <Link
              href={
                typeFilter === "technology"
                  ? "/admin/productos/nuevo?type=technology"
                  : typeFilter === "library"
                  ? "/admin/productos/nuevo?type=library"
                  : "/admin/productos/nuevo"
              }
            >
              <Plus size={18} style={{ width: 18, height: 18 }} className="w-[18px] h-[18px] mr-1.5 shrink-0" />
              Nuevo Producto {typeFilter === "technology" ? "Tecnología" : typeFilter === "library" ? "Librería" : ""}
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Table Card with Tabs on Top */}
      <Card className="overflow-hidden border-slate-200/90 rounded-2xl bg-white shadow-xs">
        {/* Top Tabs (reducido a 12-16px entre bloques) */}
        <div className="border-b border-slate-100 px-4 py-2 bg-white">
          <Tabs
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v as TypeFilter);
              setCategoryFilter("Todos");
            }}
          >
            <TabsList className="h-9 rounded-lg bg-slate-100 p-0.5">
              {(
                [
                  { v: "all", label: "Todos", count: counts.all },
                  { v: "technology", label: "Tecnología TI", count: counts.technology },
                  { v: "library", label: "Librería & Papelería", count: counts.library },
                ] as { v: TypeFilter; label: string; count: number }[]
              ).map((t) => (
                <TabsTrigger
                  key={t.v}
                  value={t.v}
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs rounded-md px-3 text-xs font-semibold"
                >
                  {t.label}
                  <Badge
                    className={cn(
                      "ml-1.5 h-4 px-1.5 rounded text-[10px] font-bold border tabular-nums",
                      t.v === "technology"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : t.v === "library"
                        ? "bg-teal-50 text-teal-700 border-teal-200"
                        : "bg-slate-200 text-slate-700 border-slate-300"
                    )}
                  >
                    {t.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Clean Filter Controls (todos h-10, gap de 12px, alineados en una sola fila) */}
        <CardContent className="p-3 lg:px-4 lg:py-2.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full">
            {/* Buscador con lupa de 16px en position absolute left 12px y padding-left de 38px */}
            <div className="relative flex-1 min-w-[220px]">
              <Search
                size={16}
                style={{ width: 16, height: 16 }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none shrink-0"
              />
              <Input
                placeholder="Buscar por nombre, SKU, marca..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-[38px] h-10 rounded-lg bg-white border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 w-full"
              />
            </div>

            {/* Categoría con min-width 160px */}
            <div className="w-full sm:w-[200px] shrink-0 min-w-[160px]">
              <Select
                value={categoryFilter}
                onValueChange={(v) => setCategoryFilter(v)}
              >
                <SelectTrigger className="h-10 rounded-lg bg-white border-slate-200 text-xs w-full min-w-[160px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((c) => (
                    <SelectItem key={c} value={c} className="text-xs">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estado Select con min-width 160px */}
            <div className="w-full sm:w-[170px] shrink-0 min-w-[160px]">
              <Select
                value={statusFilter}
                onValueChange={(v) =>
                  setStatusFilter(v as "all" | "active" | "inactive")
                }
              >
                <SelectTrigger className="h-10 rounded-lg bg-white border-slate-200 text-xs w-full min-w-[160px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">Estado: Todos</SelectItem>
                  <SelectItem value="active" className="text-xs">Solo activos</SelectItem>
                  <SelectItem value="inactive" className="text-xs">Solo inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ordenar con icono de 16px */}
            <div className="w-full sm:w-[160px] shrink-0 min-w-[150px]">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortKey((p) => {
                    const order: SortKey[] = [
                      "newest",
                      "name_asc",
                      "price_asc",
                      "price_desc",
                    ];
                    const idx = order.indexOf(p);
                    return order[(idx + 1) % order.length];
                  })
                }
                className="w-full h-10 justify-start gap-2 rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium px-3"
              >
                <ArrowUpDown size={16} style={{ width: 16, height: 16 }} className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">
                  {sortKey === "newest"
                    ? "Recientes"
                    : sortKey === "name_asc"
                    ? "Nombre A-Z"
                    : sortKey === "price_asc"
                    ? "Precio ↑"
                    : "Precio ↓"}
                </span>
              </Button>
            </div>
          </div>
        </CardContent>

        {/* Counter & Active filter helper (espacio vertical reducido 12-16px) */}
        <div className="px-4 py-2 text-xs text-slate-500 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <span>
              Mostrando <strong className="text-slate-800 font-semibold">{filtered.length}</strong> de {products.length} productos
            </span>
            {(search.trim() || categoryFilter !== "Todos" || statusFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("Todos");
                  setStatusFilter("all");
                }}
                className="h-6 px-2 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
              >
                <RotateCcw size={12} style={{ width: 12, height: 12 }} className="w-3 h-3 mr-1 shrink-0" /> Restablecer filtros
              </Button>
            )}
          </div>
          {loading && <span className="text-slate-400">Actualizando…</span>}
        </div>

        {/* TABLA: table-layout: fixed, width: 100%, anchos exactos ajustados, sticky header */}
        <div className="hidden md:block w-full overflow-hidden">
          <table className="w-full table-fixed text-sm border-collapse">
            <colgroup>
              <col style={{ width: "40%" }} /> {/* Producto (espacio suficiente para foto, título y SKU/badges) */}
              <col style={{ width: "15%" }} /> {/* Categoría (separación limpia sin colisión) */}
              <col style={{ width: "10%" }} /> {/* Tipo */}
              <col style={{ width: "11%" }} /> {/* Precio */}
              <col style={{ width: "11%" }} /> {/* Estado */}
              <col style={{ width: "13%" }} /> {/* Acciones */}
            </colgroup>
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200">
              <tr className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                <th className="text-left px-3.5 py-2.5">Producto</th>
                <th className="text-left px-3.5 py-2.5">Categoría</th>
                <th className="text-left px-3 py-2.5">Tipo</th>
                <th className="text-left px-3 py-2.5">Precio</th>
                <th className="text-left px-3 py-2.5">Estado</th>
                <th className="text-right px-3 py-2.5 whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-14 text-center text-slate-500"
                  >
                    <div className="inline-flex flex-col items-center gap-2 max-w-sm">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Package className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        No hay productos para mostrar
                      </p>
                      <p className="text-xs text-slate-400">
                        Prueba a ajustar los filtros o crea un nuevo producto.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <ProductRow
                    key={`prod-${p.id}`}
                    product={p}
                    onToggle={toggleAvailable}
                    onToggleStock={toggleStock}
                    onDeleteRequested={(prod) => setConfirmTarget(prod)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* RESPONSIVE: Tarjetas en pantallas < 768px */}
        <div className="md:hidden px-3.5 pb-4 pt-3 space-y-3 border-t border-slate-100">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-slate-500">
              <p className="text-sm font-semibold text-slate-700">
                No hay productos
              </p>
              <p className="text-xs text-slate-400 mt-1">Ajusta los filtros o crea uno nuevo.</p>
            </div>
          ) : (
            filtered.map((p) => (
              <ProductCardRow
                key={`mobile-prod-${p.id}`}
                product={p}
                onToggle={toggleAvailable}
                onToggleStock={toggleStock}
                onDeleteRequested={(prod) => setConfirmTarget(prod)}
              />
            ))
          )}
        </div>
      </Card>

      {/* MODAL ELIMINAR PRODUCTO */}
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(o) => !o && setConfirmTarget(null)}
      >
        <AlertDialogContent className="bg-white text-slate-900 border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 font-bold text-lg tracking-tight">
              ¿Eliminar este producto?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-xs">
              Estás a punto de eliminar permanentemente{" "}
              <strong className="text-slate-900">
                «{confirmTarget?.name ?? ""}»
              </strong>
              . Esta acción lo removerá definitivamente del catálogo y la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-100">
            <AlertDialogCancel className="h-9 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmTarget) deleteProduct(confirmTarget.id);
                setConfirmTarget(null);
              }}
              className="h-9 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs"
            >
              Sí, eliminar producto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ExcelManagerModal
        open={excelModalOpen}
        onOpenChange={setExcelModalOpen}
        defaultTab={excelModalTab}
      />
    </div>
  );
}

function ProductRow({
  product,
  onToggle,
  onToggleStock,
  onDeleteRequested,
}: {
  product: Product;
  onToggle: (id: number) => void;
  onToggleStock: (id: number, current: boolean) => void;
  onDeleteRequested: (product: Product) => void;
}) {
  const isTech = product.type === "technology";

  return (
    <tr className="group hover:bg-slate-50/70 transition-colors h-[70px]">
      {/* 1. Producto (fusionado con Imagen, miniatura 44x44px, con límite de celda max-w-0 para evitar cruce con Categoría) */}
      <td className="px-3.5 py-2.5 align-middle overflow-hidden max-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-[44px] h-[44px] rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0 flex items-center justify-center p-0.5 shadow-2xs">
            <ProductImage
              type={product.imageType}
              name={product.name}
              image={product.image}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-[14px] font-semibold text-slate-900 truncate leading-snug"
              title={product.name}
            >
              {product.name}
            </p>
            {/* Misma línea: Marca · SKU truncable + badges que no desbordan la celda */}
            <div className="flex items-center gap-2 min-w-0 mt-0.5 flex-nowrap">
              <span
                className="text-[12px] text-slate-500 truncate min-w-0 flex-shrink"
                title={`${product.brand} · SKU ${product.sku}`}
              >
                {product.brand} · SKU {product.sku}
              </span>
              <div className="inline-flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleStock(product.id, product.inStock)}
                  title={product.inStock ? "Clic para marcar Agotado" : "Clic para marcar En Stock"}
                  className="inline-flex cursor-pointer"
                >
                  <span
                    className={cn(
                      "inline-flex items-center text-[10.5px] font-semibold px-1.5 py-[1px] rounded border transition-colors whitespace-nowrap",
                      product.inStock
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full mr-1 shrink-0",
                        product.inStock ? "bg-emerald-500" : "bg-rose-500"
                      )}
                    />
                    {product.inStock ? "En Stock" : "Agotado"}
                  </span>
                </button>
                {product.featured && (
                  <span className="inline-flex items-center text-[10.5px] font-medium px-1.5 py-[1px] rounded bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                    Destacado
                  </span>
                )}
                {typeof product.previousPrice === "number" &&
                  product.previousPrice > product.price && (
                    <span className="inline-flex items-center text-[10.5px] font-medium px-1.5 py-[1px] rounded bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                      Oferta
                    </span>
                  )}
              </div>
            </div>
          </div>
        </div>
      </td>

      {/* 2. Categoría (con max-w-0 y truncate para separación 100% limpia sin solaparse) */}
      <td className="px-3.5 py-2.5 align-middle overflow-hidden max-w-0">
        <span
          className="inline-flex items-center text-[12px] font-medium px-2.5 py-[3px] rounded-[6px] border border-slate-200 text-slate-700 bg-slate-50 truncate max-w-full"
          title={product.category}
        >
          {product.category}
        </span>
      </td>

      {/* 3. Tipo */}
      <td className="px-3 py-2.5 align-middle whitespace-nowrap">
        <span
          className={cn(
            "inline-flex items-center text-[12px] font-semibold px-2.5 py-[3px] rounded-[6px] border whitespace-nowrap",
            isTech
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          )}
        >
          {isTech ? "Tecnología" : "Librería"}
        </span>
      </td>

      {/* 4. Precio */}
      <td className="px-3 py-2.5 align-middle text-left tabular-nums whitespace-nowrap">
        <div className="flex flex-col items-start justify-center leading-tight">
          <span className="text-[14px] font-semibold text-slate-900 tabular-nums">
            {formatPrice(product.price)}
          </span>
          {typeof product.previousPrice === "number" &&
            product.previousPrice > product.price && (
              <span className="text-[12px] text-slate-400 line-through tabular-nums mt-0.5">
                {formatPrice(product.previousPrice)}
              </span>
            )}
        </div>
      </td>

      {/* 5. Estado */}
      <td className="px-3 py-2.5 align-middle text-left whitespace-nowrap">
        <div
          onClick={() => onToggle(Number(product.id))}
          className="inline-flex items-center gap-2 cursor-pointer select-none group/switch py-1"
          title={product.available ? "Desactivar producto" : "Activar producto"}
        >
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(product.available)}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(Number(product.id));
            }}
            className={cn(
              "relative inline-flex w-[36px] h-[20px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
              product.available ? "bg-emerald-500" : "bg-slate-300"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block w-[16px] h-[16px] rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out",
                product.available ? "translate-x-4" : "translate-x-0"
              )}
            />
          </button>
          <span className="text-[13px] font-medium text-slate-700 group-hover/switch:text-slate-900 transition-colors">
            {product.available ? "Activo" : "Inactivo"}
          </span>
        </div>
      </td>

      {/* 6. Acciones (Iconos 13.5px en recuadro compacto de 21px, sin desborde ni salto de columna) */}
      <td className="px-3 py-2 align-middle text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1 flex-nowrap shrink-0">
          <a
            href={isTech ? `/productos/${product.id}` : `/libreria`}
            target="_blank"
            rel="noopener noreferrer"
            title="Ver en tienda"
            className="w-[21px] h-[21px] rounded-[4px] flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
          >
            <ExternalLink size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 shrink-0" />
          </a>
          <Link
            href={`/admin/productos/${product.id}`}
            title="Editar"
            className="w-[21px] h-[21px] rounded-[4px] flex items-center justify-center text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors shrink-0"
          >
            <Edit3 size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 shrink-0" />
          </Link>
          <button
            type="button"
            onClick={() => onDeleteRequested(product)}
            title="Eliminar"
            className="w-[21px] h-[21px] rounded-[4px] flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
          >
            <Trash2 size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function ProductCardRow({
  product,
  onToggle,
  onToggleStock,
  onDeleteRequested,
}: {
  product: Product;
  onToggle: (id: number) => void;
  onToggleStock: (id: number, current: boolean) => void;
  onDeleteRequested: (product: Product) => void;
}) {
  const isTech = product.type === "technology";
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <div className="flex gap-3 p-3">
        <div className="w-[52px] h-[52px] shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-0.5">
          <ProductImage
            type={product.imageType}
            name={product.name}
            image={product.image}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1 flex-wrap">
              <span
                className={cn(
                  "inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-[5px] border whitespace-nowrap",
                  isTech
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                )}
              >
                {isTech ? "Tecnología" : "Librería"}
              </span>
              <span
                className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-[5px] border border-slate-200 text-slate-700 bg-slate-50 whitespace-nowrap"
              >
                {product.category}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onToggleStock(product.id, product.inStock)}
              className="inline-flex"
            >
              <span
                className={cn(
                  "inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border cursor-pointer whitespace-nowrap",
                  product.inStock
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                )}
              >
                {product.inStock ? "En Stock" : "Agotado"}
              </span>
            </button>
          </div>

          <p className="text-xs font-semibold text-slate-900 truncate leading-snug" title={product.name}>
            {product.name}
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            {product.brand} · SKU {product.sku}
          </p>

          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-xs font-semibold text-slate-900 tabular-nums">
                {formatPrice(product.price)}
              </span>
              {typeof product.previousPrice === "number" &&
                product.previousPrice > product.price && (
                  <span className="text-[10px] text-slate-400 line-through tabular-nums ml-1.5">
                    {formatPrice(product.previousPrice)}
                  </span>
                )}
            </div>

            <div
              onClick={() => onToggle(Number(product.id))}
              className="flex items-center gap-2 cursor-pointer select-none group/switch"
              title={product.available ? "Desactivar producto" : "Activar producto"}
            >
              <button
                type="button"
                role="switch"
                aria-checked={Boolean(product.available)}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(Number(product.id));
                }}
                className={cn(
                  "relative inline-flex w-[36px] h-[20px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                  product.available ? "bg-emerald-500" : "bg-slate-300"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block w-[16px] h-[16px] rounded-full bg-white shadow-xs transition",
                    product.available ? "translate-x-4" : "translate-x-0"
                  )}
                />
              </button>
              <span className="text-[12px] font-medium text-slate-600 group-hover/switch:text-slate-900 transition-colors">
                {product.available ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 border-t border-slate-100 p-2 bg-slate-50/50">
        <a
          href={isTech ? `/productos/${product.id}` : `/libreria`}
          target="_blank"
          rel="noopener noreferrer"
          title="Ver en tienda"
          className="w-6 h-6 rounded-[4px] flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
        >
          <ExternalLink size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 shrink-0" />
        </a>
        <Link
          href={`/admin/productos/${product.id}`}
          title="Editar"
          className="w-6 h-6 rounded-[4px] flex items-center justify-center text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors shrink-0"
        >
          <Edit3 size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 shrink-0" />
        </Link>
        <button
          type="button"
          onClick={() => onDeleteRequested(product)}
          title="Eliminar"
          className="w-6 h-6 rounded-[4px] flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
        >
          <Trash2 size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 text-rose-500 shrink-0" />
        </button>
      </div>
    </div>
  );
}
