"use server";

import { createClient } from "@supabase/supabase-js";

/**
 * Crea o actualiza un usuario de afiliado en Supabase Auth con confirmación automática de email
 * utilizando la Service Role Key para que pueda iniciar sesión inmediatamente sin esperar confirmación por correo.
 */
export async function syncAffiliateAuthUserAction(data: {
  email: string;
  password?: string;
  name: string;
  phone?: string;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return { success: false, reason: "No service role key configured" };
  }

  const cleanEmail = data.email.trim().toLowerCase();
  const cleanPassword = data.password?.trim() || "Password123!";

  try {
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Buscar si el usuario ya existe en Supabase Auth
    const { data: usersData, error: listError } = await adminSupabase.auth.admin.listUsers();
    if (listError) {
      console.warn("Error listing users in admin action:", listError);
    }

    const existingUser = usersData?.users?.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    if (existingUser) {
      // Usuario ya existe: actualizar contraseña, asegurar confirmación de email y rol affiliate
      const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password: cleanPassword,
          email_confirm: true,
          user_metadata: {
            ...existingUser.user_metadata,
            full_name: data.name.trim(),
            name: data.name.trim(),
            phone: data.phone?.trim() || "",
            role: "affiliate",
          },
        }
      );

      if (updateError) {
        console.warn("Error updating affiliate in Supabase Auth:", updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true, userId: existingUser.id, updated: true };
    }

    // 2. Usuario nuevo: crear con email_confirm = true inmediatamente
    const { data: created, error: createError } = await adminSupabase.auth.admin.createUser({
      email: cleanEmail,
      password: cleanPassword,
      email_confirm: true, // Auto-confirmado para acceso inmediato
      user_metadata: {
        full_name: data.name.trim(),
        name: data.name.trim(),
        phone: data.phone?.trim() || "",
        role: "affiliate",
      },
    });

    if (createError) {
      console.warn("Error creating affiliate in Supabase Auth:", createError);
      return { success: false, error: createError.message };
    }

    return { success: true, userId: created.user.id, created: true };
  } catch (err: any) {
    console.error("Unexpected error in syncAffiliateAuthUserAction:", err);
    return { success: false, error: err?.message || "Error al sincronizar autenticación" };
  }
}
