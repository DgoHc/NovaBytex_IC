import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#020617",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.novabytexrj.com"),
  title: {
    default: "Nova Bytex S.R.L. | Tecnología, Útiles y Soporte en Cajamarca",
    template: "%s | Nova Bytex S.R.L.",
  },
  description:
    "Venta de equipos de tecnología, útiles de oficina y papelería en Cajamarca. Brindamos soporte técnico, instalación de redes y asesoría para empresas locales.",
  authors: [{ name: "Nova Bytex S.R.L.", url: "https://www.novabytexrj.com" }],
  creator: "Nova Bytex S.R.L.",
  publisher: "Nova Bytex S.R.L.",
  applicationName: "Nova Bytex Portal",
  category: "technology",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/assets/branding/nb-isotype.png",
    shortcut: "/assets/branding/nb-isotype.png",
    apple: "/assets/branding/nb-isotype.png",
  },
  openGraph: {
    title: "Nova Bytex S.R.L. | Tecnología, Útiles y Soporte en Cajamarca",
    description:
      "Venta de equipos de tecnología, útiles de oficina y papelería en Cajamarca. Brindamos soporte técnico, instalación de redes y asesoría para empresas locales.",
    url: "https://www.novabytexrj.com",
    siteName: "Nova Bytex S.R.L.",
    locale: "es_PE",
    type: "website",
    images: [
      {
        url: "/assets/branding/nb-isotype.png",
        width: 800,
        height: 800,
        alt: "Logo de Nova Bytex S.R.L.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nova Bytex S.R.L. | Tecnología, Útiles y Soporte en Cajamarca",
    description:
      "Venta de equipos de tecnología, útiles de oficina y papelería en Cajamarca. Brindamos soporte técnico, instalación de redes y asesoría para empresas locales.",
    images: ["/assets/branding/nb-isotype.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.novabytexrj.com",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://www.novabytexrj.com/#business",
  "name": "Nova Bytex S.R.L.",
  "url": "https://www.novabytexrj.com",
  "logo": "https://www.novabytexrj.com/assets/branding/nb-isotype.png",
  "image": "https://www.novabytexrj.com/assets/branding/nb-isotype.png",
  "description": "Comercialización de productos de tecnología, servicios técnicos y asesoría",
  "telephone": "+51990804482",
  "email": "nbytex@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Av. Vía Universitaria S/N, Sector La Base II",
    "addressLocality": "Cajamarca",
    "addressRegion": "Cajamarca",
    "addressCountry": "PE",
  },
  "sameAs": [
    "https://www.instagram.com/novabytex/",
    "https://www.facebook.com/Nova-Bytex-SRL-1708431966134505/",
  ],
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "07:00",
      "closes": "13:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "15:00",
      "closes": "19:00",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,600;0,6..96,700;1,6..96,400;1,6..96,500&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
