"use client";

import { useEffect, useState } from "react";
import { CartProvider } from "@/contexts/CartContext";
import { CartSidebar } from "@/components/CartSidebar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { NovaLoader } from "@/components/NovaLoader";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowLoader(false), 800);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <NovaLoader visible={showLoader} fadingOut={false} />
      <CartProvider>
        <Navbar />
        <main className="min-h-screen pt-[72px]">{children}</main>
        <CartSidebar />
        <Footer />
      </CartProvider>
    </>
  );
}
