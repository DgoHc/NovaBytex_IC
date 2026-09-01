"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, MessageCircle, Server, Wifi, Shield, Cpu, Layers, Headphones, PhoneCall } from "lucide-react";
import Link from "next/link";

const detailedServices = [
  {
    icon: <Wifi className="w-10 h-10 text-blue-400" />,
    title: "Diseño & Certificación de Redes LAN/WAN",
    badge: "Ingeniería de Red",
    description: "Diseño e instalación de cableado estructurado Cat 6A/7, enlaces de fibra óptica de alta velocidad y arquitectura de redes empresariales Cisco/Aruba.",
    deliverables: ["Certificación Fluke Networks", "Diagramas de Red Visio/CAD", "Configuración VLANs & QoS"]
  },
  {
    icon: <Server className="w-10 h-10 text-blue-400" />,
    title: "Infraestructura & Servidores Data Center",
    badge: "Virtualización & Cloud",
    description: "Implementación de servidores de alta densidad Dell PowerEdge & HPE ProLiant, clusters VMware ESXi, Hyper-V y migraciones hacia entornos híbridos.",
    deliverables: ["Alta disponibilidad 99.99%", "Respaldo automatizado Veeam", "Consolidación de Servidores"]
  },
  {
    icon: <Shield className="w-10 h-10 text-blue-400" />,
    title: "Ciberseguridad Perimetral & SOC",
    badge: "Protección 24/7",
    description: "Despliegue de Next-Generation Firewalls (Fortinet, Palo Alto), detección de intrusos IPS/IDS, redes privadas virtuales VPN corporativas y Zero Trust.",
    deliverables: ["Prevención contra Ransomware", "Inspección SSL Profunda", "Monitoreo de Amenazas 24/7"]
  },
  {
    icon: <Cpu className="w-10 h-10 text-blue-400" />,
    title: "Mantenimiento Preventivo & Correctivo",
    badge: "Soporte NBD / Onsite",
    description: "Planes de soporte técnico programado para parque informático corporativo, limpiezas físicas de data center, actualización de firmware y repuestos.",
    deliverables: ["Inventario de activos TI", "Informe mensual de salud", "Atención prioritaria Onsite"]
  },
  {
    icon: <Layers className="w-10 h-10 text-blue-400" />,
    title: "Proyectos de Transformación Digital",
    badge: "Consultoría Senior",
    description: "Asesoría para migración de sistemas legacy a la nube, automatización de procesos operativos, licenciamiento Microsoft 365 y auditorías de licencias.",
    deliverables: ["Análisis de ROI tecnológico", "Gestión de proyectos PMBOK", "Capacitación a colaboradores"]
  },
  {
    icon: <Headphones className="w-10 h-10 text-blue-400" />,
    title: "Mesa de Ayuda (Help Desk TI)",
    badge: "Nivel 1, 2 y 3",
    description: "Mesa de servicio de atención remota e in-situ orientada a resolver incidentes del personal de forma rápida, eficiente y documentada bajo normas ITIL.",
    deliverables: ["Atención multicanal", "SLA < 15 minutos", "Portal de Tickets ITSM"]
  }
];

export default function ServicesPage() {
  const openWhatsApp = () => {
    const message = encodeURIComponent("¡Hola! Quisiera solicitar información sobre sus servicios tecnológicos.");
    window.open(`https://wa.me/51999999999?text=${message}`, "_blank");
  };

  return (
    <section className="py-16 lg:py-24 bg-slate-950 text-white min-h-screen">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 lg:mb-20 max-w-3xl mx-auto space-y-4"
        >
          <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3.5 py-1 mb-2 font-medium">
            Catálogo de Servicios TI Corporativos
          </Badge>
          <h1 className="font-editorial text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.025em] mb-4 text-white">
            Servicios Profesionales de Tecnología
          </h1>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed font-normal">
            Soluciones integrales de alto valor diseñadas para garantizar la continuidad operativa, seguridad y crecimiento sostenido de tu empresa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {detailedServices.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="flex min-w-0"
            >
              <Card className="w-full bg-slate-900/50 border-slate-800 hover:border-blue-500/40 shadow-2xl transition-all duration-300 flex flex-col justify-between group overflow-hidden rounded-[22px]">
                <CardHeader className="p-6 pb-2">
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 group-hover:scale-105 transition-transform duration-300">
                      {service.icon}
                    </div>
                    <Badge variant="outline" className="border-slate-700 text-slate-400 text-[11px] font-medium">
                      {service.badge}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors leading-snug">
                    {service.title}
                  </h3>
                </CardHeader>

                <CardContent className="px-6 py-4 space-y-4 flex-1">
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {service.description}
                  </p>

                  <div className="space-y-2.5 pt-3 border-t border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest block">Entregables Clave:</span>
                    {service.deliverables.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 rounded-[28px] p-8 sm:p-12 text-center text-white shadow-2xl border border-blue-500/20 relative overflow-hidden"
        >
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="font-editorial text-3xl sm:text-4xl leading-[1.08] tracking-[-0.02em] text-white">¿Necesitas una Evaluación Técnica Gratuita?</h2>
            <p className="text-blue-100 text-base sm:text-lg leading-relaxed font-normal">
              Nuestros arquitectos de red e ingenieros de infraestructura están listos para analizar tus necesidades sin compromiso.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link href="/contacto">
                <Button className="w-full sm:w-auto bg-white text-blue-800 hover:bg-blue-50 text-base px-8 h-13 font-semibold rounded-2xl shadow-lg">
                  Solicitar Diagnóstico <PhoneCall className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto border-white/30 bg-white/10 text-white hover:bg-white/20 text-base px-8 h-13 font-semibold rounded-2xl"
                onClick={openWhatsApp}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Consultar vía WhatsApp
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
