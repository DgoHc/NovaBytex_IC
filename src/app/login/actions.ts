"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const user = formData.get("user");
  const password = formData.get("password");

  const validUser = process.env.ADMIN_USER || "admin";
  const validPassword = process.env.ADMIN_PASSWORD || "admin";

  if (user === validUser && password === validPassword) {
    // Si es correcto, guardamos una cookie segura que dura 1 día
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 día
      path: "/",
    });
    
    // Redirigimos al panel de control
    redirect("/admin/nfc/profiles");
  }

  return { error: "Usuario o contraseña incorrectos" };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/login");
}
