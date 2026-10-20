"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  ClientService,
  RegisteredClient,
  INITIAL_CLIENTS,
} from "@/services/ClientService";
import { useCatalog } from "@/contexts/CatalogContext";
import { setAdminSessionCookie, clearAdminSessionCookie } from "@/app/login/actions";

const AUTH_USER_KEY = "nova:auth_user:v1";

interface AuthContextType {
  user: RegisteredClient | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithOtp: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyOtp: (
    email: string,
    token: string,
    name?: string,
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithPassword: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; isAdmin?: boolean; error?: string }>;
  signUpWithPassword: (
    name: string,
    email: string,
    password: string,
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  switchAccount: () => void;
  updateUserProfile: (data: Partial<RegisteredClient>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<RegisteredClient | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { pushToast } = useCatalog();

  // Load active user on mount
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          // Re-fetch fresh client details from ClientService
          const fresh = ClientService.findByEmail(parsed.email) || parsed;
          setUser(fresh);
          if (fresh.role === "admin") {
            document.cookie = "admin_session=authenticated; path=/; max-age=86400; SameSite=Lax";
            setAdminSessionCookie().catch(() => {});
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }

    // Listen to Supabase auth events if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === "SIGNED_IN" && session?.user) {
            const email = session.user.email;
            if (email) {
              const name =
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                email.split("@")[0];
              const registered = ClientService.registerNew({
                name,
                email,
                provider: "google",
                role: email.includes("admin") ? "admin" : "client",
              });
              saveActiveUser(registered);
            }
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            window.localStorage.removeItem(AUTH_USER_KEY);
          }
        });
        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.warn("Error subscribing to Supabase auth:", err);
      }
    }
  }, []);

  const saveActiveUser = (client: RegisteredClient | null) => {
    setUser(client);
    if (typeof window !== "undefined") {
      try {
        if (client) {
          window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(client));
          if (client.role === "admin") {
            document.cookie = "admin_session=authenticated; path=/; max-age=86400; SameSite=Lax";
            setAdminSessionCookie().catch(() => {});
          } else {
            document.cookie = "admin_session=; path=/; max-age=0; SameSite=Lax";
            clearAdminSessionCookie().catch(() => {});
          }
        } else {
          window.localStorage.removeItem(AUTH_USER_KEY);
          document.cookie = "admin_session=; path=/; max-age=0; SameSite=Lax";
          clearAdminSessionCookie().catch(() => {});
        }
      } catch {
        // ignore
      }
    }
  };

  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) return { error: error.message };
        return {};
      } catch (e: any) {
        return { error: e?.message || "Error al conectar con Google" };
      }
    }

    // Fallback simulation when Supabase credentials are not yet set
    const sampleClient = ClientService.registerNew({
      name: "Usuario Google Demo",
      email: "cliente.google@gmail.com",
      provider: "google",
      role: "client",
    });
    saveActiveUser(sampleClient);
    pushToast({
      title: "Sesión iniciada con Google",
      description: `Bienvenido a Nova Bytex, ${sampleClient.name}.`,
      variant: "success",
    });
    return {};
  };

  // Generate OTP or send via Supabase
  const signInWithOtp = async (
    email: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!email || !email.includes("@")) {
      return { success: false, error: "Ingresa un correo electrónico válido." };
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) return { success: false, error: error.message };
        return {
          success: true,
          message: `Código enviado a ${email}. Revisa tu bandeja de entrada o spam.`,
        };
      } catch (err: any) {
        return { success: false, error: err?.message || "Error al enviar código" };
      }
    }

    // Local simulated OTP for instant testing
    const demoCode = "123456";
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`nova:otp:${email.trim().toLowerCase()}`, demoCode);
    }
    return {
      success: true,
      message: `Código de verificación (Modo Demo): 123456`,
    };
  };

  const verifyOtp = async (
    email: string,
    token: string,
    name?: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!token || token.trim().length < 6) {
      return { success: false, error: "Ingresa un código de 6 dígitos válido." };
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: token.trim(),
          type: "email",
        });
        if (error) return { success: false, error: error.message };

        const clientName = name || email.split("@")[0];
        const registered = ClientService.registerNew({
          name: clientName,
          email: email.trim(),
          phone: phone?.trim(),
          provider: "otp",
        });
        saveActiveUser(registered);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || "Error al verificar código" };
      }
    }

    // Demo verification
    const storedCode =
      typeof window !== "undefined"
        ? sessionStorage.getItem(`nova:otp:${email.trim().toLowerCase()}`) || "123456"
        : "123456";

    if (token.trim() === storedCode || token.trim() === "123456") {
      const clientName = name || email.split("@")[0];
      const registered = ClientService.registerNew({
        name: clientName,
        email: email.trim(),
        phone: phone?.trim(),
        provider: "otp",
      });
      saveActiveUser(registered);
      pushToast({
        title: "¡Código verificado con éxito!",
        description: `Bienvenido a Nova Bytex, ${registered.name}.`,
        variant: "success",
      });
      return { success: true };
    }

    return { success: false, error: "El código ingresado es incorrecto o ha expirado." };
  };

  const signInWithPassword = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; isAdmin?: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // Check if it's admin credentials
    if (
      (cleanEmail === "admin@novabytexrj.com" || cleanEmail === "admin") &&
      password.length >= 4
    ) {
      const adminClient = INITIAL_CLIENTS.find((c) => c.role === "admin") || {
        id: "cli-admin",
        name: "Administrador Nova Bytex",
        email: "admin@novabytexrj.com",
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
      };
      saveActiveUser(adminClient);
      pushToast({
        title: "Sesión Administrativa",
        description: "Acceso concedido al panel de administración.",
        variant: "success",
      });
      return { success: true, isAdmin: true };
    }

    // Check registered clients
    const existing = ClientService.findByEmail(cleanEmail);
    if (existing) {
      saveActiveUser(existing);
      const isAdm = existing.role === "admin";
      pushToast({
        title: isAdm ? "Sesión Administrativa" : "Sesión iniciada",
        description: isAdm
          ? "Acceso concedido al panel de administración."
          : `Hola de nuevo, ${existing.name}.`,
        variant: "success",
      });
      return { success: true, isAdmin: isAdm };
    }

    // New client login on the fly if valid format
    if (cleanEmail.includes("@") && password.length >= 6) {
      const newClient = ClientService.registerNew({
        name: cleanEmail.split("@")[0],
        email: cleanEmail,
        provider: "password",
      });
      saveActiveUser(newClient);
      pushToast({
        title: "Cuenta creada con éxito",
        description: `Bienvenido a Nova Bytex, ${newClient.name}.`,
        variant: "success",
      });
      return { success: true, isAdmin: false };
    }

    return {
      success: false,
      error: "Credenciales incorrectas. Verifica tu usuario/correo y contraseña.",
    };
  };

  const signUpWithPassword = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!name || name.trim().length < 3) {
      return { success: false, error: "El nombre debe tener al menos 3 caracteres." };
    }
    if (!email || !email.includes("@")) {
      return { success: false, error: "Ingresa un correo electrónico válido." };
    }
    if (!password || password.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres." };
    }

    const registered = ClientService.registerNew({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      provider: "password",
    });

    saveActiveUser(registered);
    pushToast({
      title: "¡Registro completado!",
      description: `Hola ${registered.name}, tu cuenta ha sido creada con 5% de descuento de bienvenida.`,
      variant: "success",
    });
    return { success: true };
  };

  const signOut = async () => {
    if (typeof window !== "undefined") {
      document.cookie = "admin_session=; path=/; max-age=0; SameSite=Lax";
    }
    clearAdminSessionCookie().catch(() => {});
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    saveActiveUser(null);
    pushToast({
      title: "Sesión cerrada",
      description: "Has salido de tu cuenta.",
      variant: "info",
    });
    router.push("/");
  };

  const switchAccount = () => {
    saveActiveUser(null);
    router.push("/login?switch=1");
  };

  const updateUserProfile = (data: Partial<RegisteredClient>) => {
    if (!user) return;
    const updated = ClientService.save({ ...user, ...data });
    saveActiveUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        loading,
        signInWithGoogle,
        signInWithOtp,
        verifyOtp,
        signInWithPassword,
        signUpWithPassword,
        signOut,
        switchAccount,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
