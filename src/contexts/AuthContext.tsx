"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  ClientService,
  RegisteredClient,
  INITIAL_CLIENTS,
} from "@/services/ClientService";
import { AffiliateService } from "@/services/AffiliateService";
import { useCatalog } from "@/contexts/CatalogContext";
import { setAdminSessionCookie, clearAdminSessionCookie, verifyAdminCredentialsAction } from "@/app/login/actions";

const AUTH_USER_KEY = "nova:auth_user:v1";

interface AuthContextType {
  user: RegisteredClient | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAffiliate: boolean;
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
  ) => Promise<{ success: boolean; isAdmin?: boolean; isAffiliate?: boolean; error?: string }>;
  signUpWithPassword: (
    name: string,
    email: string,
    password: string,
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUpWithActivationLink: (
    name: string,
    email: string,
    password: string,
    phone?: string
  ) => Promise<{ success: boolean; requiresEmailVerification?: boolean; error?: string }>;
  resendActivationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
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
          let fresh = ClientService.findByEmail(parsed.email) || parsed;
          // Si el usuario es un socio en AffiliateService, garantizar rol de afiliado
          const aff = AffiliateService.getStoredAffiliates().find(
            (a) =>
              a.email.toLowerCase() === parsed.email.toLowerCase() ||
              a.user_id === parsed.id ||
              a.id === parsed.id
          );
          if (aff) {
            fresh = {
              ...fresh,
              name: aff.name,
              phone: aff.phone || fresh.phone,
              role: "affiliate",
            };
          }
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
              const meta = session.user.user_metadata || {};
              const name = meta.full_name || meta.name || email.split("@")[0];
              const phone = meta.phone;

              // Determinar rol con prioridad:
              let determinedRole: "admin" | "affiliate" | "client" = "client";
              if (email.includes("admin") || meta.role === "admin") {
                determinedRole = "admin";
              } else if (
                meta.role === "affiliate" ||
                AffiliateService.getStoredAffiliates().some((a) => a.email.toLowerCase() === email.toLowerCase())
              ) {
                determinedRole = "affiliate";
              } else {
                const existingClient = ClientService.findByEmail(email);
                if (existingClient?.role === "affiliate") {
                  determinedRole = "affiliate";
                } else if (existingClient?.role === "admin") {
                  determinedRole = "admin";
                }
              }

              const registered = ClientService.registerNew({
                name,
                email,
                phone,
                provider: session.user.app_metadata?.provider === "google" ? "google" : "password",
                role: determinedRole,
              });

              const finalUser: RegisteredClient = {
                ...registered,
                name: name || registered.name,
                role: determinedRole,
                phone: phone || registered.phone,
              };
              saveActiveUser(finalUser);
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
  ): Promise<{ success: boolean; isAdmin?: boolean; isAffiliate?: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Verificación segura en el servidor de credenciales de Administrador (Vercel env)
    try {
      const adminRes = await verifyAdminCredentialsAction(cleanEmail, password);
      if (adminRes.success && adminRes.isAdmin && adminRes.user) {
        saveActiveUser(adminRes.user);
        pushToast({
          title: "Sesión Administrativa",
          description: "Acceso concedido al panel de administración NovaAdmin.",
          variant: "success",
        });
        return { success: true, isAdmin: true };
      }
    } catch (err) {
      console.warn("Error al verificar credenciales admin en servidor:", err);
    }

    // 2. Verificación prioritaria de SOCIOS AFILIADOS (por Código REF-XXXX o por Correo)
    const upperInput = cleanEmail.toUpperCase();
    const isRefCode = upperInput.startsWith("REF-");
    const affiliate = isRefCode
      ? await AffiliateService.getAffiliateByCode(upperInput)
      : await AffiliateService.getAffiliateByUserIdOrEmail(cleanEmail);

    if (affiliate) {
      const expectedPass = affiliate.password || "Password123!";
      if (password !== expectedPass) {
        return { success: false, error: "Contraseña incorrecta para esta cuenta de afiliado." };
      }
      if (affiliate.status === "suspended") {
        return { success: false, error: "Esta cuenta de afiliado se encuentra suspendida." };
      }

      const affiliateUser: RegisteredClient = {
        id: affiliate.user_id || affiliate.id,
        name: affiliate.name,
        email: affiliate.email.toLowerCase(),
        phone: affiliate.phone,
        password: affiliate.password,
        role: "affiliate", // ROL ESTRICTO DE AFILIADO
        provider: "password",
        registeredAt: affiliate.created_at,
        purchasesCount: 0,
        totalSpent: 0,
        loyaltyDiscount: 10,
        maxDiscountPrice: 250,
        status: "active",
        recentOrders: [],
      };

      saveActiveUser(affiliateUser);
      // Asegurar que en ClientService quede registrado como afiliado
      ClientService.save(affiliateUser);

      pushToast({
        title: "Portal de Afiliados",
        description: `¡Hola ${affiliate.name}! Bienvenido a tu panel de socios.`,
        variant: "success",
      });

      return {
        success: true,
        isAdmin: false,
        isAffiliate: true,
      };
    }

    // 3. Verificación mediante Supabase Auth si está configurado
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          if (error.message.toLowerCase().includes("email not confirmed")) {
            return {
              success: false,
              error: "Tu cuenta aún no ha sido activada. Por favor haz clic en el enlace enviado a tu correo.",
            };
          }
          // Si falló en Supabase, revisamos si existe en ClientService como fallback
        } else if (data.user) {
          const userMeta = data.user.user_metadata || {};
          const existing = ClientService.findByEmail(cleanEmail);
          
          let role: "client" | "admin" | "affiliate" = "client";
          if (cleanEmail.includes("admin") || userMeta.role === "admin" || existing?.role === "admin") {
            role = "admin";
          } else if (
            userMeta.role === "affiliate" ||
            existing?.role === "affiliate" ||
            AffiliateService.getStoredAffiliates().some((a) => a.email.toLowerCase() === cleanEmail)
          ) {
            role = "affiliate";
          }

          const isAff = role === "affiliate";
          const isAdm = role === "admin";

          const clientData: RegisteredClient = {
            ...(existing || {}),
            id: data.user.id,
            name: userMeta.full_name || userMeta.name || existing?.name || cleanEmail.split("@")[0],
            email: cleanEmail,
            phone: userMeta.phone || existing?.phone,
            role,
            provider: "password",
            registeredAt: data.user.created_at || existing?.registeredAt || new Date().toISOString(),
            purchasesCount: existing?.purchasesCount || 0,
            totalSpent: existing?.totalSpent || 0,
            loyaltyDiscount: isAff ? 10 : existing?.loyaltyDiscount || 5,
            maxDiscountPrice: isAff ? 250 : existing?.maxDiscountPrice || 150,
            status: "active",
            recentOrders: existing?.recentOrders || [],
          };

          saveActiveUser(clientData);
          ClientService.save(clientData);
          pushToast({
            title: isAdm
              ? "Sesión Administrativa"
              : isAff
              ? "Portal de Afiliados"
              : `¡Bienvenido de nuevo, ${clientData.name}!`,
            description: isAdm
              ? "Acceso concedido al panel de administración."
              : isAff
              ? `¡Hola ${clientData.name}! Bienvenido a tu panel de socios afiliados.`
              : "Has iniciado sesión exitosamente.",
            variant: "success",
          });
          return {
            success: true,
            isAdmin: isAdm,
            isAffiliate: isAff,
          };
        }
      } catch (err: any) {
        console.warn("Supabase auth error:", err);
      }
    }

    // 4. Verificación de clientes registrados localmente
    const existing = ClientService.findByEmail(cleanEmail);
    if (existing) {
      if (existing.password && existing.password !== password) {
        return { success: false, error: "Contraseña incorrecta. Verifica tus datos de acceso." };
      }
      saveActiveUser(existing);
      const isAdm = existing.role === "admin";
      const isAff = existing.role === "affiliate";
      pushToast({
        title: isAdm ? "Sesión Administrativa" : isAff ? "Portal de Afiliados" : "Sesión iniciada",
        description: isAdm
          ? "Acceso concedido al panel de administración."
          : isAff
          ? `¡Hola ${existing.name}! Bienvenido a tu panel de afiliados.`
          : `Hola de nuevo, ${existing.name}.`,
        variant: "success",
      });
      return { success: true, isAdmin: isAdm, isAffiliate: isAff };
    }

    // NINGÚN registro silencioso o automático de correos inexistentes
    return {
      success: false,
      error: "Correo o contraseña incorrectos. Verifica tus credenciales o regístrate si no tienes cuenta.",
    };
  };

  const signUpWithPassword = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    return signUpWithActivationLink(name, email, password, phone);
  };

  const signUpWithActivationLink = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<{ success: boolean; requiresEmailVerification?: boolean; error?: string }> => {
    if (!name || name.trim().length < 3) {
      return { success: false, error: "El nombre debe tener al menos 3 caracteres." };
    }
    if (!email || !email.includes("@")) {
      return { success: false, error: "Ingresa un correo electrónico válido." };
    }
    if (!password || password.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres." };
    }

    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: name.trim(),
              name: name.trim(),
              phone: phone?.trim(),
              role: "client",
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        // Registrar cliente en el servicio local
        ClientService.registerNew({
          name: name.trim(),
          email: cleanEmail,
          phone: phone?.trim(),
          password,
          provider: "password",
        });

        // Si Supabase no requiere confirmación y devuelve sesión de inmediato
        if (data.session && data.user) {
          const registered = ClientService.findByEmail(cleanEmail);
          if (registered) saveActiveUser(registered);
          return { success: true, requiresEmailVerification: false };
        }

        // Si requiere confirmación por link de correo (Resend)
        return { success: true, requiresEmailVerification: true };
      } catch (err: any) {
        return { success: false, error: err?.message || "Error al registrar la cuenta." };
      }
    }

    // Modo local / offline
    const registered = ClientService.registerNew({
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim(),
      password,
      provider: "password",
    });

    saveActiveUser(registered);
    pushToast({
      title: "¡Registro completado!",
      description: `Hola ${registered.name}, tu cuenta ha sido creada.`,
      variant: "success",
    });
    return { success: true, requiresEmailVerification: false };
  };

  const resendActivationEmail = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!email || !email.includes("@")) {
      return { success: false, error: "Ingresa un correo válido." };
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase.auth.resend({
          type: "signup",
          email: email.trim().toLowerCase(),
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || "No se pudo reenviar el correo de activación." };
      }
    }

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
        isAffiliate: user?.role === "affiliate",
        loading,
        signInWithGoogle,
        signInWithOtp,
        verifyOtp,
        signInWithPassword,
        signUpWithPassword,
        signUpWithActivationLink,
        resendActivationEmail,
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
