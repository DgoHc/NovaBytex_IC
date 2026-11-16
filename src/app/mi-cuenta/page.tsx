"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ShoppingBag,
  Heart,
  Tag,
  Sparkles,
  ShoppingCart,
  Calendar,
  LogOut,
  ExternalLink,
  Phone,
  Mail,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  ArrowLeftRight,
  Store,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AVAILABLE_COUPONS, type Coupon } from "@/lib/coupons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useCatalog } from "@/contexts/CatalogContext";
import { ProductCard } from "@/components/ui/ProductCard";
import { calculateLoyalty } from "@/services/ClientService";
import { cn } from "@/lib/utils";

type TabKey =
  | "resumen"
  | "compras"
  | "deseados"
  | "promociones"
  | "recomendaciones"
  | "carrito"
  | "perfil";

function CustomerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabKey) || "resumen";

  const { user, isAuthenticated, loading, signOut, switchAccount, isAdmin } = useAuth();
  const { wishlistItems, wishlistCount } = useWishlist();
  const { cart, cartTotal, cartCount, toggleCart, appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const { products } = useCatalog();

  const [activeTab, setActiveTab] = useState<TabKey>("resumen");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // REDIRECCIÓN OBLIGATORIA: Si el usuario autenticado es ADMIN, debe ir al panel de admin
  useEffect(() => {
    if (!loading && isAuthenticated && isAdmin) {
      router.replace("/admin");
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  // REDIRECCIÓN OBLIGATORIA: Si el usuario autenticado es AFILIADO, debe ir al portal de afiliados
  useEffect(() => {
    if (!loading && isAuthenticated && user?.role === "affiliate") {
      router.replace("/afiliados");
    }
  }, [loading, isAuthenticated, user, router]);

  // Si no está autenticado, redirigir a login
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  // Sincronizar tab desde URL
  useEffect(() => {
    if (initialTab && ["resumen", "compras", "deseados", "promociones", "recomendaciones", "carrito", "perfil"].includes(initialTab)) {
      if (isAdmin && initialTab === "deseados") {
        setActiveTab("resumen");
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab, isAdmin]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Cargando portal de cliente...</p>
        </div>
      </div>
    );
  }

  // Si es admin, mostrar pantalla de redirección
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-700 font-semibold">
            Acceso administrativo detectado. Redirigiendo al Panel de Control...
          </p>
        </div>
      </div>
    );
  }

  // Si es afiliado, mostrar pantalla de redirección al portal de afiliados
  if (user?.role === "affiliate") {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-700 font-semibold">
            Acceso de socio afiliado detectado. Redirigiendo a tu Portal de Afiliados...
          </p>
        </div>
      </div>
    );
  }

  const loyalty = calculateLoyalty(user.purchasesCount || 0);

  const recommendedProducts = products
    .filter((p) => p.featured || p.rating >= 4.8)
    .slice(0, 4);

  const orders = user.recentOrders || [];

  const navItems = [
    {
      group: "PRINCIPAL",
      items: [
        {
          key: "resumen" as TabKey,
          label: "Resumen General",
          icon: LayoutDashboard,
        },
        {
          key: "compras" as TabKey,
          label: "Mis Compras",
          icon: ShoppingBag,
          badge: orders.length > 0 ? orders.length : undefined,
        },
        {
          key: "deseados" as TabKey,
          label: "Lista de Deseados",
          icon: Heart,
          badge: wishlistCount > 0 ? wishlistCount : undefined,
        },
      ],
    },
    {
      group: "BENEFICIOS",
      items: [
        {
          key: "promociones" as TabKey,
          label: "Promociones & Cupones",
          icon: Tag,
        },
        {
          key: "recomendaciones" as TabKey,
          label: "Recomendaciones",
          icon: Sparkles,
        },
      ],
    },
    {
      group: "GESTIÓN",
      items: [
        {
          key: "carrito" as TabKey,
          label: "Mi Carrito",
          icon: ShoppingCart,
          badge: cartCount > 0 ? cartCount : undefined,
        },
        {
          key: "perfil" as TabKey,
          label: "Mi Perfil & Datos",
          icon: User,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* ------------------------------------------------------------- */}
      {/* 1. SIDEBAR IZQUIERDA (Estilo corporativo oscuro tipo /admin)  */}
      {/* ------------------------------------------------------------- */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0B132B] border-r border-slate-800 text-slate-300 fixed top-0 bottom-0 left-0 z-40 select-none shadow-xl">
        {/* Brand Header */}
        <div className="shrink-0 flex items-center gap-3 px-5 h-16 border-b border-slate-800/80 bg-[#080D1F]/50">
          <div className="w-9 h-9 rounded-xl bg-white p-1 border border-slate-700 shadow-md shrink-0">
            <img
              src="/assets/branding/nb-isotype.png"
              alt="Nova Bytex"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-white leading-tight">Nova Bytex</p>
            <p className="text-[10.5px] font-medium text-slate-400 leading-tight">
              Portal de Clientes
            </p>
          </div>
        </div>

        {/* User Mini Profile Card */}
        <div className="p-3 mx-3 my-3 rounded-lg bg-slate-900/40 border border-slate-800/60 flex items-center gap-2.5">
          <Avatar className="h-8 w-8 border border-slate-700 shrink-0">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback className="bg-slate-800 text-xs font-semibold text-white">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white truncate">{user.name}</p>
            <p className="text-[11px] text-slate-400">nivel {loyalty.level.toLowerCase()}</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4 no-scrollbar">
          {navItems.map((section) => (
            <div key={section.group} className="space-y-0.5">
              <p className="text-[9.5px] font-bold tracking-widest text-slate-500 px-3 py-1 uppercase">
                {section.group}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveTab(item.key)}
                    className={cn(
                      "w-full flex items-center gap-2.5 h-8 text-xs transition-colors text-left",
                      active
                        ? "text-white font-medium border-l-2 border-blue-500 pl-2.5"
                        : "text-slate-400 hover:text-slate-200 pl-3 border-l-2 border-transparent"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        active ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                      )}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="shrink-0 p-3 border-t border-slate-800/60 bg-[#080D1F]/40 space-y-2 text-xs">
          <Link
            href="/"
            title="Volver a la Tienda Pública"
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-blue-400" />
            <span>Volver a la Tienda</span>
          </Link>
          <div className="flex items-center justify-between pt-1 text-slate-400">
            <button
              type="button"
              onClick={switchAccount}
              title="Cambiar de Cuenta"
              className="flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Cuenta</span>
            </button>
            <button
              type="button"
              onClick={() => signOut()}
              title="Cerrar Sesión"
              className="flex items-center gap-1.5 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* 2. DRAWER MÓVIL (Para pantallas pequeñas)                    */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
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
                  <div className="w-8 h-8 rounded-lg bg-white p-1 border border-slate-700">
                    <img
                      src="/assets/branding/nb-isotype.png"
                      alt="Nova Bytex"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">Nova Bytex</p>
                    <p className="text-[10px] text-slate-400">Portal de Clientes</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 mx-3 my-2 rounded-lg bg-slate-900/40 border border-slate-800/60 flex items-center gap-2.5">
                <Avatar className="h-8 w-8 border border-slate-700 shrink-0">
                  {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                  <AvatarFallback className="bg-slate-800 text-xs font-semibold text-white">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-400">nivel {loyalty.level.toLowerCase()}</p>
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto p-3 space-y-3">
                {navItems.map((section) => (
                  <div key={section.group} className="space-y-0.5">
                    <p className="text-[9.5px] font-bold tracking-widest text-slate-500 px-3 uppercase">
                      {section.group}
                    </p>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = activeTab === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            setActiveTab(item.key);
                            setMobileMenuOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-2.5 h-8 text-xs transition-colors text-left",
                            active
                              ? "text-white font-medium border-l-2 border-blue-500 pl-2.5"
                              : "text-slate-400 hover:text-slate-200 pl-3 border-l-2 border-transparent"
                          )}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge !== undefined && (
                            <span className="text-[11px] text-slate-400 tabular-nums">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>

              <div className="p-3 border-t border-slate-800/60 bg-[#080D1F] space-y-2 text-xs">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <Store className="w-3.5 h-3.5 text-blue-400" />
                  <span>Volver a la Tienda</span>
                </Link>
                <div className="flex items-center justify-between pt-1 text-slate-400">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      switchAccount();
                    }}
                    className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Cuenta</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="flex items-center gap-1.5 hover:text-rose-300 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Salir</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* 3. CONTENIDO PRINCIPAL Y BARRA SUPERIOR DEL SISTEMA           */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0 bg-slate-50 min-h-screen">
        {/* Top Header del Sistema */}
        <header className="shrink-0 h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="w-8 h-8 rounded-md flex items-center justify-center text-slate-700 hover:bg-slate-100 lg:hidden border border-slate-200"
              aria-label="Abrir menú"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 leading-none flex items-center gap-1.5">
                <span>Portal Cliente</span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-slate-900 font-medium">
                  {activeTab === "resumen"
                    ? "Resumen General"
                    : activeTab === "compras"
                    ? "Mis Compras"
                    : activeTab === "deseados"
                    ? "Lista de Deseados"
                    : activeTab === "promociones"
                    ? "Promociones & Descuentos"
                    : activeTab === "recomendaciones"
                    ? "Recomendaciones"
                    : activeTab === "carrito"
                    ? "Mi Carrito"
                    : "Mi Perfil"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick action: Volver a la Tienda */}
            <Link
              href="/"
              title="Volver a la Tienda Pública"
              className="h-8 px-2.5 text-xs rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline font-medium">Tienda</span>
            </Link>

            {/* Cart shortcut */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleCart}
              className="h-8 px-2.5 text-xs rounded-md border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-none"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
              <span className="tabular-nums font-medium">{cartCount}</span>
            </Button>

            {/* User Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 pl-2 border-l border-slate-200 outline-none hover:opacity-80 transition-opacity select-none cursor-pointer"
                >
                  <Avatar className="h-7 w-7 border border-slate-200">
                    {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                    <AvatarFallback className="bg-slate-900 text-[10px] font-bold text-white">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-xs font-medium text-slate-800 max-w-[120px] truncate leading-tight">
                    {user.name.split(" ")[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 p-1.5 rounded-lg bg-white border border-slate-200 shadow-lg text-slate-800 z-50"
              >
                <DropdownMenuLabel className="p-2">
                  <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <p className="text-[11px] text-slate-500 mt-1 capitalize">
                    nivel {loyalty.level.toLowerCase()}
                  </p>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-slate-100 my-1" />

                <DropdownMenuItem
                  onClick={() => router.push("/")}
                  className="cursor-pointer text-xs rounded-md px-2.5 py-1.5 font-medium flex items-center gap-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <Store className="w-4 h-4 text-blue-600" />
                  <span>Volver a la Tienda</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={switchAccount}
                  className="cursor-pointer text-xs rounded-md px-2.5 py-1.5 font-medium flex items-center gap-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <ArrowLeftRight className="w-4 h-4 text-slate-600" />
                  <span>Cambiar de Cuenta</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setActiveTab("perfil")}
                  className="cursor-pointer text-xs rounded-md px-2.5 py-1.5 font-medium flex items-center gap-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <User className="w-4 h-4 text-slate-600" />
                  <span>Mi Perfil &amp; Datos</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-slate-100 my-1" />

                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="cursor-pointer text-xs rounded-md px-2.5 py-1.5 font-medium flex items-center gap-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Cuerpo de la Sección Activa */}
        <main className="flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6">
          {/* ========================================================= */}
          {/* TAB 1: RESUMEN GENERAL                                    */}
          {/* ========================================================= */}
          {activeTab === "resumen" && (
            <div className="space-y-6">
              {/* Saludo y bloque de descuento directo sobre el fondo */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Saludo a la izquierda con datos en una sola línea */}
                <div className="space-y-1">
                  <h1 className="text-[26px] font-semibold text-slate-900 leading-tight">
                    ¡Hola, {user.name}!
                  </h1>
                  <p className="text-[13px] text-slate-500 flex items-center flex-wrap gap-x-2">
                    <span>{user.email}</span>
                    <span>·</span>
                    <span>nivel {loyalty.level.toLowerCase()}</span>
                    <span>·</span>
                    <span className="whitespace-nowrap">{user.purchasesCount} compras realizadas</span>
                    <span>·</span>
                    <span className="whitespace-nowrap">
                      Cliente desde {new Date(user.registeredAt).toLocaleDateString("es-PE", { month: "short", year: "numeric" })}
                    </span>
                  </p>

                  {/* Barra de progreso: solo visible cuando compras > 0, 4px de alto, ancho acotado */}
                  {user.purchasesCount > 0 && (
                    <div className="flex items-center gap-3 pt-2">
                      <div className="w-28 h-1 bg-slate-200 rounded-full overflow-hidden shrink-0">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, (user.purchasesCount / loyalty.nextTarget) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[13px] text-slate-500 tabular-nums">
                        {user.purchasesCount} / {loyalty.nextTarget} pedidos para el siguiente nivel
                      </span>
                    </div>
                  )}
                </div>

                {/* Bloque sencillo de descuento: borde izq de 3px verde, fondo muy tenue, sin icono */}
                <div className="border-l-[3px] border-emerald-600 bg-emerald-50/50 rounded-r-md p-3.5 space-y-0.5 max-w-sm shrink-0">
                  <p className="text-sm font-semibold text-emerald-950">
                    {loyalty.discount}% de descuento
                  </p>
                  <p className="text-[13px] text-slate-600 leading-snug">
                    Válido para tu siguiente compra en cualquier producto de hasta S/ {loyalty.maxPrice}.
                  </p>
                  <p className="text-[13px] text-slate-500 pt-0.5">
                    Cupón: <span className="font-mono text-slate-800 tabular-nums">NOVA-{user.name.split(" ")[0].toUpperCase()}-{loyalty.discount}</span>
                  </p>
                </div>
              </div>

              {/* 4 estadísticas en una sola fila con líneas divisorias verticales de 1px */}
              <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200/80 border-y border-slate-200/80 py-3">
                <div className="py-2 md:py-0 md:px-4 md:first:pl-0">
                  <span className="text-[13px] text-slate-500 block">total gastado</span>
                  <span className="text-[28px] font-medium text-slate-900 tabular-nums leading-tight block mt-0.5">
                    S/ {(user.totalSpent || 0).toLocaleString("es-PE")}
                  </span>
                </div>

                <div className="py-2 md:py-0 md:px-4">
                  <span className="text-[13px] text-slate-500 block">compras realizadas</span>
                  <span className="text-[28px] font-medium text-slate-900 tabular-nums leading-tight block mt-0.5">
                    {user.purchasesCount}
                  </span>
                </div>

                <div className="py-2 md:py-0 md:px-4">
                  <span className="text-[13px] text-slate-500 block">lista de deseados</span>
                  <span className="text-[28px] font-medium text-slate-900 tabular-nums leading-tight block mt-0.5">
                    {wishlistCount}
                  </span>
                </div>

                <div className="py-2 md:py-0 md:px-4 md:last:pr-0">
                  <span className="text-[13px] text-slate-500 block">mi carrito</span>
                  <span className="text-[28px] font-medium text-slate-900 tabular-nums leading-tight block mt-0.5">
                    {cartCount}
                  </span>
                </div>
              </div>

              {/* Compras Recientes: máximo un nivel de contenedor, bordes sutiles de 1px, sin sombras */}
              <div className="border border-slate-200/80 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Compras Recientes
                    </h2>
                    <p className="text-[13px] text-slate-500 mt-0.5">
                      Últimos pedidos procesados y estado de entrega
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("compras")}
                    className="text-[13px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Ver todas ({orders.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {orders.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {orders.slice(0, 3).map((ord) => (
                      <div
                        key={ord.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900 tabular-nums">
                              {ord.id}
                            </span>
                            <span className="text-xs text-slate-300">·</span>
                            <span className="text-xs text-slate-500">{ord.date}</span>
                            <span className="text-xs text-slate-300">·</span>
                            <span className="text-xs text-emerald-700 font-medium">
                              {ord.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{ord.itemsSummary}</p>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <span className="text-sm font-semibold text-slate-900 tabular-nums block">
                            S/ {ord.total.toLocaleString("es-PE")}
                          </span>
                          {ord.discountApplied ? (
                            <span className="text-[11px] text-emerald-700 block">
                              -{ord.discountApplied}% aplicado
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-6 text-center text-slate-400 text-xs">
                    No tienes pedidos registrados aún.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: MIS COMPRAS                                        */}
          {/* ========================================================= */}
          {activeTab === "compras" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-emerald-600" />
                      Historial Completo de Compras
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Detalle de todos tus pedidos y cotizaciones registradas.</p>
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-semibold">
                    {orders.length} pedidos
                  </Badge>
                </div>

                {orders.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {orders.map((ord) => (
                      <div key={ord.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-blue-700">{ord.id}</span>
                            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-semibold">
                              {ord.status}
                            </Badge>
                            <span className="text-xs text-slate-400 font-mono">{ord.date}</span>
                          </div>
                          <p className="text-xs text-slate-800 font-medium">{ord.itemsSummary}</p>
                          <span className="text-[11px] text-slate-500 block">
                            Cantidad de ítems: {ord.itemsCount}
                          </span>
                        </div>
                        <div className="text-left md:text-right">
                          <span className="text-base font-black text-slate-900 font-mono block">
                            S/ {ord.total.toLocaleString("es-PE")}
                          </span>
                          {ord.discountApplied ? (
                            <span className="text-xs text-emerald-700 font-semibold">
                              Cupón aplicado: {ord.discountApplied}% OFF
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Aún no registras compras anteriores</p>
                    <p className="text-xs text-slate-500 mt-1">Tus compras se sincronizan automáticamente con tu cuenta.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: LISTA DE DESEADOS                                  */}
          {/* ========================================================= */}
          {activeTab === "deseados" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500 fill-current" />
                      Tu Lista de Deseados
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Guarda productos para comprarlos luego o cotizarlos en bloque.</p>
                  </div>
                  <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs font-semibold">
                    {wishlistCount} artículos
                  </Badge>
                </div>

                {wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {wishlistItems.map((prod) => (
                      <ProductCard key={prod.id} product={prod} variant="light" />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Tu lista de deseados está vacía</p>
                    <p className="text-xs text-slate-500 mt-1">Explora nuestros productos y toca el corazón para guardarlos.</p>
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <Link
                        href="/productos"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-xl text-white shadow-xs"
                      >
                        Catálogo Tecnología
                      </Link>
                      <Link
                        href="/libreria"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-bold rounded-xl text-white shadow-xs"
                      >
                        Catálogo Papelería
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: CUPONES & PROMOCIONES                              */}
          {/* ========================================================= */}
          {activeTab === "promociones" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-emerald-600" />
                      Cuponera Digital Nova Bytex
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Beneficios y cupones activos. Podrás seleccionarlos y aplicarlos directamente desde tu Carrito de Compras con tus productos elegidos.
                    </p>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs px-3 py-1 font-semibold shrink-0">
                    {AVAILABLE_COUPONS.length} Cupones disponibles
                  </Badge>
                </div>

                {/* Grid de Cupones */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {AVAILABLE_COUPONS.map((coupon) => {
                    return (
                      <div
                        key={coupon.id}
                        className={`rounded-2xl border-2 border-dashed p-5 flex flex-col justify-between transition-all relative overflow-hidden ${
                          coupon.isExtra
                            ? "border-blue-300 bg-gradient-to-br from-white to-blue-50/40 hover:border-blue-500 shadow-xs"
                            : "border-slate-200 bg-white hover:border-slate-300 shadow-xs"
                        }`}
                      >
                        {/* Decorative ticket notch indicators */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 border border-slate-200/90" />
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 border border-slate-200/90" />

                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-mono text-xl font-black text-slate-900">
                              {coupon.badge}
                            </span>
                            {coupon.isExtra ? (
                              <Badge className="bg-blue-600 text-white font-bold text-[9.5px]">
                                ✨ Cupón Nuevo
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-900 text-white font-bold text-[9.5px]">
                                Oficial NB
                              </Badge>
                            )}
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 leading-snug">
                            {coupon.name}
                          </h3>

                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                            {coupon.description}
                          </p>

                          {coupon.minPurchase > 0 && (
                            <div className="mt-2 text-[11px] font-semibold text-slate-500">
                              Compra mínima: S/ {coupon.minPurchase.toLocaleString("es-PE")}
                            </div>
                          )}
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-200/80 space-y-2.5">
                          {/* Tiempo de vida */}
                          <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60 font-medium">
                            <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                            <span className="truncate">{coupon.validUntilDisplay}</span>
                          </div>

                          {/* Indicador de aplicación en carrito */}
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                              <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
                              <span>Aplicable en tu Carrito</span>
                            </span>
                            <span className="font-mono text-[10.5px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {coupon.code}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: RECOMENDACIONES                                    */}
          {/* ========================================================= */}
          {activeTab === "recomendaciones" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6">
                <div className="mb-4 pb-3 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Recomendaciones para ti
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Productos seleccionados según tu perfil y categorías preferidas.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                  {recommendedProducts.map((prod) => (
                    <ProductCard key={prod.id} product={prod} variant="light" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: MI CARRITO                                         */}
          {/* ========================================================= */}
          {activeTab === "carrito" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-blue-600" />
                      Tu Carrito de Compras
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Artículos seleccionados listos para procesar.</p>
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-semibold">
                    {cartCount} productos
                  </Badge>
                </div>

                {cart.length > 0 ? (
                  <div>
                    <div className="divide-y divide-slate-100">
                      {cart.map((item) => (
                        <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                            <span className="text-xs text-slate-500">Cantidad: {item.quantity} · S/ {(item.price || 0).toLocaleString("es-PE")} c/u</span>
                          </div>
                          <span className="text-sm font-bold text-emerald-700 shrink-0 font-mono">
                            S/ {((item.price || 0) * item.quantity).toLocaleString("es-PE")}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-xs text-slate-500 block">Total del Carrito:</span>
                        {appliedCoupon ? (
                          <div>
                            <span className="text-xs text-slate-400 line-through font-mono mr-2">
                              S/ {cartTotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-2xl font-extrabold text-emerald-600 font-mono">
                                S/ {Math.max(0, cartTotal - (appliedCoupon.discountType === 'percentage' ? Math.round((cartTotal * appliedCoupon.discountValue) / 100) : Math.min(appliedCoupon.discountValue, cartTotal))).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                              </span>
                              <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold border-emerald-200">
                                {appliedCoupon.badge} aplicado
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <span className="text-2xl font-bold text-slate-900 font-mono">
                            S/ {cartTotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={toggleCart}
                        className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
                      >
                        Ver Carrito Completo y Cotizar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Tu carrito está actualmente vacío</p>
                    <p className="text-xs text-slate-500 mt-1">Agrega productos desde las secciones de tecnología o papelería.</p>
                    <Link
                      href="/productos"
                      className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-xl text-white shadow-xs"
                    >
                      Ver Productos
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: MI PERFIL & DATOS                                  */}
          {/* ========================================================= */}
          {activeTab === "perfil" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 max-w-2xl">
                <div className="mb-4 pb-3 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-700" />
                    Datos
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Información asociada a tu cuenta en Nova Bytex.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <Avatar className="h-14 w-14 rounded-2xl border border-slate-200 bg-slate-900">
                      {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                      <AvatarFallback className="bg-slate-900 text-lg font-black text-white rounded-2xl">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-base font-bold text-slate-900">{user.name}</p>
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                        {user.provider === "google" ? "Cuenta Google" : user.provider === "otp" ? "Código OTP" : "Contraseña"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 font-medium block">Correo electrónico</span>
                      <span className="text-slate-900 font-semibold mt-0.5 block">{user.email}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 font-medium block">Teléfono / WhatsApp</span>
                      <span className="text-slate-900 font-semibold mt-0.5 block">{user.phone || "No especificado"}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 font-medium block">Fecha de Registro</span>
                      <span className="text-slate-900 font-semibold mt-0.5 block">
                        {new Date(user.registeredAt).toLocaleDateString("es-PE")}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 font-medium block">Nivel de Fidelidad</span>
                      <span className="text-emerald-700 font-bold mt-0.5 block">{loyalty.level} ({loyalty.discount}% OFF)</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={switchAccount}
                      className="text-xs border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs"
                    >
                      Iniciar con otra cuenta
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => signOut()}
                      className="text-xs border-rose-200 bg-white hover:bg-rose-50 text-rose-700 shadow-xs"
                    >
                      Cerrar sesión
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Cargando portal de cliente...</p>
          </div>
        </div>
      }
    >
      <CustomerDashboardContent />
    </React.Suspense>
  );
}
