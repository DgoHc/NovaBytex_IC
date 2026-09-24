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
  metadataBase: new URL("https://novabytex.com"),
  title: {
    default: "Nova Bytex | Solución, Seguridad y Tecnología para Empresas",
    template: "%s | Nova Bytex",
  },
  description:
    "Solución integral, seguridad y tecnología para empresas e instituciones. Suministro confiable de papelería, útiles de oficina y hardware con servicios de ingeniería de software, conectividad y automatización de procesos.",
  keywords: [
    "Nova Bytex",
    "Solución seguridad y tecnología para empresas",
    "suministros de oficina",
    "papelería corporativa",
    "hardware corporativo",
    "servidores y conectividad",
    "ingeniería de software",
    "ciberseguridad gestionada",
    "automatización de procesos",
    "IoT y Domótica",
    "soporte técnico TI empresas",
    "distribución corporativa Perú",
  ],
  authors: [{ name: "Nova Bytex", url: "https://novabytex.com" }],
  creator: "Nova Bytex",
  publisher: "Nova Bytex",
  applicationName: "Nova Bytex Portal",
  category: "technology",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/assets/branding/logonb.jpeg",
    shortcut: "/assets/branding/logonb.jpeg",
    apple: "/assets/branding/logonb.jpeg",
  },
  openGraph: {
    title: "Nova Bytex | Solución, Seguridad y Tecnología para Empresas",
    description:
      "Brindamos solución integral, seguridad y tecnología a empresas e instituciones combinando papelería, útiles de oficina y hardware con servicios de ingeniería de software y conectividad.",
    url: "https://novabytex.com",
    siteName: "Nova Bytex",
    locale: "es_PE",
    type: "website",
    images: [
      {
        url: "/assets/branding/logonb.jpeg",
        width: 800,
        height: 800,
        alt: "Nova Bytex - Solución, Seguridad y Tecnología",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nova Bytex | Solución, Seguridad y Tecnología para Empresas",
    description:
      "Suministro confiable de papelería, útiles de oficina y hardware corporativo con ingeniería de software y conectividad.",
    images: ["/assets/branding/logonb.jpeg"],
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
    canonical: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://novabytex.com/#organization",
      name: "Nova Bytex",
      url: "https://novabytex.com",
      logo: {
        "@type": "ImageObject",
        url: "https://novabytex.com/assets/branding/logonb.jpeg",
      },
      slogan: "Solución, seguridad y tecnología para empresas",
      description:
        "Brindar solución integral, seguridad y tecnología a las empresas e instituciones, combinando el suministro confiable de papelería, útiles de oficina y hardware con servicios especializados de ingeniería de software, conectividad y automatización de procesos.",
      foundingDate: "2014",
      address: {
        "@type": "PostalAddress",
        addressCountry: "PE",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: ["Spanish"],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://novabytex.com/#website",
      url: "https://novabytex.com",
      name: "Nova Bytex",
      publisher: {
        "@id": "https://novabytex.com/#organization",
      },
      inLanguage: "es-PE",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://novabytex.com/productos?search={search_term_string}",
        "query-input": "required name=search_term_string",
      },
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
