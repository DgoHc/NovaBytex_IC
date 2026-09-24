import type { Metadata } from "next";
import { DEFAULT_NOVABYTEX_PROFILE } from "@/lib/nfcProfiles";
import DigitalCardView from "@/components/nfc/DigitalCardView";

export const metadata: Metadata = {
  title: "Tarjeta Digital NFC — Nova Bytex",
  description:
    "Tarjeta de contacto digital oficial de Nova Bytex. Infraestructura de redes, servidores, ciberseguridad y suministros corporativos en todo el Perú.",
  openGraph: {
    title: "Nova Bytex — Tarjeta Digital NFC",
    description:
      "Tarjeta digital interactiva de Nova Bytex. Contacta por WhatsApp, guarda el contacto o conoce nuestros servicios de tecnología y suministros.",
    url: "https://novabytex.com/card",
    siteName: "Nova Bytex",
    images: [
      {
        url: "/assets/branding/logonb.jpeg",
        width: 683,
        height: 450,
        alt: "Nova Bytex Tarjeta Digital NFC",
      },
    ],
    locale: "es_PE",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nova Bytex — Tarjeta Digital NFC",
    description:
      "Tarjeta digital interactiva de Nova Bytex. Contacto directo por WhatsApp y descarga de contacto vCard.",
  },
};

export default function CardPage() {
  return <DigitalCardView profile={DEFAULT_NOVABYTEX_PROFILE} />;
}
