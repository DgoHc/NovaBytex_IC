"use client";

import React, { useState, useEffect } from "react";
import {
  Banknote,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Upload,
  ExternalLink,
  FileText,
  DollarSign,
  RefreshCw,
  Eye,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AffiliateService,
  PayoutRequest,
} from "@/services/AffiliateService";
import { useCatalog } from "@/contexts/CatalogContext";
import { cn } from "@/lib/utils";

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "requested" | "paid" | "rejected">("all");

  // Liquidar Payout Modal
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  // Vista Previa de Comprobante
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const { pushToast } = useCatalog();

  const loadPayouts = async () => {
    setLoading(true);
    try {
      const data = await AffiliateService.getPayoutRequests();
      setPayouts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, []);

  const handleOpenSettle = (payout: PayoutRequest) => {
    setSelectedPayout(payout);
    setReceiptUrl(payout.receipt_url || "");
    setAdminNotes(
      payout.admin_notes ||
        `Transferencia realizada vía ${payout.payment_method}. Op #${Math.floor(
          100000 + Math.random() * 900000
        )}`
    );
    setSettleModalOpen(true);
  };

  const handleConfirmSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout) return;

    const updated = await AffiliateService.updatePayoutStatus({
      payoutId: selectedPayout.id,
      status: "paid",
      receiptUrl: receiptUrl.trim() || undefined,
      adminNotes: adminNotes.trim() || undefined,
    });

    if (updated) {
      pushToast({
        title: "Retiro Liquidado con Éxito",
        description: `Se marcó como pagado el monto de S/ ${selectedPayout.amount.toFixed(2)} para ${selectedPayout.affiliate_name}.`,
        variant: "success",
      });
      setSettleModalOpen(false);
      loadPayouts();
    }
  };

  const handleRejectPayout = async (payout: PayoutRequest) => {
    const confirmReject = window.confirm(
      `¿Deseas rechazar la solicitud de S/ ${payout.amount.toFixed(2)} de ${payout.affiliate_name}? El saldo será reembolsado al afiliado.`
    );
    if (!confirmReject) return;

    const reason = window.prompt("Ingresa el motivo del rechazo:", "Datos de cuenta bancaria o Yape incorrectos.");
    if (reason === null) return;

    const updated = await AffiliateService.updatePayoutStatus({
      payoutId: payout.id,
      status: "rejected",
      adminNotes: `Rechazado por administración: ${reason}`,
    });

    if (updated) {
      pushToast({
        title: "Solicitud Rechazada",
        description: `Se reembolsó S/ ${payout.amount.toFixed(2)} al saldo disponible del afiliado.`,
        variant: "info",
      });
      loadPayouts();
    }
  };

  // Subida de imagen simulada o conversión a DataURL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setReceiptUrl(reader.result);
          pushToast({
            title: "Comprobante cargado",
            description: "Imagen lista para adjuntar al comprobante.",
            variant: "info",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredPayouts = payouts.filter((p) => {
    const matchesSearch =
      (p.affiliate_name && p.affiliate_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.affiliate_code && p.affiliate_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.payment_details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // KPIs
  const requestedPayouts = payouts.filter((p) => p.status === "requested");
  const pendingAmount = requestedPayouts.reduce((sum, p) => sum + p.amount, 0);
  const paidPayouts = payouts.filter((p) => p.status === "paid");
  const totalPaidAmount = paidPayouts.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Solicitudes de Pago
            </h1>
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs font-bold">
              {requestedPayouts.length} Por Liquidar
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Revisa solicitudes de retiro de comisiones de afiliados, liquida pagos y adjunta comprobantes (Yape / Plin / Transferencia).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadPayouts}
            className="text-xs h-9 gap-1.5 border-slate-200"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Pendientes de Pago
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {requestedPayouts.length}
          </p>
          <span className="text-[11px] text-amber-700 mt-0.5 block font-medium">
            Por S/ {pendingAmount.toFixed(2)} en total
          </span>
        </Card>

        <Card className="p-4 bg-white border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Liquidado
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            S/ {totalPaidAmount.toFixed(2)}
          </p>
          <span className="text-[11px] text-emerald-700 mt-0.5 block font-medium">
            {paidPayouts.length} transferencias realizadas
          </span>
        </Card>

        <Card className="p-4 bg-white border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Monto Mínimo Permitido
            </span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
            S/ 50.00
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Regla de retiro para afiliados
          </span>
        </Card>

        <Card className="p-4 bg-white border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Solicitudes
            </span>
            <Banknote className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {payouts.length}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Histórico registrado en la plataforma
          </span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white border-slate-200 rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por afiliado, código o cuenta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs rounded-lg border-slate-200 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Estado:
            </span>
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/50 p-0.5 text-xs">
              <button
                onClick={() => setStatusFilter("all")}
                className={cn(
                  "px-3 py-1 rounded-md font-medium transition-all",
                  statusFilter === "all"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Todas
              </button>
              <button
                onClick={() => setStatusFilter("requested")}
                className={cn(
                  "px-3 py-1 rounded-md font-medium transition-all",
                  statusFilter === "requested"
                    ? "bg-amber-50 text-amber-800 border border-amber-200 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Solicitadas
              </button>
              <button
                onClick={() => setStatusFilter("paid")}
                className={cn(
                  "px-3 py-1 rounded-md font-medium transition-all",
                  statusFilter === "paid"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Pagadas
              </button>
              <button
                onClick={() => setStatusFilter("rejected")}
                className={cn(
                  "px-3 py-1 rounded-md font-medium transition-all",
                  statusFilter === "rejected"
                    ? "bg-rose-50 text-rose-800 border border-rose-200 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Rechazadas
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Payouts Table */}
      <Card className="bg-white border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10.5px]">
              <tr>
                <th className="py-3 px-4">Fecha Solicitud</th>
                <th className="py-3 px-4">Afiliado</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4">Método de Pago</th>
                <th className="py-3 px-4">Detalle / Cuenta</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Comprobante</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No se encontraron solicitudes de pago con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((payout) => {
                  const isRequested = payout.status === "requested";
                  const isPaid = payout.status === "paid";
                  const isRejected = payout.status === "rejected";

                  return (
                    <tr
                      key={payout.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {payout.created_at ? new Date(payout.created_at).toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) : "-"}
                      </td>

                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-slate-900">
                            {payout.affiliate_name || "Afiliado"}
                          </p>
                          <span className="font-mono text-[10.5px] text-blue-600 font-bold">
                            {payout.affiliate_code}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                        S/ {Number(payout.amount).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge className="bg-slate-100 text-slate-800 border-slate-200 font-bold">
                          {payout.payment_method}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-slate-700 max-w-[220px] truncate">
                        {payout.payment_details}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          className={cn(
                            "text-[10px] font-bold uppercase",
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isRequested
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          )}
                        >
                          {isPaid
                            ? "Pagado"
                            : isRequested
                            ? "Solicitado"
                            : "Rechazado"}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {payout.receipt_url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPreviewUrl(payout.receipt_url || "");
                              setPreviewModalOpen(true);
                            }}
                            className="h-7 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 gap-1 text-[11px]"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            Ver Recibo
                          </Button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Sin comprobante
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isRequested && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleOpenSettle(payout)}
                                className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Liquidar
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectPayout(payout)}
                                className="h-7 px-2 border-rose-200 text-rose-600 hover:bg-rose-50 text-xs"
                                title="Rechazar retiro"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}

                          {isPaid && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenSettle(payout)}
                              className="h-7 px-2 text-slate-600 hover:text-slate-900 text-xs border-slate-200"
                              title="Editar o cambiar comprobante"
                            >
                              <Upload className="w-3.5 h-3.5 mr-1" />
                              Comprobante
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL 1: LIQUIDAR / ADJUNTAR COMPROBANTE DE PAGO */}
      <Dialog open={settleModalOpen} onOpenChange={setSettleModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white text-slate-900 border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-600" />
              Liquidar Pago a Afiliado
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Marca como pagada la solicitud de <strong>{selectedPayout?.affiliate_name}</strong> ({selectedPayout?.affiliate_code}) y adjunta la captura o URL del comprobante.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmSettle} className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Monto a Transferir:</span>
                <span className="font-mono font-black text-emerald-600 text-sm">
                  S/ {selectedPayout?.amount ? selectedPayout.amount.toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Método:</span>
                <span className="font-bold text-slate-900">{selectedPayout?.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Datos / Cuenta:</span>
                <span className="font-mono font-semibold text-slate-800">{selectedPayout?.payment_details}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="receipt-url" className="text-xs font-semibold text-slate-700">
                URL del Comprobante (Yape, Plin o Voucher bancario)
              </Label>
              <div className="relative mt-1">
                <Input
                  id="receipt-url"
                  placeholder="https://ejemplo.com/comprobante.jpg o sube archivo abajo"
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  className="h-9 text-xs border-slate-200"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700 block mb-1">
                O subir captura de imagen / PDF
              </Label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {receiptUrl && (
              <div className="p-2 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Comprobante adjuntado
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPreviewUrl(receiptUrl);
                    setPreviewModalOpen(true);
                  }}
                  className="h-7 text-xs text-blue-600"
                >
                  Ver Previa
                </Button>
              </div>
            )}

            <div>
              <Label htmlFor="admin-notes" className="text-xs font-semibold text-slate-700">
                Notas de la Transferencia / N° Operación
              </Label>
              <Input
                id="admin-notes"
                placeholder="Ej: Transferido vía Yape. Op: #481920"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="h-9 text-xs border-slate-200 mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSettleModalOpen(false)}
                className="h-9 text-xs border-slate-200"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Confirmar Liquidación
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: VISTA PREVIA DEL COMPROBANTE */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="sm:max-w-xl bg-white text-slate-900 border-slate-200 p-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Comprobante de Pago
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center min-h-[300px]">
            {previewUrl.startsWith("data:application/pdf") ? (
              <iframe src={previewUrl} className="w-full h-[400px]" />
            ) : (
              <img
                src={previewUrl}
                alt="Comprobante de pago"
                className="max-h-[450px] w-auto object-contain"
              />
            )}
          </div>

          <div className="flex justify-end pt-3">
            <Button
              type="button"
              size="sm"
              onClick={() => setPreviewModalOpen(false)}
              className="h-8 text-xs"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
