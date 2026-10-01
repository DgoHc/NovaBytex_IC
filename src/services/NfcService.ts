import { getSupabaseAdmin, getSupabasePublic } from "@/lib/supabase/server";
import crypto from "crypto";
import type { NfcProfile, NfcCard, CardStatus } from "@/types/nfc";

export const NfcService = {
  // Genera un código único de 8 caracteres (ej. A7KM92PX)
  async generatePublicCode(): Promise<string> {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluidos O,0,1,I por legibilidad
    const length = 8;
    const supabase = getSupabaseAdmin();
    
    let isUnique = false;
    let code = "";
    
    while (!isUnique) {
      code = Array.from(crypto.randomBytes(length))
        .map((byte) => chars[byte % chars.length])
        .join("");
        
      const { data } = await supabase
        .from("nfc_cards")
        .select("id")
        .eq("public_code", code)
        .single();
        
      if (!data) {
        isUnique = true;
      }
    }
    
    return code;
  },

  // Resuelve la tarjeta desde la URL pública
  async resolveCard(code: string) {
    const supabase = getSupabasePublic();
    
    const { data: card, error } = await supabase
      .from("nfc_cards")
      .select("*, profile:nfc_profiles(*)")
      .eq("public_code", code)
      .eq("status", "ACTIVE")
      .single();
      
    if (error || !card) return null;
    
    // Verificar si el perfil está activo
    if (!card.profile || !card.profile.is_active) return null;
    
    return card;
  },
  
  // Obtiene un perfil por su slug de forma pública
  async getProfileBySlug(slug: string) {
    const supabase = getSupabasePublic();
    
    const { data: profile, error } = await supabase
      .from("nfc_profiles")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
      
    if (error || !profile) return null;
    return profile as NfcProfile;
  },

  // ----------------------------------------------------
  // MÉTODOS ADMINISTRATIVOS (Uso exclusivo server-side)
  // ----------------------------------------------------
  
  async listProfiles() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
    
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("nfc_profiles")
        .select("*, cards:nfc_cards(*)")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async createProfile(profileData: Partial<NfcProfile>) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("nfc_profiles")
      .insert([profileData])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async updateProfile(id: string, profileData: Partial<NfcProfile>) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("nfc_profiles")
      .update(profileData)
      .eq("id", id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async getProfileByIdAdmin(id: string) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("nfc_profiles")
      .select("*, cards:nfc_cards(*)")
      .eq("id", id)
      .single();
      
    if (error) throw error;
    return data;
  },

  async assignCardToProfile(profileId: string, alias?: string) {
    const publicCode = await this.generatePublicCode();
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from("nfc_cards")
      .insert([{
        profile_id: profileId,
        public_code: publicCode,
        alias: alias || null,
        status: "PENDING"
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async changeCardStatus(cardId: string, status: CardStatus) {
    const supabase = getSupabaseAdmin();
    
    const updateData: any = { status };
    if (status === "ACTIVE") {
       updateData.activated_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from("nfc_cards")
      .update(updateData)
      .eq("id", cardId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async deleteProfile(id: string) {
    const supabase = getSupabaseAdmin();
    // Tarjetas will likely be deleted by CASCADE, or we can explicitly delete them
    const { error } = await supabase
      .from("nfc_profiles")
      .delete()
      .eq("id", id);
      
    if (error) throw error;
    return true;
  },

  async deleteCard(cardId: string) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("nfc_cards")
      .delete()
      .eq("id", cardId);
      
    if (error) throw error;
    return true;
  }
};
