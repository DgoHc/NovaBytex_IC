"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, ShieldCheck, Cpu, CheckCircle2, PhoneCall } from "lucide-react";
import Link from "next/link";
import { ProductImage } from "@/components/ui/ProductImage";

export const Hero = () => {
  const reduceMotion = useReducedMotion();
  const easeCurve = [0.22, 1, 0.36, 1] as const;

  const reveal = (delay = 0, scale = 1) => ({
    hidden: { opacity: 0, y: 38, scale: scale - 0.08 },
    visible: {
      opacity: 1,
      y: 0,
      scale: scale,
      transition: { duration: 1.05, delay, ease: easeCurve },
    },
  });

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50/30 to-white py-20 text-slate-900 md:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-blue-400/10 blur-[140px]"
          animate={reduceMotion ? { opacity: 0.35 } : { scale: [1, 1.12, 1], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 9, repeat: reduceMotion ? 0 : Infinity }}
        />
        <motion.div
          className="absolute -right-32 top-1/3 h-[550px] w-[550px] rounded-full bg-blue-500/10 blur-[150px]"
          animate={reduceMotion ? { opacity: 0.3 } : { scale: [1.1, 1, 1.1], opacity: [0.18, 0.45, 0.18] }}
          transition={{ duration: 11, repeat: reduceMotion ? 0 : Infinity, delay: 1 }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : "hidden"}
            animate={reduceMotion ? { opacity: 1, y: 0 } : "visible"}
            variants={reveal(0.05, 1)}
            className="space-y-8 text-center lg:col-span-7 lg:text-left"
          >
            <motion.div
              initial={reduceMotion ? false : "hidden"}
              animate={reduceMotion ? { opacity: 1, scale: 1, y: 0 } : "visible"}
              variants={reveal(0.12, 1)}
              className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-medium text-blue-700 shadow-sm md:text-sm"
            >
              <Cpu className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Infraestructura TI &amp; Ciberseguridad Corporativa</span>
            </motion.div>

            <motion.h1
              initial={reduceMotion ? false : "hidden"}
              animate={reduceMotion ? { opacity: 1, y: 0 } : "visible"}
              variants={reveal(0.18, 1)}
              className="font-editorial text-5xl font-medium leading-[1.05] tracking-[-0.015em] text-slate-900 sm:text-6xl md:text-7xl lg:text-[88px]"
            >
              Tecnología que{" "}
              <span className="font-medium italic text-blue-700">Transforma</span>{" "}
              e Impulsa tu Empresa
            </motion.h1>

            <motion.p
              initial={reduceMotion ? false : "hidden"}
              animate={reduceMotion ? { opacity: 1, y: 0 } : "visible"}
              variants={reveal(0.24, 1)}
              className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg lg:mx-0"
            >
              Venta de hardware corporativo, servidores, equipos de red Cisco &amp; Dell, consultoría especializada y soporte TI 24/7 con garantía oficial.
            </motion.p>

            <motion.div
              initial={reduceMotion ? false : "hidden"}
              animate={reduceMotion ? { opacity: 1, y: 0 } : "visible"}
              variants={reveal(0.32, 1)}
              className="flex flex-col justify-center gap-4 pt-2 sm:flex-row lg:justify-start"
            >
              <Link href="/productos">
                <Button size="lg" className="h-14 w-full rounded-2xl bg-blue-700 px-8 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-800 sm:w-auto">
                  Explorar Catálogo <ShoppingBag className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link href="/contacto">
                <Button size="lg" variant="outline" className="h-14 w-full rounded-2xl border-slate-200 bg-white px-8 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-300 hover:bg-slate-50 sm:w-auto">
                  Solicitar Cotización <PhoneCall className="ml-2 h-4 w-4 text-blue-700" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : "hidden"}
              animate={reduceMotion ? { opacity: 1, y: 0 } : "visible"}
              variants={reveal(0.4, 1)}
              className="mx-auto grid max-w-lg grid-cols-3 gap-6 border-t border-slate-200/70 pt-10 lg:mx-0"
            >
              {[
                { value: "+500", label: "Clientes Corporativos" },
                { value: "99.9%", label: "Uptime & Garantía", highlight: true },
                { value: "24/7", label: "Soporte Técnico" }
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div
                    className={`text-2xl font-semibold tracking-tight font-editorial md:text-3xl ${stat.highlight ? "text-blue-700" : "text-slate-900"}`}
                  >
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs font-medium text-slate-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 28 }}
            animate={reduceMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.05, delay: 0.38, ease: easeCurve }}
            className="relative mx-auto w-full max-w-md lg:col-span-5"
          >
            <div className="relative space-y-5 rounded-[28px] border border-slate-100 bg-white p-6 shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-blue-700">
                    Producto Destacado
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">STOCK LISTO</span>
                </div>
                <div className="overflow-hidden rounded-[22px]">
                  <ProductImage type="server" name="Dell PowerEdge R750" className="h-48" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-slate-900">Garantía Directa</div>
                    <div className="truncate text-[11px] text-slate-500">100% Oficial</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-slate-900">Facturación RUC</div>
                    <div className="truncate text-[11px] text-slate-500">Empresa Formal</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
