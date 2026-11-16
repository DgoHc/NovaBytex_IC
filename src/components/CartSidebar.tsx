"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  ArrowRight,
  Tag,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useCart, CartItem } from "@/contexts/CartContext";
import { type Coupon } from "@/lib/coupons";
import { Button } from "@/components/ui/button";
import { PRODUCTS_DATA } from "@/lib/products";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCatalog } from "@/contexts/CatalogContext";
import { useAuth } from "@/contexts/AuthContext";
import { getActiveReferralCode } from "@/lib/affiliateTracking";
import { AffiliateService } from "@/services/AffiliateService";
import { cn } from "@/lib/utils";

const openWhatsAppOrder = (
  cart: CartItem[],
  subtotal: number,
  appliedCoupon: Coupon | null,
  discountAmount: number,
  finalTotal: number,
  referralCode?: string | null
) => {
  let message = "¡Hola Nova Bytex! Quisiera solicitar la cotización de los siguientes productos:\n\n";

  cart.forEach((item) => {
    const price = item.price || 0;
    message += `• [${item.quantity}x] ${item.name} - S/ ${(price * item.quantity).toLocaleString("es-PE")}\n`;
  });

  const igv = (subtotal - discountAmount) * 0.18;

  message += `\nSubtotal: S/ ${subtotal.toLocaleString("es-PE")}`;

  if (appliedCoupon && discountAmount > 0) {
    message += `\nCupón Aplicado: ${appliedCoupon.name} (${appliedCoupon.badge}) (-S/ ${discountAmount.toLocaleString("es-PE")})`;
    message += `\nSubtotal con Descuento: S/ ${(subtotal - discountAmount).toLocaleString("es-PE")}`;
  }

  message += `\nIGV (18%): S/ ${igv.toLocaleString("es-PE")}`;
  message += `\nTotal Estimado: S/ ${finalTotal.toLocaleString("es-PE")}`;

  if (referralCode) {
    message += `\nCódigo de Afiliado: ${referralCode}`;
  }

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/51990804482?text=${encodedMessage}`, "_blank");
};

export function CartSidebar() {
  const {
    cart,
    isCartOpen,
    toggleCart,
    clearCart,
    cartTotal,
    cartCount,
    appliedCoupon,
    discountAmount,
    finalTotal,
    availableCoupons,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { user } = useAuth();
  const [activeRefCode, setActiveRefCode] = useState<string | null>(null);
  const [couponsDropdownOpen, setCouponsDropdownOpen] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isCartOpen) {
      setActiveRefCode(getActiveReferralCode());
    }
  }, [isCartOpen]);

  const formatPrice = (amount: number) => {
    return `S/ ${amount.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleApplyCoupon = (coupon: Coupon) => {
    const res = applyCoupon(coupon);
    setCouponFeedback(res.message);
    if (res.success) {
      setCouponsDropdownOpen(false);
    }
    setTimeout(() => setCouponFeedback(null), 3500);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 h-[100dvh] w-full sm:max-w-md bg-slate-900 border-l border-white/[0.08] text-white shadow-2xl z-50 flex flex-col"
          >
            {/* Encabezado compacto (64px) */}
            <div className="h-16 shrink-0 px-5 border-b border-white/[0.08] bg-slate-950 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white leading-tight">Carrito de Compras</h2>
                <span className="text-xs text-slate-400">
                  {cartCount} {cartCount === 1 ? "ítem" : "ítems"}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleCart}
                aria-label="Cerrar carrito"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de productos (Zona protagonista: flex: 1, min-height: 0, overflow-y: auto) */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2 no-scrollbar">
              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center p-6"
                >
                  <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center border border-slate-800 mb-3 text-slate-600">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">Tu carrito de compras está vacío</h3>
                  <p className="text-xs text-slate-400 mb-5">Explora el catálogo para agregar equipos, licencias o útiles</p>
                  <Button
                    onClick={toggleCart}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-9 px-5 rounded-xl cursor-pointer"
                  >
                    Ver Productos <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </motion.div>
              ) : (
                cart.map((item) => <CartItemCard key={item.id} item={item} />)
              )}
            </div>

            {/* Pie compacto, siempre visible, con borde sutil de 8% de opacidad */}
            {cart.length > 0 && (
              <div className="shrink-0 p-4 border-t border-white/[0.08] bg-slate-950 space-y-3">
                {/* Cupones */}
                {appliedCoupon ? (
                  // Cupón aplicado: Una sola línea con nombre y X para quitarlo
                  <div className="h-11 px-3.5 flex items-center justify-between rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Tag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-semibold text-emerald-300 truncate">
                        {appliedCoupon.name}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 rounded shrink-0">
                        {appliedCoupon.badge}
                      </span>
                      {discountAmount > 0 && (
                        <span className="text-[11px] font-mono text-emerald-400/90 shrink-0">
                          (-{formatPrice(discountAmount)})
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-white hover:bg-emerald-900/40 transition-colors shrink-0 cursor-pointer"
                      aria-label="Quitar cupón"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  // Cupones disponibles
                  <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden">
                    {/* Fila cerrada de 44px */}
                    <button
                      type="button"
                      onClick={() => setCouponsDropdownOpen(!couponsDropdownOpen)}
                      className="w-full h-11 px-3.5 flex items-center justify-between hover:bg-slate-800/60 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-xs font-semibold text-white">¿Tienes un cupón?</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="text-xs font-mono">{availableCoupons.length}</span>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            couponsDropdownOpen && "rotate-180"
                          )}
                        />
                      </div>
                    </button>

                    {/* Lista abierta: max-height 180px con scroll interno */}
                    <AnimatePresence>
                      {couponsDropdownOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-800 max-h-[180px] overflow-y-auto divide-y divide-slate-800/50 no-scrollbar"
                        >
                          {availableCoupons.map((coupon) => {
                            const canUse = coupon.minPurchase === 0 || cartTotal >= coupon.minPurchase;

                            return (
                              <div
                                key={coupon.id}
                                className={cn(
                                  "h-[52px] px-3.5 flex items-center justify-between gap-2 transition-colors",
                                  canUse ? "hover:bg-slate-800/40" : "opacity-50"
                                )}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-xs font-semibold text-white truncate">
                                    {coupon.name}
                                  </span>
                                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 rounded shrink-0">
                                    {coupon.badge}
                                  </span>
                                </div>

                                {canUse ? (
                                  <button
                                    type="button"
                                    onClick={() => handleApplyCoupon(coupon)}
                                    className="h-8 px-3 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shrink-0 transition-colors cursor-pointer"
                                  >
                                    Aplicar
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-400 font-mono shrink-0">
                                    Min. S/ {coupon.minPurchase}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {couponFeedback && (
                  <div className="px-3 py-1.5 bg-blue-950/80 border border-blue-900/50 rounded-lg text-[11px] text-blue-200 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>{couponFeedback}</span>
                  </div>
                )}

                {/* Fila única de Total */}
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-sm font-semibold text-slate-300">Total</span>
                  <span className="text-2xl font-bold font-mono text-white leading-none">
                    {formatPrice(finalTotal)}
                  </span>
                </div>

                {activeRefCode && (
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Ref: <strong className="font-mono">{activeRefCode}</strong>
                    </span>
                    <span className="text-[10px] text-blue-400">Atribuido</span>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="space-y-2 pt-1">
                  <Button
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer"
                    onClick={async () => {
                      const refCode = getActiveReferralCode();
                      if (refCode && cart.length > 0) {
                        const summary = cart.map((i) => `${i.quantity}x ${i.name}`).join(", ");
                        const orderId = `NB-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
                        await AffiliateService.createReferral({
                          affiliateCode: refCode,
                          orderId,
                          finalPaidAmount: finalTotal,
                          productSummary: summary,
                          buyerEmail: user?.email,
                          buyerId: user?.id,
                        });
                      }
                      openWhatsAppOrder(
                        cart,
                        cartTotal,
                        appliedCoupon,
                        discountAmount,
                        finalTotal,
                        refCode
                      );
                    }}
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>Enviar Cotización a WhatsApp</span>
                  </Button>

                  <button
                    type="button"
                    onClick={clearCart}
                    className="w-full text-center text-xs text-slate-400 hover:text-slate-200 transition-colors py-1 cursor-pointer bg-transparent border-0"
                  >
                    Vaciar Carrito
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CartItemCard({ item }: { item: CartItem }) {
  const { removeFromCart, updateQuantity } = useCart();
  const { products } = useCatalog();
  const matched =
    products.find((p) => p.id === item.id) ?? PRODUCTS_DATA.find((p) => p.id === item.id);
  const imageType = matched ? matched.imageType : "switch";

  const formatPrice = (amount: number) => {
    return `S/ ${amount.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const itemPrice = item.price || 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="relative flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-white/[0.06] hover:border-white/[0.12] transition-colors"
    >
      {/* Miniatura 56x56 con fondo claro (#F4F6F9) y object-fit: contain */}
      <div className="w-14 h-14 rounded-lg bg-[#F4F6F9] shrink-0 p-1 flex items-center justify-center overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <ProductImage
            type={imageType}
            name={item.name}
            className="w-full h-full !min-h-0 text-[8px]"
          />
        )}
      </div>

      {/* Contenido: Nombre (máx 2 líneas), precio y selector de cantidad */}
      <div className="flex-1 min-w-0 pr-6">
        <h4 className="text-xs font-semibold text-white leading-tight line-clamp-2" title={item.name}>
          {item.name}
        </h4>

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="font-mono font-bold text-xs text-blue-400">
            {formatPrice(itemPrice * item.quantity)}
          </span>

          {/* Selector de cantidad compacto */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-md p-0.5">
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Disminuir cantidad"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-5 text-center text-xs font-mono font-bold text-white">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Papelera pequeña (18px), gris, alineada arriba a la derecha */}
      <button
        type="button"
        onClick={() => removeFromCart(item.id)}
        className="absolute top-2.5 right-2.5 w-[18px] h-[18px] text-slate-400 hover:text-rose-400 transition-colors flex items-center justify-center cursor-pointer"
        aria-label="Eliminar producto"
      >
        <Trash2 className="w-[18px] h-[18px]" />
      </button>
    </motion.div>
  );
}
