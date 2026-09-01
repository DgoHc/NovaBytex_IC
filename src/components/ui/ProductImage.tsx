"use client";

import React from "react";

interface ProductImageProps {
  type: string;
  name: string;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({ type, name, className = "" }) => {
  switch (type) {
    case "switch":
      return (
        <div className={`w-full h-full min-h-[160px] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-xl p-4 flex flex-col justify-between shadow-inner relative overflow-hidden group border border-slate-700/50 ${className}`}>
          {/* Status LEDs & Brand logo */}
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

          {/* Switch Ports Grid */}
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

            {/* SFP Uplink Ports */}
            <div className="flex justify-end gap-2 pr-1">
              <div className="w-6 h-6 bg-amber-950/60 border border-amber-500/50 rounded flex items-center justify-center">
                <div className="w-2.5 h-2 bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
              </div>
              <div className="w-6 h-6 bg-amber-950/60 border border-amber-500/50 rounded flex items-center justify-center">
                <div className="w-2.5 h-2 bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
              </div>
              <div className="w-6 h-6 bg-amber-950/60 border border-amber-500/50 rounded flex items-center justify-center">
                <div className="w-2.5 h-2 bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              </div>
              <div className="w-6 h-6 bg-amber-950/60 border border-amber-500/50 rounded flex items-center justify-center">
                <div className="w-2.5 h-2 bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              </div>
            </div>
          </div>

          {/* Footer branding details */}
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 z-10 border-t border-slate-800 pt-2">
            <span>48x 1G PoE+</span>
            <span>STACKWISE-160</span>
            <span>740W</span>
          </div>

          {/* Glow backdrop */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
        </div>
      );

    case "server":
      return (
        <div className={`w-full h-full min-h-[160px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden group border border-slate-700/60 ${className}`}>
          {/* Top bezel */}
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

          {/* Drive Bays Grid */}
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

          {/* Bottom Specifications */}
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
          {/* Top Logo */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-red-500">FORTINET</span>
              <span className="text-[10px] font-mono text-red-300/80">FortiGate 100F</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse" />
          </div>

          {/* Firewall Front Panel */}
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
          {/* Laptop Screen & Body graphic */}
          <div className="relative z-10 flex flex-col items-center w-full max-w-[200px]">
            {/* Screen */}
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

            {/* Laptop Hinge & Base */}
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
    default:
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
  }
};
