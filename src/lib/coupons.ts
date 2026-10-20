export interface Coupon {
  id: string;
  code: string;
  name: string;
  badge: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number; // e.g., 10 for 10%, 50 for S/ 50
  minPurchase: number; // minimum cart subtotal required
  validUntil: string; // ISO date string or formatted date
  validUntilDisplay: string; // Human-friendly display, e.g. "30 de Noviembre, 2026"
  daysRemaining?: number;
  categoryConstraint?: string;
  isExtra?: boolean;
}

export const AVAILABLE_COUPONS: Coupon[] = [
  {
    id: "cupon-vip-10",
    code: "NOVA-VIP-10",
    name: "Descuento Cliente VIP",
    badge: "10% OFF",
    description: "Descuento preferencial exclusivo para clientes registrados en todo nuestro catálogo.",
    discountType: "percentage",
    discountValue: 10,
    minPurchase: 0,
    validUntil: "2026-11-30",
    validUntilDisplay: "Válido hasta el 30 de Noviembre, 2026",
    daysRemaining: 41,
  },
  {
    id: "cupon-oficina-15",
    code: "PACK-OFICINA-15",
    name: "Pack Corporativo Papelería",
    badge: "15% OFF",
    description: "Aplica en cuadernos, archivadores, paquetes de papel A4 y útiles en pedidos mayores a S/ 100.",
    discountType: "percentage",
    discountValue: 15,
    minPurchase: 100,
    validUntil: "2026-12-15",
    validUntilDisplay: "Válido hasta el 15 de Diciembre, 2026",
    daysRemaining: 56,
  },
  {
    id: "cupon-diagnostico",
    code: "BONO-DIAGNOSTICO-30",
    name: "Bono Soporte & Diagnóstico TI",
    badge: "- S/ 30.00",
    description: "Bonificación directa aplicable a mantenimiento, soporte o servicios técnicos en pedidos desde S/ 150.",
    discountType: "fixed",
    discountValue: 30,
    minPurchase: 150,
    validUntil: "2026-12-31",
    validUntilDisplay: "Válido hasta el 31 de Diciembre, 2026",
    daysRemaining: 72,
  },
  // 3 CUPONES EXTRA (SIN ENVÍOS, EXCLUSIVOS EN PRODUCTOS Y LICENCIAS):
  {
    id: "cupon-licencias-20",
    code: "SOFTWARE-PRO-20",
    name: "Especial Licencias & Antivirus",
    badge: "20% OFF",
    description: "20% de descuento directo en licencias de antivirus ESET, Kaspersky, McAfee y suites de Office digital.",
    discountType: "percentage",
    discountValue: 20,
    minPurchase: 40,
    validUntil: "2026-11-15",
    validUntilDisplay: "Válido hasta el 15 de Noviembre, 2026",
    daysRemaining: 26,
    isExtra: true,
  },
  {
    id: "cupon-primera-ti",
    code: "EQUIPAMIENTO-TI-50",
    name: "Bono Equipamiento TI & Hardware",
    badge: "- S/ 50.00",
    description: "S/ 50.00 de descuento directo en compras de switches, routers, servidores o laptops mayores a S/ 400.",
    discountType: "fixed",
    discountValue: 50,
    minPurchase: 400,
    validUntil: "2026-11-25",
    validUntilDisplay: "Válido hasta el 25 de Noviembre, 2026",
    daysRemaining: 36,
    isExtra: true,
  },
  {
    id: "cupon-networking-40",
    code: "CONECTIVIDAD-PRO-40",
    name: "Descuento Redes & Conectividad",
    badge: "- S/ 40.00",
    description: "Descuento directo en routers, switches administrables, puntos de acceso y cableado en pedidos desde S/ 250.",
    discountType: "fixed",
    discountValue: 40,
    minPurchase: 250,
    validUntil: "2026-11-30",
    validUntilDisplay: "Válido hasta el 30 de Noviembre, 2026",
    daysRemaining: 41,
    isExtra: true,
  },
];
