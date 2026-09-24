"use client";

import React, { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { CartProvider } from "@/contexts/CartContext";
import { CatalogProvider, useCatalog } from "@/contexts/CatalogContext";
import { CartSidebar } from "@/components/CartSidebar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { NovaLoader } from "@/components/NovaLoader";
import { cn } from "@/lib/utils";

function ToastContainer() {
  const { toasts, dismissToast } = useCatalog();
  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 pointer-events-none w-[340px] max-w-[92vw]">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon =
            t.variant === "success"
              ? CheckCircle2
              : t.variant === "error"
              ? AlertCircle
              : Info;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-2xl p-4 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.35)] border backdrop-blur-sm",
                t.variant === "success"
                  ? "bg-emerald-50/95 border-emerald-200 text-emerald-900"
                  : t.variant === "error"
                  ? "bg-rose-50/95 border-rose-200 text-rose-900"
                  : "bg-blue-50/95 border-blue-200 text-blue-900"
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 shrink-0 rounded-xl flex items-center justify-center",
                  t.variant === "success"
                    ? "bg-emerald-100 text-emerald-700"
                    : t.variant === "error"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-blue-100 text-blue-700"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold leading-snug">{t.title}</p>
                {t.description && (
                  <p className="text-[12.5px] leading-relaxed mt-1 opacity-90">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismissToast(t.id)}
                className="opacity-70 hover:opacity-100 p-1 -m-1 rounded-md transition-opacity"
                aria-label="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

import { usePathname } from "next/navigation";

function ShellInner({ children }: { children: React.ReactNode }) {
  const { hydrated, loading } = useCatalog();
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isCard = pathname?.startsWith("/card");
  const [navigating, setNavigating] = useState(false);
  const isFirstMount = React.useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setNavigating(true);
    const timer = setTimeout(() => setNavigating(false), 450);
    return () => clearTimeout(timer);
  }, [pathname]);

  const showLoader = isAdmin ? (!hydrated || loading) : (hydrated && loading);

  if (isCard) {
    return (
      <>
        {navigating && (
          <div className="fixed top-0 left-0 right-0 h-[3px] z-[150] overflow-hidden bg-transparent pointer-events-none">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            />
          </div>
        )}
        <main className="min-h-screen bg-slate-950">{children}</main>
        <ToastContainer />
      </>
    );
  }

  if (isAdmin) {
    return (
      <>
        {navigating && (
          <div className="fixed top-0 left-0 right-0 h-[3px] z-[150] overflow-hidden bg-transparent pointer-events-none">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            />
          </div>
        )}
        <NovaLoader visible={showLoader} fadingOut={false} />
        <main className="min-h-screen bg-slate-50">{children}</main>
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      {navigating && (
        <div className="fixed top-0 left-0 right-0 h-[3px] z-[150] overflow-hidden bg-transparent pointer-events-none">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          />
        </div>
      )}
      <NovaLoader visible={showLoader} fadingOut={false} />
      <Navbar />
      <main className="min-h-screen pt-[72px]">{children}</main>
      <CartSidebar />
      <Footer />
      <ToastContainer />
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <CatalogProvider>
      <CartProvider>
        <ShellInner>{children}</ShellInner>
      </CartProvider>
    </CatalogProvider>
  );
}
