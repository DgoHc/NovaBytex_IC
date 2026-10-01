"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Package,
  Cpu,
  BookOpen,
  ArrowRight,
  FileSpreadsheet,
  Plus,
  Edit3,
  ExternalLink,
} from "lucide-react";
import { ExcelManagerModal } from "@/components/admin/ExcelManagerModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/contexts/CatalogContext";
import { ProductImage } from "@/components/ui/ProductImage";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { products, stats } = useCatalog();
  const [excelModalOpen, setExcelModalOpen] = useState(false);

  const recentProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
        .slice(0, 5),
    [products]
  );

  const techInStock = useMemo(
    () => products.filter((p) => p.type === "technology" && p.inStock).length,
    [products]
  );
  const libInStock = useMemo(
    () => products.filter((p) => p.type === "library" && p.inStock).length,
    [products]
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Panel de Control
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Resumen general del catálogo y accesos directos
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExcelModalOpen(true)}
            className="h-9 px-3.5 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Cargar Excel
          </Button>
          <Button
            asChild
            size="sm"
            className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
          >
            <Link href="/admin/productos/nuevo">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Nuevo Producto
            </Link>
          </Button>
        </div>
      </div>

      {/* Row 1: KPI Band */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-200/90">
        <div className="flex-1 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Catálogo
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
            {stats.total}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats.inStock} listos para venta y cotización
          </p>
        </div>
        <div className="flex-1 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tecnología TI
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
            {stats.technology}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {techInStock} disponibles en almacén
          </p>
        </div>
        <div className="flex-1 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Librería & Papelería
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
            {stats.library}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {libInStock} disponibles en almacén
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requiere Atención (Summary) */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">
            Requiere Atención
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Sin stock</p>
                <p className="text-xs text-slate-500">Productos agotados</p>
              </div>
              <Link href="/admin/inventario" className="text-xs font-semibold text-rose-600 hover:underline">
                Revisar {stats.outOfStock}
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Sin imagen</p>
                <p className="text-xs text-slate-500">Productos incompletos</p>
              </div>
              <Link href="/admin/productos" className="text-xs font-semibold text-amber-600 hover:underline">
                Completar
              </Link>
            </div>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Actividad Reciente
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Últimos productos
              </p>
            </div>
            <Link
              href="/admin/productos"
              className="text-xs font-semibold text-blue-700 hover:underline inline-flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[300px]">
            {recentProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No hay productos registrados aún.
              </div>
            ) : (
              recentProducts.map((p) => {
                const isTech = p.type === "technology";
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0">
                        <ProductImage
                          type={p.imageType}
                          name={p.name}
                          image={p.image}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={cn("text-[9px] font-bold uppercase tracking-wider", isTech ? "text-blue-700" : "text-teal-700")}>
                            {isTech ? "TI" : "Librería"}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate">
                            {p.category}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-900 truncate max-w-md">
                          {p.name}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-900 tabular-nums">
                        S/ {p.price.toLocaleString("es-PE")}
                      </p>
                      <span
                        className={cn(
                          "text-[10px] font-medium flex items-center justify-end gap-1",
                          p.inStock ? "text-emerald-700" : "text-rose-600"
                        )}
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full", p.inStock ? "bg-emerald-500" : "bg-rose-500")} />
                        {p.inStock ? "En stock" : "Agotado"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <ExcelManagerModal
        open={excelModalOpen}
        onOpenChange={setExcelModalOpen}
      />
    </div>
  );
}
