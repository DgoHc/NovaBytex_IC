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
  Check,
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
          {/* Top Status & Badge */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}
            className="w-full flex items-center justify-between mb-16 pt-2"
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.15)] backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span>{profile.badge || "NFC Card"}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/90 font-medium bg-slate-900/50 px-2.5 py-1 rounded-full border border-slate-800 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>En línea</span>
            </div>
          </motion.div>

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
            className="w-full space-y-3.5 mb-6"
          >
            {/* WhatsApp (Tarjeta Destacada) */}
            <div className="relative p-[1px] rounded-full overflow-hidden bg-gradient-to-r from-emerald-500/30 via-teal-500/10 to-emerald-500/30">
              <motion.a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.98 }}
                className="group relative flex items-center justify-between w-full p-2 pr-5 rounded-full bg-slate-950 hover:bg-slate-900 transition-colors"
              >
                {/* Dotted/dashed border effect inside */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/20 opacity-50" />
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.25)] group-hover:scale-105 transition-transform">
                    <MessageCircle className="w-6 h-6 text-white" />
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
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform relative z-10" />
              </motion.a>
            </div>

            {/* Guardar Contacto (Rounded & Thick) */}
            <motion.button
              onClick={handleSaveContact}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-[18px] px-6 rounded-full bg-white text-slate-950 font-bold text-[14px] shadow-[0_8px_20px_-6px_rgba(255,255,255,0.3)] hover:bg-slate-100 transition-all duration-200"
            >
              <UserPlus className="w-[18px] h-[18px]" />
              <span>Guardar contacto</span>
            </motion.button>
          </motion.div>

          {/* Quick Actions Grid (Rounded, Minimum 44px for thumb) */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            className="w-full grid grid-cols-4 gap-2 mb-8"
          >
            {/* Llamar */}
            <motion.a href={`tel:${profile.telefono}`} whileTap={{ scale: 0.94 }} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.25rem] bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-300 group-hover:bg-slate-800 group-hover:text-white group-hover:border-slate-700 transition-all shadow-sm">
                <Phone className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold text-slate-400">Llamar</span>
            </motion.a>

            {/* Web */}
            <motion.div whileTap={{ scale: 0.94 }} className="flex flex-col items-center gap-2 group">
              <Link href="/" className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.25rem] bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-300 group-hover:bg-slate-800 group-hover:text-white group-hover:border-slate-700 transition-all shadow-sm">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">Web</span>
              </Link>
            </motion.div>

            {/* Compartir */}
            <motion.button onClick={handleShare} whileTap={{ scale: 0.94 }} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.25rem] bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-300 group-hover:bg-slate-800 group-hover:text-white group-hover:border-slate-700 transition-all shadow-sm">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold text-slate-400">Compartir</span>
            </motion.button>

            {/* QR Code */}
            <motion.button onClick={() => setQrModalOpen(true)} whileTap={{ scale: 0.94 }} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.25rem] bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-300 group-hover:bg-slate-800 group-hover:text-white group-hover:border-slate-700 transition-all shadow-sm">
                <QrCode className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold text-slate-400">QR Code</span>
            </motion.button>
          </motion.div>

          {/* Secondary Contact Info List (Email, Location) */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            className="w-full space-y-3"
          >
            {/* Correo */}
            <a href={`mailto:${profile.email}`} className="flex items-center gap-3 p-4 rounded-3xl bg-slate-900/40 border border-slate-800/50 hover:bg-slate-900/80 hover:border-slate-700 transition-all group">
              <div className="w-[38px] h-[38px] rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 group-hover:text-white group-hover:bg-slate-700 transition-colors">
                <Mail className="w-[18px] h-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Correo</p>
                <p className="text-[13px] font-medium text-slate-200 truncate">{profile.email}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
            </a>

            {/* Ubicación */}
            {profile.ubicacion.mapsUrl && (
              <a href={profile.ubicacion.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-3xl bg-slate-900/40 border border-slate-800/50 hover:bg-slate-900/80 hover:border-slate-700 transition-all group">
                <div className="w-[38px] h-[38px] rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 group-hover:text-white group-hover:bg-slate-700 transition-colors">
                  <MapPin className="w-[18px] h-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Ubicación</p>
                  <p className="text-[13px] font-medium text-slate-200 truncate">{profile.ubicacion.cobertura || `${profile.ubicacion.ciudad}, ${profile.ubicacion.pais}`}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
              </a>
            )}

            {/* Redes Sociales */}
            {profile.redes && profile.redes.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                {profile.redes.map((red) => (
                  <a
                    key={red.platform}
                    href={red.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 rounded-full bg-slate-900/60 border border-slate-800 hover:border-slate-600 hover:bg-slate-800 hover:text-white text-slate-300 transition-all text-xs font-semibold"
                  >
                    {red.label || red.platform}
                  </a>
                ))}
              </div>
            )}
          </motion.div>

          {/* Nuestros Servicios */}
          {profile.servicios && profile.servicios.length > 0 && (
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              className="w-full mt-10 pt-4 border-t border-slate-800/40"
            >
              <div className="flex items-center justify-between px-1 mb-4">
                <h2 className="text-[11px] uppercase font-bold tracking-[0.2em] text-slate-500">
                  Servicios
                </h2>
                <Link href="/servicios" className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 group">
                  Ver todos <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <div className="space-y-2">
                {profile.servicios.map((srv) => {
                  const IconComponent = (srv.iconName && serviceIcons[srv.iconName]) || Sparkles;
                  return (
                    <Link
                      key={srv.id}
                      href={srv.href}
                      className="p-4 rounded-3xl bg-slate-900/30 border border-slate-800/50 hover:bg-slate-900/80 hover:border-blue-500/30 transition-all group flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-blue-400 shrink-0 group-hover:bg-blue-500/10 group-hover:text-blue-300 transition-colors">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-slate-200 group-hover:text-white transition-colors">
                          {srv.title}
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-slate-800/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-3 h-3 text-slate-400" />
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
            className="w-full mt-12 pt-8 text-center pb-4"
          >
            <img
              src="/assets/branding/nb-isotype.png"
              alt="Nova Bytex"
              className="h-[18px] w-auto mx-auto opacity-40 mb-3"
            />
            <p className="text-[10px] text-slate-500 font-medium">
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
