"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { 
  ShoppingBag, 
  Headphones, 
  Server, 
  Layers, 
  Lightbulb, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const services = [
  {
    icon: <ShoppingBag className="w-8 h-8 text-blue-500" />,
    title: "Comercialización TI",
    sla: "Entrega Inmediata",
    description: "Venta e importación directa de equipos Cisco, Dell, Fortinet, HP y Lenovo con garantía oficial y facturación empresarial.",
    highlights: ["Garantía de fábrica 100%", "Factura electrónica RUC 20", "Asesoría pre-venta técnica"]
  },
  {
    icon: <Headphones className="w-8 h-8 text-blue-500" />,
    title: "Soporte TI 24/7",
    sla: "Respuesta < 15 min",
    description: "Mantenimiento preventivo, correctivo y mesa de ayuda dedicada para mantener tu negocio operando sin interrupciones.",
    highlights: ["Nivel 1, 2 y 3 especializado", "Monitoreo de red en tiempo real", "Asistencia remota e in-situ"]
  },
  {
    icon: <Server className="w-8 h-8 text-blue-500" />,
    title: "Infraestructura & Data Center",
    sla: "99.99% Uptime",
    description: "Diseño, implementación y virtualización de data centers, cableado estructurado certificado y soluciones Cloud híbridas.",
    highlights: ["Virtualización VMware / Hyper-V", "Redes SD-WAN & Switch 10G", "Respaldo y recuperación BCP"]
  },
  {
    icon: <Layers className="w-8 h-8 text-blue-500" />,
    title: "Proyectos a Medida",
    sla: "Metodología PMBOK",
    description: "Desarrollo e implementación llave en mano de proyectos de transformación digital e integración de sistemas complejos.",
    highlights: ["Gestión por hitos y entregables", "Pruebas de estrés y benchmarking", "Documentación técnica integral"]
  },
  {
    icon: <Lightbulb className="w-8 h-8 text-blue-500" />,
    title: "Asesoría & Auditoría TI",
    sla: "Informe Ejecutivo",
    description: "Consultoría estratégica para optimizar costos de licencias, auditorías de ciberseguridad y renovación tecnológica.",
    highlights: ["Auditoría de vulnerabilidades", "Optimización de costos Cloud/OpEx", "Plan de desarrollo tecnológico"]
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-blue-500" />,
    title: "Ciberseguridad Gestionada",
    sla: "Protección SOC 24/7",
    description: "Implementación de Next-Gen Firewalls Fortinet, filtrado web, antivirus corporativo EDR/XDR y políticas de Zero Trust.",
    highlights: ["Defensa perimetral avanzada", "Protección contra Ransomware", "Certificaciones ISO 27001 compliance"]
  }
];

export const Services = () => {
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 py-24 lg:py-32">
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={mounted && !reduceMotion ? { opacity: 0, y: 20, scale: 0.98 } : false}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-16 max-w-3xl space-y-4 text-center lg:mb-20"
        >
          <Badge className="bg-blue-50 text-blue-700 border border-blue-100 px-3.5 py-1 mb-2 font-medium">
            Soluciones Integrales 360°
          </Badge>
          <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-medium leading-[1.2] tracking-[-0.015em] text-slate-900">
            Nuestros Servicios Especializados
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-base md:text-lg leading-relaxed font-normal">
            Cubrimos todo el ciclo de vida de la tecnología de tu empresa con personal altamente certificado
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: reduceMotion ? 0 : index * 0.08, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-w-0"
            >
              <Card className="w-full flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-100 bg-white group overflow-hidden rounded-[22px]">
                <CardHeader className="p-6 pb-2">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 bg-blue-50 group-hover:bg-blue-50/80 rounded-2xl flex items-center justify-center transition-colors border border-blue-100">
                      {service.icon}
                    </div>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[11px] font-medium rounded-lg px-2.5 py-1">
                      SLA: {service.sla}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                    {service.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="px-6 py-4 space-y-4 flex-1">
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {service.description}
                  </p>

                  <div className="space-y-2.5 pt-3 border-t border-slate-100">
                    {service.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <div className="px-6 pb-6 pt-2">
                  <Link href="/servicios">
                    <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent text-blue-700 hover:text-blue-800 font-semibold group-hover:translate-x-1 transition-all h-auto py-1">
                      <span className="text-sm">Ver más detalles</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
