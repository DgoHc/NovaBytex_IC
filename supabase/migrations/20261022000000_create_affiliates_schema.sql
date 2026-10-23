-- ================================================================
-- MIGRACIÓN: Módulo de Afiliados y RBAC para Nova Bytex
-- Fecha: 2026-10-22
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. MODIFICACIÓN EN 'users' (o tabla de usuarios si existe)
-- Si la tabla public.users existe, agregamos o actualizamos la columna role
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN
        -- Agregar columna role si no existe
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
        ) THEN
            ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'client';
        END IF;

        -- Agregar constraint de roles si no existe
        BEGIN
            ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
            ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('client', 'admin', 'affiliate'));
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END IF;
END $$;

-- 2. TABLA: affiliates
CREATE TABLE IF NOT EXISTS public.affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT, -- Puede referenciar a auth.users(id) o public.users(id)
    affiliate_code TEXT UNIQUE NOT NULL, -- Ej: REF-1002
    commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00, -- Porcentaje (ej. 10%)
    payment_info JSONB DEFAULT '{}'::jsonb, -- { type: 'Yape' | 'Plin' | 'BCP' | 'CCI', number: '...', account_name: '...' }
    balance NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- Saldo disponible para retiro
    pending_balance NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- Saldo acumulado pendiente
    clicks_count INTEGER NOT NULL DEFAULT 0, -- Métricas de clics/visitas
    status TEXT NOT NULL CHECK (status IN ('active', 'suspended')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA: affiliate_referrals
CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    order_id TEXT NOT NULL,
    order_amount NUMERIC(10,2) NOT NULL, -- Precio final pagado en checkout
    commission_amount NUMERIC(10,2) NOT NULL, -- Comisión calculada sobre precio final
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')) DEFAULT 'pending',
    buyer_id TEXT,
    buyer_email TEXT,
    product_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA: payout_requests
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('requested', 'paid', 'rejected')) DEFAULT 'requested',
    payment_method TEXT, -- 'Yape', 'Plin', 'BCP', 'CCI'
    payment_details TEXT, -- Número de celular o cuenta
    receipt_url TEXT, -- URL o comprobante subido por el admin
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON public.affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON public.affiliates(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate ON public.affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_order ON public.affiliate_referrals(order_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_affiliate ON public.payout_requests(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON public.payout_requests(status);

-- 6. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para administradores y lectura según corresponda
CREATE POLICY "Admins have full access to affiliates" 
    ON public.affiliates FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Public read for active affiliates code verification" 
    ON public.affiliates FOR SELECT 
    USING (status = 'active');

CREATE POLICY "Admins have full access to referrals" 
    ON public.affiliate_referrals FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Admins have full access to payouts" 
    ON public.payout_requests FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- 7. TRIGGER AUTOMÁTICO PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_affiliates_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_affiliates_updated_at ON public.affiliates;
CREATE TRIGGER trg_affiliates_updated_at
    BEFORE UPDATE ON public.affiliates
    FOR EACH ROW
    EXECUTE FUNCTION update_affiliates_modified();

DROP TRIGGER IF EXISTS trg_payout_requests_updated_at ON public.payout_requests;
CREATE TRIGGER trg_payout_requests_updated_at
    BEFORE UPDATE ON public.payout_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_affiliates_modified();
