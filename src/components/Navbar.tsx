"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Menu, X, MessageCircle, ShoppingCart, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";

const openWhatsApp = () => {
  const message = encodeURIComponent("¡Hola! Me gustaría cotizar productos y servicios de tecnología.");
  window.open(`https://wa.me/51999999999?text=${message}`, "_blank");
};

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { cartCount, toggleCart } = useCart();
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
      router.push(`/productos`);
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Productos", href: "/productos" },
    { name: "Servicios", href: "/servicios" },
    { name: "Nosotros", href: "/nosotros" },
    { name: "Contacto", href: "/contacto" }
  ];

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 shadow-[0_16px_40px_rgba(2,6,23,0.35)] backdrop-blur-xl transition-transform duration-300 ease-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex h-[72px] w-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 text-white transition-opacity duration-200 hover:opacity-95"
          aria-label="Nova Bytex inicio"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/40 bg-blue-500/10 shadow-[0_0_25px_rgba(59,130,246,0.18)] transition-all duration-200 group-hover:scale-[1.02] group-hover:border-blue-300/60">
            <Cpu className="h-4 w-4 text-blue-300" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-black tracking-[-0.04em] text-white md:text-[1.08rem]">Nova Bytex</span>
            <span className="mt-1 text-[8.5px] font-medium uppercase tracking-[0.22em] text-blue-300/90">
              Technology
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`group relative px-2.5 py-2 text-[12.5px] font-medium transition-all duration-200 xl:px-3.5 ${
                  isActive ? "text-white" : "text-slate-300 hover:text-white"
                }`}
              >
                <span className={isActive ? "font-semibold" : "font-medium"}>{link.name}</span>
                <span
                  className={`absolute -bottom-2 left-2 right-2 h-px origin-left transition-all duration-300 ${
                    isActive ? "scale-x-100 bg-blue-400/80" : "scale-x-0 bg-blue-400/60 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Input
              placeholder="Buscar productos TI..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-9 w-40 rounded-lg border border-slate-700/80 bg-slate-900/70 pl-9 text-xs text-white placeholder:text-slate-400 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] focus:border-blue-500/60 focus:ring-0 focus-visible:ring-0 xl:w-52"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </form>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCart}
            className="relative h-9 w-9 rounded-lg border border-slate-700/80 bg-slate-900/70 text-slate-200 shadow-[0_10px_25px_rgba(15,23,42,0.25)] transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white"
            aria-label="Carrito"
          >
            <ShoppingCart className="h-4 w-4 text-blue-300" />
            {cartCount > 0 && (
              <Badge className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[18px] items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-black text-slate-950 shadow-md">
                {cartCount}
              </Badge>
            )}
          </Button>

          <Button
            className="h-9 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3.5 text-[11px] font-semibold text-emerald-300 shadow-[0_10px_25px_rgba(16,185,129,0.12)] transition-colors hover:border-emerald-400/40 hover:bg-emerald-500 hover:text-slate-950"
            onClick={openWhatsApp}
          >
            <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
            WhatsApp
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
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
        <div className="border-t border-slate-800 bg-slate-950/95 pb-3 pt-3 md:hidden">
          <div className="space-y-1.5 text-sm text-slate-200">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "border border-slate-700 bg-slate-900 text-white"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="mt-3 space-y-2 border-t border-slate-800 pt-3">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Input
                  placeholder="Buscar productos..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="h-10 w-full rounded-lg border-slate-700 bg-slate-900/80 pl-9 text-sm text-white placeholder:text-slate-400"
                />
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </form>

            <Button
              className="h-10 w-full rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-[11px] font-semibold text-emerald-300 transition-colors hover:border-emerald-400/40 hover:bg-emerald-500 hover:text-slate-950"
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
