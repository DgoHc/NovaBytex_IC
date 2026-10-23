import { AffiliateService } from "@/services/AffiliateService";

const STORAGE_KEY = "nb:affiliate_ref:v1";
const COOKIE_NAME = "nb_affiliate_ref";
const EXPIRATION_DAYS = 30;

export interface StoredReferral {
  code: string;
  timestamp: number;
}

/**
 * Guarda el código de afiliado en localStorage y en cookie durante 30 días (Last-Click).
 */
export function setReferralCode(code: string): void {
  if (typeof window === "undefined" || !code) return;

  const cleanCode = code.trim().toUpperCase();
  const data: StoredReferral = {
    code: cleanCode,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }

  try {
    const maxAgeSeconds = EXPIRATION_DAYS * 24 * 60 * 60;
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
      cleanCode
    )}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
  } catch {
    // ignore
  }
}

/**
 * Obtiene el código de afiliado activo respetando la ventana de atribución de 30 días.
 */
export function getActiveReferralCode(): string | null {
  if (typeof window === "undefined") return null;

  // 1. Intentar desde localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: StoredReferral = JSON.parse(stored);
      const ageInDays = (Date.now() - parsed.timestamp) / (1000 * 60 * 60 * 24);
      if (ageInDays <= EXPIRATION_DAYS && parsed.code) {
        return parsed.code;
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  } catch {
    // ignore
  }

  // 2. Intentar desde cookie
  try {
    const match = document.cookie.match(new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`));
    if (match && match[2]) {
      return decodeURIComponent(match[2]);
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Borra el código de afiliado tras concretar la compra o expiración
 */
export function clearReferralCode(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    // ignore
  }
}

/**
 * Función que se ejecuta al cargar páginas para capturar ?ref=...
 */
export function captureReferralFromURL(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get("ref");

    if (refParam && refParam.trim().length > 0) {
      const currentActive = getActiveReferralCode();
      const newCode = refParam.trim().toUpperCase();

      // Atribución Last-Click: Si es nuevo o diferente, actualizamos y registramos clic
      if (currentActive !== newCode) {
        setReferralCode(newCode);
        AffiliateService.recordClick(newCode).catch(() => {});
      }
      return newCode;
    }
  } catch {
    // ignore
  }

  return getActiveReferralCode();
}
