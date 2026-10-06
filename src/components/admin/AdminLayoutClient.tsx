"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Tags,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  BookOpen,
  Cpu,
  Layers,
  LogOut,
  Plus,
  Warehouse,
  FileSpreadsheet,
  ExternalLink,
  PlusCircle,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/contexts/CatalogContext";
import { ExcelManagerModal } from "@/components/admin/ExcelManagerModal";

interface NavLinkItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: "total" | "tech" | "lib" | "outOfStock";
  exact?: boolean;
}

interface NavSection {
  title: string;
  items: NavLinkItem[];
}

const navSections: NavSection[] = [
  {
    title: "MENÚ",
    items: [
      {
        name: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        name: "Productos",
        href: "/admin/productos",
        icon: Package,
        badgeKey: "total",
      },
      {
        name: "Inventario & Stock",
        href: "/admin/inventario",
        icon: Warehouse,
        badgeKey: "outOfStock",
      },
      {
        name: "Categorías",
        href: "/admin/categorias",
        icon: Tags,
      },
    ],
  },
  {
    title: "NFC",
    items: [
      {
        name: "Perfiles",
        href: "/admin/nfc/profiles",
        icon: Layers,
      },
      {
        name: "Tarjetas",
        href: "/admin/nfc/cards",
        icon: Cpu,
      },
    ],
  },
  {
    title: "SOPORTE",
    items: [
      {
        name: "Tickets",
        href: "/admin/tickets",
        icon: Ticket,
      },
    ],
  },
];

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const [currentQuery, setCurrentQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const { stats } = useCatalog();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentQuery(window.location.search);
    }
  }, [pathname]);

  const getBadgeValue = (key?: "total" | "tech" | "lib" | "outOfStock") => {
    switch (key) {
      case "total":
        return { count: stats.total, variant: "neutral" as const };
      case "tech":
        return { count: stats.technology, variant: "tech" as const };
      case "lib":
        return { count: stats.library, variant: "lib" as const };
      case "outOfStock":
        return stats.outOfStock > 0
          ? { count: stats.outOfStock, variant: "alert" as const }
          : undefined;
      default:
        return undefined;
    }
  };

  const isLinkActive = (item: NavLinkItem) => {
    if (item.exact) {
      return pathname === item.href;
    }

    if (item.href.includes("?")) {
      const [itemPath, itemQuery] = item.href.split("?");
      if (pathname !== itemPath) return false;
      const itemParams = new URLSearchParams(itemQuery);
      const activeParams = new URLSearchParams(currentQuery);
      let matches = true;
      itemParams.forEach((val, key) => {
        if (activeParams.get(key) !== val) matches = false;
      });
      return matches;
    }

    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <div className="bg-slate-50 relative min-h-screen flex">
      {/* DESKTOP SIDEBAR - Deep Dark Navy Blue */}
      <aside
        className="hidden lg:flex flex-col bg-[#0B132B] border-r border-slate-800 text-slate-300 transition-[width] duration-300 ease-out shrink-0 select-none shadow-xl z-40 fixed top-0 left-0 bottom-0 h-screen"
        style={{ width: sidebarOpen ? "256px" : "80px" }}
      >
        {/* Brand header */}
        <div className="shrink-0 flex items-center justify-between px-4 h-16 border-b border-slate-800/80 bg-[#080D1F]/50">
          <Link href="/admin" className="flex items-center gap-3 min-w-0 group">
            <div className="h-9 aspect-[683/450] rounded-xl overflow-hidden border border-slate-700/80 shadow-md shrink-0 transition-transform group-hover:scale-105">
              <img
                src="/assets/branding/logonb.jpeg"
                alt="Nova Bytex"
                className="h-full w-full object-cover block"
              />
            </div>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="min-w-0"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-tight text-white leading-none">
                    NovaAdmin
                  </span>
                </div>
                <p className="text-[10.5px] font-medium text-slate-400 mt-1 leading-none truncate">
                  Gestión
                </p>
              </motion.div>
            )}
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto min-h-0 p-3 space-y-4 no-scrollbar">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {sidebarOpen && (
                <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 px-3 py-1 uppercase">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item);
                const badge = getBadgeValue(item.badgeKey);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (item.href.includes("?")) {
                        setCurrentQuery(item.href.slice(item.href.indexOf("?")));
                      } else {
                        setCurrentQuery("");
                      }
                    }}
                    title={!sidebarOpen ? item.name : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 h-9 rounded-md text-xs font-semibold transition-all group relative",
                      active
                        ? "bg-slate-800/40 text-white"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                    )}
                  >
                    {active && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500 rounded-l-md" />
                    )}
                    <Icon
                      className={cn(
                        "w-[18px] h-[18px] shrink-0 transition-colors",
                        active
                          ? "text-cyan-400"
                          : "text-slate-400 group-hover:text-slate-200"
                      )}
                    />
                    {sidebarOpen && (
                      <span className="flex-1 min-w-0 truncate">
                        {item.name}
                      </span>
                    )}
                    {sidebarOpen && badge && (
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums border",
                          badge.variant === "tech"
                            ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                            : badge.variant === "lib"
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : badge.variant === "alert"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        )}
                      >
                        {badge.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}


          {/* Excel Bulk Tool Shortcut */}
          <div className="pt-2 border-t border-slate-800/80">
            {sidebarOpen && (
              <p className="text-[10px] font-bold tracking-wider text-slate-400 px-3 py-1 uppercase">
                HERRAMIENTAS
              </p>
            )}
            <button
              onClick={() => setExcelModalOpen(true)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 h-9 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all",
                !sidebarOpen && "justify-center px-0"
              )}
              title="Cargar / Exportar Excel"
            >
              <FileSpreadsheet className="w-[18px] h-[18px] text-emerald-400 shrink-0" />
              {sidebarOpen && (
                <span className="flex-1 text-left truncate">Carga Masiva Excel</span>
              )}
            </button>
          </div>
        </nav>

        {/* Bottom card & store link */}
        <div className="shrink-0 p-3 border-t border-slate-800/80 bg-[#080D1F]/60 flex flex-col gap-3">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="w-full h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label={sidebarOpen ? "Colapsar menú" : "Expandir menú"}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {sidebarOpen ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="inline-flex items-center gap-2 text-emerald-400 font-medium text-[12px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Sistema online
                </span>
              </div>
              <Link
                href="/"
                className="flex items-center gap-2 text-slate-400 hover:text-white text-[12px] font-medium transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ir a Tienda Pública
              </Link>
            </div>
          ) : (
            <Link
              href="/"
              title="Ir a Tienda Pública"
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center mx-auto transition-all"
            >
              <ExternalLink className="w-4 h-4 text-cyan-400" />
            </Link>
          )}
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 z-50 h-full w-72 bg-[#0B132B] text-slate-300 shadow-2xl flex flex-col lg:hidden border-r border-slate-800"
            >
              <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800 bg-[#080D1F]">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 aspect-[683/450] rounded-lg overflow-hidden border border-slate-700/80 shadow-md shrink-0">
                    <img
                      src="/assets/branding/logonb.jpeg"
                      alt="Nova Bytex Logo"
                      className="h-full w-full object-cover block"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">NovaAdmin</p>
                    <p className="text-[10px] text-slate-400">Panel Corporativo</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-3 space-y-4">
                {navSections.map((section) => (
                  <div key={section.title} className="space-y-1">
                    <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 px-3 py-1 uppercase">
                      {section.title}
                    </p>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isLinkActive(item);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => {
                            setMobileOpen(false);
                            if (item.href.includes("?")) {
                              setCurrentQuery(item.href.slice(item.href.indexOf("?")));
                            } else {
                              setCurrentQuery("");
                            }
                          }}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold",
                            active
                              ? "bg-blue-600/20 text-white border border-blue-500/40"
                              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                          )}
                        >
                          <Icon className={cn("w-4 h-4", active ? "text-cyan-400" : "text-slate-400")} />
                          <span className="flex-1 truncate">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}

                <div className="pt-2 space-y-2">

                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setExcelModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white border border-slate-800"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Carga Masiva Excel</span>
                  </button>
                </div>
              </nav>

              <div className="p-3 border-t border-slate-800 bg-[#080D1F]">
                <Link
                  href="/"
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-slate-800 text-white text-xs font-bold"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  Ir a Tienda Pública
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <div 
        className={cn(
          "min-w-0 flex-1 flex flex-col bg-slate-50 transition-all duration-300 ease-out",
          sidebarOpen ? "lg:ml-[256px]" : "lg:ml-[80px]"
        )}
      >
        {/* Top Header */}
        <header className="shrink-0 h-[var(--topbar-h)] bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between shadow-xs z-30 sticky top-0 w-full">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <Breadcrumb />
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Botones de Tickets (Vista Previa / Sin implementar por ahora) */}
            <div className="hidden md:flex items-center gap-2 mr-2">
              <Button type="button" variant="outline" size="sm" className="h-8 px-3 text-xs bg-white text-slate-600 border-slate-200">
                <Ticket className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Mis Tickets
              </Button>
              <Button type="button" size="sm" className="h-8 px-3 text-xs bg-slate-800 text-white hover:bg-slate-700">
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                Nuevo Ticket
              </Button>
            </div>

            <div className="hidden md:flex p-1 rounded-lg bg-slate-100 border border-slate-200">
              <Link
                href="/admin/productos?type=technology"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium bg-white text-blue-700 shadow-sm transition-colors"
              >
                <Cpu className="w-4 h-4 text-blue-600" />
                Tecnología
              </Link>
              <Link
                href="/admin/productos?type=library"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium text-slate-600 hover:text-emerald-700 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-emerald-700" />
                Librería
              </Link>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50">
          {children}
        </main>
      </div>

      {/* Global Excel Modal */}
      <ExcelManagerModal
        open={excelModalOpen}
        onOpenChange={setExcelModalOpen}
      />
    </div>
  );
}

function Breadcrumb() {
  const pathname = usePathname() ?? "";
  const parts = pathname.split("/").filter(Boolean).slice(1);

  const labels: Record<string, string> = {
    admin: "Admin",
    productos: "Productos",
    nuevo: "Nuevo",
    categorias: "Categorías",
    inventario: "Inventario & Stock",
    nfc: "NFC",
    profiles: "Perfiles",
    cards: "Tarjetas",
    tickets: "Tickets",
  };

  const currentSection = parts.length > 0 
    ? (labels[parts[0]] ?? decodeURIComponent(parts[0]).replace(/-/g, " "))
    : "Dashboard";

  return (
    <p className="text-sm font-semibold text-slate-900 leading-none">
      <span className="text-slate-500 font-normal">Consola</span>
      <span className="mx-1.5 text-slate-300 font-medium">/</span>
      <span>{currentSection}</span>
    </p>
  );
}
