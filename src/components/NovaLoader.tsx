"use client";

import { AnimatePresence, motion } from "framer-motion";

export function NovaLoader({
  visible,
  fadingOut,
}: {
  visible: boolean;
  fadingOut: boolean;
}) {
  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key="nova-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: fadingOut ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] as const }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50/90 backdrop-blur-[2px]"
        >
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.96 }}
            animate={{ opacity: fadingOut ? 0 : 1, y: fadingOut ? -16 : 0, scale: fadingOut ? 0.98 : 1 }}
            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] as const }}
            className="flex flex-col items-center"
          >
            <div className="relative flex h-20 w-20 items-center justify-center rounded-[24px] border border-blue-100 bg-white shadow-[0_20px_60px_rgba(29,78,216,0.12)]">
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.82, 1, 0.82] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="relative h-12 w-12"
              >
                <span className="absolute left-2 top-1 h-10 w-1.5 rounded-full bg-blue-700" />
                <span className="absolute right-2 top-1 h-10 w-1.5 rounded-full bg-blue-700" />
                <span className="absolute left-2 top-1 h-1.5 w-8 rotate-[32deg] rounded-full bg-blue-700" />
                <span className="absolute left-[32%] top-1.5 h-8 w-1.5 rotate-[10deg] rounded-full bg-blue-700" />
                <span className="absolute inset-x-2 bottom-1 h-1.5 rounded-full bg-blue-400/40" />
              </motion.div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-slate-500">
                Nova Bytex
              </p>
              <p className="mt-2 text-xs font-medium tracking-[0.24em] text-blue-700/80">
                CARGANDO
              </p>
            </div>

            <div className="mt-5 h-1.5 w-40 overflow-hidden rounded-full bg-slate-200">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.6, ease: "linear", repeat: Infinity }}
                className="h-full w-1/2 rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
