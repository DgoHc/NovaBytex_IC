export type CardStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED';

export interface NfcProfile {
  id: string;
  slug: string;
  name: string;
  company: string | null;
  position: string | null;
  description: string | null;
  
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  
  address: string | null;
  
  avatar_url: string | null;
  logo_url: string | null;
  
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  cards?: NfcCard[];
}

export interface NfcCard {
  id: string;
  profile_id: string;
  public_code: string;
  alias: string | null;
  status: CardStatus;
  
  created_at: string;
  updated_at: string;
  activated_at: string | null;
  
  // Relations
  profile?: NfcProfile;
}
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

