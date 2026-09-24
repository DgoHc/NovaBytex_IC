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
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-600 selection:text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-[160px]" />
        <div className="absolute top-1/2 -left-48 w-[400px] h-[400px] rounded-full bg-cyan-600/10 blur-[140px]" />
        <div className="absolute bottom-0 -right-48 w-[500px] h-[500px] rounded-full bg-blue-700/15 blur-[160px]" />
        {/* Subtle grid texture */}
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

      {/* Main card viewport container */}
      <main className="relative z-10 w-full max-w-md sm:max-w-lg mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-between">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          {/* Header Card / Identity */}
          <div className="relative rounded-3xl border border-slate-800/90 bg-slate-900/60 p-6 sm:p-7 shadow-[0_20px_50px_-15px_rgba(2,6,23,0.7)] backdrop-blur-xl overflow-hidden">
            {/* Ambient inner rim glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-blue-500/15 blur-2xl pointer-events-none" />

            {/* Top row: NFC Badge & Status indicator */}
            <div className="flex items-center justify-between gap-2 mb-6">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                </span>
                <span>{profile.badge || "Tarjeta Digital NFC"}</span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/90 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>En línea</span>
              </div>
            </div>

            {/* Brand Logo & Presentation */}
            <div className="flex items-center gap-4 sm:gap-5 mb-5">
              <div className="relative shrink-0 w-20 h-20 sm:w-22 sm:h-22 rounded-2xl p-0.5 bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-700 shadow-lg shadow-blue-500/20">
                <div className="w-full h-full rounded-[14px] bg-slate-950 p-2 flex items-center justify-center overflow-hidden">
                  <img
                    src={profile.logo || "/assets/branding/nb-isotype.png"}
                    alt={profile.nombre}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white truncate">
                    {profile.nombre}
                  </h1>
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                </div>
                <p className="text-xs sm:text-[13px] font-semibold text-blue-400 tracking-wide mt-0.5">
                  {profile.cargo}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{profile.ubicacion.ciudad}, {profile.ubicacion.pais}</span>
                </p>
              </div>
            </div>

            {/* Headline / Bodoni Moda tagline */}
            {profile.headline && (
              <div className="pt-2 pb-1 border-t border-slate-800/80">
                <p className="font-editorial text-[17px] sm:text-[19px] leading-snug font-medium text-slate-200 italic">
                  "{profile.headline}"
                </p>
              </div>
            )}

            {/* Description */}
            <p className="text-xs sm:text-[13px] leading-relaxed text-slate-400 mt-3">
              {profile.descripcion}
            </p>
          </div>

          {/* Primary Action 1: WhatsApp (Hero CTA) */}
          <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileTap={{ scale: 0.98 }}
            className="group relative flex items-center justify-between w-full p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-semibold shadow-[0_12px_30px_-8px_rgba(16,185,129,0.45)] hover:shadow-[0_16px_36px_-6px_rgba(16,185,129,0.6)] transition-all duration-300"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-sm sm:text-base font-bold leading-tight">
                  Hablar por WhatsApp
                </p>
                <p className="text-[11px] text-emerald-100/90 leading-tight mt-0.5 truncate">
                  Atención comercial y técnica directa
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </motion.a>

          {/* Primary Action 2: Guardar Contacto (.vcf) */}
          <motion.button
            onClick={handleSaveContact}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-blue-500/30 hover:border-blue-500/60 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-950/40 transition-all duration-200"
          >
            <UserPlus className="w-4 h-4 text-blue-400" />
            <span>Guardar contacto en tu teléfono</span>
          </motion.button>

          {/* Quick Action Buttons Grid (Llamar, Web, Compartir, QR) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Llamar */}
            <motion.a
              href={`tel:${profile.telefono}`}
              whileTap={{ scale: 0.96 }}
              className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-850 transition-all text-center group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-200 leading-tight">
                Llamar
              </span>
              <span className="text-[10px] text-slate-500">
                Directo
              </span>
            </motion.a>

            {/* Sitio Web Oficial */}
            <motion.div whileTap={{ scale: 0.96 }} className="flex">
              <Link
                href="/"
                className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-850 transition-all text-center w-full group"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                  <Globe className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-200 leading-tight">
                  Sitio Web
                </span>
                <span className="text-[10px] text-slate-500">
                  NovaBytex
                </span>
              </Link>
            </motion.div>

            {/* Compartir Tarjeta */}
            <motion.button
              onClick={handleShare}
              whileTap={{ scale: 0.96 }}
              className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-850 transition-all text-center group"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                <Share2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-200 leading-tight">
                Compartir
              </span>
              <span className="text-[10px] text-slate-500">
                Tarjeta
              </span>
            </motion.button>

            {/* Código QR */}
            <motion.button
              onClick={() => setQrModalOpen(true)}
              whileTap={{ scale: 0.96 }}
              className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-850 transition-all text-center group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <QrCode className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-200 leading-tight">
                Ver QR
              </span>
              <span className="text-[10px] text-slate-500">
                Escanear
              </span>
            </motion.button>
          </div>

          {/* Secondary Details: Email & Location & Socials */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-3 backdrop-blur-sm">
            {/* Correo */}
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 transition-colors text-xs text-slate-300 group"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    Correo electrónico
                  </p>
                  <p className="text-xs font-medium text-slate-200 truncate">
                    {profile.email}
                  </p>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0" />
            </a>

            {/* Ubicación / Cobertura */}
            {profile.ubicacion.mapsUrl && (
              <a
                href={profile.ubicacion.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 transition-colors text-xs text-slate-300 group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                      Ubicación y Cobertura
                    </p>
                    <p className="text-xs font-medium text-slate-200 truncate">
                      {profile.ubicacion.cobertura || `${profile.ubicacion.ciudad}, ${profile.ubicacion.pais}`}
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0" />
              </a>
            )}

            {/* Redes sociales */}
            {profile.redes && profile.redes.length > 0 && (
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-medium">
                  Redes oficiales:
                </span>
                <div className="flex items-center gap-1.5">
                  {profile.redes.map((red) => (
                    <a
                      key={red.platform}
                      href={red.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>{red.label || red.platform}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nuestros Servicios (Resumen visual, no segunda Home) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-xs uppercase font-bold tracking-[0.18em] text-blue-400">
                  Nuestros Servicios
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Capacidades y soluciones integrales
                </p>
              </div>
              <Link
                href="/servicios"
                className="text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 group"
              >
                <span>Ver todos</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {profile.servicios.map((srv) => {
                const IconComponent =
                  (srv.iconName && serviceIcons[srv.iconName]) || Sparkles;

                return (
                  <Link
                    key={srv.id}
                    href={srv.href}
                    className="p-3.5 rounded-2xl bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800/80 hover:border-blue-500/40 transition-all duration-200 group flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors leading-tight">
                        {srv.title}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-snug mt-1 line-clamp-2">
                        {srv.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Footer info inside mobile card */}
        <footer className="mt-10 pt-6 border-t border-slate-800/80 text-center space-y-2 pb-6 sm:pb-2">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <img
              src="/assets/branding/nb-isotype.png"
              alt="Nova Bytex"
              className="h-3.5 w-auto object-contain opacity-75"
            />
            <span className="font-semibold text-slate-300">NovaBytex Technology</span>
            <span>·</span>
            <span className="text-[11px]">Tarjeta Digital NFC</span>
          </div>
          <p className="text-[10px] text-slate-500">
            © {new Date().getFullYear()} Nova Bytex. Todos los derechos reservados.
          </p>
        </footer>
      </main>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[250] px-4 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-semibold shadow-xl shadow-blue-900/40 flex items-center gap-2 max-w-[90vw]"
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
