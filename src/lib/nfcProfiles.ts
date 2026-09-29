import type { NFCProfile } from "@/types/nfc";

export const DEFAULT_NOVABYTEX_PROFILE: NFCProfile = {
  id: "novabytex-corp",
  slug: "novabytex",
  nombre: "Nova Bytex",
  empresa: "Nova Bytex Technology",
  cargo: "Tecnolog铆a, Conectividad & Suministros",
  logo: "/assets/branding/nb-isotype.png",
  avatar: "/assets/branding/logonb.jpeg",
  headline: "Soluciones Integrales en Redes, Servidores, Ciberseguridad y Suministros",
  descripcion:
    "Especialistas en infraestructura TI, servidores de alto rendimiento, firewalls empresariales, cableado estructurado y papeler铆a corporativa para empresas en todo el Per煤.",
  badge: "Tarjeta Digital NFC Verificada",
  telefono: "+51990804482",
  telefonoDisplay: "+51 990 804 482",
  whatsapp: "51990804482",
  whatsappMessage:
    "Hola NovaBytex, acabo de escanear su tarjeta digital NFC y deseo cotizar una soluci贸n para mi empresa.",
  email: "nbytex@gmail.com",
  website: "https://novabytexrj.com",
  websiteDisplay: "novabytexrj.com",
  ubicacion: {
    direccion: "Av Via Universitaria S/N",
    ciudad: "Cajamarca",
    pais: "Per煤",
    cobertura: "Atenci贸n y env铆os a nivel nacional",
    mapsUrl: "https://maps.google.com/?q=Cajamarca,Peru",
  },
  redes: [
    {
      platform: "linkedin",
      url: "https://www.linkedin.com/company/novabytex",
      username: "novabytex",
      label: "LinkedIn",
    },
    {
      platform: "instagram",
      url: "https://www.instagram.com/novabytex",
      username: "@novabytex",
      label: "Instagram",
    },
    {
      platform: "facebook",
      url: "https://www.facebook.com/novabytex",
      username: "NovaBytex",
      label: "Facebook",
    },
  ],
  servicios: [
    {
      id: "redes",
      title: "Infraestructura & Conectividad",
      description: "Switches gestionables, cableado estructurado y redes de alta velocidad.",
      iconName: "Network",
      href: "/servicios",
    },
    {
      id: "servidores",
      title: "Servidores & Almacenamiento",
      description: "Equipos rackeables Dell/Lenovo, virtualizaci贸n y storage empresarial.",
      iconName: "Server",
      href: "/servicios",
    },
    {
      id: "seguridad",
      title: "Ciberseguridad & Firewalls",
      description: "Protecci贸n perimetral NGFW Fortinet, VPNs y respaldo de datos.",
      iconName: "ShieldCheck",
      href: "/servicios",
    },
    {
      id: "libreria",
      title: "Librer铆a & Suministros",
      description: "Papel bond, cuadernos, archivadores y 煤tiles de oficina corporativos.",
      iconName: "BookOpen",
      href: "/libreria",
    },
  ],
  estado: "active",
};

export const NFC_PROFILES_REGISTRY: Record<string, NFCProfile> = {
  novabytex: DEFAULT_NOVABYTEX_PROFILE,
};

export function getNFCProfile(slug?: string): NFCProfile {
  if (!slug || slug === "novabytex" || slug === "default") {
    return DEFAULT_NOVABYTEX_PROFILE;
  }
  return NFC_PROFILES_REGISTRY[slug] || DEFAULT_NOVABYTEX_PROFILE;
}


