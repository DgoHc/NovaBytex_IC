import Link from "next/link";
import { ChevronRight, Smartphone, Zap, Shield, Share2 } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarjetas Digitales NFC | NovaBytex",
  description: "Tu información profesional a un toque. Tarjetas NFC inteligentes para compartir tus redes, WhatsApp y contacto al instante.",
};

export default function NfcLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#080D1F] text-white pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 rounded-l-full blur-3xl transform translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Badge text="Nuevo Servicio" />
          <h1 className="mt-8 text-5xl md:text-7xl font-black tracking-tight" style={{ fontFamily: "var(--font-bodoni)" }}>
            Tu información.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              A un toque.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-slate-400">
            Una forma moderna y elegante de compartir tu identidad profesional, empresa y canales de contacto sin necesidad de imprimir tarjetas de papel.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contacto" className="inline-flex justify-center items-center h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)]">
              Solicitar mi tarjeta
            </Link>
            <a href="#como-funciona" className="inline-flex justify-center items-center h-14 px-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all">
              Ver cómo funciona
            </a>
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section id="como-funciona" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900" style={{ fontFamily: "var(--font-bodoni)" }}>
              Tres pasos simples
            </h2>
            <p className="mt-4 text-slate-500">La experiencia más fluida para ti y tus clientes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <Step icon={<Smartphone className="w-8 h-8" />} title="1. Acerca" desc="Acerca la tarjeta NFC a cualquier smartphone compatible." />
            <Step icon={<Zap className="w-8 h-8" />} title="2. Conecta" desc="Tu perfil digital profesional aparece instantáneamente en la pantalla." />
            <Step icon={<Share2 className="w-8 h-8" />} title="3. Comparte" desc="Tus clientes podrán guardarte, hablar por WhatsApp o visitar tus redes." />
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6" style={{ fontFamily: "var(--font-bodoni)" }}>
                Diseñado para profesionales modernos
              </h2>
              <div className="space-y-6">
                <Feature title="Información siempre actualizable" desc="Cambia tu teléfono, empresa o redes desde nuestro sistema sin tener que cambiar la tarjeta física." />
                <Feature title="Contacto instantáneo" desc="Tus clientes no tienen que tipear tu número. Con un botón abren WhatsApp o te guardan en su agenda." />
                <Feature title="Código QR complementario" desc="Si el teléfono no tiene NFC, tu perfil incluye un código QR escaneable por cualquier cámara." />
                <Feature title="Ecológico y rentable" desc="No vuelvas a imprimir cientos de tarjetas de papel que terminan en la basura." />
              </div>
            </div>
            
            <div className="relative">
              {/* Mockup visual abstracto */}
              <div className="aspect-[4/5] rounded-[3rem] bg-gradient-to-tr from-blue-600 to-indigo-900 shadow-2xl p-8 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-20 mix-blend-overlay"></div>
                <div className="w-64 h-96 bg-white rounded-3xl shadow-2xl transform rotate-12 translate-x-8 opacity-90 flex flex-col items-center pt-10">
                  <div className="w-20 h-20 bg-slate-200 rounded-full mb-4"></div>
                  <div className="w-32 h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="w-24 h-3 bg-slate-100 rounded mb-8"></div>
                  <div className="w-48 h-10 bg-green-100 rounded-xl mb-3"></div>
                  <div className="w-48 h-10 bg-slate-100 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-semibold text-cyan-300">
      {text}
    </span>
  );
}

function Step({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500">{desc}</p>
    </div>
  );
}

function Feature({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
        <Shield className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <h4 className="text-lg font-bold text-slate-900 mb-1">{title}</h4>
        <p className="text-slate-500">{desc}</p>
      </div>
    </div>
  );
}
