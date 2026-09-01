"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck, Building2, Headphones, Award, HeartHandshake, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const benefits = [
  {
    icon: <ShieldCheck className="w-8 h-8 text-blue-500" />,
    title: "Garantía Oficial",
    description: "Equipos 100% originales con respaldo de fábrica y reemplazo rápido."
  },
  {
    icon: <Building2 className="w-8 h-8 text-blue-500" />,
    title: "Empresa Formal",
    description: "Facturación electrónica RUC 20 y pleno cumplimiento fiscal."
  },
  {
    icon: <Headphones className="w-8 h-8 text-blue-500" />,
    title: "Soporte Continuo",
    description: "Ingenieros certificados listos para atender emergencias 24/7."
  },
  {
    icon: <Award className="w-8 h-8 text-blue-500" />,
    title: "Personal Certificado",
    description: "Especialistas Cisco CCNA/CCNP, Dell EMC y Fortinet NSE."
  },
  {
    icon: <HeartHandshake className="w-8 h-8 text-blue-500" />,
    title: "Atención a Medida",
    description: "Asesoría personalizada para optimizar el presupuesto de tu empresa."
  }
];

export const Benefits = () => {
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-white lg:py-32">
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-16 max-w-3xl space-y-4 text-center lg:mb-20"
        >
          <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3.5 py-1 mb-2 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 inline text-blue-400" />
            Valor Agregado Corporativo
          </Badge>
          <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-medium leading-[1.2] tracking-[-0.015em] text-white">
            ¿Por qué elegir Nova Bytex?
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed font-normal">
            Nuestros pilares fundamentales garantizan tranquilidad, seguridad y continuidad operativa a tu negocio
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 lg:gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: reduceMotion ? 0 : index * 0.08, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
              className="flex min-w-0 flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl lg:p-7"
            >
              <div>
                <div className="mb-5 w-14 h-14 bg-slate-800/80 rounded-2xl flex items-center justify-center border border-slate-700/60">
                  {benefit.icon}
                </div>
                <h3 className="text-base font-semibold mb-2.5 text-white break-words">{benefit.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed break-words">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
