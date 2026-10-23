"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  UserCheck,
  Search,
  Mail,
  Copy,
  Percent,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  CreditCard,
  TrendingUp,
  DollarSign,
  MousePointerClick,
  ShoppingBag,
  ExternalLink,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  RotateCcw,
  ArrowUpDown,
  Phone,
  ShieldCheck,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  AffiliateService,
  Affiliate,
  AffiliateReferral,
} from "@/services/AffiliateService";
import { useCatalog } from "@/contexts/CatalogContext";
import { cn } from "@/lib/utils";

type SortOption = "newest" | "name_asc" | "balance_desc" | "rate_desc" | "clicks_desc";

function generateRandomPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let randomStr = "";
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Nova#${randomStr}`;
}

export default function AdminAfiliadosPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [sortKey, setSortKey] = useState<SortOption>("newest");

  // Modals state
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [editRateOpen, setEditRateOpen] = useState(false);
  const [newRate, setNewRate] = useState<number>(10);

  const [paymentInfoOpen, setPaymentInfoOpen] = useState(false);
  const [referralsModalOpen, setReferralsModalOpen] = useState(false);
  const [affiliateReferrals, setAffiliateReferrals] = useState<AffiliateReferral[]>([]);

  // Create Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createRate, setCreateRate] = useState(10);
  const [createPayType, setCreatePayType] = useState<"Yape" | "Plin" | "BCP" | "CCI">("Yape");
  const [createPayNumber, setCreatePayNumber] = useState("");

  // Post-creation credentials modal
  const [createdSummaryOpen, setCreatedSummaryOpen] = useState(false);
  const [lastCreatedData, setLastCreatedData] = useState<{
    name: string;
    email: string;
    code: string;
    password: string;
  } | null>(null);

  // Manage existing credentials modal
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false);
  const [managePassword, setManagePassword] = useState("");
  const [showManagePassword, setShowManagePassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Delete affiliate state
  const [confirmDeleteAffiliate, setConfirmDeleteAffiliate] = useState<Affiliate | null>(null);

  const { pushToast } = useCatalog();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await AffiliateService.getAllAffiliates();
      setAffiliates(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    pushToast({
      title: "Código copiado",
      description: `Código ${code} copiado al portapapeles.`,
      variant: "info",
    });
  };

  const handleToggleStatus = async (affiliate: Affiliate) => {
    const nextStatus = affiliate.status === "active" ? "suspended" : "active";
    const updated = await AffiliateService.updateAffiliate(affiliate.id, {
      status: nextStatus,
    });
    if (updated) {
      pushToast({
        title: nextStatus === "active" ? "Afiliado Activado" : "Afiliado Suspendido",
        description: `La cuenta de ${affiliate.name} ahora está ${
          nextStatus === "active" ? "activa" : "suspendida"
        }.`,
        variant: nextStatus === "active" ? "success" : "info",
      });
      loadData();
    }
  };

  const handleDeleteAffiliate = async () => {
    if (!confirmDeleteAffiliate) return;
    const success = await AffiliateService.deleteAffiliate(confirmDeleteAffiliate.id);
    if (success) {
      pushToast({
        title: "Afiliado eliminado",
        description: `Se eliminó permanentemente la cuenta de ${confirmDeleteAffiliate.name}.`,
        variant: "info",
      });
      setConfirmDeleteAffiliate(null);
      loadData();
    }
  };

  const handleSaveCommissionRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAffiliate) return;
    const rateVal = Math.min(50, Math.max(1, Number(newRate)));
    const updated = await AffiliateService.updateAffiliate(selectedAffiliate.id, {
      commission_rate: rateVal,
    });
    if (updated) {
      pushToast({
        title: "Comisión Actualizada",
        description: `Se asignó ${rateVal}% de comisión a ${selectedAffiliate.name}.`,
        variant: "success",
      });
      setEditRateOpen(false);
      loadData();
    }
  };

  const handleOpenReferrals = async (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    const refs = await AffiliateService.getReferrals(affiliate.id);
    setAffiliateReferrals(refs);
    setReferralsModalOpen(true);
  };

  const handleOpenManageCredentials = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setManagePassword(affiliate.password || "Password123!");
    setShowManagePassword(false);
    setCredentialsModalOpen(true);
  };

  const handleSaveExistingPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAffiliate) return;
    if (!managePassword || managePassword.trim().length < 6) {
      pushToast({
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "error",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const success = await AffiliateService.updateAffiliatePassword(
        selectedAffiliate.id,
        managePassword.trim()
      );
      if (success) {
        pushToast({
          title: "Contraseña Actualizada",
          description: `Se actualizó la contraseña de acceso de ${selectedAffiliate.name}.`,
          variant: "success",
        });
        setCredentialsModalOpen(false);
        loadData();
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleOpenCreateModal = () => {
    setCreateName("");
    setCreateEmail("");
    setCreatePhone("");
    setCreatePassword(generateRandomPassword());
    setShowCreatePassword(false);
    setCreateRate(10);
    setCreatePayType("Yape");
    setCreatePayNumber("");
    setCreateModalOpen(true);
  };

  const handleCreateAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim() || !createEmail.trim()) {
      pushToast({
        title: "Campos incompletos",
        description: "Ingresa el nombre y correo del afiliado.",
        variant: "error",
      });
      return;
    }

    const assignedPass = createPassword.trim() || generateRandomPassword();

    const created = await AffiliateService.createAffiliate({
      userId: `user-manual-${Date.now()}`,
      name: createName.trim(),
      email: createEmail.trim().toLowerCase(),
      phone: createPhone.trim() || createPayNumber.trim(),
      password: assignedPass,
      commissionRate: createRate,
      paymentInfo: {
        type: createPayType,
        number: createPayNumber.trim() || createPhone.trim(),
        account_name: createName.trim(),
      },
    });

    setLastCreatedData({
      name: created.name,
      email: created.email,
      code: created.affiliate_code,
      password: assignedPass,
    });

    setCreateModalOpen(false);
    setCreatedSummaryOpen(true);
    loadData();
  };

  const handleCopyAccessMessage = (data: {
    name: string;
    email: string;
    code: string;
    password: string;
  }) => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://novabytexrj.com";
    const text = `¡Hola ${data.name}! Te damos la bienvenida como Socio Afiliado de Nova Bytex.\n\n` +
      `Tus credenciales de acceso al portal son:\n` +
      `🌐 Portal de Acceso: ${origin}/login\n` +
      `👤 Usuario / Correo: ${data.email}\n` +
      `🔑 Contraseña: ${data.password}\n` +
      `🏷️ Tu Código de Afiliado: ${data.code}\n\n` +
      `Una vez que inicies sesión serás dirigido a tu panel de control donde podrás crear enlaces personalizados y solicitar retiros de tus comisiones.`;

    navigator.clipboard.writeText(text);
    pushToast({
      title: "Mensaje copiado",
      description: "Mensaje con credenciales copiado para enviar por WhatsApp o correo.",
      variant: "success",
    });
  };

  // Filtering and Sorting
  const filteredAffiliates = useMemo(() => {
    let list = affiliates.filter((a) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.affiliate_code.toLowerCase().includes(q) ||
        (a.phone && a.phone.includes(searchTerm));

      const matchesStatus =
        statusFilter === "all" ? true : a.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    switch (sortKey) {
      case "name_asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "balance_desc":
        list.sort((a, b) => (b.balance || 0) - (a.balance || 0));
        break;
      case "rate_desc":
        list.sort((a, b) => (b.commission_rate || 0) - (a.commission_rate || 0));
        break;
      case "clicks_desc":
        list.sort((a, b) => (b.clicks_count || 0) - (a.clicks_count || 0));
        break;
      case "newest":
      default:
        list.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
        break;
    }

    return list;
  }, [affiliates, searchTerm, statusFilter, sortKey]);

  // KPIs
  const totalCount = affiliates.length;
  const activeCount = affiliates.filter((a) => a.status === "active").length;
  const totalClicks = affiliates.reduce((sum, a) => sum + (a.clicks_count || 0), 0);
  const totalBalance = affiliates.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalPending = affiliates.reduce((sum, a) => sum + (a.pending_balance || 0), 0);

  return (
    <div className="p-3.5 sm:p-5 lg:p-6 max-w-[1600px] mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Gestión de Afiliados
            </h1>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[11px] font-bold py-0 h-5">
              {activeCount} Activos
            </Badge>
            <Badge variant="outline" className="text-slate-600 border-slate-300 text-[11px] font-semibold py-0 h-5">
              {totalCount} Registrados
            </Badge>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Supervisa socios de referidos, gestiona contraseñas de acceso y audita liquidaciones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="h-8.5 px-3 rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs gap-1.5"
          >
            <RefreshCw className={cn("w-3 h-3 text-blue-600 shrink-0", loading && "animate-spin")} />
            Actualizar
          </Button>
          <Button
            size="sm"
            onClick={handleOpenCreateModal}
            className="h-8.5 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs gap-1.5 border-0"
          >
            <Plus className="w-3 h-3 shrink-0" />
            Nuevo Afiliado
          </Button>
        </div>
      </div>

      {/* KPI Cards Row - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3 bg-white border-slate-200/90 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total Afiliados
            </span>
            <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <UserCheck className="w-3 h-3" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900 mt-0.5 font-mono">{totalCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">
            {activeCount} habilitados
          </span>
        </Card>

        <Card className="p-3 bg-white border-slate-200/90 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Clics Atribuidos
            </span>
            <div className="w-6 h-6 rounded-md bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <MousePointerClick className="w-3 h-3" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900 mt-0.5 font-mono">{totalClicks}</p>
          <span className="text-[10px] text-purple-600 font-medium">
            Últimos 30 días
          </span>
        </Card>

        <Card className="p-3 bg-white border-slate-200/90 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Saldo Disponible
            </span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-3 h-3" />
            </div>
          </div>
          <p className="text-xl font-black text-emerald-600 mt-0.5 font-mono">
            S/ {totalBalance.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-400">
            Listo para liquidación
          </span>
        </Card>

        <Card className="p-3 bg-white border-slate-200/90 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Saldo en Revisión
            </span>
            <div className="w-6 h-6 rounded-md bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <TrendingUp className="w-3 h-3" />
            </div>
          </div>
          <p className="text-xl font-black text-amber-600 mt-0.5 font-mono">
            S/ {totalPending.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-400">
            Pendiente de entrega
          </span>
        </Card>
      </div>

      {/* Main Table Card - ZERO HORIZONTAL SCROLL ON DESKTOP */}
      <Card className="overflow-hidden border-slate-200/90 rounded-xl bg-white shadow-2xs">
        {/* Clean Filter Controls (todos h-10, gap de 12px, alineados en una sola fila) */}
        <CardContent className="p-3 lg:px-4 lg:py-2.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search
                size={16}
                style={{ width: 16, height: 16 }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none shrink-0"
              />
              <Input
                placeholder="Buscar código (ej. REF-1002), nombre, email o celular..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-[38px] h-10 rounded-lg bg-white border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 w-full"
              />
            </div>

            {/* Status Select */}
            <div className="w-full sm:w-[190px] shrink-0 min-w-[160px]">
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as "all" | "active" | "suspended")}
              >
                <SelectTrigger className="h-10 rounded-lg bg-white border-slate-200 text-xs w-full min-w-[160px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">Estado: Todos</SelectItem>
                  <SelectItem value="active" className="text-xs">Solo Activos</SelectItem>
                  <SelectItem value="suspended" className="text-xs">Solo Suspendidos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Button */}
            <div className="w-full sm:w-[170px] shrink-0 min-w-[150px]">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortKey((prev) => {
                    const order: SortOption[] = [
                      "newest",
                      "name_asc",
                      "balance_desc",
                      "rate_desc",
                      "clicks_desc",
                    ];
                    const idx = order.indexOf(prev);
                    return order[(idx + 1) % order.length];
                  })
                }
                className="w-full h-10 justify-start gap-2 rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium px-3"
              >
                <ArrowUpDown size={16} style={{ width: 16, height: 16 }} className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">
                  {sortKey === "newest"
                    ? "Más recientes"
                    : sortKey === "name_asc"
                    ? "Nombre A-Z"
                    : sortKey === "balance_desc"
                    ? "Mayor saldo"
                    : sortKey === "rate_desc"
                    ? "Mayor comisión"
                    : "Más clics"}
                </span>
              </Button>
            </div>
          </div>
        </CardContent>

        {/* Counter & Reset Bar */}
        <div className="px-4 py-2 text-xs text-slate-500 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <span>
              Mostrando <strong className="text-slate-800 font-semibold">{filteredAffiliates.length}</strong> de {affiliates.length} afiliados
            </span>
            {(searchTerm.trim() || statusFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="h-6 px-2 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
              >
                <RotateCcw size={12} style={{ width: 12, height: 12 }} className="w-3 h-3 mr-1 shrink-0" /> Restablecer filtros
              </Button>
            )}
          </div>
          {loading && <span className="text-slate-400">Actualizando…</span>}
        </div>

        {/* DESKTOP TABLE - STRICT TABLE-FIXED & ZERO OVERFLOW */}
        <div className="hidden md:block w-full overflow-hidden">
          <table className="w-full table-fixed text-xs border-collapse">
            <colgroup>
              <col style={{ width: "23%" }} /> {/* Afiliado: Avatar 32x32 + Nombre + Correo */}
              <col style={{ width: "11%" }} /> {/* Código */}
              <col style={{ width: "9%" }} />  {/* Comisión */}
              <col style={{ width: "6%" }} />  {/* Clics */}
              <col style={{ width: "12%" }} /> {/* Saldo Disp. */}
              <col style={{ width: "10%" }} /> {/* Saldo Pendiente */}
              <col style={{ width: "11%" }} /> {/* Estado */}
              <col style={{ width: "18%" }} /> {/* Acciones (espacio seguro para los 5 botones sin desbordarse) */}
            </colgroup>
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="text-left px-3 py-2">Afiliado</th>
                <th className="text-left px-2.5 py-2">Código</th>
                <th className="text-center px-2 py-2">Comisión</th>
                <th className="text-center px-2 py-2">Clics</th>
                <th className="text-right px-2 py-2">Saldo Disp.</th>
                <th className="text-right px-2 py-2">Pendiente</th>
                <th className="text-center px-2 py-2">Estado</th>
                <th className="text-right px-2.5 py-2 whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAffiliates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-slate-500">
                    <div className="inline-flex flex-col items-center gap-1.5 max-w-sm">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">
                        No se encontraron afiliados
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Prueba ajustando los términos de búsqueda o registra un nuevo socio.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAffiliates.map((aff) => {
                  const initials = aff.name
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase() || "AF";

                  const isActive = aff.status === "active";

                  return (
                    <tr
                      key={aff.id}
                      className="group hover:bg-slate-50/70 transition-colors h-[48px]"
                    >
                      {/* 1. Afiliado Info (Avatar 32x32 con gap-2.5, min-w-0 flex-1: distancia perfecta y sin solapamiento) */}
                      <td className="px-3 py-1.5 align-middle overflow-hidden max-w-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar className="w-[32px] h-[32px] rounded-lg bg-blue-100 text-blue-800 font-bold text-[10.5px] border border-blue-200 shrink-0">
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 truncate text-[12px] leading-tight" title={aff.name}>
                              {aff.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                              {aff.email}
                              {aff.phone && ` · ${aff.phone}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Código Referido */}
                      <td className="px-2.5 py-1.5 align-middle">
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono font-bold text-slate-800 text-[10.5px]">
                          <span>{aff.affiliate_code}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(aff.affiliate_code)}
                            title="Copiar código"
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <Copy className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </td>

                      {/* 3. Comisión */}
                      <td className="px-2 py-1.5 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAffiliate(aff);
                            setNewRate(aff.commission_rate || 10);
                            setEditRateOpen(true);
                          }}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                          title="Clic para editar comisión"
                        >
                          <Percent className="w-2.5 h-2.5" />
                          <span>{aff.commission_rate}%</span>
                        </button>
                      </td>

                      {/* 4. Clics */}
                      <td className="px-2 py-1.5 align-middle text-center font-mono text-[11px] font-semibold text-slate-600 tabular-nums">
                        {aff.clicks_count || 0}
                      </td>

                      {/* 5. Saldo Disponible */}
                      <td className="px-2 py-1.5 align-middle text-right font-mono font-bold text-emerald-600 text-[11.5px] tabular-nums">
                        S/ {Number(aff.balance || 0).toFixed(2)}
                      </td>

                      {/* 6. Saldo Pendiente */}
                      <td className="px-2 py-1.5 align-middle text-right font-mono text-slate-500 text-[11px] tabular-nums">
                        S/ {Number(aff.pending_balance || 0).toFixed(2)}
                      </td>

                      {/* 7. Estado */}
                      <td className="px-2 py-1.5 align-middle text-center">
                        <Badge
                          className={cn(
                            "text-[9px] font-bold uppercase px-1.5 py-0 h-4 border",
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          )}
                        >
                          {isActive ? "Activo" : "Pausado"}
                        </Badge>
                      </td>

                      {/* 8. Acciones (Iconos 13.5px en recuadro compacto de 21px, sin desborde ni salto de columna) */}
                      <td className="px-2.5 py-1.5 align-middle text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 flex-nowrap shrink-0">
                          {/* Gestión de Credenciales / Contraseña */}
                          <button
                            type="button"
                            onClick={() => handleOpenManageCredentials(aff)}
                            className="w-[21px] h-[21px] rounded-[4px] flex items-center justify-center text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors shrink-0 cursor-pointer"
                            title="Gestionar contraseña y acceso"
                          >
                            <KeyRound size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 shrink-0" />
                          </button>

                          {/* Datos de Pago */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAffiliate(aff);
                              setPaymentInfoOpen(true);
                            }}
                            className="w-[21px] h-[21px] rounded-[4px] flex items-center justify-center text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors shrink-0 cursor-pointer"
                            title="Ver datos de pago"
                          >
                            <CreditCard size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 shrink-0" />
                          </button>

                          {/* Historial de Ventas */}
                          <button
                            type="button"
                            onClick={() => handleOpenReferrals(aff)}
                            className="w-[21px] h-[21px] rounded-[4px] flex items-center justify-center text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors shrink-0 cursor-pointer"
                            title="Ver ventas referidas"
                          >
                            <ShoppingBag size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 shrink-0" />
                          </button>

                          {/* Activar / Suspender */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(aff)}
                            className={cn(
                              "w-[21px] h-[21px] rounded-[4px] flex items-center justify-center transition-colors shrink-0 cursor-pointer",
                              isActive
                                ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            )}
                            title={isActive ? "Pausar cuenta" : "Activar cuenta"}
                          >
                            {isActive ? (
                              <PauseCircle size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                              <PlayCircle size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 shrink-0" />
                            )}
                          </button>

                          {/* Eliminar Afiliado */}
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteAffiliate(aff)}
                            className="w-[21px] h-[21px] rounded-[4px] flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                            title="Eliminar afiliado"
                          >
                            <Trash2 size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* RESPONSIVE MOBILE VIEW (< 768px) */}
        <div className="md:hidden px-3 pb-3 pt-2.5 space-y-2.5 border-t border-slate-100">
          {filteredAffiliates.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <p className="text-xs font-semibold text-slate-700">No hay afiliados</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Ajusta los filtros o registra uno nuevo.</p>
            </div>
          ) : (
            filteredAffiliates.map((aff) => {
              const initials = aff.name
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase() || "AF";
              const isActive = aff.status === "active";

              return (
                <div
                  key={aff.id}
                  className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="w-[30px] h-[30px] rounded-lg bg-blue-100 text-blue-800 font-bold text-[10px] border border-blue-200">
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate text-xs">{aff.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{aff.email}</p>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "text-[9px] font-bold uppercase shrink-0 py-0 h-4",
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      )}
                    >
                      {isActive ? "Activo" : "Pausado"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center bg-slate-50 p-2 rounded border border-slate-100 text-[10.5px]">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-semibold">CÓDIGO</span>
                      <span className="font-mono font-bold text-slate-800">{aff.affiliate_code}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-semibold">COMISIÓN</span>
                      <span className="font-bold text-blue-700">{aff.commission_rate}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-semibold">SALDO</span>
                      <span className="font-mono font-bold text-emerald-600">
                        S/{Number(aff.balance || 0).toFixed(0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-semibold">CLICS</span>
                      <span className="font-semibold text-slate-700">{aff.clicks_count || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenManageCredentials(aff)}
                      className="h-7 text-[10.5px] px-2 gap-1 rounded-md border-slate-200 text-amber-700 font-semibold"
                    >
                      <KeyRound className="w-2.5 h-2.5" />
                      Clave
                    </Button>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAffiliate(aff);
                          setPaymentInfoOpen(true);
                        }}
                        className="w-6 h-6 rounded-[4px] flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                        title="Datos de Pago"
                      >
                        <CreditCard size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 shrink-0" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenReferrals(aff)}
                        className="w-6 h-6 rounded-[4px] flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                        title="Ventas"
                      >
                        <ShoppingBag size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 shrink-0" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(aff)}
                        className={cn(
                          "w-6 h-6 rounded-[4px] flex items-center justify-center transition-colors shrink-0 cursor-pointer",
                          isActive ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"
                        )}
                        title={isActive ? "Pausar cuenta" : "Activar cuenta"}
                      >
                        {isActive ? (
                          <PauseCircle size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <PlayCircle size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 shrink-0" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteAffiliate(aff)}
                        className="w-6 h-6 rounded-[4px] flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 size={13.5} strokeWidth={2} style={{ width: 13.5, height: 13.5 }} className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* MODAL 1: REGISTRAR NUEVO AFILIADO */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white text-slate-900 border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Registrar Nuevo Afiliado
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Crea la cuenta del socio, asigna su contraseña de inicio de sesión y define su porcentaje de comisión.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAffiliate} className="space-y-3.5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="aff-name" className="text-xs font-semibold text-slate-700">
                  Nombre Completo / Razón Social *
                </Label>
                <Input
                  id="aff-name"
                  required
                  placeholder="Ej: Marcos Valdivia"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>

              <div>
                <Label htmlFor="aff-email" className="text-xs font-semibold text-slate-700">
                  Correo Electrónico (Login) *
                </Label>
                <Input
                  id="aff-email"
                  type="email"
                  required
                  placeholder="marcos@ejemplo.com"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="aff-phone" className="text-xs font-semibold text-slate-700">
                  Teléfono / WhatsApp
                </Label>
                <div className="relative mt-1">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="aff-phone"
                    placeholder="+51 976 000 000"
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    className="h-9 text-xs pl-8 border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="aff-rate" className="text-xs font-semibold text-slate-700">
                  Comisión (%) *
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="aff-rate"
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={createRate}
                    onChange={(e) => setCreateRate(Number(e.target.value))}
                    className="h-9 text-xs pr-8 border-slate-200 font-mono font-bold"
                  />
                  <Percent className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            {/* SECCIÓN DE CONTRASEÑA */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="aff-password" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  Contraseña de Acceso para el Afiliado *
                </Label>
                <button
                  type="button"
                  onClick={() => setCreatePassword(generateRandomPassword())}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  Generar segura
                </button>
              </div>

              <div className="relative">
                <Input
                  id="aff-password"
                  type={showCreatePassword ? "text" : "password"}
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="h-9 text-xs pr-9 bg-white border-slate-200 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCreatePassword(!showCreatePassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showCreatePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                El afiliado iniciará sesión en <strong>/login</strong> con su correo (o su código REF) y esta contraseña.
              </p>
            </div>

            {/* DATOS DE PAGO BANCARIO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <Label htmlFor="aff-paytype" className="text-xs font-semibold text-slate-700">
                  Método de Pago Preferido
                </Label>
                <select
                  id="aff-paytype"
                  value={createPayType}
                  onChange={(e) => setCreatePayType(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white text-xs px-2.5 mt-1 font-medium text-slate-700"
                >
                  <option value="Yape">Yape</option>
                  <option value="Plin">Plin</option>
                  <option value="BCP">BCP</option>
                  <option value="CCI">CCI</option>
                </select>
              </div>

              <div>
                <Label htmlFor="aff-paynum" className="text-xs font-semibold text-slate-700">
                  Número de Pago o Cuenta
                </Label>
                <Input
                  id="aff-paynum"
                  placeholder="976 000 000 o Cta BCP"
                  value={createPayNumber}
                  onChange={(e) => setCreatePayNumber(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateModalOpen(false)}
                className="h-9 text-xs border-slate-200"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Crear y Asignar Acceso
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: CONFIRMACIÓN Y COPIA DE CREDENCIALES */}
      <Dialog open={createdSummaryOpen} onOpenChange={setCreatedSummaryOpen}>
        <DialogContent className="sm:max-w-md bg-white text-slate-900 border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              ¡Afiliado Registrado con Éxito!
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              La cuenta y credenciales han sido creadas. Copia estos datos para compartirlos directamente con el socio.
            </DialogDescription>
          </DialogHeader>

          {lastCreatedData && (
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Socio Afiliado:</span>
                  <span className="font-bold text-slate-900">{lastCreatedData.name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Código de Referido:</span>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-mono font-bold">
                    {lastCreatedData.code}
                  </Badge>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Usuario / Correo:</span>
                  <span className="font-mono font-bold text-slate-900">{lastCreatedData.email}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Contraseña asignada:</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {lastCreatedData.password}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Página de Login:</span>
                  <span className="font-mono text-slate-600 text-[11px]">/login</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => handleCopyAccessMessage(lastCreatedData)}
                  className="h-9.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Copiar Mensaje de Bienvenida para WhatsApp
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreatedSummaryOpen(false)}
                  className="h-8.5 text-xs border-slate-200 text-slate-700"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 3: GESTIONAR CONTRASEÑA DE AFILIADO EXISTENTE */}
      <Dialog open={credentialsModalOpen} onOpenChange={setCredentialsModalOpen}>
        <DialogContent className="sm:max-w-md bg-white text-slate-900 border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600" />
              Gestionar Acceso &amp; Contraseña
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Modifica la contraseña o copia las credenciales de <strong>{selectedAffiliate?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          {selectedAffiliate && (
            <form onSubmit={handleSaveExistingPassword} className="space-y-4 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Correo / Usuario:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedAffiliate.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Código de Referido:</span>
                  <span className="font-mono font-bold text-blue-700">{selectedAffiliate.affiliate_code}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="m-pass" className="text-xs font-semibold text-slate-700">
                    Nueva Contraseña
                  </Label>
                  <button
                    type="button"
                    onClick={() => setManagePassword(generateRandomPassword())}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Generar segura
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="m-pass"
                    type={showManagePassword ? "text" : "password"}
                    required
                    value={managePassword}
                    onChange={(e) => setManagePassword(e.target.value)}
                    className="h-9 text-xs pr-9 font-mono border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowManagePassword(!showManagePassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showManagePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {isUpdatingPassword ? "Guardando…" : "Actualizar Contraseña"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    handleCopyAccessMessage({
                      name: selectedAffiliate.name,
                      email: selectedAffiliate.email,
                      code: selectedAffiliate.affiliate_code,
                      password: managePassword,
                    })
                  }
                  className="h-8.5 text-xs border-slate-200 text-slate-700 gap-1.5"
                >
                  <Share2 className="w-3 h-3 text-emerald-600" />
                  Copiar Mensaje de Acceso para WhatsApp
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 4: EDITAR TASA DE COMISIÓN */}
      <Dialog open={editRateOpen} onOpenChange={setEditRateOpen}>
        <DialogContent className="sm:max-w-md bg-white text-slate-900 border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Percent className="w-4 h-4 text-blue-600" />
              Editar Comisión de Afiliado
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Ajusta el porcentaje individual que recibirá <strong>{selectedAffiliate?.name}</strong> sobre cada venta concretada.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCommissionRate} className="space-y-4 pt-2">
            <div>
              <Label htmlFor="comm-rate" className="text-xs font-semibold text-slate-700">
                Porcentaje de Comisión (%)
              </Label>
              <div className="relative mt-1">
                <Input
                  id="comm-rate"
                  type="number"
                  min="1"
                  max="50"
                  step="0.5"
                  required
                  value={newRate}
                  onChange={(e) => setNewRate(Number(e.target.value))}
                  className="h-9 pl-7 pr-10 font-bold font-mono text-sm border-slate-200"
                />
                <Percent className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  %
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 mt-1">
                Ejemplo: Con 15%, una compra de S/ 200.00 genera S/ 30.00 de comisión.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditRateOpen(false)}
                className="h-8.5 text-xs border-slate-200"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-8.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Guardar Porcentaje
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 5: DATOS DE PAGO BANCARIO */}
      <Dialog open={paymentInfoOpen} onOpenChange={setPaymentInfoOpen}>
        <DialogContent className="sm:max-w-md bg-white text-slate-900 border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Datos de Pago y Transferencia
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Información registrada para liquidar comisiones a <strong>{selectedAffiliate?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Afiliado:</span>
                <span className="font-bold text-slate-900">{selectedAffiliate?.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Método Preferido:</span>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-bold">
                  {selectedAffiliate?.payment_info?.type || "Yape"}
                </Badge>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Número / Cuenta:</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {selectedAffiliate?.payment_info?.number || selectedAffiliate?.phone || "No registrado"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Titular de la cuenta:</span>
                <span className="font-semibold text-slate-800">
                  {selectedAffiliate?.payment_info?.account_name || selectedAffiliate?.name}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPaymentInfoOpen(false)}
                className="h-8.5 text-xs"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 6: HISTORIAL DE VENTAS REFERIDAS */}
      <Dialog open={referralsModalOpen} onOpenChange={setReferralsModalOpen}>
        <DialogContent className="sm:max-w-2xl bg-white text-slate-900 border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              Historial de Ventas Referidas: {selectedAffiliate?.affiliate_code}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Listado de compras generadas a través del código de <strong>{selectedAffiliate?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[380px] overflow-y-auto pt-2">
            {affiliateReferrals.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">
                Este afiliado aún no registra ventas asociadas.
              </p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-2.5">Pedido</th>
                    <th className="py-2 px-2.5">Detalle</th>
                    <th className="py-2 px-2.5 text-right">Monto Pagado</th>
                    <th className="py-2 px-2.5 text-right">Comisión</th>
                    <th className="py-2 px-2.5 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {affiliateReferrals.map((ref) => (
                    <tr key={ref.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-2.5 font-mono font-bold text-slate-800">
                        {ref.order_id}
                      </td>
                      <td className="py-2 px-2.5 max-w-[200px] truncate text-slate-600">
                        {ref.product_summary}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono font-semibold text-slate-900">
                        S/ {Number(ref.order_amount).toFixed(2)}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono font-bold text-emerald-600">
                        S/ {Number(ref.commission_amount).toFixed(2)}
                      </td>
                      <td className="py-2 px-2.5 text-center">
                        <Badge
                          className={cn(
                            "text-[9px] font-bold uppercase py-0 h-4",
                            ref.status === "paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : ref.status === "approved"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          )}
                        >
                          {ref.status === "paid"
                            ? "Pagado"
                            : ref.status === "approved"
                            ? "Aprobado"
                            : "Pendiente"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 7: CONFIRMAR ELIMINACIÓN DE AFILIADO */}
      <AlertDialog
        open={!!confirmDeleteAffiliate}
        onOpenChange={(open) => !open && setConfirmDeleteAffiliate(null)}
      >
        <AlertDialogContent className="bg-white text-slate-900 border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              ¿Eliminar cuenta de afiliado?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              Estás a punto de eliminar permanentemente al socio{" "}
              <strong>«{confirmDeleteAffiliate?.name}»</strong> (Código:{" "}
              <strong>{confirmDeleteAffiliate?.affiliate_code}</strong>). Esta acción removerá su acceso y registro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-100">
            <AlertDialogCancel className="h-8.5 text-xs border-slate-200">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAffiliate}
              className="h-8.5 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              Sí, eliminar afiliado
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
