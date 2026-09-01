"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Plus, Minus, Trash2, MessageCircle, ArrowRight } from "lucide-react";
import { useCart, CartItem } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRODUCTS_DATA } from "@/lib/products";
import { ProductImage } from "@/components/ui/ProductImage";

const openWhatsAppOrder = (cart: CartItem[], total: number) => {
  let message = "¡Hola Nova Bytex! Quisiera solicitar la cotización formal de los siguientes ítems:\n\n";
  
  cart.forEach(item => {
    const price = item.price || 0;
    message += `• [${item.quantity}x] ${item.name} - S/ ${(price * item.quantity).toLocaleString("es-PE")}\n`;
  });
  
  const igv = total * 0.18;
  const grandTotal = total + igv;

  message += `\nSubtotal: S/ ${total.toLocaleString("es-PE")}`;
  message += `\nIGV (18%): S/ ${igv.toLocaleString("es-PE")}`;
  message += `\nTotal Estimado: S/ ${grandTotal.toLocaleString("es-PE")}`;
  
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/51999999999?text=${encodedMessage}`, "_blank");
};

export function CartSidebar() {
  const { cart, isCartOpen, toggleCart, clearCart, cartTotal, cartCount } = useCart();

  const formatPrice = (amount: number) => {
    return `S/ ${amount.toLocaleString("es-PE")}`;
  };

  const igv = cartTotal * 0.18;
  const grandTotal = cartTotal + igv;

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
                  <h2 className="text-base font-bold text-white">Carrito de Cotización</h2>
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
                  <h3 className="text-lg font-bold text-white mb-1">Tu carrito de cotización está vacío</h3>
                  <p className="text-xs text-slate-400 mb-6">Explora el catálogo corporativo para agregar equipos y servicios</p>
                  <Button onClick={toggleCart} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-10 px-6 rounded-xl">
                    Ver Productos <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </motion.div>
              ) : (
                cart.map((item) => (
                  <CartItemCard key={item.id} item={item} />
                ))
              )}
            </div>

            {/* Footer Calculation */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-800 bg-slate-950 space-y-4">
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal Neto:</span>
                    <span className="font-mono text-slate-200">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IGV (18%):</span>
                    <span className="font-mono text-slate-200">{formatPrice(igv)}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                    <span>Total Estimado:</span>
                    <span className="font-mono text-blue-400">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm h-12 rounded-xl shadow-lg shadow-emerald-500/20"
                    onClick={() => openWhatsAppOrder(cart, cartTotal)}
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
  const matched = PRODUCTS_DATA.find(p => p.id === item.id);
  const imageType = matched ? matched.imageType : 'switch';

  const formatPrice = (amount: number) => {
    return `S/ ${amount.toLocaleString("es-PE")}`;
  };

  const itemPrice = item.price || 999;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-slate-800/80 rounded-xl border border-slate-700/60 p-3.5 flex gap-3 min-w-0"
    >
      <div className="w-16 h-16 bg-slate-950 rounded-lg overflow-hidden shrink-0 p-1">
        <ProductImage type={imageType} name={item.name} className="h-full min-h-0 text-[8px]" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <h3 className="font-bold text-xs text-white truncate">{item.name}</h3>
            <Badge variant="outline" className="text-[9px] border-blue-500/30 text-blue-300 px-1.5 py-0 mt-0.5">
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
            <span className="w-5 text-center font-bold text-xs text-blue-400">{item.quantity}</span>
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
