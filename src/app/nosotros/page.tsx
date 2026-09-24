"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Compass,
  Eye,
  ShieldCheck,
  Zap,
  Cpu,
  Users,
  Building,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";

const corporateValues = [
  {
    icon: <Zap className="w-7 h-7 text-amber-400" />,
    accent: "from-amber-500/20 to-amber-500/5",
    border: "group-hover:border-amber-500/40",
    title: "Orientación a la Solución",
    subtitle: "Efectividad y Rapidez",
    description:
      "Capacidad resolutiva integral; atendemos desde el requerimiento más urgente de papelería hasta el diseño e implementación de sistemas complejos.",
  },
  {
    icon: <ShieldCheck className="w-7 h-7 text-blue-400" />,
    accent: "from-blue-500/20 to-blue-500/5",
    border: "group-hover:border-blue-500/40",
    title: "Seguridad y Confianza",
    subtitle: "Protección y Respaldo",
    description:
      "Garantía en la confidencialidad, protección de datos y estabilidad técnica en cada servicio de redes, soporte y software desplegado.",
  },
  {
    icon: <Cpu className="w-7 h-7 text-cyan-400" />,
    accent: "from-cyan-500/20 to-cyan-500/5",
    border: "group-hover:border-cyan-500/40",
    title: "Tecnología e Innovación",
    subtitle: "Vanguardia Práctica",
    description:
      "Adopción de herramientas digitales modernas que aporten valor medible, eficiencia y modernización a los negocios.",
  },
  {
    icon: <Users className="w-7 h-7 text-emerald-400" />,
    accent: "from-emerald-500/20 to-emerald-500/5",
    border: "group-hover:border-emerald-500/40",
    title: "Compromiso y Cercanía",
    subtitle: "Trato Directo y Transparente",
    description:
      "Asesoría transparente y trato directo, construyendo relaciones duraderas basadas en el cumplimiento y la calidad.",
  },
];

const milestones = [
  {
    year: "2014",
    title: "Inicios y Suministro",
    desc: "Nace la operación atendiendo requerimientos ágiles de suministros de oficina, hardware y soporte técnico corporativo.",
  },
  {
    year: "2018",
    title: "Alianzas Estratégicas",
    desc: "Consolidación de canal de distribución con fabricantes líderes de conectividad, servidores y marcas tecnológicas globales.",
  },
  {
    year: "2022",
    title: "Ingeniería de Software & Redes",
    desc: "Ampliación de servicios especializados a ciberseguridad gestionada, desarrollo a medida y automatización de procesos.",
  },
  {
    year: "2026 - 2030",
    title: "Liderazgo Integral",
    desc: "Horizonte estratégico consolidado en soluciones 360°: papelería corporativa, hardware, IoT, domótica y nube híbrida.",
  },
];

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  const easeCurve = [0.22, 1, 0.36, 1] as const;

  const reveal = (delay = 0) => ({
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay, ease: easeCurve },
    },
  });

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white min-h-screen py-16 sm:py-24">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-36 top-10 h-[520px] w-[520px] rounded-full bg-blue-600/10 blur-[150px]"
          animate={
            reduceMotion
              ? { opacity: 0.3 }
              : { scale: [1, 1.12, 1], opacity: [0.2, 0.45, 0.2] }
          }
          transition={{ duration: 10, repeat: reduceMotion ? 0 : Infinity }}
        />
        <motion.div
          className="absolute -right-36 top-1/2 h-[550px] w-[550px] rounded-full bg-cyan-600/10 blur-[160px]"
          animate={
            reduceMotion
              ? { opacity: 0.25 }
              : { scale: [1.1, 1, 1.1], opacity: [0.18, 0.4, 0.18] }
          }
          transition={{
            duration: 12,
            repeat: reduceMotion ? 0 : Infinity,
            delay: 1,
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header Hero Section */}
        <motion.div
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          variants={reveal(0.05)}
          className="text-center mb-16 sm:mb-20 max-w-3xl mx-auto space-y-5"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <img
              src="/assets/branding/nb-isotype.png"
              alt="Nova Bytex"
              className="h-4 w-auto object-contain shrink-0"
            />
            <span>Solución, seguridad y tecnología para empresas</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-medium leading-[1.12] tracking-[-0.02em] text-white">
            Nuestra Identidad &amp; Propósito Corporativo
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Integramos el abastecimiento confiable de papelería y útiles de oficina con infraestructura de hardware de alta gama, ciberseguridad y desarrollo de software para la continuidad de tu negocio.
          </p>
        </motion.div>

        {/* Dual Cards: Misión & Visión */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {/* Misión Corporativa */}
          <motion.div
            initial={reduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={reveal(0.1)}
          >
            <Card className="h-full rounded-[28px] border border-blue-500/20 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 p-7 sm:p-9 shadow-2xl relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-all duration-500" />
              
              <div className="flex items-center gap-3.5 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <Badge className="bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[11px] font-bold uppercase tracking-wider mb-1">
                    Propósito Fundamental
                  </Badge>
                  <h2 className="text-2xl font-bold tracking-tight text-white font-editorial">
                    Misión Corporativa
                  </h2>
                </div>
              </div>

              <div className="relative">
                <span className="text-5xl font-editorial text-blue-500/20 absolute -top-4 -left-2 select-none leading-none">
                  “
                </span>
                <p className="relative z-10 text-slate-200 text-sm sm:text-base leading-relaxed pl-3 italic">
                  Brindar solución integral, seguridad y tecnología a las empresas e instituciones, combinando el suministro confiable de papelería, útiles de oficina y hardware con servicios especializados de ingeniería de software, conectividad y automatización de procesos. Acompañamos a nuestros clientes con un soporte técnico de excelencia y una gestión ágil que garantice la continuidad y competitividad de sus operaciones diarias.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-blue-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" /> Continuidad y competitividad
                </span>
                <span>Enfoque 360° Empresarial</span>
              </div>
            </Card>
          </motion.div>

          {/* Visión Corporativa (Horizonte 2026 - 2030) */}
          <motion.div
            initial={reduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={reveal(0.18)}
          >
            <Card className="h-full rounded-[28px] border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 p-7 sm:p-9 shadow-2xl relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-300">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/20 transition-all duration-500" />

              <div className="flex items-center gap-3.5 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <Badge className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold uppercase tracking-wider mb-1">
                    Horizonte 2026 – 2030
                  </Badge>
                  <h2 className="text-2xl font-bold tracking-tight text-white font-editorial">
                    Visión Corporativa
                  </h2>
                </div>
              </div>

              <div className="relative">
                <span className="text-5xl font-editorial text-cyan-500/20 absolute -top-4 -left-2 select-none leading-none">
                  “
                </span>
                <p className="relative z-10 text-slate-200 text-sm sm:text-base leading-relaxed pl-3 italic">
                  Consolidarnos como el principal aliado estratégico empresarial a nivel regional, siendo el referente indiscutible en soluciones integrales que abarcan desde el abastecimiento de suministros de oficina hasta la implementación de infraestructura digital segura, ciberseguridad, desarrollo a medida y tecnologías inteligentes (IoT y Domótica), reconocidos por nuestra confiabilidad, innovación y cercanía con cada cliente.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> IoT, Domótica &amp; Cloud
                </span>
                <span>Referente Regional</span>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Valores Corporativos */}
        <div className="mb-24 space-y-10">
          <motion.div
            initial={reduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={reveal(0.08)}
            className="text-center max-w-2xl mx-auto space-y-3"
          >
            <Badge className="bg-slate-800/80 text-slate-300 border border-slate-700 px-3.5 py-1 text-xs font-semibold">
              Pilares de Nuestra Cultura
            </Badge>
            <h2 className="font-editorial text-3xl sm:text-4xl text-white tracking-tight">
              Valores Corporativos
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Principios que guían cada entrega, proyecto y relación comercial con nuestros clientes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {corporateValues.map((val, idx) => (
              <motion.div
                key={val.title}
                initial={reduceMotion ? false : "hidden"}
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={reveal(0.1 + idx * 0.08)}
                className="flex"
              >
                <Card
                  className={`group relative w-full rounded-2xl border border-slate-800/90 bg-slate-900/50 p-6 flex flex-col justify-between shadow-lg transition-all duration-300 hover:-translate-y-1.5 ${val.border}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner group-hover:scale-105 transition-transform duration-300">
                        {val.icon}
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 font-semibold">
                        0{idx + 1}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
                        {val.title}
                      </h3>
                      <p className="text-xs font-semibold text-blue-400/90 mt-0.5">
                        ({val.subtitle})
                      </p>
                    </div>

                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      {val.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Hitos / Trayectoria */}
        <div className="mb-20 space-y-10">
          <motion.div
            initial={reduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={reveal(0.08)}
            className="text-center"
          >
            <h2 className="font-editorial text-3xl md:text-4xl leading-[1.08] tracking-[-0.02em] text-white">
              Trayectoria &amp; Evolución
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              El camino recorrido para convertirnos en tu socio tecnológico integral.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {milestones.map((m, index) => (
              <motion.div
                key={m.year}
                initial={reduceMotion ? false : "hidden"}
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={reveal(0.1 + index * 0.08)}
              >
                <Card className="h-full bg-slate-900/50 border-slate-800/80 p-6 space-y-3 relative rounded-2xl hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1">
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-editorial">
                    {m.year}
                  </span>
                  <h3 className="text-base font-semibold text-white leading-snug">
                    {m.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {m.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Card */}
        <motion.div
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={reveal(0.12)}
          className="rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-950/80 via-slate-900 to-blue-950/80 p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="max-w-2xl mx-auto space-y-5">
            <h3 className="font-editorial text-2xl sm:text-3xl font-medium text-white">
              ¿Listo para potenciar la infraestructura y suministros de tu empresa?
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Solicita cotizaciones de útiles, equipamiento tecnológico o asesoría en proyectos de software y conectividad con atención ejecutiva inmediata.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button
                asChild
                size="lg"
                className="h-12 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all"
              >
                <Link href="/contacto">
                  Contactar Asesor <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-7 rounded-xl border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all"
              >
                <Link href="/productos">Ver Catálogo General</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
