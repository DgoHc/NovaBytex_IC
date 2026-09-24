"use client";

import React from "react";

interface ProductImageProps {
  type: string;
  name: string;
  className?: string;
  image?: string;
}

function LibraryWarmShell({
  children,
  className = "",
  accent = "sage",
}: {
  children: React.ReactNode;
  className?: string;
  accent?: "sage" | "terracotta" | "cream";
}) {
  const accentClasses: Record<string, string> = {
    sage: "from-library-paper via-library-cream to-library-beige border-library-beige/60",
    terracotta: "from-[hsl(var(--library-paper))] via-[hsl(var(--library-cream))] to-[hsl(var(--library-beige))] border-[hsla(18,55%,70%,0.45)]",
    cream: "from-[hsl(var(--library-cream))] via-[hsl(var(--library-paper))] to-white border-[hsla(35,45%,80%,0.7)]",
  };
  return (
    <div
      className={`w-full h-full min-h-[160px] rounded-xl p-4 flex flex-col justify-between shadow-inner relative overflow-hidden group border bg-gradient-to-br ${accentClasses[accent]} ${className}`}
    >
      {children}
    </div>
  );
}

export const ProductImage: React.FC<ProductImageProps> = ({ type, name, className = "", image }) => {
  if (image && image.trim().length > 0) {
    return (
      <div
        className={`w-full h-full min-h-[160px] rounded-xl p-1 bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center relative group ${className}`}
      >
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
    );
  }

  switch (type) {
    case "switch":
      return (
        <div className={`w-full h-full min-h-[160px] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-xl p-4 flex flex-col justify-between shadow-inner relative overflow-hidden group border border-slate-700/50 ${className}`}>
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[10px] font-mono text-slate-400 ml-1 tracking-wider uppercase">C9200L PoE+</span>
            </div>
            <span className="text-xs font-black tracking-widest text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              CISCO
            </span>
          </div>
          <div className="my-auto z-10 space-y-2">
            <div className="grid grid-cols-12 gap-1.5 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 shadow-md">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-full h-3.5 bg-slate-900 border border-slate-700 rounded-sm flex items-center justify-center relative">
                    {i % 2 === 0 && <div className="w-1.5 h-1 bg-amber-400 rounded-full shadow-[0_0_4px_#fbbf24]" />}
                  </div>
                  <div className="w-full h-3.5 bg-slate-900 border border-slate-700 rounded-sm flex items-center justify-center relative">
                    {i % 3 === 0 && <div className="w-1.5 h-1 bg-emerald-400 rounded-full shadow-[0_0_4px_#34d399]" />}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pr-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-6 h-6 bg-amber-950/60 border border-amber-500/50 rounded flex items-center justify-center">
                  <div className={`w-2.5 h-2 ${i < 2 ? "bg-amber-400 shadow-[0_0_6px_#fbbf24]" : "bg-emerald-400 shadow-[0_0_6px_#34d399]"}`} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 z-10 border-t border-slate-800 pt-2">
            <span>48x 1G PoE+</span>
            <span>STACKWISE-160</span>
            <span>740W</span>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
        </div>
      );

    case "server":
      return (
        <div className={`w-full h-full min-h-[160px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden group border border-slate-700/60 ${className}`}>
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-blue-400">DELL EMC</span>
              <span className="text-[10px] font-mono text-slate-400">PowerEdge R750</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 text-[9px] font-mono bg-blue-950 text-blue-300 border border-blue-800 rounded">iDRAC9</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
          </div>
          <div className="my-auto z-10 space-y-1.5">
            <div className="grid grid-cols-6 gap-1 bg-slate-950 p-2 rounded-lg border border-slate-800">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-7 bg-slate-900 border border-slate-700/80 rounded-xs p-1 flex flex-col justify-between hover:border-blue-500 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="w-1 h-1 bg-emerald-400 rounded-full" />
                    <span className="w-1 h-1 bg-blue-400 rounded-full" />
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500/60 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 z-10 border-t border-slate-800 pt-2">
            <span className="text-blue-400 font-bold">2x INTEL XEON</span>
            <span>64GB DDR4</span>
            <span>NVMe SSD</span>
          </div>
          <div className="absolute -left-8 -top-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
        </div>
      );

    case "firewall":
      return (
        <div className={`w-full h-full min-h-[160px] bg-gradient-to-br from-red-950 via-slate-900 to-slate-950 rounded-xl p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden group border border-red-900/40 ${className}`}>
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-red-500">FORTINET</span>
              <span className="text-[10px] font-mono text-red-300/80">FortiGate 100F</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse" />
          </div>
          <div className="my-auto z-10 bg-slate-950/90 p-3 rounded-lg border border-red-900/30 space-y-2">
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1">
              <span>HA / STATUS</span>
              <span>10GE SFP+ UPLINKS</span>
            </div>
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-6 bg-slate-900 border border-slate-700 rounded flex flex-col items-center justify-center gap-0.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_4px_#10b981]" />
                  <div className="w-1 h-1 bg-red-400 rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-red-400 z-10 border-t border-red-950 pt-2">
            <span>SD-WAN SECURE</span>
            <span>20 Gbps NGFW</span>
          </div>
          <div className="absolute right-0 top-0 w-36 h-36 bg-red-600/10 rounded-full blur-3xl group-hover:bg-red-600/20 transition-all" />
        </div>
      );

    case "laptop":
      return (
        <div className={`w-full h-full min-h-[160px] bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 rounded-xl p-4 flex flex-col items-center justify-center shadow-xl relative overflow-hidden group border border-slate-700/50 ${className}`}>
          <div className="relative z-10 flex flex-col items-center w-full max-w-[200px]">
            <div className="w-full h-24 bg-slate-950 border-2 border-slate-700 rounded-t-lg p-2 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center text-[8px] font-mono text-cyan-400 border-b border-slate-800 pb-1">
                <span>ThinkPad X1</span>
                <span>4K OLED</span>
              </div>
              <div className="my-auto text-center">
                <span className="text-[11px] font-bold text-white tracking-wide">INTEL CORE i7</span>
                <p className="text-[8px] text-slate-400">Windows 11 Pro Enterprise</p>
              </div>
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mx-auto" />
            </div>
            <div className="w-[110%] h-3 bg-slate-800 rounded-b-md border-t border-slate-600 flex items-center justify-center shadow-md">
              <div className="w-12 h-1 bg-slate-900 rounded-full" />
            </div>
          </div>
          <div className="absolute bottom-2 left-4 text-[10px] font-mono text-slate-400">1.12 kg Carbon</div>
          <div className="absolute bottom-2 right-4 text-[10px] font-mono text-cyan-400 font-bold">LENOVO</div>
        </div>
      );

    case "storage":
      return (
        <div className={`w-full h-full min-h-[160px] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 rounded-xl p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden group border border-indigo-800/40 ${className}`}>
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-black tracking-widest text-indigo-400">POWERSTORE 500T</span>
            <span className="px-2 py-0.5 text-[9px] font-mono bg-indigo-900/60 text-indigo-200 rounded border border-indigo-700">ALL-FLASH</span>
          </div>
          <div className="my-auto z-10 space-y-1.5 bg-slate-950/80 p-2.5 rounded-lg border border-indigo-900/40">
            <div className="grid grid-cols-8 gap-1">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="h-5 bg-indigo-950/60 border border-indigo-800/50 rounded flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_4px_#818cf8]" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-indigo-300 z-10 border-t border-indigo-900/60 pt-2">
            <span>NVMe DEDUPE 4:1</span>
            <span>25 TB ALL-FLASH</span>
          </div>
        </div>
      );

    case "accesspoint":
      return (
        <div className={`w-full h-full min-h-[160px] bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 rounded-xl p-4 flex flex-col items-center justify-center shadow-xl relative overflow-hidden group border border-sky-800/40 ${className}`}>
          <div className="relative z-10 w-24 h-24 rounded-full bg-slate-100 shadow-2xl flex items-center justify-center border-4 border-slate-200 group-hover:scale-105 transition-transform">
            <div className="w-10 h-10 rounded-full border-2 border-sky-400 flex items-center justify-center animate-pulse shadow-[0_0_15px_#38bdf8]">
              <div className="w-4 h-4 rounded-full bg-sky-500" />
            </div>
          </div>
          <div className="mt-3 text-[11px] font-bold font-mono text-sky-300 z-10">UBIQUITI UNIFI U6 PRO</div>
          <div className="text-[9px] font-mono text-slate-400 z-10">Wi-Fi 6 • 5.3 Gbps • 300+ Clients</div>
        </div>
      );

    case "router":
      return (
        <div className={`w-full h-full min-h-[160px] bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 rounded-xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden group border border-teal-800/40 ${className}`}>
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-black tracking-widest text-teal-400">MIKROTIK</span>
            <span className="text-[10px] font-mono text-slate-300">CCR2004-16G-2S+</span>
          </div>
          <div className="my-auto z-10 bg-slate-950 p-2.5 rounded-lg border border-teal-900/40">
            <div className="grid grid-cols-8 gap-1.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-6 bg-slate-900 border border-slate-700 rounded flex flex-col items-center justify-center">
                  <div className="w-1.5 h-1 bg-teal-400 rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-teal-300 z-10 border-t border-teal-900/60 pt-2">
            <span>ROUTEROS v7</span>
            <span>QUAD CORE 1.7GHz</span>
          </div>
        </div>
      );

    case "book":
      return (
        <LibraryWarmShell className={className} accent="terracotta">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold tracking-widest uppercase text-library-terracotta bg-white/60 px-2 py-0.5 rounded border border-library-beige">
              Libro
            </span>
            <span className="text-[10px] font-mono text-library-paper-foreground/70">{name.length > 12 ? name.slice(0, 12) + "…" : name}</span>
          </div>
          <div className="my-auto z-10 mx-auto w-full max-w-[150px]">
            <div className="relative rounded-md shadow-xl overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-library-terracotta/80 border-r border-black/10" />
              <div className="bg-white ml-2 p-4 pr-3 min-h-[100px] flex flex-col justify-center">
                <div className="font-bodoni text-[13px] font-semibold text-slate-800 leading-tight line-clamp-3">
                  {name}
                </div>
                <div className="mt-2 w-8 h-px bg-library-terracotta/60" />
              </div>
              <div className="absolute inset-y-0 left-2 w-8 bg-gradient-to-r from-black/10 to-transparent" />
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] z-10 border-t border-library-beige/80 pt-2 text-library-paper-foreground/70">
            <span className="font-bold tracking-wide text-library-sage-foreground">ISBN · EDITORIAL</span>
            <span className="font-mono">VOL. 01</span>
          </div>
        </LibraryWarmShell>
      );

    case "notebook":
      return (
        <LibraryWarmShell className={className} accent="cream">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold tracking-widest uppercase text-library-cream-foreground bg-white/70 px-2 py-0.5 rounded border border-library-beige">
              Cuaderno
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono bg-library-beige text-library-cream-foreground rounded">A5 · 240H</span>
          </div>
          <div className="my-auto z-10 mx-auto w-full max-w-[140px]">
            <div className="aspect-[3/4] rounded-sm shadow-xl relative overflow-hidden bg-white">
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-library-beige border-r border-library-beige/80" />
              <div className="absolute inset-1 ml-4 border-t border-b border-dashed border-library-beige" />
              <div className="pt-5 pb-3 px-4 ml-2">
                <div className="font-bodoni text-[14px] font-semibold text-library-cream-foreground leading-tight text-center">
                  {name.length > 20 ? name.slice(0, 20) + "…" : name}
                </div>
                <div className="mt-3 w-10 h-px mx-auto bg-library-sage" />
                <div className="mt-2 text-center text-[10px] tracking-widest uppercase text-library-sage-foreground/70">
                  Notes
                </div>
              </div>
              <div className="absolute top-0 right-0 w-10 h-10 bg-library-terracotta/30 transform rotate-45 translate-x-5 -translate-y-5" />
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] z-10 border-t border-library-beige/80 pt-2 text-library-paper-foreground/70">
            <span className="font-bold">TAPA DURA</span>
            <span className="font-mono">Líneas · 100gsm</span>
          </div>
        </LibraryWarmShell>
      );

    case "agenda":
      return (
        <LibraryWarmShell className={className} accent="sage">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold tracking-widest uppercase text-library-sage-foreground bg-white/70 px-2 py-0.5 rounded border border-library-beige">
              Agenda
            </span>
            <span className="text-[9px] font-bold font-mono text-library-sage-foreground bg-library-sage/30 px-2 py-0.5 rounded border border-library-sage/60">
              2026
            </span>
          </div>
          <div className="my-auto z-10 mx-auto w-full max-w-[140px]">
            <div className="aspect-[3/4] rounded-md shadow-xl relative overflow-hidden border-2 border-library-sage/60 bg-library-cream">
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-library-sage" />
              <div className="pt-6 pb-4 px-3 ml-3">
                <div className="text-center">
                  <div className="text-[9px] tracking-[0.3em] uppercase text-library-sage-foreground/70 font-bold">
                    Planner
                  </div>
                  <div className="mt-1 font-bodoni text-2xl font-bold text-library-sage-foreground leading-none">
                    26
                  </div>
                  <div className="mt-1 text-[9px] tracking-widest uppercase text-library-cream-foreground/70 font-bold">
                    Weekly
                  </div>
                </div>
                <div className="mt-4 w-full h-px bg-library-sage/40" />
                <div className="mt-3 text-center text-[9px] font-semibold text-library-cream-foreground/70 tracking-wide">
                  {name.length > 18 ? name.slice(0, 18) + "…" : name}
                </div>
              </div>
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full border border-library-sage-foreground/40" />
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] z-10 border-t border-library-beige/80 pt-2 text-library-paper-foreground/70">
            <span className="font-bold">CUERO · SOLAPA</span>
            <span className="font-mono">52 semanas</span>
          </div>
        </LibraryWarmShell>
      );

    case "pen":
      return (
        <LibraryWarmShell className={className} accent="cream">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold tracking-widest uppercase text-library-cream-foreground bg-white/70 px-2 py-0.5 rounded border border-library-beige">
              Escritura
            </span>
            <span className="text-[9px] font-mono text-library-cream-foreground/80">0.7mm · x6</span>
          </div>
          <div className="my-auto z-10 mx-auto w-full max-w-[180px]">
            <div className="flex items-center justify-center gap-1.5 py-2">
              {["bg-slate-900", "bg-blue-700", "bg-rose-600", "bg-emerald-600", "bg-violet-700", "bg-cyan-500"].map((c, i) => (
                <div key={i} className="relative w-4 h-28 rounded-t-full rounded-b-md shadow-md flex flex-col items-center justify-between overflow-hidden">
                  <div className={`w-full h-full ${c}`} />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white/30" />
                  <div className="absolute -bottom-2 w-2 h-3 bg-library-terracotta/70 rounded-b-full" />
                </div>
              ))}
            </div>
            <div className="mt-1 text-center text-[10px] font-bodoni font-semibold text-library-cream-foreground/80">
              Rollerball Premium
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] z-10 border-t border-library-beige/80 pt-2 text-library-paper-foreground/70">
            <span className="font-bold">GEL · QUICK-DRY</span>
            <span className="font-mono">Recargables</span>
          </div>
        </LibraryWarmShell>
      );

    case "pencil":
      return (
        <LibraryWarmShell className={className} accent="sage">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold tracking-widest uppercase text-library-sage-foreground bg-white/70 px-2 py-0.5 rounded border border-library-beige">
              Lápices
            </span>
            <span className="text-[9px] font-mono text-library-cream-foreground/80">HB · 9H</span>
          </div>
          <div className="my-auto z-10 mx-auto w-full max-w-[180px]">
            <div className="relative h-24 w-full flex items-center justify-center">
              <div className="absolute w-full h-8 bg-library-beige/60 rounded-sm shadow-inner" />
              <div className="relative z-10 flex -space-x-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-5 h-24 rounded-b-sm shadow relative overflow-hidden"
                    style={{
                      transform: `translateY(${(i - 3) * -3}px)`,
                      background: "linear-gradient(180deg, #f5e7c7 0%, #e8d29d 65%, #b48a48 100%)",
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-5 bg-gradient-to-b from-[#1e293b] to-[#334155] rounded-t-sm" />
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-library-terracotta/70 rounded-b-sm clip-conic" />
                    <div className="absolute inset-x-1 top-6 bottom-5 border-l border-r border-[#c9a76a]/40" />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 text-center text-[10px] font-bodoni font-semibold text-library-cream-foreground/80">
              Graduación Profesional
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] z-10 border-t border-library-beige/80 pt-2 text-library-paper-foreground/70">
            <span className="font-bold">MINA SV</span>
            <span className="font-mono">Cedro Reforestado</span>
          </div>
        </LibraryWarmShell>
      );

    case "marker":
      return (
        <LibraryWarmShell className={className} accent="terracotta">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold tracking-widest uppercase text-library-terracotta bg-white/70 px-2 py-0.5 rounded border border-library-beige">
              Marcadores
            </span>
            <span className="text-[9px] font-mono text-library-cream-foreground/80">P.Fina · x12</span>
          </div>
          <div className="my-auto z-10 mx-auto w-full max-w-[180px]">
            <div className="grid grid-cols-6 gap-1.5 py-2">
              {[
                "#1e293b", "#e11d48", "#ea580c", "#d97706",
                "#65a30d", "#0d9488", "#0284c7", "#4f46e5",
                "#7c3aed", "#db2777", "#0f172a", "#3730a3",
              ].map((c, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-4 h-16 rounded-t-lg rounded-b-md shadow-md relative overflow-hidden" style={{ background: c }}>
                    <div className="absolute top-0 inset-x-0 h-2 bg-black/40" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-1 text-center text-[10px] font-bodoni font-semibold text-library-cream-foreground/80">
              Permanente · Indeleble
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] z-10 border-t border-library-beige/80 pt-2 text-library-paper-foreground/70">
            <span className="font-bold">ALCOHOL BASE</span>
            <span className="font-mono">UV resist</span>
          </div>
        </LibraryWarmShell>
      );

    case "highlighter":
      return (
        <LibraryWarmShell className={className} accent="sage">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold tracking-widest uppercase text-library-sage-foreground bg-white/70 px-2 py-0.5 rounded border border-library-beige">
              Resaltadores
            </span>
            <span className="text-[9px] font-mono text-library-cream-foreground/80">Gel · x4</span>
          </div>
          <div className="my-auto z-10 mx-auto w-full max-w-[180px]">
            <div className="flex items-end justify-around h-24 gap-2 py-2">
              {[
                { c: "#fde68a", tip: "bg-yellow-300" },
                { c: "#bbf7d0", tip: "bg-emerald-300" },
                { c: "#fbcfe8", tip: "bg-pink-300" },
                { c: "#bfdbfe", tip: "bg-sky-300" },
              ].map((item, i) => (
                <div key={i} className="relative flex flex-col items-center" style={{ transform: `translateY(${i % 2 === 0 ? 0 : 6}px)` }}>
                  <div className={`w-2 h-3 rounded-t ${item.tip} shadow-inner`} />
                  <div className="w-8 h-20 rounded-b-sm shadow-md relative" style={{ background: item.c }}>
                    <div className="absolute inset-1 border border-white/40 rounded-sm" />
                    <div className="absolute inset-x-0 top-5 h-1 bg-white/50" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-1 text-center text-[10px] font-bodoni font-semibold text-library-cream-foreground/80">
              Tonos Pastel · Soft Gel
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] z-10 border-t border-library-beige/80 pt-2 text-library-paper-foreground/70">
            <span className="font-bold">NO TRASPASAN</span>
            <span className="font-mono">Retráctil</span>
          </div>
        </LibraryWarmShell>
      );

    case "desk":
      return (
        <LibraryWarmShell className={className} accent="cream">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold tracking-widest uppercase text-library-cream-foreground bg-white/70 px-2 py-0.5 rounded border border-library-beige">
              Escritorio
            </span>
            <span className="text-[9px] font-mono text-library-cream-foreground/80">Bambú · 6C</span>
          </div>
          <div className="my-auto z-10 mx-auto w-full max-w-[160px]">
            <div className="relative rounded-lg shadow-xl overflow-hidden border border-library-beige" style={{ background: "linear-gradient(135deg, #d7b78c 0%, #c9a16c 45%, #a37843 100%)" }}>
              <div className="grid grid-cols-3 grid-rows-2 gap-1 p-3 h-36">
                <div className="bg-library-cream/80 rounded-sm border border-white/30" />
                <div className="bg-library-cream/70 rounded-sm col-span-2 border border-white/30" />
                <div className="bg-library-beige/80 rounded-sm row-span-2 border border-white/30" />
                <div className="bg-library-cream/60 rounded-sm border border-white/30" />
                <div className="bg-library-cream/60 rounded-sm border border-white/30 relative">
                  <div className="absolute inset-1.5 border border-library-terracotta/40 rounded-sm" />
                </div>
              </div>
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-library-sage/60 border border-white/30" />
            </div>
            <div className="mt-2 text-center text-[10px] font-bodoni font-semibold text-library-cream-foreground/80">
              Organizador Premium
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] z-10 border-t border-library-beige/80 pt-2 text-library-paper-foreground/70">
            <span className="font-bold">FSC · BAMBÚ</span>
            <span className="font-mono">6 secciones</span>
          </div>
        </LibraryWarmShell>
      );

    case "school":
      return (
        <LibraryWarmShell className={className} accent="sage">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold tracking-widest uppercase text-library-sage-foreground bg-white/70 px-2 py-0.5 rounded border border-library-beige">
              Kit Escolar
            </span>
            <span className="text-[9px] font-mono text-library-cream-foreground/80">Completo</span>
          </div>
          <div className="my-auto z-10 mx-auto w-full max-w-[160px] h-full flex items-center justify-center">
            <div className="relative w-full h-36 rounded-lg shadow-xl overflow-hidden border border-library-beige/80 bg-library-paper">
              <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-r from-library-terracotta/70 via-library-sage/70 to-sky-400/60" />
              <div className="absolute inset-x-0 top-8 bottom-0 flex items-center justify-center gap-1.5 p-3">
                <div className="w-6 h-20 rounded-sm shadow" style={{ background: "linear-gradient(180deg, #e8d29d 0%, #c9a76a 100%)" }} />
                <div className="w-8 h-20 rounded-md shadow bg-white border border-library-beige p-1">
                  <div className="mt-1 space-y-1">
                    <div className="h-px bg-slate-300" />
                    <div className="h-px bg-slate-300" />
                    <div className="h-px bg-slate-300 w-3/4" />
                    <div className="h-px bg-slate-300 w-2/3" />
                  </div>
                </div>
                <div className="w-2 h-20 rounded-t-lg bg-rose-500 shadow" />
                <div className="w-2 h-20 rounded-t-lg bg-blue-600 shadow" />
                <div className="w-3 h-20 rounded-t-lg bg-yellow-300 shadow" />
              </div>
              <div className="absolute top-2 left-3 w-4 h-1.5 bg-white/90 rounded-sm" />
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] z-10 border-t border-library-beige/80 pt-2 text-library-paper-foreground/70">
            <span className="font-bold">SIN PVC</span>
            <span className="font-mono">8+ piezas</span>
          </div>
        </LibraryWarmShell>
      );

    case "office":
    default:
      return (
        <LibraryWarmShell className={className} accent="cream">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold tracking-widest uppercase text-library-cream-foreground bg-white/70 px-2 py-0.5 rounded border border-library-beige">
              Accesorios
            </span>
            <span className="text-[9px] font-mono text-library-cream-foreground/80">Oficina</span>
          </div>
          <div className="my-auto z-10 mx-auto w-full max-w-[160px]">
            <div className="space-y-2 p-3 rounded-lg shadow-xl bg-white border border-library-beige/60">
              <div className="flex items-center justify-between">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 shadow-md flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${["#86efac", "#fca5a5", "#fcd34d"][i]}, ${["#22c55e", "#ef4444", "#f59e0b"][i]})` }}>
                    <div className="w-2 h-2 rounded-full bg-white/80" />
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-library-beige pt-2 space-y-1">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-2 rounded-sm" style={{ background: ["#fde68a", "#bfdbfe", "#fecaca", "#bbf7d0"][i], opacity: 0.75 }} />
                ))}
              </div>
            </div>
            <div className="mt-2 text-center text-[10px] font-bodoni font-semibold text-library-cream-foreground/80">
              Clips + Sticky Notes
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] z-10 border-t border-library-beige/80 pt-2 text-library-paper-foreground/70">
            <span className="font-bold">REUSABLE</span>
            <span className="font-mono">x9 unidades</span>
          </div>
        </LibraryWarmShell>
      );
  }
};
