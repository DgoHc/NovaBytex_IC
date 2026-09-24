"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Phone,
  MessageCircle,
  UserPlus,
  Globe,
  Share2,
  QrCode,
  Mail,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Network,
  Server,
  BookOpen,
  Sparkles,
  Copy,
  Check
} from "lucide-react";
import type { NFCProfile, NFCServiceItem } from "@/types/nfc";
import { downloadVCard } from "@/lib/vcard";
import { QRCodeModal } from "./QRCodeModal";
import { cn } from "@/lib/utils";

interface DigitalCardViewProps {
  profile: NFCProfile;
}

const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Network,
  Server,
  ShieldCheck,
  BookOpen,
};

export const DigitalCardView: React.FC<DigitalCardViewProps> = ({ profile }) => {
  const [mounted, setMounted] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [originUrl, setOriginUrl] = useState("https://novabytex.com/card");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setOriginUrl(window.location.href);
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleSaveContact = () => {
    const success = downloadVCard(profile);
    if (success) {
      triggerToast("¡Contacto descargado! Ábrelo para guardarlo en tu teléfono.");
    } else {
      triggerToast("Generando tarjeta de contacto...");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${profile.nombre} · Tarjeta Digital NFC`,
      text: `${profile.nombre} - ${profile.cargo}. Contacta directamente o guarda este contacto.`,
      url: originUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to copy
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(originUrl);
      setCopiedLink(true);
      triggerToast("¡Enlace copiado al portapapeles!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      triggerToast("No se pudo copiar el enlace.");
    }
  };

  const whatsappUrl = `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(
    profile.whatsappMessage || "Hola NovaBytex, deseo información sobre sus servicios."
  )}`;

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-white selection:bg-blue-600 selection:text-white flex flex-col relative overflow-x-hidden">
      {/* Background with Diagonal Split */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Diagonal top background using SVG/Clip-path concept via CSS */}
        <div 
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-slate-900 to-slate-950/80 border-b border-slate-800"
          style={{ 
            height: '240px',
            clipPath: 'polygon(0 0, 100% 0, 100% 65%, 0 100%)' 
          }}
        >
          {/* Subtle decorative details in the dark zone */}
          <div className="absolute top-8 left-8 w-1.5 h-1.5 rounded-full bg-blue-500/40" />
          <div className="absolute top-16 right-12 w-2 h-2 rounded-full bg-cyan-500/30" />
          <div className="absolute top-32 left-[30%] w-1 h-1 rounded-full bg-white/30" />
          <div className="absolute top-20 left-[70%] w-8 h-8 rounded-full border border-blue-500/10" />
          
          {/* Soft ambient blur */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-[160px]" />
        </div>
        
        {/* Subtle grid texture globally */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Main card viewport container - Mobile First */}
      <main className="relative z-10 w-full max-w-[480px] mx-auto px-5 py-6 flex-1 flex flex-col">
        
        {/* Staggered Content container */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="flex-1 flex flex-col items-center"
        >

          {/* Protagonist Element (Logo) Centered on the division line */}
          <motion.div 
            variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
            className="relative z-20 -mt-10 mb-6"
          >
            {/* Floating animation container respecting prefers-reduced-motion via Framer Motion automatically mostly, but let's keep it subtle */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] rounded-[2rem] p-0.5 bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-700 shadow-[0_15px_40px_-10px_rgba(59,130,246,0.4)] rotate-3 mx-auto"
            >
              <div className="w-full h-full rounded-[1.9rem] bg-slate-950 p-3 flex items-center justify-center overflow-hidden -rotate-3 relative z-10">
                <img
                  src={profile.logo || "/assets/branding/nb-isotype.png"}
                  alt={profile.nombre}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Decorative shapes around the protagonist */}
              <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full border border-blue-400/40 -z-10" />
              <div className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full bg-cyan-500/40 -z-10 blur-[1px]" />
            </motion.div>
          </motion.div>

          {/* Text Hierarchy: Name (strong), Title, Description (light) */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            className="text-center w-full mb-8 space-y-3"
          >
            <div>
              <h1 className="text-[26px] sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-1.5 leading-none">
                {profile.nombre}
                <CheckCircle2 className="w-[18px] h-[18px] text-blue-400 shrink-0" />
              </h1>
              <p className="text-[13px] font-semibold text-blue-400 tracking-wide mt-2">
                {profile.cargo}
              </p>
            </div>

            {profile.headline && (
              <p className="font-editorial text-[19px] sm:text-[21px] leading-tight text-slate-200 italic mt-3 mb-2 px-2">
                "{profile.headline}"
              </p>
            )}

            <p className="text-[13px] leading-relaxed text-slate-400 font-light px-2 max-w-sm mx-auto">
              {profile.descripcion}
            </p>
          </motion.div>

          {/* Primary Action Buttons */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            className="w-full space-y-3.5 mb-6 relative z-10"
          >
            {/* WhatsApp (Tarjeta Destacada Glow) */}
            <div className="relative rounded-full p-[1px] overflow-hidden group">
              {/* Animated gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400 opacity-60 group-hover:opacity-100 animate-[spin_4s_linear_infinite]" style={{ backgroundSize: '200% 200%' }} />
              
              <motion.a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.98 }}
                className="relative flex items-center justify-between w-full p-2 pr-5 rounded-full bg-slate-950/90 backdrop-blur-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-transform relative">
                    <div className="absolute inset-0 rounded-full bg-emerald-400 blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                    <MessageCircle className="w-6 h-6 text-white relative z-10" />
                  </div>
                  <div className="text-left">
                    <p className="text-[15px] font-bold text-white leading-tight">
                      Hablar por WhatsApp
                    </p>
                    <p className="text-[11px] text-emerald-400/90 font-medium">
                      Atención inmediata
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </div>

            {/* Guardar Contacto (Rounded & Thick) */}
            <motion.button
              onClick={handleSaveContact}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-[18px] px-6 rounded-full bg-gradient-to-r from-slate-100 to-white text-slate-950 font-bold text-[14px] shadow-[0_10px_25px_-5px_rgba(255,255,255,0.2)] hover:shadow-[0_15px_30px_-5px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <UserPlus className="w-[18px] h-[18px]" />
              <span>Guardar contacto</span>
            </motion.button>
          </motion.div>

          {/* BENTO GRID LAYOUT FOR ACTIONS & INFO */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            className="w-full grid grid-cols-2 gap-3 mb-6"
          >
            {/* Llamar (Large square) */}
            <motion.a href={`tel:${profile.telefono}`} whileTap={{ scale: 0.96 }} className="relative flex flex-col items-start justify-between p-5 h-32 rounded-[2rem] bg-gradient-to-br from-blue-600/20 to-slate-900/80 backdrop-blur-md border border-blue-500/20 hover:border-blue-400/50 hover:from-blue-600/30 transition-all group overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/20 blur-[30px] rounded-full group-hover:bg-blue-400/30 transition-all" />
              <div className="w-11 h-11 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <Phone className="w-[22px] h-[22px]" />
              </div>
              <div className="relative z-10">
                <p className="text-[17px] font-black text-white leading-tight">Llamar</p>
                <p className="text-[11px] text-blue-200/70 font-medium mt-0.5">Contacto directo</p>
              </div>
            </motion.a>

            {/* Web (Large square) */}
            <motion.div whileTap={{ scale: 0.96 }} className="flex h-32">
              <Link href="/" className="relative flex flex-col items-start justify-between p-5 w-full rounded-[2rem] bg-gradient-to-br from-cyan-600/20 to-slate-900/80 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-400/50 hover:from-cyan-600/30 transition-all group overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-cyan-500/20 blur-[30px] rounded-full group-hover:bg-cyan-400/30 transition-all" />
                <div className="w-11 h-11 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                  <Globe className="w-[22px] h-[22px]" />
                </div>
                <div className="relative z-10">
                  <p className="text-[17px] font-black text-white leading-tight">Sitio Web</p>
                  <p className="text-[11px] text-cyan-200/70 font-medium mt-0.5">Visítanos</p>
                </div>
              </Link>
            </motion.div>

            {/* Correo (Wide block spanning 2 cols) */}
            <motion.a href={`mailto:${profile.email}`} whileTap={{ scale: 0.98 }} className="col-span-2 relative flex items-center gap-4 p-4 rounded-[2rem] bg-gradient-to-r from-slate-800/60 to-slate-900/90 backdrop-blur-md border border-slate-700/50 hover:border-slate-500 hover:bg-slate-800 transition-all group overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
              <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-gradient-to-b from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-blue-400 shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors shadow-inner">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Correo Electrónico</p>
                <p className="text-[15px] font-bold text-white truncate">{profile.email}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-700/40 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </div>
            </motion.a>

            {/* Ubicación (Wide block spanning 2 cols) */}
            {profile.ubicacion.mapsUrl && (
              <motion.a href={profile.ubicacion.mapsUrl} target="_blank" rel="noopener noreferrer" whileTap={{ scale: 0.98 }} className="col-span-2 relative flex items-center gap-4 p-4 rounded-[2rem] bg-gradient-to-r from-slate-800/60 to-slate-900/90 backdrop-blur-md border border-slate-700/50 hover:border-slate-500 hover:bg-slate-800 transition-all group overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-gradient-to-b from-cyan-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-cyan-400 shrink-0 group-hover:bg-cyan-500 group-hover:text-white transition-colors shadow-inner">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Ubicación</p>
                  <p className="text-[15px] font-bold text-white truncate">{profile.ubicacion.cobertura || `${profile.ubicacion.ciudad}, ${profile.ubicacion.pais}`}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-700/40 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </div>
              </motion.a>
            )}

            {/* QR & Compartir (1 col each) */}
            <motion.button onClick={() => setQrModalOpen(true)} whileTap={{ scale: 0.96 }} className="relative flex items-center justify-center gap-2.5 p-4 rounded-[2rem] bg-slate-900/60 backdrop-blur-md border border-slate-700/50 hover:bg-slate-800 hover:border-pink-500/40 transition-all group shadow-lg">
              <QrCode className="w-5 h-5 text-slate-400 group-hover:text-pink-400 transition-colors" />
              <span className="text-[13px] font-bold text-slate-300 group-hover:text-white transition-colors">Código QR</span>
            </motion.button>
            
            <motion.button onClick={handleShare} whileTap={{ scale: 0.96 }} className="relative flex items-center justify-center gap-2.5 p-4 rounded-[2rem] bg-slate-900/60 backdrop-blur-md border border-slate-700/50 hover:bg-slate-800 hover:border-purple-500/40 transition-all group shadow-lg">
              <Share2 className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
              <span className="text-[13px] font-bold text-slate-300 group-hover:text-white transition-colors">Compartir</span>
            </motion.button>

            {/* Socials Block */}
            {profile.redes && profile.redes.length > 0 && (
              <div className="col-span-2 flex flex-wrap items-center justify-center gap-3 pt-6 pb-2">
                {profile.redes.map((red) => {
                  const pf = red.platform.toLowerCase();
                  let iconSvg = <ExternalLink className="w-5 h-5 transition-transform group-hover:scale-110" />;
                  
                  if (pf.includes("facebook")) {
                    iconSvg = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 transition-transform group-hover:scale-110"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
                  } else if (pf.includes("instagram")) {
                    iconSvg = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 transition-transform group-hover:scale-110"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
                  } else if (pf.includes("linkedin")) {
                    iconSvg = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 transition-transform group-hover:scale-110"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
                  } else if (pf.includes("twitter") || pf.includes("x")) {
                    iconSvg = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 transition-transform group-hover:scale-110"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
                  } else if (pf.includes("youtube")) {
                    iconSvg = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 transition-transform group-hover:scale-110"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>;
                  }

                  return (
                    <a
                      key={red.platform}
                      href={red.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex items-center justify-center w-[52px] h-[52px] rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-slate-400 hover:text-white hover:border-blue-400 hover:bg-blue-500/20 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:-translate-y-1.5"
                      aria-label={red.label || red.platform}
                    >
                      {iconSvg}
                    </a>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Nuestros Servicios - Bento Style */}
          {profile.servicios && profile.servicios.length > 0 && (
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              className="w-full mt-6"
            >
              <div className="flex items-center justify-between px-2 mb-5">
                <h2 className="text-[13px] uppercase font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Servicios Premium
                </h2>
                <Link href="/servicios" className="text-[12px] font-bold text-slate-400 hover:text-white flex items-center gap-1.5 group transition-colors bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
                  Ver catálogo <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {profile.servicios.map((srv) => {
                  const IconComponent = (srv.iconName && serviceIcons[srv.iconName]) || Sparkles;
                  return (
                    <Link
                      key={srv.id}
                      href={srv.href}
                      className="relative p-5 rounded-[2rem] bg-gradient-to-r from-slate-900/90 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all group overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.4)] hover:-translate-y-1"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="relative z-10 flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 shrink-0 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-cyan-500 group-hover:text-white group-hover:border-transparent transition-all shadow-inner group-hover:scale-110 group-hover:-rotate-3">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[16px] font-bold text-slate-100 group-hover:text-white transition-colors leading-tight mb-1">
                            {srv.title}
                          </p>
                          <p className="text-[12px] text-slate-400 line-clamp-2 leading-relaxed font-medium mt-1">
                            {srv.description}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Footer Branding */}
          <motion.footer 
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            className="w-full mt-14 pt-8 text-center pb-6"
          >
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1 rounded-full bg-slate-800/60" />
            </div>
            <img
              src="/assets/branding/nb-isotype.png"
              alt="Nova Bytex"
              className="h-[20px] w-auto mx-auto opacity-30 mb-3 grayscale hover:grayscale-0 hover:opacity-100 transition-all"
            />
            <p className="text-[11px] text-slate-500/80 font-medium tracking-wide">
              © {new Date().getFullYear()} Nova Bytex Technology
            </p>
          </motion.footer>

        </motion.div>
      </main>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[250] px-5 py-3 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-xl shadow-blue-900/40 flex items-center gap-2.5 whitespace-nowrap"
          >
            <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Bottom Sheet / Modal */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        profile={profile}
        url={originUrl}
      />
    </div>
  );
};

export default DigitalCardView;
