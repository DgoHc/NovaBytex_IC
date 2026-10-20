"use client";

import React, { useState } from "react";
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
  ChevronUp,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { useCart, CartItem } from "@/contexts/CartContext";
import { type Coupon } from "@/lib/coupons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRODUCTS_DATA } from "@/lib/products";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCatalog } from "@/contexts/CatalogContext";

const openWhatsAppOrder = (
  cart: CartItem[],
  subtotal: number,
  appliedCoupon: Coupon | null,
  discountAmount: number,
  finalTotal: number
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
    discountedSubtotal,
    estimatedTotal,
    finalTotal,
    availableCoupons,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponsDropdownOpen, setCouponsDropdownOpen] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);

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

  const currentIgv = discountedSubtotal * 0.18;

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
            className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 text-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 rounded-xl border border-blue-500/30 text-blue-400">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Carrito de Compras</h2>
                  <span className="text-xs text-slate-400">{cartCount} ítems seleccionados</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCart}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center p-6"
                >
                  <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center border border-slate-800 mb-4 text-slate-600">
                    <ShoppingCart className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Tu carrito de compras está vacío</h3>
                  <p className="text-xs text-slate-400 mb-6">Explora el catálogo para agregar equipos, licencias o útiles</p>
                  <Button
                    onClick={toggleCart}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-10 px-6 rounded-xl"
                  >
                    Ver Productos <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </motion.div>
              ) : (
                cart.map((item) => <CartItemCard key={item.id} item={item} />)
              )}
            </div>

            {/* Footer / Coupons & Calculation */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-800 bg-slate-950 space-y-4">
                {/* ------------------------------------------------------------- */}
                {/* SECCIÓN DE CUPONES: BOTÓN DESPLEGABLE & GESTIÓN               */}
                {/* ------------------------------------------------------------- */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden">
                  {appliedCoupon ? (
                    // Cupón Activo con opción para Cancelar
                    <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Tag className="w-3.5 h-3.5" />
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-emerald-300">
                                {appliedCoupon.name}
                              </span>
                              <Badge className="bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0">
                                {appliedCoupon.badge}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10.5px] text-emerald-400/80 mt-0.5">
                              <Clock className="w-3 h-3 text-emerald-400" />
                              <span>{appliedCoupon.validUntilDisplay}</span>
                            </div>
                          </div>
                        </div>

                        {/* Botón para cancelar / liberar cupón */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeCoupon}
                          className="h-7 px-2 text-xs text-rose-300 hover:text-white hover:bg-rose-900/40 rounded-lg shrink-0 font-medium"
                          title="Cancelar cupón"
                        >
                          <X className="w-3.5 h-3.5 mr-1" /> Cancelar
                        </Button>
                      </div>

                      <div className="text-[11px] text-emerald-200/90 font-medium bg-emerald-900/30 rounded-lg px-2.5 py-1 flex items-center justify-between">
                        <span>Ahorro aplicado al pedido:</span>
                        <span className="font-bold font-mono text-emerald-300">
                          - {formatPrice(discountAmount)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Botón para desplegar cupones disponibles
                    <div>
                      <button
                        type="button"
                        onClick={() => setCouponsDropdownOpen(!couponsDropdownOpen)}
                        className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
                            <Tag className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white flex items-center gap-1.5">
                              ¿Tienes un cupón de descuento?
                              <Badge className="bg-blue-600/30 text-blue-300 border-blue-500/30 text-[9px] px-1 py-0">
                                {availableCoupons.length} disponibles
                              </Badge>
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Toca para desplegar y aplicar cupones con vigencia
                            </p>
                          </div>
                        </div>
                        {couponsDropdownOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      {/* Desplegable de cupones disponibles */}
                      <AnimatePresence>
                        {couponsDropdownOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-slate-800 p-3 bg-slate-950/70 space-y-2.5 max-h-60 overflow-y-auto no-scrollbar"
                          >
                            {availableCoupons.map((coupon) => {
                              const canUse =
                                coupon.minPurchase === 0 || cartTotal >= coupon.minPurchase;

                              return (
                                <div
                                  key={coupon.id}
                                  className={`p-2.5 rounded-xl border transition-all ${
                                    canUse
                                      ? "border-slate-700 bg-slate-900/90 hover:border-blue-500/50"
                                      : "border-slate-800/60 bg-slate-950/40 opacity-70"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-xs font-bold text-white">
                                          {coupon.name}
                                        </span>
                                        <Badge className="bg-emerald-500 text-slate-950 text-[10px] font-black px-1 py-0">
                                          {coupon.badge}
                                        </Badge>
                                      </div>
                                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                                        {coupon.description}
                                      </p>
                                      <div className="flex items-center gap-1.5 text-[9.5px] text-amber-400 mt-1">
                                        <Clock className="w-3 h-3 shrink-0" />
                                        <span>{coupon.validUntilDisplay}</span>
                                      </div>
                                    </div>

                                    <Button
                                      size="sm"
                                      disabled={!canUse}
                                      onClick={() => handleApplyCoupon(coupon)}
                                      className={`h-7 px-2.5 text-[11px] font-bold rounded-lg shrink-0 ${
                                        canUse
                                          ? "bg-blue-600 hover:bg-blue-500 text-white"
                                          : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                                      }`}
                                    >
                                      {canUse ? (
                                        "Aplicar"
                                      ) : (
                                        `Mín. S/ ${coupon.minPurchase}`
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {couponFeedback && (
                    <div className="px-3 py-1.5 bg-blue-950/80 border-t border-blue-900/50 text-[11px] text-blue-200 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>{couponFeedback}</span>
                    </div>
                  )}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* RESUMEN DE PRECIOS CON DESCUENTO DESTACADO POR DEBAJO         */}
                {/* ------------------------------------------------------------- */}
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal Neto:</span>
                    <span className="font-mono text-slate-200">{formatPrice(cartTotal)}</span>
                  </div>

                  {appliedCoupon && discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold bg-emerald-950/20 px-2 py-1 rounded-md border border-emerald-500/20">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Descuento Cupón ({appliedCoupon.badge}):
                      </span>
                      <span className="font-mono font-bold">- {formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>IGV (18%):</span>
                    <span className="font-mono text-slate-200">{formatPrice(currentIgv)}</span>
                  </div>

                  {/* PRECIO FINAL CON DESCUENTO POR DEBAJO */}
                  <div className="pt-2 border-t border-slate-800 flex items-end justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-300 block">Total Estimado:</span>
                      {appliedCoupon && discountAmount > 0 && (
                        <span className="text-xs text-slate-500 line-through font-mono">
                          {formatPrice(estimatedTotal)}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-blue-400 font-mono block leading-none">
                        {formatPrice(finalTotal)}
                      </span>
                      {appliedCoupon && discountAmount > 0 && (
                        <span className="text-[10px] text-emerald-400 font-bold">
                          ¡Ahorraste {formatPrice(discountAmount)}!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm h-12 rounded-xl shadow-lg shadow-emerald-500/20"
                    onClick={() =>
                      openWhatsAppOrder(
                        cart,
                        cartTotal,
                        appliedCoupon,
                        discountAmount,
                        finalTotal
                      )
                    }
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Enviar Cotización a WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white text-xs h-9"
                    onClick={clearCart}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Vaciar Carrito
                  </Button>
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
      className="bg-slate-800/80 rounded-xl border border-slate-700/60 p-3.5 flex gap-3 min-w-0"
    >
      <div className="w-16 h-16 bg-slate-950 rounded-lg overflow-hidden shrink-0 p-1">
        <ProductImage
          type={imageType}
          name={item.name}
          image={item.image}
          className="h-full min-h-0 text-[8px]"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <h3 className="font-bold text-xs text-white truncate">{item.name}</h3>
            <Badge
              variant="outline"
              className="text-[9px] border-blue-500/30 text-blue-300 px-1.5 py-0 mt-0.5"
            >
              {item.category}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeFromCart(item.id)}
            className="text-slate-400 hover:text-red-400 hover:bg-slate-700 h-6 w-6 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg p-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="h-6 w-6 text-slate-300 hover:text-white"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-5 text-center font-bold text-xs text-blue-400">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="h-6 w-6 text-slate-300 hover:text-white"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <span className="font-extrabold text-xs text-blue-400 shrink-0 font-mono">
            {formatPrice(itemPrice * item.quantity)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
