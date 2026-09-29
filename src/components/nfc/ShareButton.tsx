"use client";

import { Share2, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function ShareButton({ url, title, text }: { url: string; title: string; text: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        console.error("Error compartiendo:", err);
      }
    } else {
      // Fallback a copiar enlace
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error("Error copiando:", err);
      }
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="flex flex-col items-center gap-2 group p-2"
    >
      <div className="w-12 h-12 rounded-2xl bg-white text-slate-700 flex items-center justify-center shadow-sm border border-slate-200 group-hover:scale-105 transition-transform">
        {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
      </div>
      <span className="text-[11px] font-bold text-slate-600">
        {copied ? "Copiado!" : "Compartir"}
      </span>
    </button>
  );
}
