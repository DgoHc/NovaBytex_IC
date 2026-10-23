"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Menu,
  X,
  MessageCircle,
  ShoppingCart,
  Cpu,
  User,
  Heart,
  LogOut,
  ArrowLeftRight,
  LayoutDashboard,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  KeyRound,
  Layers,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const openWhatsApp = () => {
  const message = encodeURIComponent("Hola, deseo consultar sobre productos y servicios.");
  window.open(`https://wa.me/51990804482?text=${message}`, "_blank");
};

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { cartCount, toggleCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, isAdmin, signOut, switchAccount } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY && !isMenuOpen) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/productos?search=${encodeURIComponent(searchValue.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Tecnología", href: "/productos" },
    { name: "Papelería", href: "/libreria" },
    { name: "Servicios", href: "/servicios" },
    { name: "Nosotros", href: "/nosotros" },
    { name: "Contacto", href: "/contacto" },
  ];

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-[120] border-b border-slate-800/80 bg-slate-950/90 shadow-[0_16px_40px_rgba(2,6,23,0.35)] backdrop-blur-xl transition-transform duration-300 ease-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex h-[72px] w-full max-w-[1600px] items-center justify-between gap-3 pl-0 pr-4 sm:pr-6 lg:pr-8">
        <Link
          href="/"
          className="group relative flex h-full shrink-0 items-center gap-3 px-3 sm:px-4 select-none"
          aria-label="Nova Bytex inicio"
        >
          <div className="relative h-10 w-10 flex items-center justify-center shrink-0">
            <img
              src="/assets/branding/nb-isotype.png"
              alt="Isotipo de Nova Bytex S.R.L."
              loading="lazy"
              className="h-9 w-auto object-contain block transition-transform group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold tracking-wider text-white leading-none">NOVA BYTEX</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mt-1 leading-none">Technologies</span>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`));

            if (link.href === "/productos") {
              return (
                <div key={link.href} className="relative group">
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`px-2.5 py-2 text-[12.5px] font-medium transition-all duration-200 xl:px-3.5 inline-flex items-center gap-1 ${
                      isActive ? "font-semibold text-white" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-white transition-transform group-hover:rotate-180" />
                  </Link>

                  <div className="absolute top-full left-0 pt-1.5 hidden group-hover:block z-50">
                    <div className="w-56 rounded-xl bg-slate-900/95 border border-slate-800 p-1.5 shadow-2xl backdrop-blur-md">
                      <Link
                        href="/productos"
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5 text-blue-400" />
                        <span>Todo el Catálogo</span>
                      </Link>
                      <Link
                        href="/productos?tab=hardware"
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
                      >
                        <Cpu className="w-3.5 h-3.5 text-blue-400" />
                        <span>Equipos &amp; Hardware TI</span>
                      </Link>
                      <Link
                        href="/productos?tab=licenses"
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 rounded-lg transition-colors"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Licencias &amp; Suscripciones</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`px-2.5 py-2 text-[12.5px] font-medium transition-all duration-200 xl:px-3.5 ${
                  isActive ? "font-semibold text-white" : "text-slate-300 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-1.5 md:flex shrink-0">
          <form onSubmit={handleSearchSubmit} className="relative">
            <label htmlFor="header-search-desktop" className="sr-only">Buscar productos</label>
            <Input
              id="header-search-desktop"
              placeholder="Buscar productos"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-9 w-28 lg:w-36 xl:w-44 rounded-lg border border-slate-700/80 bg-slate-900/70 pl-8 pr-2.5 text-xs text-white placeholder:text-slate-400 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] focus:border-blue-500/60 focus:ring-0 focus-visible:ring-1 focus-visible:ring-blue-400/50"
            />
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </form>

          {/* Deseados / Wishlist (solo clientes) */}
          {!isAdmin && (
            <Link
              href="/mi-cuenta?tab=deseados"
              aria-label="Lista de deseados"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/70 text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <Heart className="h-4 w-4 text-rose-400" />
              {wishlistCount > 0 && (
                <Badge className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-sm">
                  {wishlistCount}
                </Badge>
              )}
            </Link>
          )}

          {/* Carrito */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCart}
            className="relative h-9 w-9 rounded-lg border border-slate-700/80 bg-slate-900/70 text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="Carrito"
          >
            <ShoppingCart className="h-4 w-4 text-blue-300" />
            {cartCount > 0 && (
              <Badge className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[18px] items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-black text-slate-950 shadow-sm">
                {cartCount}
              </Badge>
            )}
          </Button>

          {/* Auth Button or User Combobox Dropdown */}
          {!isAuthenticated ? (
            <Link
              href="/login"
              className="h-9 rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 text-xs font-semibold text-slate-200 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] transition-all hover:border-blue-500/50 hover:bg-slate-800 hover:text-white flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <User className="h-3.5 w-3.5 text-blue-400" />
              <span>Iniciar Sesión</span>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="group flex h-9 items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/80 px-2.5 py-1 text-xs text-white transition-all hover:border-blue-500/50 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  aria-label="Menú de usuario"
                >
                  <Avatar className="h-6 w-6 border border-blue-400/40">
                    {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                    <AvatarFallback className="bg-blue-600 text-[10px] font-black text-white">
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : "NB"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[85px] truncate text-left font-medium text-slate-200 group-hover:text-white xl:max-w-[110px]">
                    {user?.name.split(" ")[0]}
                  </span>
                  {user?.loyaltyDiscount ? (
                    <span className="hidden rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30 xl:inline-block">
                      -{user.loyaltyDiscount}%
                    </span>
                  ) : null}
                  <ChevronDown className="h-3 w-3 text-slate-400 transition-transform group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl shadow-2xl">
                <div className="px-2.5 py-2 border-b border-slate-800/80 mb-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white truncate max-w-[140px]">{user?.name}</p>
                    <Badge
                      className={cn(
                        "text-[9px] font-bold uppercase",
                        isAdmin
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : user?.role === "affiliate"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                      )}
                    >
                      {isAdmin ? "Admin" : user?.role === "affiliate" ? "Afiliado" : "Cliente"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                  {user?.loyaltyDiscount ? (
                    <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 px-2 py-1 text-[10px] text-emerald-300">
                      <Sparkles className="h-3 w-3 shrink-0 text-emerald-400" />
                      <span>Tienes <strong>{user.loyaltyDiscount}% OFF</strong> acumulado</span>
                    </div>
                  ) : null}
                </div>

                {isAdmin ? (
                  <DropdownMenuItem
                    onClick={() => {
                      document.cookie = "admin_session=authenticated; path=/; max-age=86400; SameSite=Lax";
                      window.location.href = "/admin";
                    }}
                    className="flex items-center gap-2 cursor-pointer py-2 text-amber-300 focus:bg-amber-950/40 focus:text-amber-200"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                    <span>Panel de Administración</span>
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/mi-cuenta" className="flex items-center gap-2 cursor-pointer py-2">
                        <LayoutDashboard className="h-3.5 w-3.5 text-blue-400" />
                        <span>Mi Dashboard</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/afiliados" className="flex items-center gap-2 cursor-pointer py-2 text-cyan-300 focus:text-cyan-200">
                        <Share2 className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Portal de Afiliados</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/mi-cuenta?tab=deseados" className="flex items-center justify-between cursor-pointer py-2">
                        <div className="flex items-center gap-2">
                          <Heart className="h-3.5 w-3.5 text-rose-400" />
                          <span>Lista de Deseados</span>
                        </div>
                        {wishlistCount > 0 && (
                          <Badge className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] px-1.5 h-4">
                            {wishlistCount}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuItem onClick={toggleCart} className="flex items-center justify-between cursor-pointer py-2">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-3.5 w-3.5 text-blue-300" />
                    <span>Mi Carrito</span>
                  </div>
                  {cartCount > 0 && (
                    <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] px-1.5 h-4">
                      {cartCount}
                    </Badge>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 bg-slate-800" />

                <DropdownMenuItem onClick={switchAccount} className="flex items-center gap-2 cursor-pointer py-2 text-slate-300 hover:text-white">
                  <ArrowLeftRight className="h-3.5 w-3.5 text-slate-400" />
                  <span>Cambiar de Cuenta</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => signOut()} className="flex items-center gap-2 cursor-pointer py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30">
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            className={cn(
              "h-9 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 transition-colors hover:border-emerald-400 hover:bg-emerald-600 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400 shrink-0 flex items-center justify-center",
              isAuthenticated
                ? "w-9 p-0 xl:w-auto xl:px-2.5 text-[11px]"
                : "px-2.5 lg:px-3 text-[11px]"
            )}
            onClick={openWhatsApp}
            title="Contactar por WhatsApp"
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            <span
              className={cn(
                "font-semibold ml-1.5",
                isAuthenticated ? "hidden xl:inline" : "hidden sm:inline"
              )}
            >
              WhatsApp
            </span>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {!isAdmin && (
            <Link
              href="/mi-cuenta?tab=deseados"
              aria-label="Lista de deseados"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/70 text-slate-200"
            >
              <Heart className="h-4 w-4 text-rose-400" />
              {wishlistCount > 0 && (
                <Badge className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">
                  {wishlistCount}
                </Badge>
              )}
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCart}
            className="relative h-9 w-9 rounded-lg border border-slate-700 bg-slate-900/70 text-slate-200"
            aria-label="Carrito"
          >
            <ShoppingCart className="h-4 w-4 text-blue-300" />
            {cartCount > 0 && (
              <Badge className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-black text-slate-950">
                {cartCount}
              </Badge>
            )}
          </Button>

          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/70 text-slate-200 transition-colors hover:border-slate-600 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menú"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-slate-800 bg-slate-950/95 pb-4 pt-3 px-4 md:hidden">
          {isAuthenticated && user && (
            <div className="mb-3 rounded-xl border border-slate-800 bg-slate-900/90 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar className="h-8 w-8 border border-blue-400/40">
                  {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                  <AvatarFallback className="bg-blue-600 text-xs font-black text-white">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <Link
                href={isAdmin ? "/admin" : "/mi-cuenta"}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "rounded-lg px-2 py-1 text-[11px] font-bold shrink-0 border",
                  isAdmin
                    ? "bg-amber-600/20 border-amber-500/40 text-amber-300"
                    : "bg-blue-600/20 border-blue-500/40 text-blue-300"
                )}
              >
                {isAdmin ? "Panel Admin" : "Dashboard"}
              </Link>
            </div>
          )}

          <div className="space-y-1.5 text-sm text-slate-200">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`));
              return (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "border border-slate-700 bg-slate-900 text-white"
                        : "text-slate-300 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    {link.name}
                  </Link>
                  {link.href === "/productos" && (
                    <div className="ml-4 my-1 space-y-1 pl-2 border-l border-slate-800">
                      <Link
                        href="/productos?tab=hardware"
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-1 px-2 text-xs text-slate-400 hover:text-blue-400 transition-colors"
                      >
                        • Equipos &amp; Hardware TI
                      </Link>
                      <Link
                        href="/productos?tab=licenses"
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-1 px-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        • Licencias &amp; Suscripciones
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-3 space-y-2 border-t border-slate-800 pt-3">
            {!isAuthenticated ? (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-blue-500/40 bg-blue-600/20 text-xs font-semibold text-blue-300 hover:bg-blue-600/30"
              >
                <User className="h-4 w-4" />
                Iniciar Sesión / Registrarse
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {isAdmin ? (
                  <a
                    href="/admin"
                    onClick={() => {
                      setIsMenuOpen(false);
                      document.cookie = "admin_session=authenticated; path=/; max-age=86400; SameSite=Lax";
                    }}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-950/40 text-xs font-semibold text-amber-300"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                    Panel Admin
                  </a>
                ) : (
                  <>
                    <Link
                      href="/afiliados"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 text-xs text-cyan-300"
                    >
                      <Share2 className="h-3.5 w-3.5 text-cyan-400" />
                      Afiliados
                    </Link>
                    <Link
                      href="/mi-cuenta?tab=deseados"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs text-rose-300"
                    >
                      <Heart className="h-3.5 w-3.5" />
                      Deseados ({wishlistCount})
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut();
                  }}
                  className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs text-rose-400"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Cerrar sesión
                </button>
              </div>
            )}

            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <label htmlFor="header-search-mobile" className="sr-only">Buscar productos</label>
                <Input
                  id="header-search-mobile"
                  placeholder="Buscar productos"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="h-10 w-full rounded-lg border-slate-700 bg-slate-900/80 pl-10 pr-3 text-xs text-white placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-blue-400/50"
                />
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>
            </form>

            <Button
              className="h-10 w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-300 transition-colors hover:border-emerald-400 hover:bg-emerald-600 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400"
              onClick={openWhatsApp}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Contactar por WhatsApp
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};
