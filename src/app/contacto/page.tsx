"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, MapPin, Phone, Mail, Send, Clock, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = encodeURIComponent(
      `¡Hola Nova Bytex!\n\nNombre: ${formData.name}\nEmpresa: ${formData.company || 'N/A'}\nEmail: ${formData.email}\nTeléfono: ${formData.phone}\n\nMensaje: ${formData.message}`
    );
    setSubmitted(true);
    setTimeout(() => {
      window.open(`https://wa.me/51999999999?text=${messageText}`, "_blank");
    }, 400);
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
            Atención Inmediata
          </Badge>
          <h1 className="font-editorial text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.025em] mb-4 text-white">
            Contáctate con Nosotros
          </h1>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed font-normal">
            Estamos listos para atender las consultas de tu empresa y preparar cotizaciones a la medida.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-6xl mx-auto items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7"
          >
            <Card className="bg-slate-900/50 border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 rounded-[28px]">
              <CardHeader className="p-0 pb-6 border-b border-slate-800 mb-6">
                <h2 className="text-2xl font-semibold text-white tracking-tight">Solicitud de Cotización</h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">Completa el formulario para conectarte con un asesor técnico</p>
              </CardHeader>

              <CardContent className="p-0">
                {submitted ? (
                  <div className="bg-emerald-950/50 border border-emerald-800 rounded-2xl p-8 text-center space-y-4">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                    <h3 className="text-xl font-semibold text-white tracking-tight">¡Mensaje Redirigido a WhatsApp!</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">Se está abriendo una conversación directa con nuestro equipo comercial.</p>
                    <Button 
                      onClick={() => setSubmitted(false)}
                      variant="outline"
                      className="border-slate-700 text-slate-300 text-xs mt-2 rounded-xl"
                    >
                      Enviar otra consulta
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs text-slate-300 font-medium">Nombre Completo *</Label>
                        <Input
                          id="name"
                          placeholder="Juan Pérez"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-blue-500 h-11 text-sm rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-xs text-slate-300 font-medium">Empresa / RUC (Opcional)</Label>
                        <Input
                          id="company"
                          placeholder="Mi Empresa S.A.C."
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-blue-500 h-11 text-sm rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs text-slate-300 font-medium">Correo Corporativo *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="contacto@empresa.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-blue-500 h-11 text-sm rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs text-slate-300 font-medium">Teléfono / WhatsApp *</Label>
                        <Input
                          id="phone"
                          placeholder="+51 999 999 999"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                          className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-blue-500 h-11 text-sm rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-xs text-slate-300 font-medium">Detalle de Requerimiento *</Label>
                      <Textarea
                        id="message"
                        placeholder="Escribe el producto, servicio o cantidad que deseas cotizar..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        rows={4}
                        className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-blue-500 text-sm rounded-xl resize-none"
                      />
                    </div>

                    <Button 
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white h-13 text-sm font-semibold shadow-xl shadow-blue-600/20 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Cotización por WhatsApp
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 space-y-6"
          >
            <Card className="bg-slate-900/50 border-slate-800 shadow-2xl p-6 space-y-6 rounded-[24px]">
              <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-4 tracking-tight">Información Corporativa</h2>
              
              <div className="space-y-5">
                <div className="flex items-start gap-3.5">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-blue-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Oficina Central</h3>
                    <p className="text-slate-400 text-xs leading-relaxed mt-0.5">Av. Javier Prado Este 2450, San Borja, Lima, Perú</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-blue-400 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Central Telefónica</h3>
                    <p className="text-slate-400 text-xs mt-0.5">+51 (01) 748-9900 | +51 999 999 999</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-blue-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Correo Corporativo</h3>
                    <p className="text-slate-400 text-xs mt-0.5">ventas@novabytex.com | soporte@novabytex.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-blue-400 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Horario de Atención</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Lunes a Viernes: 8:30 AM - 6:30 PM</p>
                    <p className="text-slate-400 text-xs mt-0.5">Mesa de Ayuda 24/7 para clientes con contrato</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-blue-950/60 to-slate-900 border-blue-800/40 p-6 text-center space-y-4 rounded-[24px]">
              <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto border border-blue-500/30 text-blue-400">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-white tracking-tight">WhatsApp de Ventas Inmediatas</h3>
              <p className="text-slate-300 text-xs leading-relaxed">¿Necesitas verificar disponibilidad de stock en este momento?</p>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm h-11 rounded-2xl shadow-md shadow-blue-600/20"
                onClick={() => {
                  const message = encodeURIComponent("¡Hola! Quisiera hablar con un asesor de ventas de Nova Bytex.");
                  window.open(`https://wa.me/51999999999?text=${message}`, "_blank");
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Iniciar Chat Directo
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
