"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const CTA = () => {
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  const openWhatsApp = () => {
    const message = encodeURIComponent("¡Hola! Me gustaría cotizar soluciones de tecnología para mi empresa.");
    window.open(`https://wa.me/51999999999?text=${message}`, "_blank");
  };

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 relative overflow-hidden text-white">
      <motion.div
        className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-500/15 blur-[120px]"
        animate={reduceMotion ? { opacity: 0.25 } : { scale: [1, 1.12, 1], opacity: [0.2, 0.45, 0.2] }}
        transition={{ duration: 7, repeat: reduceMotion ? 0 : Infinity }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-blue-400/15 blur-[120px]"
        animate={reduceMotion ? { opacity: 0.2 } : { scale: [1.12, 1, 1.12], opacity: [0.15, 0.38, 0.15] }}
        transition={{ duration: 9, repeat: reduceMotion ? 0 : Infinity, delay: 1 }}
      />
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 26, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl space-y-6 lg:space-y-7"
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.0, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <Badge className="border border-white/20 bg-white/10 px-4 py-1.5 font-medium text-white">
              <ShieldCheck className="mr-1.5 inline h-4 w-4 text-blue-200" />
              Asesoría Corporativa Inmediata
            </Badge>
          </motion.div>

          <motion.h2
            initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.0, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-editorial text-4xl font-medium leading-[1.18] tracking-[-0.015em] text-white sm:text-5xl lg:text-6xl"
          >
            ¿Listo para Transformar la Tecnología de tu Empresa?
          </motion.h2>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.99 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.0, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-2xl text-base leading-relaxed text-blue-100 sm:text-lg"
          >
            Nuestros asesores senior responderán tus consultas técnicas y prepararán una cotización personalizada en menos de 15 minutos.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.0, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row"
          >
            <Button
              size="lg"
              onClick={openWhatsApp}
              className="h-14 w-full rounded-2xl bg-white px-8 text-sm font-semibold text-blue-800 shadow-2xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-50 sm:w-auto sm:text-base"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Cotizar por WhatsApp <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
