"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Tag,
  Wrench,
  Wifi,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Definición de slides de servicios (4 escenas garantizadas)
interface ServiceSlide {
  id: string;
  number: string;
  category: string;
  title: string;
  description: string;
  linkText: string;
  href: string;
  isExternal?: boolean;
  theme: "tech" | "stationery" | "support" | "network";
  gradientBg: string;
  spotlightColor: string;
  chipText: string;
  chipIcon: React.ElementType;
}

const slides: ServiceSlide[] = [
  {
    id: "tech",
    number: "01",
    category: "Hardware & Laptops",
    title: "Tecnología & Hardware",
    description: "Laptops de alto rendimiento, periféricos, monitores y equipos garantizados para profesionales.",
    linkText: "Ver catálogo de tecnología",
    href: "/productos?tipo=technology",
    theme: "tech",
    gradientBg: "from-sky-700 via-blue-800 to-[#080f28]",
    spotlightColor: "rgba(34, 211, 238, 0.28)",
    chipText: "Stock local · Garantía de marca",
    chipIcon: ShieldCheck,
  },
  {
    id: "stationery",
    number: "02",
    category: "Librería & Suministros",
    title: "Papelería & Útiles",
    description: "Cuadernos ejecutivos, archivadores, bolígrafos finos y útiles para oficinas y empresas al por mayor.",
    linkText: "Ver catálogo de librería",
    href: "/libreria",
    theme: "stationery",
    gradientBg: "from-[#b2533e] via-[#c86d51] to-[#080f28]",
    spotlightColor: "rgba(244, 162, 97, 0.32)",
    chipText: "Venta por mayor · Útiles de oficina",
    chipIcon: Tag,
  },
  {
    id: "support",
    number: "03",
    category: "Mantenimiento & Reparación",
    title: "Soporte Técnico Especializado",
    description: "Diagnóstico preventivo, reparación de placas, repotenciación y mantenimiento corporativo directo.",
    linkText: "Solicitar soporte técnico",
    href: "https://wa.me/51990804482?text=Hola,%20deseo%20solicitar%20soporte%20t%C3%A9cnico",
    isExternal: true,
    theme: "support",
    gradientBg: "from-[#13295c] via-[#1e3a8a] to-[#080f28]",
    spotlightColor: "rgba(96, 165, 250, 0.30)",
    chipText: "Diagnóstico rápido · Servicio técnico",
    chipIcon: Wrench,
  },
  {
    id: "network",
    number: "04",
    category: "Infraestructura & Conectividad",
    title: "Redes & Conectividad",
    description: "Instalación de redes Cat 6/6A, access points Wi-Fi 6, configuración de routers y fibra óptica.",
    linkText: "Ver soluciones de red",
    href: "https://wa.me/51990804482?text=Hola,%20deseo%20consultar%20por%20redes%20y%20conectividad",
    isExternal: true,
    theme: "network",
    gradientBg: "from-[#2e1065] via-[#4338ca] to-[#080f28]",
    spotlightColor: "rgba(168, 85, 247, 0.30)",
    chipText: "Wi-Fi 6 de alta velocidad · Redes",
    chipIcon: Wifi,
  },
];

/* -------------------------------------------------------------
   Productos Protagonistas en SVG Limpio (Sin interfaces simuladas)
   Ocupan ~65% de la altura de la escena (~175px de 260px)
-------------------------------------------------------------- */

function LaptopProduct() {
  return (
    <svg
      viewBox="0 0 280 180"
      width="280"
      height="180"
      fill="none"
      className="w-auto h-[165px] sm:h-[175px] max-w-[85%] object-contain select-none pointer-events-none drop-shadow-[0_16px_24px_rgba(0,0,0,0.5)]"
      aria-label="Laptop y hardware"
    >
      <defs>
        <linearGradient id="laptopBezel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="laptopScreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="40%" stopColor="#0369a1" />
          <stop offset="80%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#080f28" />
        </linearGradient>
        <linearGradient id="laptopWave" x1="0" y1="0" x2="1" y2="0.8">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#2563eb" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="laptopBase" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="20%" stopColor="#64748b" />
          <stop offset="80%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="laptopMetalRim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      {/* Pantalla de Laptop abierta */}
      <rect x="35" y="16" width="210" height="128" rx="10" fill="url(#laptopBezel)" stroke="#475569" strokeWidth="1.5" />
      <rect x="43" y="24" width="194" height="112" rx="6" fill="url(#laptopScreen)" />
      
      {/* Fondo abstracto de pantalla (sin ventanas ni texto) */}
      <path d="M43 90 C 80 50, 130 110, 180 60 C 210 30, 230 45, 237 55 L 237 136 L 43 136 Z" fill="url(#laptopWave)" />
      <circle cx="140" cy="80" r="32" fill="#38bdf8" fillOpacity="0.15" />
      <path d="M 100 136 Q 140 100 190 136 Z" fill="#38bdf8" fillOpacity="0.12" />
      
      {/* Reflejo diagonal de cristal */}
      <path d="M44 25 L 140 25 L 44 110 Z" fill="#ffffff" fillOpacity="0.05" />
      <circle cx="140" cy="20" r="1.5" fill="#1e293b" stroke="#475569" strokeWidth="0.5" />
      <rect x="110" y="143" width="60" height="5" rx="2.5" fill="#1e293b" stroke="#475569" strokeWidth="0.8" />

      {/* Base de teclado */}
      <path d="M 18 145 L 262 145 L 272 165 C 272 168, 269 170, 265 170 L 15 170 C 11 170, 8 168, 8 165 Z" fill="url(#laptopBase)" />
      <line x1="18" y1="145" x2="262" y2="145" stroke="url(#laptopMetalRim)" strokeWidth="1.2" />
      
      {/* Zona de teclado retroiluminado */}
      <polygon points="42,148 238,148 244,158 36,158" fill="#0f172a" fillOpacity="0.7" />
      <line x1="46" y1="151" x2="234" y2="151" stroke="#94a3b8" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="6 2" />
      <line x1="43" y1="155" x2="237" y2="155" stroke="#94a3b8" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="7 2" />

      {/* Trackpad y bisel */}
      <rect x="120" y="161" width="40" height="7" rx="1.5" fill="#475569" fillOpacity="0.4" stroke="#64748b" strokeOpacity="0.5" strokeWidth="0.8" />
      <line x1="15" y1="170" x2="265" y2="170" stroke="#64748b" strokeWidth="1" />
    </svg>
  );
}

function NotebookProduct() {
  return (
    <svg
      viewBox="0 0 280 180"
      width="280"
      height="180"
      fill="none"
      className="w-auto h-[165px] sm:h-[175px] max-w-[85%] object-contain select-none pointer-events-none drop-shadow-[0_16px_24px_rgba(0,0,0,0.5)]"
      aria-label="Cuaderno ejecutivo y bolígrafo"
    >
      <defs>
        <linearGradient id="bookCover" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2e241e" />
          <stop offset="50%" stopColor="#3f3127" />
          <stop offset="100%" stopColor="#1f1814" />
        </linearGradient>
        <linearGradient id="bookPages" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f5eedc" />
          <stop offset="70%" stopColor="#fdfbf7" />
          <stop offset="100%" stopColor="#ece2ca" />
        </linearGradient>
        <linearGradient id="bookGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="penFinish" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
      </defs>

      {/* Bloque de páginas bond marfil */}
      <rect x="52" y="22" width="145" height="138" rx="10" fill="#1c1917" />
      <rect x="56" y="25" width="143" height="132" rx="6" fill="url(#bookPages)" stroke="#d5c8ad" strokeWidth="1" />
      <line x1="198" y1="32" x2="198" y2="150" stroke="#c2b18f" strokeWidth="1.5" strokeDasharray="2 2" />

      {/* Cubierta de cuero ejecutiva */}
      <rect x="44" y="18" width="148" height="144" rx="12" fill="url(#bookCover)" stroke="#614d3e" strokeWidth="1.5" />
      <rect x="44" y="18" width="18" height="144" rx="6" fill="#1e1713" stroke="#523e31" strokeWidth="1" />
      <line x1="54" y1="20" x2="54" y2="160" stroke="#d97706" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="4 3" />

      {/* Cinta marcapáginas */}
      <path d="M 115 18 L 115 174 L 123 166 L 131 174 L 131 18 Z" fill="#ea580c" stroke="#c2410c" strokeWidth="0.8" />

      {/* Emblema geométrico repujado en oro */}
      <circle cx="126" cy="82" r="24" stroke="url(#bookGold)" strokeWidth="1.5" fill="none" strokeOpacity="0.85" />
      <polygon points="126,66 138,82 126,98 114,82" stroke="url(#bookGold)" strokeWidth="1.2" fill="none" strokeOpacity="0.75" />
      <circle cx="126" cy="82" r="4" fill="url(#bookGold)" />

      {/* Esquineros metálicos dorados */}
      <path d="M 174 18 L 192 18 C 192 18, 192 36, 174 18 Z" fill="url(#bookGold)" />
      <path d="M 174 162 L 192 162 C 192 162, 192 144, 174 162 Z" fill="url(#bookGold)" />

      {/* Bolígrafo de alta gama descansando al costado */}
      <g transform="rotate(18, 218, 90)">
        <rect x="214" y="16" width="12" height="144" rx="6" fill="#000000" fillOpacity="0.35" />
        <rect x="216" y="14" width="10" height="146" rx="5" fill="url(#penFinish)" stroke="#475569" strokeWidth="0.8" />
        <rect x="215" y="68" width="12" height="4" rx="1" fill="url(#bookGold)" />
        <rect x="215" y="14" width="12" height="8" rx="2" fill="url(#bookGold)" />
        <path d="M 218 20 L 218 58 C 218 60, 222 60, 222 58 L 222 20 Z" fill="url(#bookGold)" />
        <polygon points="217,160 225,160 221,170" fill="url(#bookGold)" />
        <polygon points="220,168 222,168 221,172" fill="#0f172a" />
      </g>
    </svg>
  );
}

function TechSupportProduct() {
  return (
    <svg
      viewBox="0 0 280 180"
      width="280"
      height="180"
      fill="none"
      className="w-auto h-[165px] sm:h-[175px] max-w-[85%] object-contain select-none pointer-events-none drop-shadow-[0_16px_24px_rgba(0,0,0,0.5)]"
      aria-label="Herramientas y soporte técnico"
    >
      <defs>
        <linearGradient id="supportBase" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#090d16" />
        </linearGradient>
        <linearGradient id="supportCircuit" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="supportMetal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>

      {/* Placa base técnica de diagnóstico */}
      <rect x="30" y="38" width="220" height="118" rx="16" fill="url(#supportBase)" stroke="#334155" strokeWidth="1.8" />
      
      {/* Procesador y socket central */}
      <rect x="78" y="58" width="74" height="74" rx="10" fill="#0f172a" stroke="#2563eb" strokeWidth="2" />
      <rect x="88" y="68" width="54" height="54" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.2" />
      <circle cx="115" cy="95" r="16" fill="none" stroke="url(#supportCircuit)" strokeWidth="2" strokeDasharray="6 4" />
      <circle cx="115" cy="95" r="6" fill="#38bdf8" fillOpacity="0.9" />
      
      {/* Pistas de circuitos limpios */}
      <path d="M 48 70 L 78 70 M 48 85 L 78 85 M 48 100 L 78 100 M 48 115 L 78 115" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.75" strokeLinecap="round" />
      <circle cx="48" cy="70" r="2.5" fill="#38bdf8" />
      <circle cx="48" cy="100" r="2.5" fill="#38bdf8" />

      <path d="M 115 58 L 115 46 M 130 58 L 130 46 M 100 58 L 100 46" stroke="#2563eb" strokeWidth="1.5" strokeOpacity="0.75" strokeLinecap="round" />

      {/* Módulos RAM */}
      <rect x="164" y="58" width="10" height="74" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" />
      <rect x="180" y="58" width="10" height="74" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" />
      <rect x="166" y="62" width="6" height="66" rx="1" fill="#38bdf8" fillOpacity="0.35" />
      <rect x="182" y="62" width="6" height="66" rx="1" fill="#2563eb" fillOpacity="0.45" />

      {/* Destornillador de precisión eléctrica cruzando a la derecha */}
      <g transform="rotate(-28, 200, 95)">
        <rect x="194" y="20" width="16" height="95" rx="8" fill="url(#supportMetal)" stroke="#94a3b8" strokeWidth="1" />
        <rect x="193" y="45" width="18" height="3" rx="1.5" fill="#0f172a" />
        <rect x="193" y="55" width="18" height="3" rx="1.5" fill="#0f172a" />
        <rect x="193" y="65" width="18" height="3" rx="1.5" fill="#0f172a" />
        <circle cx="202" cy="35" r="3.5" fill="#38bdf8" />
        <rect x="198" y="115" width="8" height="20" rx="2" fill="#475569" />
        <rect x="200" y="135" width="4" height="28" rx="1" fill="url(#supportMetal)" stroke="#cbd5e1" strokeWidth="0.5" />
        <polygon points="199,163 205,163 203,172 201,172" fill="#38bdf8" />
      </g>

      {/* Pinza antiestática de precisión */}
      <g transform="rotate(18, 55, 45)">
        <path d="M 46 16 L 49 70 L 52 70 L 54 16 Z" fill="url(#supportMetal)" stroke="#94a3b8" strokeWidth="0.8" />
        <path d="M 54 16 L 56 70 L 59 70 L 62 16 Z" fill="url(#supportMetal)" stroke="#94a3b8" strokeWidth="0.8" />
      </g>
    </svg>
  );
}

function NetworkingProduct() {
  return (
    <svg
      viewBox="0 0 280 180"
      width="280"
      height="180"
      fill="none"
      className="w-auto h-[165px] sm:h-[175px] max-w-[85%] object-contain select-none pointer-events-none drop-shadow-[0_16px_24px_rgba(0,0,0,0.5)]"
      aria-label="Router Wi-Fi 6 y conectividad"
    >
      <defs>
        <linearGradient id="netChassis" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2e1065" />
          <stop offset="40%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#0a081e" />
        </linearGradient>
        <linearGradient id="netAntenna" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="netAccent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>

      {/* 4 Antenas de alta ganancia */}
      <g transform="rotate(-18, 48, 105)">
        <rect x="44" y="16" width="8" height="90" rx="4" fill="url(#netAntenna)" stroke="#475569" strokeWidth="1" />
        <line x1="48" y1="20" x2="48" y2="60" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      <rect x="96" y="10" width="8" height="95" rx="4" fill="url(#netAntenna)" stroke="#475569" strokeWidth="1" />
      <line x1="100" y1="15" x2="100" y2="60" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />

      <rect x="176" y="10" width="8" height="95" rx="4" fill="url(#netAntenna)" stroke="#475569" strokeWidth="1" />
      <line x1="180" y1="15" x2="180" y2="60" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />

      <g transform="rotate(18, 232, 105)">
        <rect x="228" y="16" width="8" height="90" rx="4" fill="url(#netAntenna)" stroke="#475569" strokeWidth="1" />
        <line x1="232" y1="20" x2="232" y2="60" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Cuerpo aerodinámico del Router Wi-Fi 6 */}
      <path d="M 32 118 L 62 92 L 218 92 L 248 118 L 240 148 C 240 152, 236 155, 230 155 L 50 155 C 44 155, 40 152, 40 148 Z" fill="url(#netChassis)" stroke="#4c1d95" strokeWidth="1.8" />
      
      <polygon points="68,96 212,96 226,114 54,114" fill="#0f0b29" stroke="#6d28d9" strokeWidth="1" />
      <path d="M 120 100 L 160 100 L 152 110 L 128 110 Z" fill="url(#netAccent)" fillOpacity="0.75" />

      {/* Panel frontal de micro-LEDs de estado */}
      <rect x="80" y="128" width="120" height="12" rx="6" fill="#09061a" stroke="#3b0764" strokeWidth="1" />
      <circle cx="95" cy="134" r="2.5" fill="#22d3ee" />
      <circle cx="115" cy="134" r="2.5" fill="#34d399" />
      <circle cx="135" cy="134" r="2.5" fill="#c084fc" />
      <circle cx="155" cy="134" r="2.5" fill="#c084fc" />
      <circle cx="175" cy="134" r="2.5" fill="#22d3ee" />

      <line x1="45" y1="152" x2="235" y2="152" stroke="url(#netAccent)" strokeWidth="1.5" strokeOpacity="0.7" />
    </svg>
  );
}

/* -------------------------------------------------------------
   Componente Principal: HeroServicesCarousel
-------------------------------------------------------------- */

export const HeroServicesCarousel: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [progress, setProgress] = useState(0);

  // Estados de hardware y accesibilidad
  const [isDesktop, setIsDesktop] = useState(false);
  const [isLowSpec, setIsLowSpec] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);

  // Referencias para 3D tilt & lerp
  const cardRef = useRef<HTMLDivElement>(null);
  const targetTilt = useRef({ rx: 0, ry: 0, mx: 50, my: 50 });
  const currentTilt = useRef({ rx: 0, ry: 0, mx: 50, my: 50 });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50 });

  // Detección de specs y tamaño
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const concurrency = typeof navigator !== "undefined" && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 8;
    setIsLowSpec(mediaQuery.matches || concurrency <= 4);

    const handleVisibility = () => {
      setIsTabHidden(document.visibilityState === "hidden");
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("resize", checkDesktop);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Bucle de lerp para el tilt suave (~150ms)
  useEffect(() => {
    let animId: number;
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const updateTilt = () => {
      currentTilt.current.rx = lerp(currentTilt.current.rx, targetTilt.current.rx, 0.15);
      currentTilt.current.ry = lerp(currentTilt.current.ry, targetTilt.current.ry, 0.15);
      currentTilt.current.mx = lerp(currentTilt.current.mx, targetTilt.current.mx, 0.15);
      currentTilt.current.my = lerp(currentTilt.current.my, targetTilt.current.my, 0.15);

      setTilt({
        rx: Number(currentTilt.current.rx.toFixed(2)),
        ry: Number(currentTilt.current.ry.toFixed(2)),
        mx: Number(currentTilt.current.mx.toFixed(2)),
        my: Number(currentTilt.current.my.toFixed(2)),
      });

      animId = requestAnimationFrame(updateTilt);
    };

    animId = requestAnimationFrame(updateTilt);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDesktop || isLowSpec) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    targetTilt.current = {
      rx: -((y - 0.5) * 16),
      ry: (x - 0.5) * 16,
      mx: x * 100,
      my: y * 100,
    };
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    targetTilt.current = { rx: 0, ry: 0, mx: 50, my: 50 };
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Navegación entre slides
  const goToSlide = useCallback((index: number, dir?: 1 | -1) => {
    setDirection(dir !== undefined ? dir : index > activeSlide ? 1 : -1);
    setActiveSlide((index + slides.length) % slides.length);
    setProgress(0);
  }, [activeSlide]);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setActiveSlide((prev) => (prev + 1) % slides.length);
    setProgress(0);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  }, []);

  // Autoplay de 5 segundos con pausa en hover, foco y pestaña oculta
  useEffect(() => {
    if (isLowSpec) return;
    const isPaused = isHovered || isFocused || isTabHidden;
    if (isPaused) return;

    const intervalTime = 50;
    const totalTime = 5000;
    const step = (intervalTime / totalTime) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          nextSlide();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isLowSpec, isHovered, isFocused, isTabHidden, nextSlide]);

  // Gestos táctiles
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 40) {
      prevSlide();
    } else if (deltaX < -40) {
      nextSlide();
    }
    touchStartX.current = null;
  };

  // Teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    }
  };

  const current = slides[activeSlide];

  // Variantes para la transición del Producto Protagonista
  const productVariants: Variants = {
    enter: (dir: number) => ({
      opacity: 0,
      scale: 0.94,
      x: dir > 0 ? 30 : -30,
    }),
    center: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: isLowSpec ? 0.25 : 0.4,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
    exit: (dir: number) => ({
      opacity: 0,
      scale: 0.94,
      x: dir > 0 ? -30 : 30,
      transition: {
        duration: isLowSpec ? 0.2 : 0.3,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };

  return (
    <div
      className="relative w-full max-w-[600px] group/hero-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* CUBO DEL LOGO: Esquina SUPERIOR IZQUIERDA
          96px en escritorio (-top-6 -left-6 sobresale ~24px)
          64px en móvil (-top-4 -left-4 sobresale ~16px)
          Con borde luminoso y rotación 3D sutil */}
      <div
        className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 z-30 pointer-events-none select-none"
        style={{
          transform: isDesktop && !isLowSpec
            ? `translate3d(${tilt.ry * 0.25}px, ${tilt.rx * 0.25}px, 25px)`
            : undefined,
        }}
      >
        <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-[20px] sm:rounded-[26px] p-0.5 bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-600 shadow-[0_15px_40px_-5px_rgba(59,130,246,0.5)] rotate-3">
          <div className="w-full h-full rounded-[18px] sm:rounded-[24px] bg-slate-950 p-2 sm:p-3.5 flex items-center justify-center overflow-hidden -rotate-3 relative z-10">
            <img
              src="/assets/branding/nb-isotype.png"
              alt="Isotipo de Nova Bytex S.R.L."
              width={72}
              height={72}
              className="w-full h-full object-contain filter drop-shadow(0 4px 8px rgba(0,0,0,0.6))"
            />
          </div>
          <div className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-blue-400/50 -z-10" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-cyan-400/50 -z-10 blur-[1px]" />
        </div>
      </div>

      {/* FLECHAS DE NAVEGACIÓN LATERALES (44px, con fade de opacidad en hover) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        aria-label="Servicio anterior"
        className="absolute left-3 z-50 w-11 h-11 rounded-full bg-white text-slate-900 border border-slate-200/90 shadow-md flex items-center justify-center transition-opacity duration-200 ease-in-out cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:opacity-100 hidden sm:flex opacity-0 pointer-events-none group-hover/hero-card:opacity-100 group-hover/hero-card:pointer-events-auto group-focus-within/hero-card:opacity-100 group-focus-within/hero-card:pointer-events-auto hover:bg-slate-50 active:scale-95"
        style={{ top: "calc(50% - 22px)" }}
      >
        <ChevronLeft width={18} height={18} strokeWidth={2} className="w-[18px] h-[18px]" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        aria-label="Servicio siguiente"
        className="absolute right-3 z-50 w-11 h-11 rounded-full bg-white text-slate-900 border border-slate-200/90 shadow-md flex items-center justify-center transition-opacity duration-200 ease-in-out cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:opacity-100 hidden sm:flex opacity-0 pointer-events-none group-hover/hero-card:opacity-100 group-hover/hero-card:pointer-events-auto group-focus-within/hero-card:opacity-100 group-focus-within/hero-card:pointer-events-auto hover:bg-slate-50 active:scale-95"
        style={{ top: "calc(50% - 22px)" }}
      >
        <ChevronRight width={18} height={18} strokeWidth={2} className="w-[18px] h-[18px]" />
      </button>

      {/* TARJETA DEL CARRUSEL: ancho 100% (máx 600px), altura fija 560px, radio 28px, flex column */}
      <div
        ref={cardRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseMove={handleMouseMove}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Carrusel de Servicios Nova Bytex"
        className={cn(
          "relative w-full rounded-[28px] overflow-hidden select-none outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-shadow duration-300",
          "h-[560px] flex flex-col justify-between",
          "border border-slate-200/80 shadow-2xl bg-[#080f28]"
        )}
        style={{
          perspective: "1000px",
        }}
      >
        {/* Contenedor 3D con tilt */}
        <div
          className="relative w-full h-full flex flex-col justify-between transition-transform duration-75 ease-out"
          style={{
            transform: isDesktop && !isLowSpec ? `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` : undefined,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Reflejo radial blanco (glare) sutil */}
          {isDesktop && !isLowSpec && (
            <div
              className="pointer-events-none absolute inset-0 z-40 rounded-[28px]"
              style={{
                background: `radial-gradient(circle 350px at ${tilt.mx}% ${tilt.my}%, rgba(255, 255, 255, 0.10) 0%, transparent 80%)`,
              }}
            />
          )}

          {/* FONDO SUAVE DEL TEMA */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br transition-all duration-700 -z-30 pointer-events-none",
              current.gradientBg
            )}
          />

          {/* 1) CABECERA (56px de altura)
              padding-left: 60px en móvil, 88px en escritorio (para que el cubo nunca la cubra) */}
          <div className="h-14 pt-5 sm:pt-6 px-6 pl-[60px] sm:pl-[88px] flex items-center justify-between gap-3 relative z-20 shrink-0 select-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-bold tracking-wider uppercase text-white shadow-sm whitespace-nowrap shrink-0 pointer-events-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" />
              Nuestros Servicios
            </span>

            {/* Barra segmentada (máx 160px) y contador */}
            <div className="flex items-center gap-2.5 max-w-[160px] shrink-0 pointer-events-auto">
              <div className="flex items-center gap-1.5 flex-1">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToSlide(i);
                    }}
                    aria-label={`Ir al servicio ${i + 1}`}
                    className="flex-1 h-1 rounded-full bg-white/25 overflow-hidden cursor-pointer hover:bg-white/40 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
                  >
                    <div
                      className="h-full bg-white transition-all duration-75"
                      style={{
                        width:
                          i === activeSlide
                            ? `${progress}%`
                            : i < activeSlide
                              ? "100%"
                              : "0%",
                      }}
                    />
                  </button>
                ))}
              </div>

              <span className="font-mono text-[12px] font-semibold text-white/90 tabular-nums whitespace-nowrap">
                0{activeSlide + 1} / 0{slides.length}
              </span>
            </div>
          </div>

          {/* 2) ESCENA DE ALTURA FIJA (~260px)
              Máximo 4 elementos por slide:
              1. Fondo: un único spotlight radial del color del slide (sin anillos ni partículas)
              2. Número "01": serif, 120px, opacidad 8%, completo, detrás del producto
              3. Producto: UNA sola imagen/SVG protagonista (~65% altura), centrada con drop-shadow y tilt
              4. Chip frontal: UNO solo, de una línea, fondo sólido, en esquina inferior derecha */}
          <div className="relative h-[260px] shrink-0 w-full flex items-center justify-center overflow-visible z-10 px-6">
            {/* 1. Fondo: Único spotlight radial sin partículas */}
            <div
              className="absolute inset-0 pointer-events-none -z-10"
              style={{
                background: `radial-gradient(circle 260px at 50% 50%, ${current.spotlightColor} 0%, transparent 75%)`,
              }}
            />

            {/* 2. Número "01": serif, 120px, opacidad 8%, detrás del producto */}
            <div className="absolute top-2 left-6 font-serif font-bold text-[120px] text-white/[0.08] leading-none pointer-events-none select-none z-0">
              {current.number}
            </div>

            {/* 3. Producto Protagonista: Centrado, ~65% altura de la escena (~175px), drop-shadow y parallax */}
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={current.id}
                custom={direction}
                variants={productVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none"
                style={{
                  transform: isDesktop && !isLowSpec
                    ? `translate3d(${tilt.ry * 0.45}px, ${tilt.rx * 0.45}px, 20px)`
                    : undefined,
                }}
              >
                {current.theme === "tech" && <LaptopProduct />}
                {current.theme === "stationery" && <NotebookProduct />}
                {current.theme === "support" && <TechSupportProduct />}
                {current.theme === "network" && <NetworkingProduct />}
              </motion.div>
            </AnimatePresence>

            {/* 4. Chip frontal: UNO solo, una sola línea, nowrap, fondo sólido, esquina inferior derecha */}
            <div className="absolute bottom-3 right-6 z-20 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 border border-white/20 text-white text-xs font-semibold shadow-lg whitespace-nowrap pointer-events-auto">
              {React.createElement(current.chipIcon, {
                className: "w-3.5 h-3.5 text-cyan-300 shrink-0",
              })}
              <span>{current.chipText}</span>
            </div>
          </div>

          {/* 3) BLOQUE DE TEXTO CON DEGRADADO
              Empieza donde termina la escena. Aire mínimo de 24px entre producto, chip y texto */}
          <div className="relative z-20 pt-4 pb-7 px-7 flex flex-col justify-start gap-2 select-none shrink-0">
            {/* Fondo con degradado vertical que inicia en el borde superior de esta zona */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#080f28]/95 via-[#080f28]/85 to-transparent pointer-events-none" />

            <span className="text-[12px] font-bold text-cyan-400 tracking-[0.08em] uppercase block">
              {current.category}
            </span>

            <h3 className="text-[24px] sm:text-[26px] font-semibold text-white tracking-tight leading-snug">
              {current.title}
            </h3>

            <p className="text-[14px] sm:text-[15px] text-white/90 leading-[1.5] line-clamp-2 max-w-xl">
              {current.description}
            </p>

            {/* CTA SÓLIDO DE 44px (fondo blanco, texto oscuro, icono de 16px) */}
            <div className="pt-2">
              {current.isExternal ? (
                <a
                  href={current.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 px-6 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-[14px] shadow-lg inline-flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 pointer-events-auto cursor-pointer"
                >
                  <span>{current.linkText}</span>
                  <ArrowRight className="w-4 h-4 text-blue-700" />
                </a>
              ) : (
                <Link
                  href={current.href}
                  className="h-11 px-6 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-[14px] shadow-lg inline-flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 pointer-events-auto cursor-pointer"
                >
                  <span>{current.linkText}</span>
                  <ArrowRight className="w-4 h-4 text-blue-700" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroServicesCarousel;
