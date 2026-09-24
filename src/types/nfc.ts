export type NFCSocialPlatform =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "twitter"
  | "tiktok"
  | "youtube"
  | "github";

export interface NFCSocialLink {
  platform: NFCSocialPlatform;
  url: string;
  label?: string;
  username?: string;
}

export interface NFCServiceItem {
  id: string;
  title: string;
  description: string;
  iconName?: string;
  href: string;
}

export interface NFCProfile {
  id: string;
  slug: string;
  nombre: string;
  empresa: string;
  cargo: string;
  logo: string;
  avatar?: string;
  banner?: string;
  descripcion: string;
  headline?: string;
  badge?: string;
  telefono: string;
  telefonoDisplay?: string;
  whatsapp: string;
  whatsappMessage?: string;
  email: string;
  website: string;
  websiteDisplay?: string;
  ubicacion: {
    direccion?: string;
    ciudad: string;
    pais: string;
    mapsUrl?: string;
    cobertura?: string;
  };
  redes: NFCSocialLink[];
  servicios: NFCServiceItem[];
  estado: "active" | "inactive" | "maintenance";
}
