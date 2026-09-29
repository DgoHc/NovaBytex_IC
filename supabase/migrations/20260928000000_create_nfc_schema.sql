-- Habilitar extensión pgcrypto para generación de UUIDs si no está habilitada
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. TABLA: nfc_profiles
-- ==========================================
CREATE TABLE IF NOT EXISTS public.nfc_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    company TEXT,
    position TEXT,
    description TEXT,
    
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    website TEXT,
    
    instagram TEXT,
    facebook TEXT,
    linkedin TEXT,
    
    address TEXT,
    
    avatar_url TEXT,
    logo_url TEXT,
    
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. TABLA: nfc_cards
-- ==========================================
CREATE TABLE IF NOT EXISTS public.nfc_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.nfc_profiles(id) ON DELETE CASCADE,
    public_code TEXT UNIQUE NOT NULL,
    alias TEXT,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'DISABLED')) DEFAULT 'PENDING',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    activated_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 3. ÍNDICES
-- ==========================================
-- Índices para mejorar el rendimiento de las búsquedas principales (resolución de NFC y carga de perfil)
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_slug ON public.nfc_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_public_code ON public.nfc_cards(public_code);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_profile_id ON public.nfc_cards(profile_id);

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.nfc_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfc_cards ENABLE ROW LEVEL SECURITY;

-- Políticas para nfc_profiles
-- Permitir a usuarios públicos ver solo los perfiles activos
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.nfc_profiles FOR SELECT 
    USING (is_active = true);

-- Permitir a usuarios autenticados (admin) realizar todas las operaciones
CREATE POLICY "Admins have full access to profiles" 
    ON public.nfc_profiles FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Políticas para nfc_cards
-- Permitir a usuarios públicos ver solo tarjetas activas
CREATE POLICY "Active cards are viewable by everyone" 
    ON public.nfc_cards FOR SELECT 
    USING (status = 'ACTIVE');

-- Permitir a usuarios autenticados (admin) realizar todas las operaciones
CREATE POLICY "Admins have full access to cards" 
    ON public.nfc_cards FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- ==========================================
-- 5. TRIGGERS PARA UPDATED_AT
-- ==========================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_nfc_profiles_modtime
    BEFORE UPDATE ON public.nfc_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_nfc_cards_modtime
    BEFORE UPDATE ON public.nfc_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
