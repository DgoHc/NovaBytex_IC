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
} from "lucide-react";
import { QRCodeModal } from "./QRCodeModal";

export const ClientDigitalCardView = ({ profile, isPreview = false }: { profile: any, isPreview?: boolean }) => {
  const [mounted, setMounted] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [originUrl, setOriginUrl] = useState("https://novabytex.com/card");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && !isPreview) {
      setOriginUrl(window.location.href);
    }
  }, [isPreview]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleSaveContact = () => {
    if (isPreview) {
      triggerToast("En modo vista previa no se descarga el contacto.");
      return;
    }
    if (profile.slug) {
      window.location.href = `/api/nfc/profiles/${profile.slug}/vcard`;
    }
  };

  const handleShare = async () => {
    if (isPreview) {
      triggerToast("En modo vista previa no se puede compartir.");
      return;
    }
    const shareData = {
      title: `${profile.name || profile.nombre} · Tarjeta Digital NFC`,
      text: `${profile.name || profile.nombre} - ${profile.position || profile.cargo}. Contacta directamente o guarda este contacto.`,
      url: originUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback
      }
    }

    try {
      await navigator.clipboard.writeText(originUrl);
      setCopiedLink(true);
      triggerToast("¡Enlace copiado al portapapeles!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      triggerToast("No se pudo copiar el enlace.");
    }
  };

  const whatsappNumber = profile.whatsapp || "";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    "Hola, deseo información."
  )}`;

  const name = profile.name || profile.nombre || "Nombre del Cliente";
  const position = profile.position || profile.cargo || "Cargo";
  const company = profile.company || profile.empresa || "";
  const logoUrl = profile.logo_url || profile.logo || "/assets/branding/nb-isotype.png";
  const avatarUrl = profile.avatar_url || profile.avatar || "";
  const phone = profile.phone || profile.telefono || "";
  const email = profile.email || "";
  const website = profile.website || "";
  const address = profile.address || profile.ubicacion?.cobertura || profile.ubicacion?.ciudad || "";

  // Redes
  const redes = [];
  if (profile.instagram) redes.push({ platform: "instagram", url: profile.instagram });
  if (profile.facebook) redes.push({ platform: "facebook", url: profile.facebook });
  if (profile.linkedin) redes.push({ platform: "linkedin", url: profile.linkedin });

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-white selection:bg-blue-600 selection:text-white flex flex-col relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-slate-900 to-slate-950/80 border-b border-slate-800"
          style={{ 
            height: '240px',
            clipPath: 'polygon(0 0, 100% 0, 100% 65%, 0 100%)' 
          }}
        >
          {/* Logo was previously here, but it's now a badge on the avatar */}
          <div className="absolute top-8 left-8 w-1.5 h-1.5 rounded-full bg-blue-500/40" />
          <div className="absolute top-16 right-12 w-2 h-2 rounded-full bg-cyan-500/30" />
          <div className="absolute top-32 left-[30%] w-1 h-1 rounded-full bg-white/30" />
          <div className="absolute top-20 left-[70%] w-8 h-8 rounded-full border border-blue-500/10" />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-[160px]" />
        </div>
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

      <main className="relative z-10 w-full max-w-[480px] mx-auto px-5 py-6 flex-1 flex flex-col pt-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="flex-1 flex flex-col items-center"
        >
          {/* Protagonist Element (Avatar + Logo Badge) */}
          <motion.div 
            variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
            className="relative z-20 mt-4 mb-6 group"
          >
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] mx-auto rounded-[2rem]"
            >
              {/* Enhanced Avatar Contour (Stunning Visuals) */}
              <div className="absolute -inset-[3px] rounded-[2.1rem] bg-gradient-to-tr from-purple-500 via-blue-500 to-cyan-400 opacity-80 blur-[8px] mix-blend-screen group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -inset-[2px] rounded-[2rem] bg-gradient-to-br from-blue-400/80 via-cyan-300/40 to-purple-500/80 z-10 pointer-events-none border-[2px] border-white/20 mix-blend-overlay" />
              
              {/* Avatar Container */}
              <div className="relative w-full h-full rounded-[1.9rem] bg-slate-900 flex items-center justify-center overflow-hidden z-10 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-2 border-blue-400/30">
                {avatarUrl ? (
                   <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                   <span className="text-4xl font-black text-slate-500">{name.charAt(0)}</span>
                )}
              </div>
              
              {/* Logo superimposed on top-left (Original Logo Contour) */}
              <div className="absolute -top-3 -left-3 z-50">
                <div className="relative w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] rounded-2xl p-[2px] bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-700 shadow-[0_10px_20px_-5px_rgba(59,130,246,0.6)] rotate-3 transition-transform hover:rotate-0">
                  <div className="w-full h-full rounded-[0.9rem] bg-slate-950 p-1.5 flex items-center justify-center overflow-hidden -rotate-3 relative z-10">
                    <img src={logoUrl} alt="Company Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
              
              {/* Decorative shapes */}
              <div className="absolute top-1/2 -right-4 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] z-0" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-cyan-500/50 blur-[2px] z-0" />
            </motion.div>
          </motion.div>

          <motion.div 
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            className="text-center w-full mb-6"
          >
            <h1 className="text-[24px] sm:text-[28px] font-black tracking-tight text-white flex items-center justify-center gap-1.5 leading-none mb-1.5">
              {name}
              <CheckCircle2 className="w-[16px] h-[16px] text-blue-400 shrink-0" />
            </h1>
            <p className="text-[12px] font-bold text-blue-400/90 tracking-wide uppercase">
              {position} {company && `• ${company}`}
            </p>
            {profile.description && (
              <p className="text-sm text-slate-400 mt-3">{profile.description}</p>
            )}
          </motion.div>

          <motion.div 
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            className="w-full space-y-3.5 mb-6 relative z-10"
          >
            {whatsappNumber && (
              <motion.a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.97 }}
                className="relative flex items-center justify-between w-full p-2.5 pr-6 rounded-full bg-[#25D366] hover:bg-[#1ebd5b] transition-all shadow-[0_8px_25px_-5px_rgba(37,211,102,0.5)] hover:shadow-[0_12px_35px_-5px_rgba(37,211,102,0.6)] group overflow-hidden"
              >
                {/* Highlight effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-[48px] h-[48px] rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-7 h-7 text-white fill-white/10" />
                  </div>
                  <div className="text-left">
                    <p className="text-[16px] font-extrabold text-white leading-tight tracking-tight">WhatsApp</p>
                    <p className="text-[12px] text-white/90 font-semibold tracking-wide">Mensaje Directo</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1.5 transition-transform relative z-10" />
              </motion.a>
            )}

            <motion.button
              onClick={handleSaveContact}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-[16px] px-6 rounded-full bg-gradient-to-r from-slate-100 to-white text-slate-950 font-bold text-[14px] shadow-[0_10px_25px_-5px_rgba(255,255,255,0.2)] hover:shadow-[0_15px_30px_-5px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <UserPlus className="w-[18px] h-[18px]" />
              <span>Guardar contacto</span>
            </motion.button>
          </motion.div>

          <motion.div 
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            className="w-full grid grid-cols-2 gap-3 mb-6"
          >
            {phone && (
              <motion.a href={`tel:${phone}`} whileTap={{ scale: 0.96 }} className="relative flex flex-col items-center justify-center py-3 px-4 h-20 rounded-3xl bg-gradient-to-br from-blue-600/20 to-slate-900/80 backdrop-blur-md border border-blue-500/20 hover:border-blue-400/50 hover:from-blue-600/30 transition-all group overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.2)] gap-1.5">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/20 blur-[30px] rounded-full group-hover:bg-blue-400/30 transition-all" />
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Phone className="w-[16px] h-[16px]" />
                </div>
                <div className="relative z-10 text-center">
                  <p className="text-[13px] font-black text-white leading-tight">Llamar</p>
                </div>
              </motion.a>
            )}

            {website && (
              <motion.a href={website} target="_blank" rel="noopener noreferrer" whileTap={{ scale: 0.96 }} className="relative flex flex-col items-center justify-center py-3 px-4 h-20 rounded-3xl bg-gradient-to-br from-cyan-600/20 to-slate-900/80 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-400/50 hover:from-cyan-600/30 transition-all group overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.2)] gap-1.5">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-cyan-500/20 blur-[30px] rounded-full group-hover:bg-cyan-400/30 transition-all" />
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                  <Globe className="w-[16px] h-[16px]" />
                </div>
                <div className="relative z-10 text-center">
                  <p className="text-[13px] font-black text-white leading-tight">Sitio Web</p>
                </div>
              </motion.a>
            )}

            {email && (
              <motion.a href={`mailto:${email}`} whileTap={{ scale: 0.98 }} className="col-span-2 relative flex items-center gap-3 py-2 px-3.5 rounded-full bg-gradient-to-r from-slate-800/60 to-slate-900/90 backdrop-blur-md border border-slate-700/50 hover:border-slate-500 hover:bg-slate-800 transition-all group overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.2)]">
                <div className="w-9 h-9 rounded-full bg-slate-800/80 flex items-center justify-center text-blue-400 shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors shadow-inner">
                  <Mail className="w-[16px] h-[16px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-0.5">Correo Electrónico</p>
                  <p className="text-[14px] font-bold text-white truncate leading-none">{email}</p>
                </div>
                <div className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center mr-1">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </motion.a>
            )}

            {address && (
              <motion.div className="col-span-2 relative flex items-center gap-3 py-2 px-3.5 rounded-full bg-gradient-to-r from-slate-800/60 to-slate-900/90 backdrop-blur-md border border-slate-700/50 hover:border-slate-500 hover:bg-slate-800 transition-all group overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.2)]">
                <div className="w-9 h-9 rounded-full bg-slate-800/80 flex items-center justify-center text-cyan-400 shrink-0 group-hover:bg-cyan-500 group-hover:text-white transition-colors shadow-inner">
                  <MapPin className="w-[16px] h-[16px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-0.5">Ubicación</p>
                  <p className="text-[14px] font-bold text-white truncate leading-none">{address}</p>
                </div>
                <div className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center mr-1">
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </motion.div>
            )}

            {!isPreview && (
              <>
                <motion.button onClick={() => setQrModalOpen(true)} whileTap={{ scale: 0.96 }} className="relative flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-700/50 hover:bg-slate-800 hover:border-pink-500/40 transition-all group shadow-sm">
                  <QrCode className="w-4 h-4 text-slate-400 group-hover:text-pink-400 transition-colors" />
                  <span className="text-[12px] font-bold text-slate-300 group-hover:text-white transition-colors">Código QR</span>
                </motion.button>
                <motion.button onClick={handleShare} whileTap={{ scale: 0.96 }} className="relative flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-700/50 hover:bg-slate-800 hover:border-purple-500/40 transition-all group shadow-sm">
                  <Share2 className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
                  <span className="text-[12px] font-bold text-slate-300 group-hover:text-white transition-colors">Compartir</span>
                </motion.button>
              </>
            )}

            {redes.length > 0 && (
              <div className="col-span-2 flex flex-wrap items-center justify-center gap-3 pt-6 pb-2">
                {redes.map((red) => (
                  <a
                    key={red.platform}
                    href={red.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-center w-[52px] h-[52px] rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-slate-400 hover:text-white hover:border-blue-400 hover:bg-blue-500/20 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:-translate-y-1.5"
                  >
                    <Globe className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </a>
                ))}
              </div>
            )}
          </motion.div>

          <motion.footer 
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            className="w-full mt-14 pt-8 text-center pb-6"
          >
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1 rounded-full bg-slate-800/60" />
            </div>
            <img src="/assets/branding/nb-isotype.png" alt="Nova Bytex" className="h-[20px] w-auto mx-auto opacity-30 mb-3 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
            <p className="text-[11px] text-slate-500/80 font-medium tracking-wide">
              © {new Date().getFullYear()} Nova Bytex Technology
            </p>
          </motion.footer>
        </motion.div>
      </main>

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

      {!isPreview && profile.nombre && (
        <QRCodeModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          profile={profile}
          url={originUrl}
        />
      )}
    </div>
  );
};

export default ClientDigitalCardView;
