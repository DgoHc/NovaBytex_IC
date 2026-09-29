"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { QrCode, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function QrModal({ url, name }: { url: string; name: string }) {
  const [qrSrc, setQrSrc] = useState("");

  useEffect(() => {
    QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#080D1F', light: '#FFFFFF' } })
      .then(setQrSrc)
      .catch(console.error);
  }, [url]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex flex-col items-center gap-2 group p-2">
          <div className="w-12 h-12 rounded-2xl bg-white text-slate-700 flex items-center justify-center shadow-sm border border-slate-200 group-hover:scale-105 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-600">Mostrar QR</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-0 bg-[#080D1F] p-8 text-center rounded-[2rem]">
        <DialogTitle className="sr-only">Código QR de {name}</DialogTitle>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <QrCode className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-bodoni)" }}>
            Escanea para conectar
          </h2>
          <p className="text-slate-400 text-sm mb-8">
            Abre la cámara de tu teléfono y apunta a este código para guardar el contacto de {name}.
          </p>
          
          <div className="bg-white p-4 rounded-3xl shadow-xl">
            {qrSrc ? (
              <img src={qrSrc} alt="QR Code" className="w-48 h-48 md:w-56 md:h-56 object-contain" />
            ) : (
              <div className="w-48 h-48 md:w-56 md:h-56 bg-slate-100 animate-pulse rounded-2xl" />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
