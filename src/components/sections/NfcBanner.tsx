import Link from "next/link";
import { Zap } from "lucide-react";

export function NfcBanner() {
  return (
    <section className="py-16 bg-[#080D1F] border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-semibold text-cyan-400 mb-4 border border-blue-500/20">
              <Zap className="w-4 h-4" /> Nuevo Servicio
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4" style={{ fontFamily: "var(--font-bodoni)" }}>
              Tarjetas Digitales NFC
            </h2>
            <p className="text-slate-300 text-lg max-w-xl">
              Tu identidad profesional, a un toque. Comparte tu contacto, redes y WhatsApp instantáneamente acercando tu tarjeta a un smartphone.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <Link 
              href="/nfc" 
              className="inline-flex justify-center items-center w-full md:w-auto h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              Descubrir NFC
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
