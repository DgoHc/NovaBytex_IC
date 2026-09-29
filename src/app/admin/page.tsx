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

      {/* Row 1: The 3 Core Metric Cards (Spacious, Clear, Clean) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Card */}
        <Link
          href="/admin/productos"
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Total Catálogo
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 tabular-nums">
            {stats.total}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats.inStock} listos para venta y cotización
          </p>
        </Link>

        {/* Technology Card */}
        <Link
          href="/admin/productos?type=technology"
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Tecnología TI
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 group-hover:bg-blue-100 transition-colors">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 tabular-nums">
            {stats.technology}
          </p>
          <p className="text-[11px] text-blue-700/80 mt-1">
            {techInStock} disponibles en almacén
          </p>
        </Link>

        {/* Library Card */}
        <Link
          href="/admin/productos?type=library"
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-teal-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Librería &amp; Papelería
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 group-hover:bg-teal-100 transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 tabular-nums">
            {stats.library}
          </p>
          <p className="text-[11px] text-teal-700/80 mt-1">
            {libInStock} disponibles en almacén
          </p>
        </Link>
      </div>

      {/* Row 2: Two Clean Department Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* TI Division */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                División Tecnología &amp; Redes TI
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Switches, servidores rack, firewalls y almacenamiento empresarial.
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-600">
                <span className="font-semibold text-emerald-700">● {techInStock} en stock</span>
                <span>•</span>
                <span className="text-slate-400">{stats.technology - techInStock} sin stock</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
            <Link
              href="/admin/productos?type=technology"
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 group"
            >
              Ver productos TI
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="h-7 px-2.5 rounded-lg text-xs font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Link href="/admin/productos/nuevo?type=technology">
                + Crear TI
              </Link>
            </Button>
          </div>
        </div>

        {/* Library Division */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                División Librería &amp; Papelería Fina
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Cuadernos de autor, agendas, arte y suministros de oficina.
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-600">
                <span className="font-semibold text-emerald-700">● {libInStock} en stock</span>
                <span>•</span>
                <span className="text-slate-400">{stats.library - libInStock} sin stock</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
            <Link
              href="/admin/productos?type=library"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 group"
            >
              Ver librería
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="h-7 px-2.5 rounded-lg text-xs font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50"
            >
              <Link href="/admin/productos/nuevo?type=library">
                + Crear Librería
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Row 3: Compact Recent Products (Clear, 5 items max) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Últimos Productos Agregados
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Actividad reciente en el catálogo
            </p>
          </div>
          <Link
            href="/admin/productos"
            className="text-xs font-semibold text-blue-700 hover:underline inline-flex items-center gap-1"
          >
            Ver todos ({stats.total}) <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
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
                    <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white overflow-hidden shrink-0">
                      <ProductImage
                        type={p.imageType}
                        name={p.name}
                        image={p.image}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Badge
                          className={cn(
                            "h-4 px-1.5 text-[9.5px] font-bold rounded",
                            isTech
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-teal-50 text-teal-700 border-teal-200"
                          )}
                        >
                          {isTech ? "TI" : "Librería"}
                        </Badge>
                        <span className="text-[11px] text-slate-400 truncate">
                          {p.category}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 truncate max-w-md">
                        {p.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900 tabular-nums">
                        S/ {p.price.toLocaleString("es-PE")}
                      </p>
                      <span
                        className={cn(
                          "text-[10px] font-medium",
                          p.inStock ? "text-emerald-700" : "text-rose-600"
                        )}
                      >
                        {p.inStock ? "En stock" : "Agotado"}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-900"
                      >
                        <a
                          href={`/productos/${p.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ver en tienda"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Link href={`/admin/productos/${p.id}`} title="Editar">
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ExcelManagerModal
        open={excelModalOpen}
        onOpenChange={setExcelModalOpen}
      />
    </div>
  );
}
