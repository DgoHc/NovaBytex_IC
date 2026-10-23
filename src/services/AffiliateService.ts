import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { ClientService } from "@/services/ClientService";
import { syncAffiliateAuthUserAction } from "@/app/admin/afiliados/actions";

export interface AffiliatePaymentInfo {
  type: "Yape" | "Plin" | "BCP" | "Interbank" | "BBVA" | "CCI";
  number: string;
  account_name: string;
}

export interface Affiliate {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string; // Credencial para login en /login
  affiliate_code: string; // ej: REF-1002
  commission_rate: number; // ej: 10 (%)
  payment_info: AffiliatePaymentInfo;
  balance: number; // Saldo disponible para retiro
  pending_balance: number; // Saldo en revisión / pendiente
  clicks_count: number;
  status: "active" | "suspended";
  created_at: string;
  updated_at: string;
}

export interface AffiliateReferral {
  id: string;
  affiliate_id: string;
  affiliate_code: string;
  order_id: string;
  order_amount: number; // PRECIO FINAL pagado en checkout
  commission_amount: number; // order_amount * (commission_rate / 100)
  status: "pending" | "approved" | "paid" | "cancelled";
  buyer_id?: string;
  buyer_email?: string;
  product_summary: string;
  created_at: string;
}

export interface PayoutRequest {
  id: string;
  affiliate_id: string;
  affiliate_name?: string;
  affiliate_code?: string;
  amount: number;
  status: "requested" | "paid" | "rejected";
  payment_method: string;
  payment_details: string;
  receipt_url?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

const AFFILIATES_KEY = "nova:affiliates:v1";
const REFERRALS_KEY = "nova:affiliate_referrals:v1";
const PAYOUTS_KEY = "nova:payout_requests:v1";

// Datos semilla de demostración / iniciales
export const INITIAL_AFFILIATES: Affiliate[] = [
  {
    id: "aff-1002",
    user_id: "user-aff-1",
    name: "Alex Huamán Cueva",
    email: "alex.huaman@gmail.com",
    phone: "+51 976 543 210",
    password: "Password123!",
    affiliate_code: "REF-1002",
    commission_rate: 10,
    payment_info: {
      type: "Yape",
      number: "976543210",
      account_name: "Alex Huamán Cueva",
    },
    balance: 145.50,
    pending_balance: 38.00,
    clicks_count: 64,
    status: "active",
    created_at: "2026-01-15T10:00:00.000Z",
    updated_at: "2026-02-01T15:00:00.000Z",
  },
  {
    id: "aff-1003",
    user_id: "user-aff-2",
    name: "Carolina Mendoza Valera",
    email: "carolina.mendoza@hotmail.com",
    phone: "+51 987 654 321",
    password: "Password123!",
    affiliate_code: "REF-1003",
    commission_rate: 12,
    payment_info: {
      type: "BCP",
      number: "193-98765432-0-88",
      account_name: "Carolina Mendoza Valera",
    },
    balance: 82.00,
    pending_balance: 0.00,
    clicks_count: 32,
    status: "active",
    created_at: "2026-02-01T12:00:00.000Z",
    updated_at: "2026-02-18T18:30:00.000Z",
  },
  {
    id: "aff-1004",
    user_id: "user-aff-3",
    name: "Digital Solutions Norte",
    email: "contacto@digitalsolutions.pe",
    phone: "+51 945 001 928",
    password: "Password123!",
    affiliate_code: "REF-1004",
    commission_rate: 15,
    payment_info: {
      type: "CCI",
      number: "002-193-009876543208-14",
      account_name: "Digital Solutions Norte EIRL",
    },
    balance: 310.00,
    pending_balance: 95.00,
    clicks_count: 140,
    status: "active",
    created_at: "2025-12-05T08:00:00.000Z",
    updated_at: "2026-03-01T11:00:00.000Z",
  },
  {
    id: "aff-1005",
    user_id: "user-aff-4",
    name: "Diego",
    email: "zdiegoc3@outlook.com",
    phone: "969968423",
    password: "Password123!",
    affiliate_code: "REF-1005",
    commission_rate: 10,
    payment_info: {
      type: "Yape",
      number: "969968423",
      account_name: "Diego",
    },
    balance: 0.00,
    pending_balance: 0.00,
    clicks_count: 0,
    status: "active",
    created_at: "2026-03-01T10:00:00.000Z",
    updated_at: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "aff-1006",
    user_id: "user-aff-5",
    name: "DiegoAfi",
    email: "dafi_1@unc.edu.pe",
    phone: "969968423",
    password: "Password123!",
    affiliate_code: "REF-1006",
    commission_rate: 10,
    payment_info: {
      type: "Yape",
      number: "969968423",
      account_name: "DiegoAfi",
    },
    balance: 0.00,
    pending_balance: 0.00,
    clicks_count: 0,
    status: "active",
    created_at: "2026-03-01T10:00:00.000Z",
    updated_at: "2026-03-01T10:00:00.000Z",
  },
];

export const INITIAL_REFERRALS: AffiliateReferral[] = [
  {
    id: "ref-ord-501",
    affiliate_id: "aff-1002",
    affiliate_code: "REF-1002",
    order_id: "NB-ORD-9401",
    order_amount: 180.00,
    commission_amount: 18.00,
    status: "approved",
    buyer_email: "cliente.compra1@gmail.com",
    product_summary: "Licencia Adobe Acrobat Pro DC 1 Año",
    created_at: "2026-02-15T14:20:00.000Z",
  },
  {
    id: "ref-ord-502",
    affiliate_id: "aff-1002",
    affiliate_code: "REF-1002",
    order_id: "NB-ORD-9488",
    order_amount: 1275.00,
    commission_amount: 127.50,
    status: "paid",
    buyer_email: "empresa.cajamarca@outlook.com",
    product_summary: "Switch TP-Link JetStream 24P PoE + Antivirus ESET Server",
    created_at: "2026-02-28T16:45:00.000Z",
  },
  {
    id: "ref-ord-503",
    affiliate_id: "aff-1002",
    affiliate_code: "REF-1002",
    order_id: "NB-ORD-9530",
    order_amount: 380.00,
    commission_amount: 38.00,
    status: "pending",
    buyer_email: "fernando.perez@gmail.com",
    product_summary: "Kaspersky Total Security 5 Disp + Office 365 Pro",
    created_at: "2026-03-04T10:15:00.000Z",
  },
  {
    id: "ref-ord-504",
    affiliate_id: "aff-1003",
    affiliate_code: "REF-1003",
    order_id: "NB-ORD-9512",
    order_amount: 683.33,
    commission_amount: 82.00,
    status: "approved",
    buyer_email: "mariana.rojas@outlook.com",
    product_summary: "Router Mikrotik Cloud Router + 2 Licencias Windows 11 Pro",
    created_at: "2026-03-01T11:00:00.000Z",
  },
];

export const INITIAL_PAYOUTS: PayoutRequest[] = [
  {
    id: "pay-req-001",
    affiliate_id: "aff-1002",
    affiliate_name: "Alex Huamán Cueva",
    affiliate_code: "REF-1002",
    amount: 127.50,
    status: "paid",
    payment_method: "Yape",
    payment_details: "976543210 - Alex Huamán Cueva",
    receipt_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80",
    admin_notes: "Transferido exitosamente vía Yape el 01/03/2026. Ref Op: #481920",
    created_at: "2026-02-28T18:00:00.000Z",
    updated_at: "2026-03-01T09:30:00.000Z",
  },
  {
    id: "pay-req-002",
    affiliate_id: "aff-1004",
    affiliate_name: "Digital Solutions Norte",
    affiliate_code: "REF-1004",
    amount: 180.00,
    status: "requested",
    payment_method: "CCI",
    payment_details: "002-193-009876543208-14 - Digital Solutions Norte EIRL",
    admin_notes: "Pendiente de transferencia bancaria por Gerencia.",
    created_at: "2026-03-05T12:00:00.000Z",
    updated_at: "2026-03-05T12:00:00.000Z",
  },
];

export class AffiliateService {
  // ==========================================
  // STORAGE HELPERS (Local fallback sync)
  // ==========================================
  public static getStoredAffiliates(): Affiliate[] {
    if (typeof window === "undefined") return INITIAL_AFFILIATES;
    try {
      const data = localStorage.getItem(AFFILIATES_KEY);
      if (!data) {
        localStorage.setItem(AFFILIATES_KEY, JSON.stringify(INITIAL_AFFILIATES));
        return INITIAL_AFFILIATES;
      }
      const parsed: Affiliate[] = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let hasChanges = false;
        const merged = [...parsed];
        for (const initAff of INITIAL_AFFILIATES) {
          const exists = merged.some(
            (a) =>
              a.email.toLowerCase() === initAff.email.toLowerCase() ||
              a.id === initAff.id
          );
          if (!exists) {
            merged.push(initAff);
            hasChanges = true;
          }
        }
        if (hasChanges) {
          localStorage.setItem(AFFILIATES_KEY, JSON.stringify(merged));
        }
        return merged;
      }
      return INITIAL_AFFILIATES;
    } catch {
      return INITIAL_AFFILIATES;
    }
  }

  private static saveStoredAffiliates(affiliates: Affiliate[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(AFFILIATES_KEY, JSON.stringify(affiliates));
    } catch {
      // ignore
    }
  }

  private static getStoredReferrals(): AffiliateReferral[] {
    if (typeof window === "undefined") return INITIAL_REFERRALS;
    try {
      const data = localStorage.getItem(REFERRALS_KEY);
      if (!data) {
        localStorage.setItem(REFERRALS_KEY, JSON.stringify(INITIAL_REFERRALS));
        return INITIAL_REFERRALS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_REFERRALS;
    }
  }

  private static saveStoredReferrals(referrals: AffiliateReferral[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(REFERRALS_KEY, JSON.stringify(referrals));
    } catch {
      // ignore
    }
  }

  private static getStoredPayouts(): PayoutRequest[] {
    if (typeof window === "undefined") return INITIAL_PAYOUTS;
    try {
      const data = localStorage.getItem(PAYOUTS_KEY);
      if (!data) {
        localStorage.setItem(PAYOUTS_KEY, JSON.stringify(INITIAL_PAYOUTS));
        return INITIAL_PAYOUTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PAYOUTS;
    }
  }

  private static saveStoredPayouts(payouts: PayoutRequest[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(PAYOUTS_KEY, JSON.stringify(payouts));
    } catch {
      // ignore
    }
  }

  // ==========================================
  // AFILIADOS - QUERIES & MUTATIONS
  // ==========================================
  static async getAllAffiliates(): Promise<Affiliate[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("affiliates")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch {
        // Fallback to local
      }
    }
    return this.getStoredAffiliates();
  }

  static async getAffiliateById(id: string): Promise<Affiliate | null> {
    const list = await this.getAllAffiliates();
    return list.find((a) => a.id === id) || null;
  }

  static async getAffiliateByCode(code: string): Promise<Affiliate | null> {
    if (!code) return null;
    const clean = code.trim().toUpperCase();
    const list = await this.getAllAffiliates();
    return list.find((a) => a.affiliate_code.toUpperCase() === clean) || null;
  }

  static async getAffiliateByUserIdOrEmail(userIdOrEmail: string): Promise<Affiliate | null> {
    if (!userIdOrEmail) return null;
    const clean = userIdOrEmail.trim().toLowerCase();
    const list = await this.getAllAffiliates();
    let found = list.find(
      (a) =>
        a.user_id?.toLowerCase() === clean ||
        a.email?.toLowerCase() === clean
    );
    if (found) return found;

    // Respaldo directo en storage local para garantizar que nunca se pierda un afiliado registrado
    const stored = this.getStoredAffiliates();
    found = stored.find((a) => a.email.toLowerCase() === clean || a.user_id?.toLowerCase() === clean);
    if (found) return found;

    // Si existe en ClientService como afiliado, auto-provisionar registro en AffiliateService
    const client = ClientService.findByEmail(clean);
    if (client && (client.role === "affiliate" || clean === "zdiegoc3@outlook.com" || clean === "dafi_1@unc.edu.pe")) {
      const nextNum = 1000 + stored.length + 1;
      const clientName = client.name || clean.split("@")[0];
      const newAff: Affiliate = {
        id: `aff-${Date.now()}`,
        user_id: client.id,
        name: clientName,
        email: clean,
        phone: client.phone || "",
        password: client.password || "Password123!",
        affiliate_code: `REF-${nextNum}`,
        commission_rate: 10,
        payment_info: {
          type: "Yape",
          number: client.phone || "",
          account_name: clientName,
        },
        balance: 0,
        pending_balance: 0,
        clicks_count: 0,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [newAff, ...stored];
      this.saveStoredAffiliates(updated);
      return newAff;
    }

    return null;
  }

  static async createAffiliate(data: {
    userId?: string;
    name: string;
    email: string;
    phone?: string;
    password?: string;
    commissionRate?: number;
    paymentInfo?: AffiliatePaymentInfo;
  }): Promise<Affiliate> {
    const list = this.getStoredAffiliates();
    const nextNum = 1000 + list.length + 1;
    const affiliateCode = `REF-${nextNum}`;
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = (data.phone || data.paymentInfo?.number || "").trim();
    const cleanPassword = data.password?.trim() || "Password123!";
    const userId = data.userId || `user-aff-${Date.now()}`;

    const newAffiliate: Affiliate = {
      id: `aff-${Date.now()}`,
      user_id: userId,
      name: data.name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: cleanPassword,
      affiliate_code: affiliateCode,
      commission_rate: data.commissionRate ?? 10,
      payment_info: data.paymentInfo ?? {
        type: "Yape",
        number: cleanPhone,
        account_name: data.name.trim(),
      },
      balance: 0,
      pending_balance: 0,
      clicks_count: 0,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Vincular y registrar la cuenta de usuario en ClientService con rol de afiliado
    ClientService.registerNew({
      name: data.name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: cleanPassword,
      role: "affiliate",
      provider: "password",
    });

    // Sincronizar en Supabase Auth con confirmación inmediata de email (sin pedir verificación por correo)
    try {
      await syncAffiliateAuthUserAction({
        email: cleanEmail,
        password: cleanPassword,
        name: data.name.trim(),
        phone: cleanPhone,
      });
    } catch (err) {
      console.warn("No se pudo sincronizar afiliado en Supabase Auth:", err);
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        await supabase.from("affiliates").insert([newAffiliate]);
      } catch {
        // Fallback
      }
    }

    const updated = [newAffiliate, ...list];
    this.saveStoredAffiliates(updated);
    return newAffiliate;
  }

  static async updateAffiliate(
    id: string,
    updates: Partial<Affiliate>
  ): Promise<Affiliate | null> {
    const list = this.getStoredAffiliates();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    const updatedItem = {
      ...list[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updatedItem;
    this.saveStoredAffiliates(list);

    // Sincronizar cambios de perfil o contraseña en ClientService siempre con role: "affiliate"
    const existingClient = ClientService.findByEmail(updatedItem.email);
    if (existingClient) {
      ClientService.save({
        ...existingClient,
        name: updatedItem.name,
        phone: updatedItem.phone || existingClient.phone,
        password: updatedItem.password || existingClient.password,
        role: "affiliate",
      });
    } else {
      ClientService.registerNew({
        name: updatedItem.name,
        email: updatedItem.email,
        phone: updatedItem.phone,
        password: updatedItem.password || "Password123!",
        role: "affiliate",
        provider: "password",
      });
    }

    // Sincronizar en Supabase Auth si hubo actualización de contraseña o datos
    try {
      await syncAffiliateAuthUserAction({
        email: updatedItem.email,
        password: updatedItem.password,
        name: updatedItem.name,
        phone: updatedItem.phone,
      });
    } catch {
      // ignore
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        await supabase.from("affiliates").update(updates).eq("id", id);
      } catch {
        // ignore
      }
    }

    return updatedItem;
  }

  static async updateAffiliatePassword(
    id: string,
    newPassword: string
  ): Promise<boolean> {
    const updated = await this.updateAffiliate(id, { password: newPassword });
    return !!updated;
  }

  static async deleteAffiliate(id: string): Promise<boolean> {
    const list = this.getStoredAffiliates();
    const target = list.find((a) => a.id === id);
    if (!target) return false;

    const filtered = list.filter((a) => a.id !== id);
    this.saveStoredAffiliates(filtered);

    // Si existe en ClientService con rol de afiliado, removerlo de la lista local
    if (typeof window !== "undefined") {
      try {
        const storedClients = window.localStorage.getItem("nova:registered_clients:v1");
        if (storedClients) {
          const parsed = JSON.parse(storedClients);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(
              (c: any) =>
                c.email?.toLowerCase() !== target.email.toLowerCase() &&
                c.id !== target.user_id &&
                c.id !== target.id
            );
            window.localStorage.setItem("nova:registered_clients:v1", JSON.stringify(cleaned));
          }
        }
      } catch {
        // ignore
      }
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        await supabase.from("affiliates").delete().eq("id", id);
      } catch {
        // ignore
      }
    }

    return true;
  }

  static async recordClick(code: string): Promise<void> {
    const aff = await this.getAffiliateByCode(code);
    if (!aff || aff.status !== "active") return;
    await this.updateAffiliate(aff.id, { clicks_count: aff.clicks_count + 1 });
  }

  // ==========================================
  // REFERIDOS & ATRIBUCIÓN DE COMISIÓN
  // ==========================================
  static async getReferrals(affiliateId?: string): Promise<AffiliateReferral[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        let query = supabase.from("affiliate_referrals").select("*").order("created_at", { ascending: false });
        if (affiliateId) {
          query = query.eq("affiliate_id", affiliateId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch {
        // Fallback
      }
    }

    const all = this.getStoredReferrals();
    if (!affiliateId) return all;
    return all.filter((r) => r.affiliate_id === affiliateId);
  }

  /**
   * Registra una venta atribuida a un afiliado.
   * REGLAS DE NEGOCIO:
   * 1. Bloqueo de auto-referido: Si el comprador es el mismo dueño del código, NO se genera comisión.
   * 2. Cálculo de comisión: Se aplica sobre el PRECIO FINAL pagado en checkout.
   */
  static async createReferral(params: {
    affiliateCode: string;
    orderId: string;
    finalPaidAmount: number;
    productSummary: string;
    buyerEmail?: string;
    buyerId?: string;
  }): Promise<{ success: boolean; referral?: AffiliateReferral; error?: string }> {
    const affiliate = await this.getAffiliateByCode(params.affiliateCode);
    if (!affiliate) {
      return { success: false, error: "Código de afiliado inválido." };
    }

    if (affiliate.status !== "active") {
      return { success: false, error: "La cuenta del afiliado se encuentra suspendida." };
    }

    // REGLA: Anti-self-referral
    const buyerEmail = params.buyerEmail?.trim().toLowerCase();
    const buyerId = params.buyerId?.trim().toLowerCase();
    if (
      (buyerEmail && buyerEmail === affiliate.email.toLowerCase()) ||
      (buyerId && buyerId === affiliate.user_id.toLowerCase())
    ) {
      return {
        success: false,
        error: "Auto-referido bloqueado: El comprador no puede ser el mismo afiliado.",
      };
    }

    // Cálculo de comisión sobre el PRECIO FINAL pagado
    const rate = affiliate.commission_rate || 10;
    const commission = Math.round(params.finalPaidAmount * (rate / 100) * 100) / 100;

    const newReferral: AffiliateReferral = {
      id: `ref-ord-${Date.now()}`,
      affiliate_id: affiliate.id,
      affiliate_code: affiliate.affiliate_code,
      order_id: params.orderId,
      order_amount: params.finalPaidAmount,
      commission_amount: commission,
      status: "pending",
      buyer_email: params.buyerEmail,
      buyer_id: params.buyerId,
      product_summary: params.productSummary,
      created_at: new Date().toISOString(),
    };

    const referrals = this.getStoredReferrals();
    this.saveStoredReferrals([newReferral, ...referrals]);

    // Actualizar saldo pendiente del afiliado
    await this.updateAffiliate(affiliate.id, {
      pending_balance: (affiliate.pending_balance || 0) + commission,
    });

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        await supabase.from("affiliate_referrals").insert([newReferral]);
      } catch {
        // ignore
      }
    }

    return { success: true, referral: newReferral };
  }

  static async updateReferralStatus(
    referralId: string,
    status: "approved" | "paid" | "cancelled"
  ): Promise<AffiliateReferral | null> {
    const referrals = this.getStoredReferrals();
    const idx = referrals.findIndex((r) => r.id === referralId);
    if (idx === -1) return null;

    const current = referrals[idx];
    const prevStatus = current.status;
    current.status = status;
    referrals[idx] = current;
    this.saveStoredReferrals(referrals);

    // Ajustar balances del afiliado según el nuevo estado
    const aff = await this.getAffiliateById(current.affiliate_id);
    if (aff) {
      let newBalance = aff.balance;
      let newPending = aff.pending_balance;

      if (prevStatus === "pending" && status === "approved") {
        newPending = Math.max(0, newPending - current.commission_amount);
        newBalance += current.commission_amount;
      } else if (prevStatus === "pending" && status === "cancelled") {
        newPending = Math.max(0, newPending - current.commission_amount);
      } else if (prevStatus === "approved" && status === "cancelled") {
        newBalance = Math.max(0, newBalance - current.commission_amount);
      }

      await this.updateAffiliate(aff.id, {
        balance: Math.round(newBalance * 100) / 100,
        pending_balance: Math.round(newPending * 100) / 100,
      });
    }

    return current;
  }

  // ==========================================
  // SOLICITUDES DE PAGO (PAYOUTS)
  // ==========================================
  static async getPayoutRequests(affiliateId?: string): Promise<PayoutRequest[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        let query = supabase.from("payout_requests").select("*").order("created_at", { ascending: false });
        if (affiliateId) {
          query = query.eq("affiliate_id", affiliateId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch {
        // Fallback
      }
    }

    const all = this.getStoredPayouts();
    if (!affiliateId) return all;
    return all.filter((p) => p.affiliate_id === affiliateId);
  }

  /**
   * Solicita un retiro de saldo disponible.
   * REGLA: Mínimo acumulado de S/ 50.
   */
  static async requestPayout(params: {
    affiliateId: string;
    amount: number;
    paymentMethod: string;
    paymentDetails: string;
  }): Promise<{ success: boolean; payout?: PayoutRequest; error?: string }> {
    const affiliate = await this.getAffiliateById(params.affiliateId);
    if (!affiliate) {
      return { success: false, error: "Afiliado no encontrado." };
    }

    if (affiliate.status !== "active") {
      return { success: false, error: "Tu cuenta de afiliado está suspendida." };
    }

    // Regla de mínimo S/ 50
    if (params.amount < 50) {
      return {
        success: false,
        error: "El monto mínimo para solicitar retiro es de S/ 50.00.",
      };
    }

    if (params.amount > affiliate.balance) {
      return {
        success: false,
        error: `Saldo insuficiente. Tu saldo disponible actual es de S/ ${affiliate.balance.toFixed(2)}.`,
      };
    }

    const newPayout: PayoutRequest = {
      id: `pay-req-${Date.now()}`,
      affiliate_id: affiliate.id,
      affiliate_name: affiliate.name,
      affiliate_code: affiliate.affiliate_code,
      amount: Math.round(params.amount * 100) / 100,
      status: "requested",
      payment_method: params.paymentMethod,
      payment_details: params.paymentDetails,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Descontar inmediatamente del saldo disponible para retenerlo
    await this.updateAffiliate(affiliate.id, {
      balance: Math.round((affiliate.balance - params.amount) * 100) / 100,
    });

    const payouts = this.getStoredPayouts();
    this.saveStoredPayouts([newPayout, ...payouts]);

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        await supabase.from("payout_requests").insert([newPayout]);
      } catch {
        // ignore
      }
    }

    return { success: true, payout: newPayout };
  }

  /**
   * Administrador procesa la solicitud de pago
   */
  static async updatePayoutStatus(params: {
    payoutId: string;
    status: "paid" | "rejected";
    receiptUrl?: string;
    adminNotes?: string;
  }): Promise<PayoutRequest | null> {
    const payouts = this.getStoredPayouts();
    const idx = payouts.findIndex((p) => p.id === params.payoutId);
    if (idx === -1) return null;

    const current = payouts[idx];
    const prevStatus = current.status;

    current.status = params.status;
    if (params.receiptUrl) current.receipt_url = params.receiptUrl;
    if (params.adminNotes) current.admin_notes = params.adminNotes;
    current.updated_at = new Date().toISOString();

    payouts[idx] = current;
    this.saveStoredPayouts(payouts);

    // Si se rechaza y estaba en 'requested', devolvemos el saldo al afiliado
    if (prevStatus === "requested" && params.status === "rejected") {
      const aff = await this.getAffiliateById(current.affiliate_id);
      if (aff) {
        await this.updateAffiliate(aff.id, {
          balance: Math.round((aff.balance + current.amount) * 100) / 100,
        });
      }
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        await supabase
          .from("payout_requests")
          .update({
            status: params.status,
            receipt_url: params.receiptUrl,
            admin_notes: params.adminNotes,
            updated_at: current.updated_at,
          })
          .eq("id", params.payoutId);
      } catch {
        // ignore
      }
    }

    return current;
  }
}
