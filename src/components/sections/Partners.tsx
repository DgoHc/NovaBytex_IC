"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Mostrar niveles de partner solo si están documentados y vigentes
const partners = [
  { name: "Cisco Systems" },
  { name: "Dell Technologies" },
  { name: "Fortinet" },
  { name: "HP Aruba Networks" },
  { name: "Lenovo ThinkPad" },
  { name: "Mikrotik RouterOS" },
  { name: "Ubiquiti UniFi" },
  { name: "VMware Broadcom" }
];

export const Partners = () => {
  const [mounted, setMounted] = useState(false);
  const marqueeItems = [...partners, ...partners];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden border-y border-slate-800 bg-slate-900 py-20">
      <div className="container mx-auto mb-10 max-w-3xl px-4 text-center lg:mb-12">
        <motion.h2
          initial={mounted ? { opacity: 0, y: 10, scale: 0.98 } : false}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mb-3 font-editorial text-3xl font-medium leading-[1.25] tracking-[-0.015em] text-white md:text-4xl"
        >
          Marcas que distribuimos
        </motion.h2>
        <p className="text-sm font-normal leading-relaxed text-slate-400 md:text-base">
          Equipos de Cisco, Dell, Fortinet, HP Aruba, Lenovo, Mikrotik, Ubiquiti y VMware.
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-[1600px] overflow-hidden px-0">
        <div className="absolute bottom-0 left-0 top-0 z-10 w-24 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 right-0 top-0 z-10 w-24 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none" />

        <div className="marquee-track flex w-max items-center gap-5 py-3">
          {marqueeItems.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="partner-card flex min-w-[185px] shrink-0 flex-col items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-800/60 px-7 py-5 shadow-md transition-all duration-300 hover:border-blue-500/40"
            >
              <span className="text-lg font-semibold tracking-tight text-slate-200 transition-colors duration-300 hover:text-blue-400">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
