import { createClient } from "@supabase/supabase-js";

// Para uso administrativo server-side (bypass RLS y operaciones seguras)
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Faltan las variables de entorno de Supabase (Admin)");
    // Proveer un dummy en desarrollo para que createClient no crashee la vista
    return createClient("https://dummy.supabase.co", "dummy-key", { auth: { persistSession: false } });
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

// Para lecturas públicas donde las políticas de RLS aplican normalmente
export function getSupabasePublic() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Faltan las variables de entorno de Supabase (Public)");
    return createClient("https://dummy.supabase.co", "dummy-key", { auth: { persistSession: false } });
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}
