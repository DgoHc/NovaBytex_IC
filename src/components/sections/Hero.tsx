"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, ShieldCheck, CheckCircle2, PhoneCall, CreditCard, Server, Headphones } from "lucide-react";
import Link from "next/link";

const heroServices = [
  {
    title: "Tarjetas Digitales NFC",
    description: "Comparte tu contacto al instante. Ecológica, moderna y personalizable para tu empresa.",
    icon: <CreditCard className="w-8 h-8 text-white" />,
    features: ["Contacto directo", "Sin apps adicionales"],
    gradient: "from-blue-600 to-indigo-700",
    shadow: "shadow-blue-500/30"
  },
  {
    title: "Papelería & Hardware",
    description: "Suministro confiable de útiles de oficina y hardware de las mejores marcas.",
    icon: <ShoppingBag className="w-8 h-8 text-white" />,
    features: ["Entrega inmediata", "Garantía oficial"],
    gradient: "from-cyan-500 to-blue-600",
    shadow: "shadow-cyan-500/30"
  },
  {
    title: "Soporte Técnico",
    description: "Acompañamiento especializado para garantizar la continuidad operativa de tu empresa.",
    icon: <Headphones className="w-8 h-8 text-white" />,
    features: ["Respuesta < 15 min", "Monitoreo 24/7"],
    gradient: "from-violet-500 to-purple-600",
    shadow: "shadow-purple-500/30"
  },
  {
    title: "Data Center & Redes",
    description: "Diseño, implementación y cableado de redes seguras, virtualización y servidores.",
    icon: <Server className="w-8 h-8 text-white" />,
    features: ["99.99% Uptime", "Redes robustas"],
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/30"
  }
];

export const Hero = () => {
  const [activeService, setActiveService] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveService((prev) => (prev + 1) % heroServices.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

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
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50/30 to-white pt-8 pb-20 text-slate-900 md:pt-12 md:pb-28 lg:pt-12 lg:pb-32">
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
            className="space-y-8 text-center lg:col-span-6 lg:text-left"
          >
            <motion.div
              initial={reduceMotion ? false : "hidden"}
              animate={reduceMotion ? { opacity: 1, scale: 1, y: 0 } : "visible"}
              variants={reveal(0.12, 1)}
              className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-blue-900 shadow-sm md:text-sm backdrop-blur-sm"
            >
              <img
                src="/assets/branding/nb-isotype.png"
                alt="Nova Bytex"
                className="h-4 w-auto object-contain shrink-0"
              />
              <span className="font-semibold">Solución, seguridad y tecnología para empresas</span>
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
              Suministro confiable de papelería, útiles de oficina y hardware con servicios especializados de ingeniería de software, conectividad y automatización de procesos.
            </motion.p>

            <motion.div
              initial={reduceMotion ? false : "hidden"}
              animate={reduceMotion ? { opacity: 1, y: 0 } : "visible"}
              variants={reveal(0.32, 1)}
              className="flex flex-col justify-center gap-4 pt-2 sm:flex-row lg:justify-start"
            >
              <Button asChild size="lg" className="h-14 w-full rounded-2xl bg-blue-700 px-8 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-800 sm:w-auto">
                <Link href="/productos">
                  Explorar Catálogo <ShoppingBag className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="h-14 w-full rounded-2xl border-slate-200 bg-white px-8 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-300 hover:bg-slate-50 sm:w-auto">
                <Link href="/contacto">
                  Solicitar Cotización <PhoneCall className="ml-2 h-4 w-4 text-blue-700" />
                </Link>
              </Button>
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
            className="relative mx-auto w-full max-w-lg lg:max-w-xl lg:col-span-6 mt-6 lg:mt-0"
          >
            {/* Logo from /card */}
            <div className="absolute -top-14 -right-4 md:-top-16 md:-right-10 z-50">
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="relative w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] rounded-[2rem] p-0.5 bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-700 shadow-[0_15px_40px_-10px_rgba(59,130,246,0.4)] rotate-3"
              >
                <div className="w-full h-full rounded-[1.9rem] bg-slate-950 p-3 flex items-center justify-center overflow-hidden -rotate-3 relative z-10">
                  <img
                    src="/assets/branding/nb-isotype.png"
                    alt="Nova Bytex"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full border border-blue-400/40 -z-10" />
                <div className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full bg-cyan-500/40 -z-10 blur-[1px]" />
              </motion.div>
            </div>

            <div className="relative space-y-6 rounded-[32px] border border-slate-100 bg-white p-6 sm:p-8 shadow-xl overflow-hidden h-[480px] sm:h-[520px] flex flex-col">
              <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-blue-700 z-10">
                  Nuestros Servicios
                </span>
                <span className="flex gap-1.5 z-10">
                  {heroServices.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeService ? "w-6 bg-blue-600" : "w-1.5 bg-slate-200"}`} />
                  ))}
                </span>
              </div>
              
              <div className="relative flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeService}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex flex-col"
                  >
                    <div className={`w-full h-48 sm:h-56 rounded-[24px] bg-gradient-to-br ${heroServices[activeService].gradient} flex items-center justify-center mb-6 sm:mb-8 shadow-lg ${heroServices[activeService].shadow}`}>
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-inner">
                        {heroServices[activeService].icon}
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">{heroServices[activeService].title}</h3>
                      <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">{heroServices[activeService].description}</p>
                      
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-auto pb-1">
                        {heroServices[activeService].features.map((feat, i) => (
                          <div key={i} className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 sm:p-4 border border-slate-100/60">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                            <div className="truncate text-sm font-semibold text-slate-700">{feat}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
