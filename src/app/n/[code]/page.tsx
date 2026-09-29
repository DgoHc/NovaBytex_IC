import { redirect } from "next/navigation";
import { NfcService } from "@/services/NfcService";
import { ShieldAlert, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tarjeta NFC | NovaBytex",
  robots: { index: false, follow: false }
};

export default async function NfcCardResolver({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = await params;
  const { code } = resolvedParams;

  // Lógica de resolución ultra-rápida (Server-side)
  // NfcService.resolveCard ya filtra por status === 'ACTIVE' e is_active === true
  const card = await NfcService.resolveCard(code);

  if (card && card.profile && card.profile.slug) {
    // Redirección HTTP nativa desde el servidor. 
    // El usuario nunca verá esta página si la tarjeta es válida.
    redirect(`/card/${card.profile.slug}`);
  }

  // Si llega aquí, la tarjeta:
  // 1. No existe (código incorrecto)
  // 2. Existe pero está SUSPENDED o DISABLED
  // 3. Existe pero el perfil fue desactivado
  
  return (
    <div className="min-h-screen bg-[#080D1F] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        <div className="w-20 h-20 mx-auto bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20">
          <ShieldAlert className="w-10 h-10 text-rose-400" />
        </div>
        
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-3" style={{ fontFamily: "var(--font-bodoni)" }}>
          Tarjeta no disponible
        </h1>
        
        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8">
          Esta tarjeta NFC no está configurada, se encuentra suspendida o ha sido desactivada temporalmente por el administrador.
        </p>

        <div className="space-y-4">
          <button 
            className="w-full h-12 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            onClick={() => {
              "use client";
              if (typeof window !== "undefined") window.location.reload();
            }}
          >
            <RefreshCcw className="w-4 h-4" />
            Reintentar
          </button>
          
          <Link 
            href="/"
            className="w-full h-12 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white rounded-xl font-bold transition-colors flex items-center justify-center"
          >
            Ir a NovaBytex
          </Link>
        </div>
      </div>
      
      <p className="mt-8 text-slate-600 text-xs font-medium uppercase tracking-widest">
        Sistema NFC · NovaBytex
      </p>
    </div>
  );
}
