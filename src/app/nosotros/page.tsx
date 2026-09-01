"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Award, ShieldCheck, Building, Sparkles } from "lucide-react";

const milestones = [
  { year: "2014", title: "Fundación en Lima", desc: "Nace Nova Bytex ofreciendo servicios de soporte TI y suministro de componentes para empresas locales." },
  { year: "2018", title: "Partner Cisco & Dell", desc: "Obtenemos la certificación de canal autorizado de distribución para las principales marcas tecnológicas." },
  { year: "2021", title: "Expansión Data Center", desc: "Inauguramos nuestra unidad de proyectos de infraestructura de alta disponibilidad y virtualización." },
  { year: "2026", title: "Líder Corporativo", desc: "Más de 500 empresas confían en nuestras soluciones de ciberseguridad, redes y servidores." }
];

const pillars = [
  {
    icon: <Users className="w-8 h-8 text-blue-400" />,
    title: "Equipo Certificado",
    description: "Ingenieros altamente calificados en soluciones Cisco, Dell EMC, Fortinet y VMware."
  },
  {
    icon: <Target className="w-8 h-8 text-blue-400" />,
    title: "Orientación al Negocio",
    description: "Diseñamos arquitecturas que reducen costos operativos (OpEx) y aceleran la productividad."
  },
  {
    icon: <Award className="w-8 h-8 text-blue-400" />,
    title: "Garantía & Respaldo",
    description: "Equipos 100% originales importados con garantía oficial de fábrica y soporte NBD."
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-blue-400" />,
    title: "Compromiso Formal",
    description: "Empresa constituida en el Perú con facturación RUC 20 y cumplimiento de SLAs estrictos."
  }
];

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-16 lg:py-24 bg-slate-950 text-white min-h-screen">
      <div className="container mx-auto px-4">
        <motion.div
          initial={mounted ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 lg:mb-20 max-w-3xl mx-auto space-y-4"
        >
          <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3.5 py-1 mb-2 font-medium">
            <Building className="w-3.5 h-3.5 mr-1.5 inline text-blue-400" /> Conócenos
          </Badge>
          <h1 className="font-editorial text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.18] tracking-[-0.015em] mb-4 text-white">
            Sobre Nova Bytex
          </h1>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed font-normal">
            Más de 10 años impulsando la transformación digital y la continuidad tecnológica de empresas líderes en el Perú.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto mb-20">
          <Card className="bg-slate-900/50 border-slate-800 shadow-2xl p-6 sm:p-10 relative overflow-hidden rounded-[28px]">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
                <Sparkles className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-semibold text-white tracking-tight">Nuestra Visión y Trayectoria</h2>
              </div>
              
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Fundada en 2014, <strong className="text-blue-400 font-semibold">Nova Bytex</strong> surgió con un propósito claro: proveer soluciones tecnológicas de calidad empresarial con un nivel de atención personalizada y ágil que el mercado corporativo demandaba.
              </p>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                A lo largo de más de una década, hemos evolucionado de ser un proveedor de hardware a convertirnos en el aliado estratégico integral de infraestructura TI, ciberseguridad y proyectos de conectividad para cientos de organizaciones.
              </p>
            </div>
          </Card>
        </div>

        <div className="mb-20 space-y-10">
          <div className="text-center">
            <h2 className="font-editorial text-3xl md:text-4xl leading-[1.08] tracking-[-0.02em] text-white">Hitos Importantes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {milestones.map((m, index) => (
              <Card key={index} className="bg-slate-900/50 border-slate-800 p-6 space-y-3 relative rounded-2xl hover:border-blue-500/30 transition-colors">
                <span className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-editorial">
                  {m.year}
                </span>
                <h3 className="text-base font-semibold text-white leading-snug">{m.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{m.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 mb-16">
          {pillars.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex min-w-0"
            >
              <Card className="w-full bg-slate-900/50 border-slate-800 hover:border-blue-500/30 shadow-xl p-6 transition-all duration-300 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 leading-snug">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
