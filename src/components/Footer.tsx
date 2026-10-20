import React from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/Nova-Bytex-SRL-1708431966134505/",
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/novabytex/",
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
];

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-3 text-white font-extrabold text-xl tracking-tight select-none"
            >
              <div className="h-10 w-10 flex items-center justify-center shrink-0">
                <img
                  src="/assets/branding/nb-isotype.png"
                  alt="Isotipo de Nova Bytex S.R.L."
                  loading="lazy"
                  className="h-9 w-auto object-contain block"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-wider text-white leading-none">
                  NOVA BYTEX
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mt-1 leading-none">
                  Tecnología &amp; Papelería
                </span>
              </div>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Comercialización de productos de tecnología, servicios técnicos y asesoría.
            </p>
            <div className="flex gap-2 pt-1">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                  className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 h-9 w-9 rounded-[8px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Contacto & Ubicación */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Ubicación &amp; Contacto
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Av. Vía Universitaria S/N, Sector La Base II, Cajamarca
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Lunes a viernes: 7:00 a. m. a 1:00 p. m. y 3:00 p. m. a 7:00 p. m.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <a
                  href="https://wa.me/51990804482"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 transition-colors"
                >
                  +51 990 804 482 (WhatsApp)
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>nbytex@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Navegación Rápida */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Navegación
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-cyan-400 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/libreria" className="hover:text-cyan-400 transition-colors">
                  Papelería &amp; Librería
                </Link>
              </li>
              <li>
                <Link href="/productos" className="hover:text-cyan-400 transition-colors">
                  Catálogo Tecnología TI
                </Link>
              </li>
              <li>
                <Link href="/servicios" className="hover:text-cyan-400 transition-colors">
                  Servicios TI &amp; Redes
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="hover:text-cyan-400 transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-cyan-400 transition-colors">
                  Contacto &amp; Cotizaciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Métodos de Pago y Facturación */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Métodos de Pago
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Aceptamos los principales medios de pago en todo el Perú:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] font-semibold bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-[6px]">
                Yape
              </span>
              <span className="text-[11px] font-semibold bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-[6px]">
                Plin
              </span>
              <span className="text-[11px] font-semibold bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-[6px]">
                Transferencia BCP / BBVA
              </span>
              <span className="text-[11px] font-semibold bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-[6px]">
                Tarjetas Visa / Mastercard
              </span>
            </div>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Emitimos Factura electrónica (RUC 20) y Boleta</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/60 pt-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 Nova Bytex S.R.L. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Términos de Servicio</span>
            <span className="hover:underline cursor-pointer">Política de Privacidad</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
