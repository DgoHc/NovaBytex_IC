"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Share2,
  Copy,
  TrendingUp,
  DollarSign,
  MousePointerClick,
  ShoppingBag,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Link2,
  CreditCard,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  FileCheck,
  Info,
  Menu,
  X,
  LogOut,
  Store,
  User,
  Settings,
  Search,
  Filter,
  Check,
  ArrowUpRight,
  Wallet,
  Receipt,
  HelpCircle,
  Percent,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useCatalog } from "@/contexts/CatalogContext";
import {
  AffiliateService,
  Affiliate,
  AffiliateReferral,
  PayoutRequest,
} from "@/services/AffiliateService";
import { PRODUCTS_DATA } from "@/lib/products";
import { cn } from "@/lib/utils";

type AffiliateTab = "resumen" | "enlaces" | "ventas" | "retiros" | "cobros";

export default function AffiliatePortalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as AffiliateTab | null;

  const { user, isAuthenticated, loading: authLoading, signOut } = useAuth();
  const { pushToast } = useCatalog();

  const [activeTab, setActiveTab] = useState<AffiliateTab>("resumen");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [referrals, setReferrals] = useState<AffiliateReferral[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Link Generator State
  const [targetUrl, setTargetUrl] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  // Payout Request Modal
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(50);
  const [payoutMethod, setPayoutMethod] = useState<string>("Yape");
  const [payoutDetails, setPayoutDetails] = useState<string>("");
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // Receipt Preview Modal
  const [receiptPreviewOpen, setReceiptPreviewOpen] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string>("");

  // Payment Info Settings Form
  const [payFormType, setPayFormType] = useState<"Yape" | "Plin" | "BCP" | "Interbank" | "BBVA" | "CCI">("Yape");
  const [payFormNumber, setPayFormNumber] = useState("");
  const [payFormHolder, setPayFormHolder] = useState("");
  const [isSavingPayInfo, setIsSavingPayInfo] = useState(false);

  // Filters for referrals table
  const [referralSearch, setReferralSearch] = useState("");
  const [referralStatusFilter, setReferralStatusFilter] = useState<string>("all");

  // Sync tab from query param
  useEffect(() => {
    if (tabParam && ["resumen", "enlaces", "ventas", "retiros", "cobros"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Redireccionar si no está autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?redirect=/afiliados");
    }
  }, [authLoading, isAuthenticated, router]);

  const loadAffiliateData = useCallback(async () => {
    if (authLoading) return;
    if (!user?.email) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let currentAff: Affiliate | null = null;

    if (user?.email) {
      currentAff = await AffiliateService.getAffiliateByUserIdOrEmail(user.email);
      if (!currentAff) {
        // Auto-crear / auto-aprovisionar cuenta de afiliado para el usuario conectado
        const userDisplayName = user.name || user.email.split("@")[0];
        currentAff = await AffiliateService.createAffiliate({
          userId: user.id,
          name: userDisplayName,
          email: user.email,
          phone: user.phone,
          password: user.password || "Password123!",
          commissionRate: 10,
          paymentInfo: {
            type: "Yape",
            number: user.phone || "",
            account_name: userDisplayName,
          },
        });
      }
    }

    if (currentAff) {
      setAffiliate(currentAff);
      setPayoutMethod(currentAff.payment_info?.type || "Yape");
      setPayoutDetails(
        currentAff.payment_info?.number
          ? `${currentAff.payment_info.number} - ${currentAff.payment_info.account_name}`
          : ""
      );
      setPayFormType(currentAff.payment_info?.type || "Yape");
      setPayFormNumber(currentAff.payment_info?.number || "");
      setPayFormHolder(currentAff.payment_info?.account_name || currentAff.name || "");

      const refs = await AffiliateService.getReferrals(currentAff.id);
      setReferrals(refs);
      const pays = await AffiliateService.getPayoutRequests(currentAff.id);
      setPayouts(pays);
    }
    setLoading(false);
  }, [user, authLoading]);

  useEffect(() => {
    loadAffiliateData();
  }, [loadAffiliateData]);

  // Generador de enlaces
  const handleGenerateLink = (urlToUse?: string) => {
    const input = urlToUse !== undefined ? urlToUse : targetUrl;
    if (!affiliate?.affiliate_code) return "";

    let base = input.trim();
    const origin = typeof window !== "undefined" ? window.location.origin : "https://novabytexrj.com";

    if (!base) {
      base = origin;
    }

    try {
      let cleanUrl = base;
      if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
        cleanUrl = `${origin}${cleanUrl.startsWith("/") ? "" : "/"}${cleanUrl}`;
      }

      const urlObj = new URL(cleanUrl);
      urlObj.searchParams.set("ref", affiliate.affiliate_code);
      const fullLink = urlObj.toString();
      setGeneratedLink(fullLink);
      return fullLink;
    } catch {
      const fallback = `${base}${base.includes("?") ? "&" : "?"}ref=${affiliate.affiliate_code}`;
      setGeneratedLink(fallback);
      return fallback;
    }
  };

  const handleCopyGenerated = (textToCopy?: string) => {
    const target = textToCopy || generatedLink;
    if (!target) return;
    navigator.clipboard.writeText(target);
    pushToast({
      title: "¡Enlace copiado!",
      description: "Pega este enlace en tus redes, WhatsApp o canales de recomendación.",
      variant: "success",
    });
  };

  const handleQuickPreset = (path: string) => {
    setTargetUrl(path);
    const link = handleGenerateLink(path);
    if (link) {
      navigator.clipboard.writeText(link);
      pushToast({
        title: "Enlace generado y copiado",
        description: `Enlace de referido listo para compartir.`,
        variant: "success",
      });
    }
  };

  const copyGeneralLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://novabytexrj.com";
    const code = affiliate?.affiliate_code || "REF-XXXX";
    const generalLink = `${origin}?ref=${code}`;
    navigator.clipboard.writeText(generalLink);
    pushToast({
      title: "Enlace de Tienda Copiado",
      description: generalLink,
      variant: "success",
    });
  };

  // Solicitar retiro
  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliate) return;

    if (payoutAmount < 50) {
      pushToast({
        title: "Monto inválido",
        description: "El monto mínimo para retiro es de S/ 50.00.",
        variant: "error",
      });
      return;
    }

    if (payoutAmount > affiliate.balance) {
      pushToast({
        title: "Saldo insuficiente",
        description: `Tu saldo disponible actual es de S/ ${affiliate.balance.toFixed(2)}.`,
        variant: "error",
      });
      return;
    }

    if (!payoutDetails.trim()) {
      pushToast({
        title: "Datos incompletos",
        description: "Ingresa tu número de celular o número de cuenta bancaria.",
        variant: "error",
      });
      return;
    }

    setIsSubmittingPayout(true);
    try {
      const res = await AffiliateService.requestPayout({
        affiliateId: affiliate.id,
        amount: payoutAmount,
        paymentMethod: payoutMethod,
        paymentDetails: payoutDetails.trim(),
      });

      if (res.success) {
        pushToast({
          title: "¡Solicitud de Retiro Enviada!",
          description: `Se solicitó la transferencia de S/ ${payoutAmount.toFixed(2)}. Será liquidado en un plazo de 24 a 48 horas.`,
          variant: "success",
        });
        setPayoutModalOpen(false);
        await loadAffiliateData();
      } else {
        pushToast({
          title: "Error al solicitar retiro",
          description: res.error || "Ocurrió un error al procesar el retiro.",
          variant: "error",
        });
      }
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  // Guardar datos de cobro
  const handleSavePaymentInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliate) return;

    if (!payFormNumber.trim() || !payFormHolder.trim()) {
      pushToast({
        title: "Campos requeridos",
        description: "Por favor completa el número de cuenta/celular y el nombre del titular.",
        variant: "error",
      });
      return;
    }

    setIsSavingPayInfo(true);
    try {
      const updated = await AffiliateService.updateAffiliate(affiliate.id, {
        payment_info: {
          type: payFormType,
          number: payFormNumber.trim(),
          account_name: payFormHolder.trim(),
        },
      });

      if (updated) {
        setAffiliate(updated);
        setPayoutMethod(updated.payment_info.type);
        setPayoutDetails(`${updated.payment_info.number} - ${updated.payment_info.account_name}`);
        pushToast({
          title: "Datos de cobro actualizados",
          description: "Tu información bancaria para retiros ha sido guardada correctamente.",
          variant: "success",
        });
      }
    } catch {
      pushToast({
        title: "Error",
        description: "No se pudieron actualizar los datos de pago.",
        variant: "error",
      });
    } finally {
      setIsSavingPayInfo(false);
    }
  };

  // Metrics
  const approvedOrPaidReferrals = referrals.filter(
    (r) => r.status === "approved" || r.status === "paid"
  );
  const totalSalesVolume = referrals.reduce((sum, r) => sum + r.order_amount, 0);
  const totalCommissionsEarned = referrals.reduce(
    (sum, r) => (r.status !== "cancelled" ? sum + r.commission_amount : sum),
    0
  );

  // Filtered referrals
  const filteredReferrals = useMemo(() => {
    return referrals.filter((r) => {
      const matchSearch =
        referralSearch === "" ||
        r.order_id.toLowerCase().includes(referralSearch.toLowerCase()) ||
        r.product_summary.toLowerCase().includes(referralSearch.toLowerCase());

      const matchStatus =
        referralStatusFilter === "all" || r.status === referralStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [referrals, referralSearch, referralStatusFilter]);

  // Featured licenses with commission previews (conectadas directamente a los productos reales del catálogo)
  const featuredLicenses = useMemo(() => {
    const licenseProducts = PRODUCTS_DATA.filter(
      (p) => (p.techSubtype === "license" || p.imageType === "software") && p.available
    );
    if (licenseProducts.length > 0) {
      return licenseProducts.slice(0, 8).map((p, idx) => ({
        id: `prod-${p.id}`,
        name: p.name,
        category: p.category,
        price: p.price,
        path: `/productos/${p.id}`,
        badge:
          idx === 0
            ? "Más Vendido"
            : idx === 1
            ? "Alta Conversión"
            : idx === 2
            ? "Popular"
            : idx === 3
            ? "Comisión Top"
            : "Recomendado",
      }));
    }
    return [
      {
        id: "eset-is",
        name: "ESET NOD32 Internet Security",
        category: "Seguridad & Antivirus",
        price: 65.0,
        path: "/productos/203",
        badge: "Alta Conversión",
      },
      {
        id: "eset-antivirus",
        name: "ESET NOD32 Antivirus x 1 Año",
        category: "Seguridad & Antivirus",
        price: 50.0,
        path: "/productos/204",
        badge: "Popular",
      },
      {
        id: "adobe-acrobat-perm",
        name: "Adobe Acrobat PRO (Licencia Permanente)",
        category: "Licencias & Software",
        price: 60.0,
        path: "/productos/201",
        badge: "Más Vendido",
      },
      {
        id: "kaspersky-plus",
        name: "Kaspersky Plus + VPN (1 Año / 1 PC)",
        category: "Seguridad & Antivirus",
        price: 75.0,
        path: "/productos/205",
        badge: "Top Ventas",
      },
      {
        id: "windows-11-oem",
        name: "Windows 10 / 11 Pro OEM",
        category: "Sistemas Operativos",
        price: 35.0,
        path: "/productos/213",
        badge: "Comisión Top",
      },
      {
        id: "office-2024",
        name: "Microsoft Office 2024 Profesional",
        category: "Licencias & Software",
        price: 70.0,
        path: "/productos/211",
        badge: "Recomendado",
      },
    ];
  }, []);

  const navItems = [
    {
      id: "resumen" as AffiliateTab,
      label: "Resumen General",
      icon: LayoutDashboard,
      description: "Métricas y actividad global",
    },
    {
      id: "enlaces" as AffiliateTab,
      label: "Enlaces y Campañas",
      icon: Link2,
      description: "Generador y links con alta comisión",
    },
    {
      id: "ventas" as AffiliateTab,
      label: "Ventas y Comisiones",
      icon: ShoppingBag,
      badge: referrals.length > 0 ? referrals.length : undefined,
      description: "Historial de pedidos referidos",
    },
    {
      id: "retiros" as AffiliateTab,
      label: "Retiros y Liquidaciones",
      icon: Banknote,
      badge: payouts.filter((p) => p.status === "requested").length > 0 ? "Pendiente" : undefined,
      description: "Solicitar transferencias a tu cuenta",
    },
    {
      id: "cobros" as AffiliateTab,
      label: "Datos de Cobro",
      icon: CreditCard,
      description: "Métodos de pago y cuenta bancaria",
    },
  ];

  if (authLoading || (loading && !affiliate)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium mt-4">
          Cargando portal de afiliado...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-blue-600 selection:text-white">
      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col w-72 bg-[#0B132B] border-r border-slate-800/80 shrink-0 sticky top-0 h-screen select-none z-30">
        {/* Brand / Logo Area */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-white">
                  NovaBytex
                </span>
                <Badge className="bg-blue-500/20 text-cyan-300 border-blue-500/30 text-[9px] px-1.5 py-0 h-4 uppercase font-bold tracking-wider">
                  Afiliados
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Portal de Recompensas
              </p>
            </div>
          </Link>
        </div>

        {/* Affiliate Profile Quick Card */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow">
              {(affiliate?.name || user?.name || "AF").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {affiliate?.name || user?.name || "Afiliado Activo"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-[11px] font-black text-cyan-400">
                  {affiliate?.affiliate_code || "..."}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (affiliate?.affiliate_code) {
                      navigator.clipboard.writeText(affiliate.affiliate_code);
                      pushToast({
                        title: "Código copiado",
                        description: `${affiliate.affiliate_code} copiado al portapapeles.`,
                        variant: "info",
                      });
                    }
                  }}
                  title="Copiar código"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Comisión
              </span>
              <span className="font-bold text-emerald-400">
                {affiliate?.commission_rate || 10}% por Venta
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Disponible
              </span>
              <span className="font-bold font-mono text-white">
                S/ {Number(affiliate?.balance || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto no-scrollbar">
          <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Módulos del Afiliado
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 h-10 rounded-xl text-xs font-semibold transition-all relative group text-left",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-cyan-400"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-blue-500/20 text-cyan-300 border border-blue-500/30"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 h-9 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <Store className="w-4 h-4 text-slate-400" />
            <span>Ir a la Tienda</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="w-full flex items-center gap-2.5 px-3 h-9 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER / OFF-CANVAS */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-[#0B132B] border-r border-slate-800 z-50 flex flex-col md:hidden select-none"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-sm text-white">NovaBytex</span>
                    <span className="text-[10px] text-cyan-400 block font-bold">Afiliados</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Profile Card */}
              <div className="p-4 mx-3 my-3 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-xs font-bold text-white truncate">
                  {affiliate?.name || user?.name || "Afiliado Activo"}
                </p>
                <p className="font-mono text-xs text-cyan-400 font-bold mt-0.5">
                  {affiliate?.affiliate_code || "..."}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between text-[11px]">
                  <span className="text-slate-400">Saldo:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    S/ {Number(affiliate?.balance || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 h-10 rounded-xl text-xs font-semibold transition-all text-left",
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-slate-800 space-y-1">
                <Link
                  href="/"
                  className="flex items-center gap-2 px-3 h-9 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <Store className="w-4 h-4 text-slate-400" />
                  <span>Ir a la Tienda</span>
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="w-full flex items-center gap-2 px-3 h-9 rounded-xl text-xs text-rose-400 hover:bg-rose-950/30"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MAIN VIEW AREA */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-slate-950">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white capitalize">
                  {navItems.find((n) => n.id === activeTab)?.label}
                </h1>
                <Badge className="hidden sm:inline-flex bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-mono font-bold">
                  Activo
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {navItems.find((n) => n.id === activeTab)?.description}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={copyGeneralLink}
              className="h-9 px-3 bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-xl shadow-sm hidden sm:flex items-center gap-1.5"
            >
              <Link2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Copiar Enlace Tienda</span>
            </Button>

            <Button
              size="sm"
              disabled={Number(affiliate?.balance || 0) < 50}
              onClick={() => {
                setPayoutAmount(Math.min(affiliate?.balance || 50, 100));
                setPayoutModalOpen(true);
              }}
              className={cn(
                "h-9 px-3.5 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5",
                Number(affiliate?.balance || 0) >= 50
                  ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              )}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Solicitar</span> Retiro
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 hover:text-white hover:border-slate-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-slate-900 border-slate-800 text-slate-200 p-1 rounded-xl shadow-2xl"
              >
                <DropdownMenuLabel className="px-3 py-2 text-xs">
                  <p className="font-bold text-white truncate">
                    {affiliate?.name || user?.name || "Afiliado"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {affiliate?.email || user?.email}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] bg-slate-950/70 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Saldo:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      S/ {Number(affiliate?.balance || 0).toFixed(2)}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem
                  onClick={() => setActiveTab("cobros")}
                  className="cursor-pointer text-xs rounded-lg hover:bg-slate-800 focus:bg-slate-800 text-slate-300"
                >
                  <Settings className="w-3.5 h-3.5 mr-2 text-slate-400" />
                  Datos de Cobro
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/mi-cuenta")}
                  className="cursor-pointer text-xs rounded-lg hover:bg-slate-800 focus:bg-slate-800 text-slate-300"
                >
                  <Store className="w-3.5 h-3.5 mr-2 text-slate-400" />
                  Panel de Cliente
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem
                  onClick={signOut}
                  className="cursor-pointer text-xs rounded-lg text-rose-400 hover:bg-rose-950/40 focus:bg-rose-950/40"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* ================================================================= */}
          {/* TAB 1: RESUMEN GENERAL */}
          {/* ================================================================= */}
          {activeTab === "resumen" && (
            <div className="space-y-6">
              {/* Hero Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-950/60 border border-slate-800 p-6 sm:p-7 shadow-2xl">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                        Programa de Partners & Afiliados
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span className="text-xs text-slate-300 font-medium">
                        Atribución 30 Días Garantizada
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      ¡Bienvenido, {affiliate?.name || user?.name || "Socio Afiliado"}!
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Comparte enlaces directos a productos o a la tienda. Recibirás automáticamente el{" "}
                      <strong className="text-emerald-300 font-bold">
                        {affiliate?.commission_rate || 10}% de comisión neta
                      </strong>{" "}
                      por cada compra completada por tus referidos.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    <div className="bg-slate-950/90 border border-slate-800/90 px-4 py-3 rounded-xl shadow-lg">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Tu Código Personal
                      </span>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="font-mono font-black text-lg text-cyan-400 tracking-wider">
                          {affiliate?.affiliate_code || "..."}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (affiliate?.affiliate_code) {
                              navigator.clipboard.writeText(affiliate.affiliate_code);
                              pushToast({
                                title: "Código copiado",
                                description: `${affiliate.affiliate_code} copiado al portapapeles.`,
                                variant: "info",
                              });
                            }
                          }}
                          className="h-7 px-2 text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={copyGeneralLink}
                      className="h-full py-3.5 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Copiar Enlace Global</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* 4 KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Saldo Disponible */}
                <Card className="p-5 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/30 rounded-2xl shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                      Saldo Disponible
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-emerald-400 mt-2 font-mono">
                    S/ {Number(affiliate?.balance || 0).toFixed(2)}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400">Mínimo: S/ 50.00</span>
                    <Button
                      size="sm"
                      disabled={Number(affiliate?.balance || 0) < 50}
                      onClick={() => {
                        setPayoutAmount(Math.min(affiliate?.balance || 50, 100));
                        setPayoutModalOpen(true);
                      }}
                      className={cn(
                        "h-6 px-2.5 text-[11px] font-bold rounded-lg",
                        Number(affiliate?.balance || 0) >= 50
                          ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      )}
                    >
                      Retirar
                    </Button>
                  </div>
                </Card>

                {/* Saldo en Revisión */}
                <Card className="p-5 bg-slate-900/90 border-slate-800 rounded-2xl shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Saldo en Revisión
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-amber-400 mt-2 font-mono">
                    S/ {Number(affiliate?.pending_balance || 0).toFixed(2)}
                  </p>
                  <p className="text-[11px] text-amber-300/80 mt-2 pt-2 border-t border-slate-800/80 truncate">
                    Comisiones por pedidos en entrega
                  </p>
                </Card>

                {/* Ventas Concretadas */}
                <Card className="p-5 bg-slate-900/90 border-slate-800 rounded-2xl shadow-xl relative overflow-hidden group hover:border-blue-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Ventas Concretadas
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-white mt-2 font-mono">
                    {approvedOrPaidReferrals.length}
                  </p>
                  <p className="text-[11px] text-blue-300 mt-2 pt-2 border-t border-slate-800/80 truncate">
                    Total Facturado: S/ {totalSalesVolume.toFixed(2)}
                  </p>
                </Card>

                {/* Clics e Interacciones */}
                <Card className="p-5 bg-slate-900/90 border-slate-800 rounded-2xl shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Clics Registrados
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <MousePointerClick className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-white mt-2 font-mono">
                    {affiliate?.clicks_count || 0}
                  </p>
                  <p className="text-[11px] text-purple-300 mt-2 pt-2 border-t border-slate-800/80 truncate">
                    Visitas únicas vía tus enlaces
                  </p>
                </Card>
              </div>

              {/* TWO COLUMN SPLIT: RECENT ACTIVITY & CONVERSION TIPS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Referrals Activity (2 cols) */}
                <Card className="lg:col-span-2 bg-slate-900 border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-emerald-400" />
                        Últimas Ventas Referidas
                      </h3>
                      <p className="text-xs text-slate-400">
                        Clientes que compraron con tu enlace en los últimos días
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("ventas")}
                      className="text-xs text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 h-8"
                    >
                      Ver Todas
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>

                  {referrals.length === 0 ? (
                    <div className="p-8 text-center rounded-xl bg-slate-950/60 border border-slate-800/60 text-slate-400 space-y-3">
                      <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs">
                        Aún no se han registrado compras con tu código. Comparte tus enlaces en redes sociales o WhatsApp para comenzar a ganar.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setActiveTab("enlaces")}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-xl"
                      >
                        Crear mi primer enlace
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800/60">
                      {referrals.slice(0, 5).map((ref) => (
                        <div
                          key={ref.id}
                          className="py-3 flex items-center justify-between gap-4 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-white truncate">
                              {ref.product_summary}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                              <span className="font-mono">{ref.order_id}</span>
                              <span>•</span>
                              <span>
                                {new Date(ref.created_at).toLocaleDateString("es-PE", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="font-mono font-bold text-emerald-400 text-sm">
                              +S/ {Number(ref.commission_amount).toFixed(2)}
                            </p>
                            <Badge
                              className={cn(
                                "text-[9px] uppercase px-1.5 py-0 h-4 mt-0.5 font-bold",
                                ref.status === "paid"
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : ref.status === "approved"
                                  ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                  : ref.status === "cancelled"
                                  ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              )}
                            >
                              {ref.status === "paid"
                                ? "Pagado"
                                : ref.status === "approved"
                                ? "Aprobado"
                                : ref.status === "cancelled"
                                ? "Cancelado"
                                : "Pendiente"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Conversion Tips & High Commission Quick Box */}
                <div className="space-y-4">
                  <Card className="bg-slate-900 border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Consejos para Ganar Más
                    </h3>
                    <ul className="text-xs text-slate-300 space-y-2.5">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Recomienda software esencial:</strong> Licencias de antivirus y diseño tienen tasa de recompra alta.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Comparte en comunidades:</strong> Grupos de Facebook, Telegram y WhatsApp de tecnología o estudiantes.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Cookies de 30 días:</strong> Si el usuario entra hoy y compra dentro de 30 días, la comisión sigue siendo tuya.
                        </span>
                      </li>
                    </ul>
                  </Card>

                  {/* Payment Info Status Alert */}
                  <Card className="bg-slate-900 border-slate-800 rounded-2xl p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Cuenta de Pago
                      </span>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                        {affiliate?.payment_info?.type || "Yape"}
                      </Badge>
                    </div>
                    <p className="text-xs text-white font-medium truncate">
                      {affiliate?.payment_info?.number
                        ? affiliate.payment_info.number
                        : "Sin cuenta registrada"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {affiliate?.payment_info?.account_name || "Configura tu cuenta para recibir pagos"}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("cobros")}
                      className="w-full mt-3 h-8 border-slate-700 hover:bg-slate-800 text-xs text-slate-200"
                    >
                      Editar Método de Cobro
                    </Button>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: ENLACES Y CAMPAÑAS */}
          {/* ================================================================= */}
          {activeTab === "enlaces" && (
            <div className="space-y-6">
              {/* Custom Link Generator Card */}
              <Card className="p-6 bg-slate-900 border-slate-800 rounded-2xl shadow-xl space-y-5">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-cyan-400" />
                    Generador de Enlaces Personalizados
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pega la URL de cualquier software, curso o producto de la tienda para generar tu enlace único con seguimiento de comisiones.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Pega una URL (ej: https://novabytexrj.com/productos/203 o /catalogo)"
                      value={targetUrl}
                      onChange={(e) => {
                        setTargetUrl(e.target.value);
                        handleGenerateLink(e.target.value);
                      }}
                      className="h-11 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs rounded-xl"
                    />
                  </div>
                  <Button
                    onClick={() => handleGenerateLink()}
                    className="h-11 px-5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 shrink-0"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generar Enlace
                  </Button>
                </div>

                {/* Quick presets */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                    Accesos directos recomendados (haz clic para copiar de inmediato):
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { name: "Tienda Completa", path: "/" },
                      { name: "Catálogo de Software", path: "/catalogo" },
                      { name: "Librería Digital", path: "/libreria" },
                      { name: "Ofertas y Promociones", path: "/ofertas" },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleQuickPreset(preset.path)}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-950/30 text-xs text-slate-300 font-medium transition-all flex items-center gap-1.5"
                      >
                        <span>{preset.name}</span>
                        <ExternalLink className="w-3 h-3 text-cyan-400" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Output box */}
                {generatedLink && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        Tu Enlace Rastreable:
                      </span>
                      <p className="font-mono text-xs text-cyan-300 truncate select-all">
                        {generatedLink}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleCopyGenerated()}
                      className="h-9 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg shrink-0 shadow-md"
                    >
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      Copiar Enlace
                    </Button>
                  </div>
                )}
              </Card>

              {/* High Commission Products Catalog Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Productos con Mayor Comisión
                    </h3>
                    <p className="text-xs text-slate-400">
                      Licencias de alta demanda listas para promocionar con 1 solo clic
                    </p>
                  </div>
                  <Badge className="bg-blue-500/20 text-cyan-300 border-blue-500/30 text-xs">
                    {affiliate?.commission_rate || 10}% Comisión fija
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {featuredLicenses.map((item) => {
                    const commissionPreview =
                      item.price * ((affiliate?.commission_rate || 10) / 100);
                    return (
                      <Card
                        key={item.id}
                        className="p-5 bg-slate-900 border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-[10px]">
                              {item.category}
                            </Badge>
                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[9px] font-bold">
                              {item.badge}
                            </Badge>
                          </div>
                          <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                            {item.name}
                          </h4>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Precio PVP</span>
                              <span className="font-bold text-xs text-white">
                                S/ {item.price.toFixed(2)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-emerald-400 font-bold block">
                                Tu Ganancia
                              </span>
                              <span className="font-bold font-mono text-emerald-400 text-sm">
                                +S/ {commissionPreview.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => handleQuickPreset(item.path)}
                            className="w-full h-8 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg"
                          >
                            <Copy className="w-3.5 h-3.5 mr-1.5" />
                            Copiar Link
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: VENTAS Y COMISIONES */}
          {/* ================================================================= */}
          {activeTab === "ventas" && (
            <div className="space-y-4">
              {/* Toolbar: Search & Filters matching corporate admin toolbars */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Buscar por ID de pedido o producto..."
                    value={referralSearch}
                    onChange={(e) => setReferralSearch(e.target.value)}
                    className="h-10 pl-9 bg-slate-950 border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={referralStatusFilter}
                    onChange={(e) => setReferralStatusFilter(e.target.value)}
                    className="h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">Todos los Estados ({referrals.length})</option>
                    <option value="approved">Aprobados</option>
                    <option value="paid">Pagados</option>
                    <option value="pending">En Revisión</option>
                    <option value="cancelled">Cancelados</option>
                  </select>

                  <Badge className="bg-slate-800 text-slate-300 border-slate-700 h-10 px-3 text-xs font-mono font-bold flex items-center">
                    Total: S/ {totalCommissionsEarned.toFixed(2)}
                  </Badge>
                </div>
              </div>

              {/* Table */}
              <Card className="bg-slate-900 border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10.5px]">
                      <tr>
                        <th className="py-3.5 px-4">Fecha</th>
                        <th className="py-3.5 px-4">ID Pedido</th>
                        <th className="py-3.5 px-4">Producto Adquirido</th>
                        <th className="py-3.5 px-4 text-right">Precio Pagado</th>
                        <th className="py-3.5 px-4 text-right">Tu Comisión</th>
                        <th className="py-3.5 px-4 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {filteredReferrals.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500">
                            {referralSearch || referralStatusFilter !== "all"
                              ? "No se encontraron ventas con los filtros aplicados."
                              : "Aún no registras ventas referidas. Comparte tus enlaces para comenzar."}
                          </td>
                        </tr>
                      ) : (
                        filteredReferrals.map((ref) => (
                          <tr key={ref.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                              {new Date(ref.created_at).toLocaleDateString("es-PE", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-white">
                              {ref.order_id}
                            </td>
                            <td className="py-3.5 px-4 text-slate-200 max-w-[280px] truncate">
                              {ref.product_summary}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-semibold text-white">
                              S/ {Number(ref.order_amount).toFixed(2)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400 text-sm">
                              S/ {Number(ref.commission_amount).toFixed(2)}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <Badge
                                className={cn(
                                  "text-[10px] font-bold uppercase",
                                  ref.status === "paid"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : ref.status === "approved"
                                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                    : ref.status === "cancelled"
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                )}
                              >
                                {ref.status === "paid"
                                  ? "Pagado"
                                  : ref.status === "approved"
                                  ? "Aprobado"
                                  : ref.status === "cancelled"
                                  ? "Cancelado"
                                  : "Pendiente"}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: RETIROS Y LIQUIDACIONES */}
          {/* ================================================================= */}
          {activeTab === "retiros" && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-emerald-400" />
                    Liquidación de Ganancias y Retiros
                  </h2>
                  <p className="text-xs text-slate-400">
                    Las transferencias se realizan en un plazo máximo de 24 a 48 horas hábiles mediante Yape, Plin o Transferencia Bancaria.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Saldo Disponible
                    </span>
                    <span className="text-xl font-black font-mono text-emerald-400">
                      S/ {Number(affiliate?.balance || 0).toFixed(2)}
                    </span>
                  </div>

                  <Button
                    disabled={Number(affiliate?.balance || 0) < 50}
                    onClick={() => {
                      setPayoutAmount(Math.min(affiliate?.balance || 50, 100));
                      setPayoutModalOpen(true);
                    }}
                    className={cn(
                      "h-10 px-4 text-xs font-bold rounded-xl shadow-lg",
                      Number(affiliate?.balance || 0) >= 50
                        ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    )}
                  >
                    Solicitar Retiro
                  </Button>
                </div>
              </div>

              {/* Payouts Table */}
              <Card className="bg-slate-900 border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Historial de Solicitudes y Comprobantes
                  </h3>
                  <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-xs">
                    {payouts.length} Registros
                  </Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10.5px]">
                      <tr>
                        <th className="py-3 px-4">Fecha Solicitada</th>
                        <th className="py-3 px-4 text-right">Monto</th>
                        <th className="py-3 px-4">Método</th>
                        <th className="py-3 px-4">Cuenta / Celular</th>
                        <th className="py-3 px-4 text-center">Estado</th>
                        <th className="py-3 px-4 text-center">Comprobante</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {payouts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500">
                            Aún no has solicitado transferencias de retiro.
                          </td>
                        </tr>
                      ) : (
                        payouts.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                              {new Date(p.created_at).toLocaleDateString("es-PE", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                              S/ {Number(p.amount).toFixed(2)}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-white">
                              {p.payment_method}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-300 max-w-[220px] truncate">
                              {p.payment_details}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <Badge
                                className={cn(
                                  "text-[10px] font-bold uppercase",
                                  p.status === "paid"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : p.status === "rejected"
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                )}
                              >
                                {p.status === "paid"
                                  ? "Pagado"
                                  : p.status === "rejected"
                                  ? "Rechazado"
                                  : "En Proceso"}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {p.receipt_url ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setReceiptUrl(p.receipt_url || "");
                                    setReceiptPreviewOpen(true);
                                  }}
                                  className="h-7 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 text-xs"
                                >
                                  <FileCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                                  Ver Comprobante
                                </Button>
                              ) : (
                                <span className="text-[11px] text-slate-500 italic">
                                  Pendiente
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: DATOS DE COBRO / PERFIL */}
          {/* ================================================================= */}
          {activeTab === "cobros" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Payment Details Form (2 Cols) */}
              <Card className="lg:col-span-2 bg-slate-900 border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    Configuración de Cuenta Bancaria y Billetera Digital
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Indica dónde deseas recibir tus liquidaciones de comisiones. Se autocompletará en tus futuras solicitudes de retiro.
                  </p>
                </div>

                <form onSubmit={handleSavePaymentInfo} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pay-type" className="text-xs font-semibold text-slate-300">
                        Método Preferido
                      </Label>
                      <select
                        id="pay-type"
                        value={payFormType}
                        onChange={(e) => setPayFormType(e.target.value as any)}
                        className="w-full h-10 rounded-xl border border-slate-800 bg-slate-950 text-xs px-3 mt-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Yape">Yape (Móvil)</option>
                        <option value="Plin">Plin (Móvil)</option>
                        <option value="BCP">BCP - Banco de Crédito del Perú</option>
                        <option value="Interbank">Interbank</option>
                        <option value="BBVA">BBVA</option>
                        <option value="CCI">Código Interbancario (CCI)</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="pay-number" className="text-xs font-semibold text-slate-300">
                        Número de Celular o Cuenta
                      </Label>
                      <Input
                        id="pay-number"
                        required
                        placeholder="Ej: 976 543 210 o 191-XXXXXXXX-X-XX"
                        value={payFormNumber}
                        onChange={(e) => setPayFormNumber(e.target.value)}
                        className="h-10 bg-slate-950 border-slate-800 text-xs text-slate-200 mt-1.5 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pay-holder" className="text-xs font-semibold text-slate-300">
                      Nombre Completo del Titular de la Cuenta
                    </Label>
                    <Input
                      id="pay-holder"
                      required
                      placeholder="Ej: Alex Huamán Cueva"
                      value={payFormHolder}
                      onChange={(e) => setPayFormHolder(e.target.value)}
                      className="h-10 bg-slate-950 border-slate-800 text-xs text-slate-200 mt-1.5 rounded-xl"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Asegúrate de que el nombre coincida exactamente con el titular de la cuenta receptora.
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSavingPayInfo}
                      className="h-10 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20"
                    >
                      {isSavingPayInfo ? "Guardando..." : "Guardar Datos de Pago"}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Program Terms & Rules Summary */}
              <div className="space-y-4">
                <Card className="bg-slate-900 border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Condiciones del Programa
                  </h3>
                  <ul className="text-xs text-slate-300 space-y-2.5">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>
                        <strong>Monto Mínimo de Retiro:</strong> S/ 50.00 de saldo disponible aprobado.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>
                        <strong>Plazo de Liquidación:</strong> De 24 a 48 horas hábiles una vez confirmada la solicitud.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>
                        <strong>Comisión Base:</strong> {affiliate?.commission_rate || 10}% sobre el valor neto de la compra.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>
                        <strong>Sin límite de ganancias:</strong> Puedes recomendar a todos los clientes que desees.
                      </span>
                    </li>
                  </ul>
                </Card>

                <Card className="bg-slate-900 border-slate-800 rounded-2xl p-5 shadow-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Soporte al Afiliado
                  </span>
                  <p className="text-xs text-slate-300 mt-1">
                    ¿Dudas con una comisión o liquidación bancaria? Escríbenos directamente a través de nuestro canal corporativo.
                  </p>
                  <a
                    href="https://wa.me/51976543210"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                  >
                    <span>Contactar Soporte WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: SOLICITAR RETIRO */}
      {/* ========================================================================= */}
      <Dialog open={payoutModalOpen} onOpenChange={setPayoutModalOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-100 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Solicitar Transferencia de Saldo
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Disponible para retiro: <strong className="text-emerald-400">S/ {affiliate?.balance ? affiliate.balance.toFixed(2) : "0.00"}</strong>. Mínimo: S/ 50.00.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRequestPayout} className="space-y-4 pt-2">
            <div>
              <Label htmlFor="req-amount" className="text-xs font-semibold text-slate-300">
                Monto a Retirar (S/)
              </Label>
              <div className="relative mt-1">
                <Input
                  id="req-amount"
                  type="number"
                  min="50"
                  max={affiliate?.balance || 50}
                  step="1"
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="h-10 pl-8 pr-12 font-bold font-mono text-base bg-slate-950 border-slate-800 text-emerald-400 rounded-xl"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  S/
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="req-method" className="text-xs font-semibold text-slate-300">
                Método de Transferencia
              </Label>
              <select
                id="req-method"
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-800 bg-slate-950 text-xs px-3 mt-1 text-slate-200"
              >
                <option value="Yape">Yape</option>
                <option value="Plin">Plin</option>
                <option value="BCP">BCP (Banco de Crédito)</option>
                <option value="Interbank">Interbank</option>
                <option value="BBVA">BBVA</option>
                <option value="CCI">Código Interbancario (CCI)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="req-details" className="text-xs font-semibold text-slate-300">
                Número de Celular o Cuenta y Titular
              </Label>
              <Input
                id="req-details"
                required
                placeholder="Ej: 976 543 210 - Alex Huamán Cueva"
                value={payoutDetails}
                onChange={(e) => setPayoutDetails(e.target.value)}
                className="h-10 bg-slate-950 border-slate-800 text-xs text-slate-200 mt-1 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPayoutModalOpen(false)}
                className="h-9 border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingPayout}
                className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl"
              >
                {isSubmittingPayout ? "Enviando..." : "Confirmar Solicitud"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: VISTA PREVIA COMPROBANTE */}
      {/* ========================================================================= */}
      <Dialog open={receiptPreviewOpen} onOpenChange={setReceiptPreviewOpen}>
        <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-800 text-slate-100 p-4 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Comprobante de Transferencia Bancaria
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[280px]">
            {receiptUrl.startsWith("data:application/pdf") ? (
              <iframe src={receiptUrl} className="w-full h-[400px]" />
            ) : (
              <img
                src={receiptUrl}
                alt="Comprobante de transferencia"
                className="max-h-[400px] w-auto object-contain"
              />
            )}
          </div>

          <div className="flex justify-end pt-3">
            <Button
              type="button"
              size="sm"
              onClick={() => setReceiptPreviewOpen(false)}
              className="h-8 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-lg"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
