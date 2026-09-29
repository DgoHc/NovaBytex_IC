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
  ToggleLeft,
  ToggleRight,
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
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all"
  );
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
    const newUrl =
      "/admin/productos" + (str ? `?${str}` : "");
    window.history.replaceState(null, "", newUrl);
  }, [typeFilter, categoryFilter]);

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
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Productos del Catálogo
          </h1>
          <p className="text-sm text-slate-500 mt-1">
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
            className="h-10 px-3.5 rounded-xl border-slate-200 bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-semibold shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
            Cargar Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setExcelModalTab("export");
              setExcelModalOpen(true);
            }}
            className="h-10 px-3.5 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs"
          >
            <Download className="w-4 h-4 mr-1.5 text-blue-600" />
            Exportar
          </Button>
          <Button
            asChild
            className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
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
              <Plus className="w-4 h-4 mr-1.5" />
              Nuevo Producto {typeFilter === "technology" ? "TI" : typeFilter === "library" ? "Librería" : ""}
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Table Card with Tabs on Top */}
      <Card className="overflow-hidden border-slate-200/90 rounded-2xl bg-white shadow-xs">
        {/* Top Tabs */}
        <div className="border-b border-slate-100 px-5 pt-4">
          <Tabs
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v as TypeFilter);
              setCategoryFilter("Todos");
            }}
          >
            <TabsList className="h-10 rounded-xl bg-slate-100 p-1">
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
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs rounded-lg px-3.5 text-xs font-semibold"
                >
                  {t.label}
                  <Badge
                    className={cn(
                      "ml-2 h-4.5 px-1.5 rounded text-[10px] font-bold border tabular-nums",
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

        {/* Clean Filter Controls */}
        <CardContent className="p-4 lg:p-5 border-b border-slate-100 bg-slate-50/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            <div className="lg:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre, SKU, marca..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10 rounded-xl bg-white border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              <Select
                value={categoryFilter}
                onValueChange={(v) => setCategoryFilter(v)}
              >
                <SelectTrigger className="h-10 rounded-xl bg-white border-slate-200 text-xs">
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

            <div className="lg:col-span-2">
              <Select
                value={statusFilter}
                onValueChange={(v) =>
                  setStatusFilter(v as "all" | "active" | "inactive")
                }
              >
                <SelectTrigger className="h-10 rounded-xl bg-white border-slate-200 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">Todos los estados</SelectItem>
                  <SelectItem value="active" className="text-xs">Solo activos</SelectItem>
                  <SelectItem value="inactive" className="text-xs">Solo inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-2">
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
                className="w-full h-10 justify-start gap-1.5 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
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

        <div className="px-5 py-3 text-xs text-slate-500 flex items-center justify-between border-b border-slate-100 bg-white">
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
                <RotateCcw className="w-3 h-3 mr-1" /> Restablecer filtros
              </Button>
            )}
          </div>
          {loading && <span className="text-slate-400">Actualizando…</span>}
        </div>


        <div className="hidden md:block overflow-x-auto border-t border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                <th className="text-left px-5 py-3 w-[96px]">Imagen</th>
                <th className="text-left px-5 py-3">Producto</th>
                <th className="text-left px-5 py-3 w-[140px]">Categoría</th>
                <th className="text-left px-5 py-3 w-[120px]">Tipo</th>
                <th className="text-right px-5 py-3 w-[130px]">Precio</th>
                <th className="text-center px-5 py-3 w-[120px]">Estado</th>
                <th className="text-right px-5 py-3 w-[230px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center text-slate-500"
                  >
                    <div className="inline-flex flex-col items-center gap-3 max-w-sm">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Package className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-base font-semibold text-slate-700">
                        No hay productos para mostrar
                      </p>
                      <p className="text-sm">
                        Prueba a ajustar los filtros o crea un nuevo producto.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <ProductRow
                    key={p.id}
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

        <div className="md:hidden px-4 lg:px-5 pb-5 pt-3 space-y-3 border-t border-slate-100">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-base font-semibold text-slate-700">
                No hay productos
              </p>
              <p className="text-sm mt-1">Ajusta los filtros o crea uno nuevo.</p>
            </div>
          ) : (
            filtered.map((p) => (
              <ProductCardRow
                key={p.id}
                product={p}
                onToggle={toggleAvailable}
                onToggleStock={toggleStock}
                onDeleteRequested={(prod) => setConfirmTarget(prod)}
              />
            ))
          )}
        </div>
      </Card>

      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(o) => !o && setConfirmTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 font-bodoni text-2xl tracking-tight">
              ¿Eliminar este producto?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-sm">
              Estás a punto de eliminar permanentemente{" "}
              <strong className="text-slate-800">
                «{confirmTarget?.name ?? ""}»
              </strong>
              . Esta acción no se puede deshacer. Si prefieres ocultarlo de la
              tienda, mejor desactívalo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="h-11 mt-0 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmTarget) deleteProduct(confirmTarget.id);
                setConfirmTarget(null);
              }}
              className="h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-sm"
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
  const router = useRouter();
  const isTech = product.type === "technology";
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="group hover:bg-slate-50/60 transition-colors"
    >
      <td className="px-5 py-3.5 align-middle">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
          <ProductImage
            type={product.imageType}
            name={product.name}
            image={product.image}
          />
        </div>
      </td>
      <td className="px-5 py-3.5 align-middle min-w-0">
        <div className="min-w-0 max-w-sm">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {product.name}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {product.brand} · SKU {product.sku}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <button
              type="button"
              onClick={() => onToggleStock(product.id, product.inStock)}
              title={product.inStock ? "Clic para marcar Sin Stock" : "Clic para marcar En Stock"}
              className="inline-flex"
            >
              <Badge
                className={cn(
                  "h-4.5 px-2 rounded-md text-[10px] font-semibold border transition-colors cursor-pointer",
                  product.inStock
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full mr-1",
                    product.inStock ? "bg-emerald-500" : "bg-rose-500"
                  )}
                />
                {product.inStock ? "En Stock" : "Agotado"}
              </Badge>
            </button>
            {product.featured && (
              <Badge className="h-4.5 px-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium">
                Destacado
              </Badge>
            )}
            {typeof product.previousPrice === "number" &&
              product.previousPrice > product.price && (
                <Badge className="h-4.5 px-1.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium">
                  Oferta
                </Badge>
              )}
          </div>
        </div>
      </td>
      <td className="px-5 py-3 align-middle">
        <Badge
          variant="outline"
          className="h-5 px-2 rounded-md text-[11px] font-semibold border-slate-200 text-slate-700 bg-slate-50"
        >
          {product.category}
        </Badge>
      </td>
      <td className="px-5 py-3 align-middle">
        <Badge
          className={cn(
            "h-5 px-2.5 rounded-md text-[10.5px] font-bold border",
            isTech
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-library-sage/25 text-library-sage-foreground border-library-sage/50"
          )}
        >
          {isTech ? "Tecnología" : "Librería"}
        </Badge>
      </td>
      <td className="px-5 py-3 align-middle text-right tabular-nums">
        <div className="flex flex-col items-end justify-center gap-0.5">
          <span className="text-sm font-black text-slate-900 leading-none">
            S/ {product.price.toLocaleString("es-PE")}
          </span>
          {typeof product.previousPrice === "number" &&
            product.previousPrice > product.price && (
              <span className="text-[11px] font-medium text-slate-400 line-through">
                S/ {product.previousPrice.toLocaleString("es-PE")}
              </span>
            )}
        </div>
      </td>
      <td className="px-5 py-3 align-middle text-center">
        <button
          onClick={() => onToggle(product.id)}
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg transition-all group/state"
          aria-label="Cambiar disponibilidad"
        >
          {product.available ? (
            <>
              <ToggleRight className="w-5 h-5 text-emerald-600 group-hover/state:text-emerald-700" />
              <span className="text-[11.5px] font-bold text-emerald-700">
                Activo
              </span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5 text-slate-400 group-hover/state:text-slate-600" />
              <span className="text-[11.5px] font-bold text-slate-600">
                Inactivo
              </span>
            </>
          )}
        </button>
      </td>
      <td className="px-5 py-3 align-middle">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-9 px-2.5 rounded-xl border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold"
          >
            <a
              href={`/productos/${product.id}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Ver en la tienda"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-9 px-3 rounded-xl border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-800 hover:bg-blue-50/60 text-xs font-semibold"
          >
            <Link href={`/admin/productos/${product.id}`}>
              <Edit3 className="w-3.5 h-3.5 mr-1.5" />
              Editar
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteRequested(product)}
            className="h-9 px-3 rounded-xl border-slate-200 bg-white text-rose-700 hover:border-rose-300 hover:bg-rose-50 text-xs font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Eliminar
          </Button>
        </div>
      </td>
    </motion.tr>
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
  const router = useRouter();
  const isTech = product.type === "technology";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="flex gap-3 p-3">
        <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-white">
          <ProductImage
            type={product.imageType}
            name={product.name}
            image={product.image}
          />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge
                className={cn(
                  "h-5 px-2 rounded-md text-[10.5px] font-bold border",
                  isTech
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-library-sage/25 text-library-sage-foreground border-library-sage/50"
                )}
              >
                {isTech ? "Tecnología" : "Librería"}
              </Badge>
              <Badge
                variant="outline"
                className="h-5 px-2 rounded-md text-[10.5px] font-semibold border-slate-200 text-slate-700 bg-slate-50"
              >
                {product.category}
              </Badge>
            </div>
            <button
              type="button"
              onClick={() => onToggleStock(product.id, product.inStock)}
              className="inline-flex"
            >
              <Badge
                className={cn(
                  "h-5 px-2 rounded-md text-[10.5px] font-bold border cursor-pointer",
                  product.inStock
                    ? "bg-slate-100 text-slate-700 border-slate-200"
                    : "bg-amber-50 text-amber-800 border-amber-300"
                )}
              >
                {product.inStock ? "En Stock" : "Sin Stock"}
              </Badge>
            </button>
          </div>
          <p className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
            {product.name}
          </p>
          <p className="text-[11.5px] text-slate-500 truncate">
            {product.brand} · SKU {product.sku}
          </p>
          <div className="flex items-end justify-between gap-2 pt-1">
            <div>
              <p className="text-sm font-black text-slate-900 leading-none tabular-nums">
                S/ {product.price.toLocaleString("es-PE")}
              </p>
              {typeof product.previousPrice === "number" &&
                product.previousPrice > product.price && (
                  <p className="text-[11px] text-slate-400 line-through mt-1 tabular-nums">
                    S/ {product.previousPrice.toLocaleString("es-PE")}
                  </p>
                )}
            </div>
            <button
              onClick={() => onToggle(product.id)}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg"
            >
              {product.available ? (
                <>
                  <ToggleRight className="w-5 h-5 text-emerald-600" />
                  <span className="text-[11.5px] font-bold text-emerald-700">
                    Activo
                  </span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 text-slate-400" />
                  <span className="text-[11.5px] font-bold text-slate-600">
                    Inactivo
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-slate-100 p-3 bg-slate-50/60">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-10 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold"
        >
          <a href={`/productos/${product.id}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3.5 h-3.5 mr-1" />
            Ver
          </a>
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-10 rounded-xl border-slate-200 bg-white text-slate-800 hover:bg-blue-50 hover:text-blue-800 text-xs font-semibold"
        >
          <Link href={`/admin/productos/${product.id}`}>
            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
            Editar
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDeleteRequested(product)}
          className="h-10 rounded-xl border-slate-200 bg-white text-rose-700 hover:bg-rose-50 text-xs font-semibold"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          Eliminar
        </Button>
      </div>
    </div>
  );
}

export default ProductList;
