import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    )
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    )
  },
  {
    name: "X",
    href: "https://x.com",
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    )
  }
];

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-white font-extrabold text-xl tracking-tight">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <Cpu className="w-5 h-5" />
              </div>
              <span>Nova Bytex</span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Soluciones integrales de tecnología empresarial, infraestructura TI, redes y ciberseguridad con garantía oficial.
            </p>
            <div className="flex gap-2 pt-1">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                >
                  <Button variant="ghost" size="icon" className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 h-9 w-9 rounded-xl">
                    {item.icon}
                  </Button>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Navegación</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/" className="hover:text-cyan-400 transition-colors">Inicio</Link></li>
              <li><Link href="/productos" className="hover:text-cyan-400 transition-colors">Catálogo de Productos</Link></li>
              <li><Link href="/servicios" className="hover:text-cyan-400 transition-colors">Servicios TI</Link></li>
              <li><Link href="/nosotros" className="hover:text-cyan-400 transition-colors">Sobre Nosotros</Link></li>
              <li><Link href="/contacto" className="hover:text-cyan-400 transition-colors">Contacto & Cotización</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Servicios Clave</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/servicios" className="hover:text-cyan-400 transition-colors">Venta & Importación TI</Link></li>
              <li><Link href="/servicios" className="hover:text-cyan-400 transition-colors">Mesa de Ayuda 24/7</Link></li>
              <li><Link href="/servicios" className="hover:text-cyan-400 transition-colors">Infraestructura & Servidores</Link></li>
              <li><Link href="/servicios" className="hover:text-cyan-400 transition-colors">Ciberseguridad Fortinet</Link></li>
              <li><Link href="/servicios" className="hover:text-cyan-400 transition-colors">Redes Cisco & Aruba</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Contacto Directo</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>nbytex@gmail.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>+51 990 804 482</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Av. Vía Universitaria S/N.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/60 pt-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} Nova Bytex S.A.C. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Términos de Servicio</span>
            <span className="hover:underline cursor-pointer">Política de Privacidad</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
