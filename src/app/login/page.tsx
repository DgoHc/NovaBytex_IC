"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSwitching = searchParams.get("switch") === "1";
  const {
    isAuthenticated,
    isAdmin,
    signInWithGoogle,
    signInWithOtp,
    verifyOtp,
    signInWithPassword,
  } = useAuth();

  // Mode: "login" or "register"
  const [mode, setMode] = useState<"login" | "register">("login");

  // Login form states
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Register form states
  const [regStep, setRegStep] = useState<"form" | "verify">("form");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regOtpCode, setRegOtpCode] = useState("");

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-redirect if already authenticated and not switching accounts
  useEffect(() => {
    if (isAuthenticated && !isSwitching) {
      if (isAdmin) {
        if (typeof window !== "undefined") {
          document.cookie = "admin_session=authenticated; path=/; max-age=86400; SameSite=Lax";
          window.location.href = "/admin";
        }
      } else {
        router.push("/mi-cuenta");
      }
    }
  }, [isAuthenticated, isAdmin, isSwitching, router]);

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Google OAuth (placed below form)
  const handleGoogleLogin = async () => {
    clearMessages();
    setIsLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.error) {
        setErrorMessage(res.error);
      } else if (!isSupabaseConfigured()) {
        router.push("/mi-cuenta");
      }
    } catch {
      setErrorMessage("Ocurrió un error al conectar con Google.");
    } finally {
      setIsLoading(false);
    }
  };

  // UNIFIED LOGIN: Detects Admin or Client automatically
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!identifier.trim()) {
      setErrorMessage("Ingresa tu usuario o correo electrónico.");
      return;
    }
    if (!password) {
      setErrorMessage("Ingresa tu contraseña.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await signInWithPassword(identifier.trim(), password);
      if (res.success) {
        if (res.isAdmin) {
          if (typeof window !== "undefined") {
            document.cookie = "admin_session=authenticated; path=/; max-age=86400; SameSite=Lax";
          }
          setSuccessMessage("Acceso administrativo confirmado");
          setTimeout(() => {
            window.location.href = "/admin";
          }, 300);
        } else {
          setSuccessMessage("¡Sesión iniciada con éxito!");
          setTimeout(() => {
            window.location.href = "/mi-cuenta";
          }, 300);
        }
      } else {
        setErrorMessage(res.error || "Credenciales incorrectas.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // REGISTRATION STEP 1: Send OTP code
  const handleStartRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!regName || regName.trim().length < 3) {
      setErrorMessage("Por favor ingresa tu nombre completo.");
      return;
    }
    if (!regEmail || !regEmail.includes("@")) {
      setErrorMessage("Por favor ingresa un correo electrónico válido.");
      return;
    }
    const cleanPhone = regPhone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 9) {
      setErrorMessage("El número de teléfono o WhatsApp es obligatorio (debe tener 9 dígitos).");
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await signInWithOtp(regEmail);
      if (res.success) {
        setRegStep("verify");
        setSuccessMessage("Código de verificación enviado. Revisa tu correo o teléfono.");
      } else {
        setErrorMessage(res.error || "No se pudo enviar el código de verificación.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // REGISTRATION STEP 2: Verify OTP and activate client
  const handleConfirmRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!regOtpCode || regOtpCode.trim().length < 6) {
      setErrorMessage("Por favor ingresa el código de 6 dígitos.");
      return;
    }

    setIsLoading(true);
    try {
      const cleanPhone = regPhone.replace(/\D/g, "");
      const formattedPhone = cleanPhone ? `+51 ${cleanPhone}` : "";
      const res = await verifyOtp(regEmail, regOtpCode, regName, formattedPhone);
      if (res.success) {
        setSuccessMessage("¡Cuenta activada con éxito con 5% de descuento de bienvenida!");
        setTimeout(() => {
          router.push("/mi-cuenta");
        }, 500);
      } else {
        setErrorMessage(res.error || "Código de verificación incorrecto o expirado.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP during registration
  const handleResendOtp = async () => {
    clearMessages();
    setIsLoading(true);
    try {
      const res = await signInWithOtp(regEmail);
      if (res.success) {
        setSuccessMessage("Se ha reenviado un nuevo código a tu correo.");
      } else {
        setErrorMessage(res.error || "No se pudo reenviar el código.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a la tienda
        </Link>

        {/* Corporate branding header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-slate-200/90 shadow-xs mb-3 p-1.5">
            <img
              src="/assets/branding/nb-isotype.png"
              alt="Nova Bytex"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Nova Bytex S.R.L. · Cajamarca
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-6 sm:p-8">
          {/* Notifications */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 flex items-start gap-2.5 text-xs text-rose-800"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-start gap-2.5 text-xs text-emerald-800"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ------------------------------------------------------------------ */}
          {/* 1. MODO INICIAR SESIÓN (Usuario + Contraseña, detecta Admin/Cliente) */}
          {/* ------------------------------------------------------------------ */}
          {mode === "login" ? (
            <div className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label
                    htmlFor="user-identifier"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Usuario o correo electrónico
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="user-identifier"
                      type="text"
                      placeholder="tu@correo.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      autoFocus
                      className="h-10 !pl-10 pl-10 rounded-lg border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs shadow-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="user-password"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Contraseña
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="user-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 !pl-10 pl-10 rounded-lg border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs shadow-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  {isLoading ? "Verificando..." : "Iniciar Sesión"}
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </form>

              {/* CONTINUAR CON GOOGLE (SITUADO DEBAJO DEL FORMULARIO) */}
              <div className="pt-1">
                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[11px] text-slate-400 font-medium shrink-0">
                    o continuar con
                  </span>
                  <div className="border-t border-slate-200 w-full" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-3 transition-colors shadow-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continuar con Google</span>
                </Button>
              </div>

              {/* ENLACE PARA REGISTRARSE SI NO TIENE CUENTA */}
              <div className="pt-2 text-center border-t border-slate-100">
                <p className="text-xs text-slate-600">
                  ¿No tienes una cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setRegStep("form");
                      clearMessages();
                    }}
                    className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Regístrate aquí
                  </button>
                </p>
              </div>
            </div>
          ) : (
            /* ------------------------------------------------------------------ */
            /* 2. MODO REGISTRARSE (Datos + Confirmación por Código OTP)            */
            /* ------------------------------------------------------------------ */
            <div>
              {regStep === "form" ? (
                <form onSubmit={handleStartRegistration} className="space-y-3.5">
                  {/* Descuento de bienvenida */}
                  <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3 text-xs text-emerald-800 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-emerald-950">Descuento de bienvenida</p>
                      <p className="text-[11px] text-emerald-800/90 mt-0.5">
                        Regístrate y recibe <strong>5% de descuento</strong> en tu primera compra en tecnología o librería.
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="reg-name"
                      className="text-xs font-semibold text-slate-700"
                    >
                      Nombre completo
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="reg-name"
                        placeholder="Ej: Laura Ramírez Torres"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                        className="h-9 !pl-10 pl-10 rounded-lg border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs shadow-xs"
                      />
                      <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="reg-email"
                      className="text-xs font-semibold text-slate-700"
                    >
                      Correo electrónico
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="laura@ejemplo.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        className="h-9 !pl-10 pl-10 rounded-lg border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs shadow-xs"
                      />
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Te enviaremos un código de confirmación a este correo.
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="reg-phone"
                      className="text-xs font-semibold text-slate-700 flex items-center justify-between"
                    >
                      <span>Número de Teléfono / WhatsApp</span>
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                        Obligatorio
                      </span>
                    </Label>
                    <div className="relative mt-1 flex rounded-lg border border-slate-200 bg-white shadow-xs focus-within:ring-1 focus-within:ring-blue-500 overflow-hidden">
                      <div className="flex items-center gap-1.5 bg-slate-100 px-3 border-r border-slate-200 text-slate-700 text-xs font-bold select-none shrink-0">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>+51</span>
                      </div>
                      <Input
                        id="reg-phone"
                        type="tel"
                        required
                        placeholder="976 000 000"
                        maxLength={9}
                        value={regPhone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                          setRegPhone(digits);
                        }}
                        className="h-9 border-0 rounded-none bg-transparent text-slate-900 placeholder:text-slate-400 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 px-3"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Código nacional (+51) predefinido. Ingresa tus 9 dígitos de celular.
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="reg-password"
                      className="text-xs font-semibold text-slate-700"
                    >
                      Crea una contraseña
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        className="h-9 !pl-10 pl-10 rounded-lg border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs shadow-xs"
                      />
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs mt-1"
                  >
                    {isLoading ? "Enviando código..." : "Crear cuenta y recibir código"}
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>

                  {/* CONTINUAR CON GOOGLE DEBAJO DEL REGISTRO */}
                  <div className="pt-2">
                    <div className="relative flex items-center justify-center my-3">
                      <div className="border-t border-slate-200 w-full" />
                      <span className="bg-white px-3 text-[11px] text-slate-400 font-medium shrink-0">
                        o registrarse con
                      </span>
                      <div className="border-t border-slate-200 w-full" />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="w-full h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-3 transition-colors shadow-xs"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Continuar con Google</span>
                    </Button>
                  </div>

                  {/* ENLACE PARA VOLVER AL LOGIN */}
                  <div className="pt-2 text-center border-t border-slate-100">
                    <p className="text-xs text-slate-600">
                      ¿Ya tienes una cuenta?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("login");
                          clearMessages();
                        }}
                        className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Inicia sesión aquí
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                /* PASO 2: CÓDIGO OTP DE CONFIRMACIÓN DE CUENTA */
                <div className="space-y-4">
                  <div className="text-center py-1">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-2 text-blue-600">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Confirma tu correo para activar tu cuenta
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Hemos enviado un código de 6 dígitos a{" "}
                      <span className="font-semibold text-slate-800">{regEmail}</span>
                      {regPhone ? ` (y a tu teléfono ${regPhone})` : ""}.
                    </p>

                    {!isSupabaseConfigured() && (
                      <div className="mt-2 inline-block px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-amber-50 text-amber-900 border border-amber-200">
                        Modo Demo: Ingresa <strong>123456</strong>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleConfirmRegistration} className="space-y-4">
                    <div>
                      <Label
                        htmlFor="reg-otp-code"
                        className="text-xs font-semibold text-slate-700 text-center block"
                      >
                        Código de 6 dígitos
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="reg-otp-code"
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={regOtpCode}
                          onChange={(e) => setRegOtpCode(e.target.value)}
                          required
                          autoFocus
                          className="h-12 text-center text-xl tracking-[0.35em] font-mono font-bold rounded-xl border-slate-300 bg-white text-slate-900 shadow-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                    >
                      {isLoading ? "Activando cuenta..." : "Confirmar y Activar Cuenta"}
                      <CheckCircle2 className="w-3.5 h-3.5 ml-1.5" />
                    </Button>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <button
                        type="button"
                        onClick={() => setRegStep("form")}
                        className="text-slate-500 hover:text-slate-800 underline font-medium"
                      >
                        Editar datos de registro
                      </button>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-blue-600 hover:text-blue-700 underline font-semibold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reenviar código
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-xs">
          Cargando portal...
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
