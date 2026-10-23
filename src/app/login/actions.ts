"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Valida credenciales de Administrador contra variables de entorno de Vercel/servidor.
 * En producción (Vercel) requiere estrictamente las variables ADMIN_USER/ADMIN_EMAIL y ADMIN_PASSWORD.
 * En localhost permite fallback 'admin' / 'admin' únicamente cuando no hay variables configuradas.
 */
export async function verifyAdminCredentialsAction(
  identifier: string,
  password: string
) {
  const inputUser = (identifier || "").trim().toLowerCase();
  const inputPass = (password || "").trim();

  const envAdminUser = (
    process.env.ADMIN_USER ||
    process.env.ADMIN_EMAIL ||
    process.env.ADMIN_USERNAME ||
    ""
  ).trim().toLowerCase();

  const envAdminPass = (process.env.ADMIN_PASSWORD || "").trim();
  const isProduction = process.env.NODE_ENV === "production";

  let isValidAdmin = false;

  if (envAdminUser && envAdminPass) {
    // Si existen credenciales configuradas en Vercel, validamos contra ellas
    if (inputUser === envAdminUser && inputPass === envAdminPass) {
      isValidAdmin = true;
    }
  } else if (!isProduction) {
    // Modo localhost de respaldo si aún no se configuraron variables
    if (
      (inputUser === "admin" || inputUser === "admin@novabytexrj.com") &&
      inputPass === "admin"
    ) {
      isValidAdmin = true;
    }
  }

  if (isValidAdmin) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: isProduction,
      maxAge: 60 * 60 * 24 * 7, // 7 días
      sameSite: "lax",
      path: "/",
    });

    const displayEmail = envAdminUser && envAdminUser.includes("@")
      ? envAdminUser
      : "admin@novabytexrj.com";

    return {
      success: true,
      isAdmin: true,
      user: {
        id: "cli-admin",
        name: "Administrador Nova Bytex",
        email: displayEmail,
        phone: "+51 990 804 482",
        role: "admin" as const,
        provider: "password" as const,
        registeredAt: new Date().toISOString(),
        purchasesCount: 0,
        totalSpent: 0,
        loyaltyDiscount: 0,
        maxDiscountPrice: 0,
        status: "active" as const,
        recentOrders: [],
      },
    };
  }

  return { success: false, isAdmin: false };
}

export async function loginAction(formData: FormData) {
  const user = formData.get("user") as string;
  const password = formData.get("password") as string;

  const res = await verifyAdminCredentialsAction(user, password);
  if (res.success) {
    redirect("/admin");
  }

  return { error: "Usuario o contraseña incorrectos" };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/login");
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set("admin_session", "authenticated", {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  return { success: true };
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return { success: true };
}
