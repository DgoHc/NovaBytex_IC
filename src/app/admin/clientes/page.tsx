"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Award,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Gift,
  ArrowUpDown,
  Filter,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ClientService,
  RegisteredClient,
  calculateLoyalty,
} from "@/services/ClientService";
import { AffiliateService } from "@/services/AffiliateService";
import { useCatalog } from "@/contexts/CatalogContext";

export default function AdminClientesPage() {
  const [clients, setClients] = useState<RegisteredClient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [providerFilter, setProviderFilter] = useState<"all" | "google" | "otp" | "password">("all");
  type ClientSortOption = "newest" | "name_asc" | "purchases_desc" | "spent_desc";
  const [sortKey, setSortKey] = useState<ClientSortOption>("newest");
  const [selectedClient, setSelectedClient] = useState<RegisteredClient | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { pushToast } = useCatalog();

  const loadClients = () => {
    const list = ClientService.list();
    const affiliates = AffiliateService.getStoredAffiliates();
    const affiliateEmails = new Set(affiliates.map((a) => a.email.toLowerCase()));

    // Excluir cuentas de socios afiliados para mantener exclusivamente clientes compradores
    const regularClients = list.filter(
      (c) => c.role !== "affiliate" && !affiliateEmails.has(c.email.toLowerCase())
    );
    setClients(regularClients);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    const list = clients.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm));

      const matchesProvider =
        providerFilter === "all" ? true : c.provider === providerFilter;

      return matchesSearch && matchesProvider;
    });

    switch (sortKey) {
      case "name_asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "purchases_desc":
        list.sort((a, b) => (b.purchasesCount || 0) - (a.purchasesCount || 0));
        break;
      case "spent_desc":
        list.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
        break;
      case "newest":
      default:
        list.sort((a, b) => (b.registeredAt || "").localeCompare(a.registeredAt || ""));
        break;
    }

    return list;
  }, [clients, searchTerm, providerFilter, sortKey]);

  const totalClients = clients.length;
  const totalPurchases = clients.reduce((acc, c) => acc + (c.purchasesCount || 0), 0);
  const totalVolume = clients.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
  const activeDiscounts = clients.filter((c) => (c.loyaltyDiscount || 0) > 0).length;

  const handleSimulatePurchase = (client: RegisteredClient) => {
    const newCount = (client.purchasesCount || 0) + 1;
    const addedSpent = Math.floor(150 + Math.random() * 450);
    const newSpent = (client.totalSpent || 0) + addedSpent;
    const { discount, maxPrice } = calculateLoyalty(newCount);

    const newOrder = {
      id: `NB-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split("T")[0],
      itemsCount: 2,
      total: addedSpent,
      discountApplied: client.loyaltyDiscount || 5,
      status: "Entregado" as const,
      itemsSummary: "Pedido de prueba registrado por administración",
    };

    const updated: RegisteredClient = {
      ...client,
      purchasesCount: newCount,
      totalSpent: newSpent,
      loyaltyDiscount: discount,
      maxDiscountPrice: maxPrice,
      recentOrders: [newOrder, ...(client.recentOrders || [])],
    };

    ClientService.save(updated);
    loadClients();
    if (selectedClient?.id === client.id) {
      setSelectedClient(updated);
    }

    pushToast({
      title: "Compra registrada con éxito",
      description: `${client.name} subió a ${discount}% de descuento para su próxima compra.`,
      variant: "success",
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Clientes Registrados
            </h1>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
              {totalClients} Usuarios
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervisión de clientes, métodos de autenticación (Google / OTP / Contraseña) y descuentos por fidelidad.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadClients}
            className="text-xs h-9 gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Clientes
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalClients}</p>
          <span className="text-[11px] text-blue-600 mt-0.5 block font-medium">Registrados en la plataforma</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Compras Totales
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalPurchases}</p>
          <span className="text-[11px] text-emerald-600 mt-0.5 block font-medium">Pedidos completados</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Volumen Acumulado
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">S/ {totalVolume.toLocaleString("es-PE")}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Ticket total generado</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Descuentos Activos
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{activeDiscounts}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Clientes con cupón fidelidad</span>
        </Card>
      </div>

      {/* Main Table Card - STRICT TABLE & ZERO OVERFLOW */}
      <Card className="overflow-hidden border-slate-200/90 rounded-xl bg-white shadow-2xs">
        {/* Clean Filter Controls (todos h-10, gap de 12px, alineados en una sola fila) */}
        <CardContent className="p-3 lg:px-4 lg:py-2.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full">
            {/* Buscador con lupa de 16px en position absolute left 12px y padding-left de 38px */}
            <div className="relative flex-1 min-w-[220px]">
              <Search
                size={16}
                style={{ width: 16, height: 16 }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none shrink-0"
              />
              <Input
                placeholder="Buscar por nombre, correo o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-[38px] h-10 rounded-lg bg-white border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 w-full"
              />
            </div>

            {/* Provider Filter Select */}
            <div className="w-full sm:w-[190px] shrink-0 min-w-[160px]">
              <Select
                value={providerFilter}
                onValueChange={(v) => setProviderFilter(v as any)}
              >
                <SelectTrigger className="h-10 rounded-lg bg-white border-slate-200 text-xs w-full min-w-[160px]">
                  <SelectValue placeholder="Método de acceso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">Método: Todos</SelectItem>
                  <SelectItem value="google" className="text-xs">Google</SelectItem>
                  <SelectItem value="otp" className="text-xs">Código OTP</SelectItem>
                  <SelectItem value="password" className="text-xs">Contraseña</SelectItem>
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
                    const order: ClientSortOption[] = [
                      "newest",
                      "name_asc",
                      "purchases_desc",
                      "spent_desc",
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
                    : sortKey === "purchases_desc"
                    ? "Más compras"
                    : "Mayor gasto"}
                </span>
              </Button>
            </div>
          </div>
        </CardContent>

        {/* Counter & Reset Bar */}
        <div className="px-4 py-2 text-xs text-slate-500 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <span>
              Mostrando <strong className="text-slate-800 font-semibold">{filteredClients.length}</strong> de {clients.length} clientes
            </span>
            {(searchTerm.trim() || providerFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setProviderFilter("all");
                }}
                className="h-6 px-2 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
              >
                <RotateCcw size={12} style={{ width: 12, height: 12 }} className="w-3 h-3 mr-1 shrink-0" /> Restablecer filtros
              </Button>
            )}
          </div>
        </div>

        {/* Table of Registered Clients */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Método de Acceso</th>
                <th className="py-3 px-4">Fidelidad &amp; Descuento</th>
                <th className="py-3 px-4">Compras</th>
                <th className="py-3 px-4">Registro</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => {
                  const loyalty = calculateLoyalty(client.purchasesCount || 0);
                  const isAdm = client.role === "admin";
                  return (
                    <tr key={client.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 rounded-xl border border-slate-200">
                            {client.avatar && <AvatarImage src={client.avatar} alt={client.name} />}
                            <AvatarFallback className="bg-slate-800 text-white font-bold text-xs rounded-xl">
                              {client.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 truncate">{client.name}</span>
                              {isAdm && (
                                <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[9px] font-bold">
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">ID: {client.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {client.provider === "google" ? (
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold gap-1">
                            Google OAuth
                          </Badge>
                        ) : client.provider === "otp" ? (
                          <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold gap-1">
                            Código OTP
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-bold gap-1">
                            Contraseña
                          </Badge>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {isAdm ? (
                          <span className="text-slate-400 text-[11px]">N/A (Admin)</span>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
                              <Gift className="w-3 h-3 text-emerald-600" />
                              {loyalty.discount}% OFF activo
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              Nivel {loyalty.level} (tope S/ {loyalty.maxPrice})
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div>
                          <span className="font-bold text-slate-900">{client.purchasesCount || 0} pedidos</span>
                          <span className="text-[11px] text-slate-500 block">
                            S/ {(client.totalSpent || 0).toLocaleString("es-PE")}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {new Date(client.registeredAt).toLocaleDateString("es-PE")}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedClient(client);
                              setDetailsOpen(true);
                            }}
                            className="h-8 text-xs px-2.5 border-slate-200 hover:bg-slate-100"
                          >
                            Ver detalle
                          </Button>
                          {!isAdm && (
                            <Button
                              size="sm"
                              onClick={() => handleSimulatePurchase(client)}
                              title="Simular nueva compra para este cliente (aumenta nivel de fidelidad)"
                              className="h-8 text-xs px-2.5 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Plus className="w-3 h-3 mr-1" /> + Compra
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No se encontraron clientes con el filtro seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Client Detail Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-xl p-6 rounded-2xl bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Detalle del Cliente
            </DialogTitle>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <Avatar className="h-12 w-12 rounded-xl">
                  {selectedClient.avatar && <AvatarImage src={selectedClient.avatar} alt={selectedClient.name} />}
                  <AvatarFallback className="bg-slate-800 text-white font-bold text-sm">
                    {selectedClient.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedClient.name}</h3>
                  <p className="text-xs text-slate-500">{selectedClient.email}</p>
                  <p className="text-[11px] text-slate-400">{selectedClient.phone || "Sin teléfono registrado"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-slate-500 block">Compras registradas:</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 block">{selectedClient.purchasesCount}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-slate-500 block">Total gastado:</span>
                  <span className="text-base font-bold text-emerald-600 mt-0.5 block">S/ {selectedClient.totalSpent.toLocaleString("es-PE")}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-slate-500 block">Descuento de fidelidad:</span>
                  <span className="text-base font-bold text-blue-600 mt-0.5 block">{selectedClient.loyaltyDiscount}% OFF</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-slate-500 block">Precio tope de producto:</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 block">Hasta S/ {selectedClient.maxDiscountPrice}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Historial de Pedidos Recientes
                </h4>
                {selectedClient.recentOrders && selectedClient.recentOrders.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedClient.recentOrders.map((ord) => (
                      <div key={ord.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-700">{ord.id}</span>
                            <span className="text-[10px] text-slate-500">{ord.date}</span>
                          </div>
                          <p className="text-slate-700 text-[11px] mt-0.5">{ord.itemsSummary}</p>
                        </div>
                        <span className="font-bold text-slate-900">S/ {ord.total.toLocaleString("es-PE")}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No registra pedidos anteriores aún.</p>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSimulatePurchase(selectedClient)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Simular Compra y Actualizar Nivel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
