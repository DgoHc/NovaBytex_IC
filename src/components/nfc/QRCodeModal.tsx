"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Download, QrCode, Share2 } from "lucide-react";
import QRCode from "qrcode";
import type { NFCProfile } from "@/types/nfc";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: NFCProfile;
  url: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  profile,
  url,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && url) {
      QRCode.toDataURL(url, {
        width: 480,
        margin: 2,
        color: {
          dark: "#020617", // slate-950
          light: "#ffffff",
        },
        errorCorrectionLevel: "H",
      })
        .then((dataUrl) => setQrDataUrl(dataUrl))
        .catch((err) => console.error("Error generating QR:", err));
    }
  }, [isOpen, url]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qr-tarjeta-${profile.slug || "novabytex"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal / Bottom Sheet */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative z-10 w-full max-w-sm sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl text-white backdrop-blur-xl"
          >
            {/* Close Button */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    Código QR de Contacto
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Escanea para abrir la tarjeta digital
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Display Area */}
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="relative p-4 bg-white rounded-2xl shadow-xl border-4 border-blue-500/30">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Código QR para tarjeta de ${profile.nombre}`}
                    className="w-56 h-56 object-contain block rounded-lg"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-slate-400">
                    <span className="text-xs animate-pulse">Generando código QR...</span>
                  </div>
                )}
                {/* Brand Badge in center of frame */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-slate-950 p-1 border-2 border-blue-400 shadow-lg flex items-center justify-center">
                  <img
                    src={profile.logo || "/assets/branding/nb-isotype.png"}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center mt-4 max-w-xs leading-relaxed">
                Apunta la cámara de tu teléfono al código para guardar el contacto o acceder directamente a la tarjeta digital.
              </p>
            </div>

            {/* URL Display & Copy */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                <span className="truncate flex-1 text-slate-300 font-mono text-[11px]">
                  {url}
                </span>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleDownloadQR}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700/60 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar PNG
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-colors"
                >
                  Listo
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
