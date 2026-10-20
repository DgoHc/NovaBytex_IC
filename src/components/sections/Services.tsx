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
    title: "Papelería & Hardware",
    description: "Venta de útiles de oficina, papelería comercial y equipos de cómputo con boleta o factura.",
    highlights: ["Suministros de oficina", "Equipos con garantía de marca", "Emisión de comprobantes de pago"]
  },
  {
    icon: <Headphones className="w-8 h-8 text-blue-500" />,
    title: "Soporte Técnico",
    description: "Mantenimiento preventivo y correctivo para computadoras, laptops e impresoras en tu oficina.",
    highlights: ["Mantenimiento preventivo y correctivo", "Asistencia remota y en sitio", "Diagnóstico y cambio de piezas"]
  },
  {
    icon: <Server className="w-8 h-8 text-blue-500" />,
    title: "Redes y Conectividad",
    description: "Instalación de cableado estructurado, ordenamiento de racks y configuración de routers y switches.",
    highlights: ["Instalación de redes y cableado", "Configuración de enrutadores y switches", "Puntos de red y conectividad local"]
  },
  {
    icon: <Layers className="w-8 h-8 text-blue-500" />,
    title: "Desarrollo Web y Sistemas",
    description: "Desarrollo de sitios web comerciales, sistemas básicos de gestión y automatización de tareas.",
    highlights: ["Páginas web y portales", "Automatización de tareas frecuentes", "Integración de herramientas digitales"]
  },
  {
    icon: <Lightbulb className="w-8 h-8 text-blue-500" />,
    title: "Asesoría Técnica TI",
    description: "Orientación en compra de equipamiento tecnológico, renovación de computadoras y software.",
    highlights: ["Elección de equipos según presupuesto", "Revisión de seguridad de red", "Planes de renovación de hardware"]
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-blue-500" />,
    title: "Seguridad Informática",
    description: "Protección antivirus corporativo, copias de seguridad de datos y configuración de cortafuegos.",
    highlights: ["Configuración de firewalls", "Copias de seguridad de datos", "Protección contra virus y malware"]
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
            Servicios técnicos y asesoría
          </Badge>
          <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-medium leading-[1.2] tracking-[-0.015em] text-slate-900">
            Nuestros Servicios
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-base md:text-lg leading-relaxed font-normal">
            Atención técnica, equipos y suministros de oficina para empresas y profesionales en Cajamarca.
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
