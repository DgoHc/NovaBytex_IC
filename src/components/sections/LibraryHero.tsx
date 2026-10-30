"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, Ruler, ArrowRight, FileText, Notebook, Pen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroFeature {
  category: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ width?: number; height?: number; className?: string; strokeWidth?: number }>;
  circleBg: string;
  href: string;
}

const heroFeatures: HeroFeature[] = [
  {
    category: "Papelería",
    title: "Papelería & Impresión",
    desc: "Papel bond, notas y fólderes",
    icon: FileText,
    circleBg: "bg-[#FCE7DC]", // Durazno suave
    href: "/libreria?categoria=Papelería#library-catalog",
  },
  {
    category: "Cuadernos",
    title: "Cuadernos & Archivo",
    desc: "Stanford, cuadriculados y archivo",
    icon: Notebook,
    circleBg: "bg-[#E5EFE7]", // Salvia suave
    href: "/libreria?categoria=Cuadernos#library-catalog",
  },
  {
    category: "Escritura",
    title: "Escritura & Oficina",
    desc: "Faber-Castell, bolígrafos y tintas",
    icon: Pen,
    circleBg: "bg-[#FAF0E1]", // Crema suave
    href: "/libreria?categoria=Escritura#library-catalog",
  },
];

interface LibraryHeroProps {
  onSelectCategory?: (category: string) => void;
}

export const LibraryHero: React.FC<LibraryHeroProps> = ({ onSelectCategory }) => {
  return (
    <section className="relative overflow-hidden paper-warm-bg border-b border-library-beige/40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, hsl(var(--library-cream)) 0%, transparent 55%), radial-gradient(circle at 85% 80%, hsla(18,55%,70%,0.25) 0%, transparent 50%), radial-gradient(circle at 50% 100%, hsla(145,30%,60%,0.20) 0%, transparent 55%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, hsl(var(--library-beige)) 1px, transparent 1px), linear-gradient(hsl(var(--library-beige)) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse at top, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at top, black 30%, transparent 75%)",
        }}
      />

      <div className="relative container mx-auto px-4 pt-16 pb-16 lg:pt-24 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-7"
          >


            <div className="space-y-4">
              <h1 className="font-bodoni text-[44px] leading-[1.05] md:text-6xl lg:text-[72px] font-medium tracking-[-0.02em] text-slate-900">
                Librería
                <span className="block text-library-terracotta italic mt-2">
                  Útiles · Cuadernos · Escritura
                </span>
              </h1>
              <p className="font-sans text-base md:text-lg leading-relaxed text-slate-600 max-w-2xl">
                Marcas como Stanford, Faber-Castell y Parker. Compra en la web, pide por WhatsApp o pasa por la tienda en Cajamarca.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="h-12 px-7 rounded-2xl bg-slate-900 hover:bg-blue-800 text-white shadow-lg shadow-slate-900/15 transition-all duration-300 hover:-translate-y-0.5 text-sm font-semibold tracking-wide"
                onClick={() => {
                  const el = document.getElementById("library-catalog");
                  if (el)
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Ver catálogo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-7 rounded-2xl border-slate-900/15 text-slate-800 hover:bg-white hover:border-library-sage/60 hover:text-library-sage-foreground bg-white/60 backdrop-blur-sm text-sm font-semibold tracking-wide"
                asChild
              >
                <a href="#categorias-libreria">Ver categorías</a>
              </Button>
            </div>

            <div className="pt-6 mt-6 border-t border-[#0f172a]/[0.08]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {heroFeatures.map((f) => (
                  <Link
                    key={f.category}
                    href={f.href}
                    onClick={(e) => {
                      if (onSelectCategory) {
                        e.preventDefault();
                        onSelectCategory(f.category);
                        const el = document.getElementById("library-catalog");
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    className="group flex items-center gap-3 p-2 rounded-xl transition-all duration-200 hover:bg-white/40 focus-visible:ring-2 focus-visible:ring-[#0f172a] focus-visible:ring-offset-2 outline-none min-h-[48px]"
                  >
                    <div
                      className={cn(
                        "w-9 h-9 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 shadow-2xs",
                        f.circleBg
                      )}
                    >
                      <f.icon
                        width={18}
                        height={18}
                        strokeWidth={1.5}
                        className="w-[18px] h-[18px] text-[#0f172a] shrink-0"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-[#0f172a] group-hover:text-blue-900 transition-colors flex items-center gap-1.5 leading-snug truncate">
                        <span>{f.title}</span>
                        <ArrowRight
                          width={14}
                          height={14}
                          className="w-3.5 h-3.5 text-slate-500 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0"
                        />
                      </p>
                      <p className="text-[13px] text-slate-600 truncate block mt-0.5 leading-tight">
                        {f.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-[460px] aspect-[4/5] w-full">
              <div className="absolute -top-4 -left-4 w-24 h-24 rounded-3xl bg-library-terracotta/70 blur-[2px] rotate-[-8deg] shadow-2xl shadow-library-terracotta/20" />
              <div className="absolute top-1/3 -right-5 w-20 h-20 rounded-full bg-library-sage/80 rotate-[12deg] shadow-xl shadow-library-sage/30" />
              <div className="absolute bottom-0 left-10 w-40 h-16 rounded-[28px] bg-library-cream border border-library-beige/80 rotate-[-4deg] shadow-xl" />

              <div className="relative z-10 w-full h-full rounded-[36px] bg-gradient-to-br from-white via-library-paper to-library-cream border border-library-beige/70 shadow-[0_30px_80px_-30px_rgba(30,41,59,0.28)] p-7 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-library-terracotta" />
                    <span className="w-2.5 h-2.5 rounded-full bg-library-beige" />
                    <span className="w-2.5 h-2.5 rounded-full bg-library-sage" />
                  </div>
                  <span className="font-bodoni italic text-[12px] text-slate-500">
                    Nova Bytex · Librería
                  </span>
                </div>

                <div className="mt-7 space-y-2">
                  <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-library-terracotta">
                    PRODUCTOS DESTACADOS
                  </p>
                  <h3 className="font-bodoni text-[30px] leading-[1.1] text-slate-900">
                    Papel, cuadernos
                    <span className="italic text-library-sage-foreground">
                      {" "}
                      y útiles
                    </span>
                  </h3>
                  <p className="font-bodoni text-[20px] leading-[1.15] text-slate-700 italic">
                    para tu oficina, colegio y estudio.
                  </p>
                </div>

                <div className="mt-8 space-y-3.5 flex-1">
                  {[
                    { n: "01", title: "Papel Bond Report · A4 75g", cat: "Papelería" },
                    { n: "02", title: "Cuaderno Stanford · 100 hojas", cat: "Cuadernos" },
                    { n: "03", title: "Lapiceros Faber-Castell · Trilux", cat: "Escritura" },
                    { n: "04", title: "Archivador Palanca · Vinifan A4", cat: "Archivadores" },
                  ].map((item) => (
                    <div
                      key={item.n}
                      className="group flex items-center justify-between px-4 py-3 rounded-2xl bg-white/80 border border-library-beige/60 hover:border-library-sage/60 hover:bg-white transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-bodoni text-[13px] text-library-terracotta font-semibold w-5">
                          {item.n}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-slate-900 truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {item.cat}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-library-sage-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Ver →
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-end justify-between pt-4 border-t border-library-beige/70">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500">
                      Disponible en
                    </p>
                    <p className="font-bodoni text-[18px] text-slate-900 italic">
                      Nova Bytex
                    </p>
                  </div>
                  <Badge className="h-7 px-3 bg-slate-900 text-white rounded-xl text-[11px] font-semibold tracking-wide shadow-md">
                    Catálogo activo
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LibraryHero;
