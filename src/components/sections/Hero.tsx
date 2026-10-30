"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShoppingBag, PhoneCall } from "lucide-react";
import Link from "next/link";
import { HeroServicesCarousel } from "./HeroServicesCarousel";

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
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50/30 to-white py-14 text-slate-900">
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

      {/* Contenedor Centrado: max-width 1280px, padding lateral 32px (20px en móvil) */}
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 relative z-10">
        {/* Grid de 2 columnas (1fr 1fr, gap 64px), align-items: center */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Columna Izquierda: max-width 560px */}
          <motion.div
            initial={reduceMotion ? false : "hidden"}
            animate={reduceMotion ? { opacity: 1, y: 0 } : "visible"}
            variants={reveal(0.05, 1)}
            className="w-full max-w-[560px] mx-auto lg:mx-0 text-center lg:text-left flex flex-col justify-center"
          >

            {/* Título (H1): clamp(40px, 4.2vw, 60px), line-height 1.08, máximo 4 líneas, 24px hacia el párrafo */}
            <motion.h1
              initial={reduceMotion ? false : "hidden"}
              animate={reduceMotion ? { opacity: 1, y: 0 } : "visible"}
              variants={reveal(0.18, 1)}
              className="font-editorial text-[clamp(40px,4.2vw,60px)] font-medium leading-[1.08] tracking-[-0.015em] text-slate-900 mb-6"
            >
              Tecnología, útiles de oficina y{" "}
              <span className="font-medium italic text-blue-700">soporte técnico</span>{" "}
              en Cajamarca
            </motion.h1>

            {/* Párrafo: 17px, max-width 520px, 28px hacia los botones */}
            <motion.p
              initial={reduceMotion ? false : "hidden"}
              animate={reduceMotion ? { opacity: 1, y: 0 } : "visible"}
              variants={reveal(0.24, 1)}
              className="text-[17px] leading-relaxed text-slate-600 max-w-[520px] mb-7 mx-auto lg:mx-0"
            >
              Vendemos equipos, papelería y útiles de oficina. También damos soporte técnico, redes y asesoría para empresas e instituciones.
            </motion.p>

            {/* Botones de 52px de alto con 12px de separación: Ver catálogo ~200px, Cotizar ~240px */}
            <motion.div
              initial={reduceMotion ? false : "hidden"}
              animate={reduceMotion ? { opacity: 1, y: 0 } : "visible"}
              variants={reveal(0.32, 1)}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
            >
              <Button asChild size="lg" className="h-[52px] w-full sm:w-[200px] rounded-2xl bg-blue-700 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-800">
                <Link href="/productos">
                  Ver catálogo <ShoppingBag className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="h-[52px] w-full sm:w-[240px] rounded-2xl border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-300 hover:bg-slate-50">
                <a href="https://wa.me/51990804482?text=Hola,%20deseo%20solicitar%20una%20cotizaci%C3%B3n" target="_blank" rel="noopener noreferrer">
                  Cotizar por WhatsApp <PhoneCall className="ml-2 h-4 w-4 text-blue-700" />
                </a>
              </Button>
            </motion.div>

            {/* Fila de datos a 40px de los botones */}
            <motion.div
              initial={reduceMotion ? false : "hidden"}
              animate={reduceMotion ? { opacity: 1, y: 0 } : "visible"}
              variants={reveal(0.4, 1)}
              className="mt-10 pt-8 border-t border-slate-200/70 grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0"
            >
              {[
                { value: "Cajamarca", label: "Tienda física" },
                { value: "L a V", label: "7:00 a. m. a 7:00 p. m.", highlight: true },
                { value: "WhatsApp", label: "Cotizaciones directas" }
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

          {/* Columna Derecha: Tarjeta del Carrusel (ancho máx. 600px, centrada verticalmente) */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 28 }}
            animate={reduceMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.05, delay: 0.38, ease: easeCurve }}
            className="relative mx-auto w-full max-w-[600px] flex items-center justify-center"
          >
            <HeroServicesCarousel />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
