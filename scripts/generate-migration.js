const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Transpile src/lib/products.ts to commonjs
const tsCode = fs.readFileSync(path.join(__dirname, '..', 'src', 'lib', 'products.ts'), 'utf-8');
const jsCode = ts.transpileModule(tsCode, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText;

const m = new module.constructor();
m._compile(jsCode, 'products.js');
const { PRODUCTS_DATA } = m.exports;

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

function arrayToSql(arr) {
  if (!arr || !arr.length) return "'{}'";
  const escaped = arr.map(s => '"' + String(s).replace(/"/g, '\\"') + '"').join(',');
  return "'{" + escaped + "}'";
}

let sql = `-- ================================================================
-- MIGRACIÓN: Tabla de Productos y Categorías para Nova Bytex
-- Fecha: 2026-10-28
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. SECUENCIA PARA IDs NUMÉRICOS
-- ==========================================
CREATE SEQUENCE IF NOT EXISTS public.products_id_seq START WITH 500;

-- ==========================================
-- 2. TABLA: products
-- ==========================================
CREATE TABLE IF NOT EXISTS public.products (
    id BIGINT PRIMARY KEY DEFAULT nextval('public.products_id_seq'),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT DEFAULT 'NovaBytex',
    description TEXT,
    full_description TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    previous_price NUMERIC(10,2),
    image TEXT DEFAULT '',
    gallery TEXT[] DEFAULT '{}',
    in_stock BOOLEAN NOT NULL DEFAULT true,
    available BOOLEAN NOT NULL DEFAULT true,
    featured BOOLEAN NOT NULL DEFAULT false,
    rating NUMERIC(3,2) DEFAULT 4.5,
    reviews_count INTEGER DEFAULT 0,
    sku TEXT,
    warranty TEXT,
    specifications TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    image_type TEXT DEFAULT 'switch',
    type TEXT NOT NULL CHECK (type IN ('technology', 'library')),
    tech_subtype TEXT CHECK (tech_subtype IN ('hardware', 'license')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. TABLA: custom_categories
-- ==========================================
CREATE TABLE IF NOT EXISTS public.custom_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('technology', 'library')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 4. ÍNDICES DE RENDIMIENTO
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(type);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON public.products(available);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_custom_categories_type ON public.custom_categories(type);

-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;

-- Lectura pública para cualquier usuario
CREATE POLICY "Public read products" 
    ON public.products FOR SELECT 
    USING (true);

-- Modificación para anon y authenticated
CREATE POLICY "Anon can modify products"
    ON public.products FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated full access to products" 
    ON public.products FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- RLS para custom_categories
CREATE POLICY "Public read custom_categories" 
    ON public.custom_categories FOR SELECT 
    USING (true);

CREATE POLICY "Anon can modify custom_categories" 
    ON public.custom_categories FOR ALL 
    TO anon 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Authenticated full access to custom_categories" 
    ON public.custom_categories FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- ==========================================
-- 6. TRIGGER PARA UPDATED_AT
-- ==========================================
CREATE OR REPLACE FUNCTION update_products_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_modified();

-- ==========================================
-- 7. SEED INICIAL DE PRODUCTOS (35 productos de PRODUCTS_DATA)
-- ==========================================
`;

for (const p of PRODUCTS_DATA) {
  const specs = arrayToSql(p.specifications || []);
  const feats = arrayToSql(p.features || []);
  const gallery = arrayToSql(p.gallery || []);
  const prevPrice = p.previousPrice != null ? p.previousPrice : 'NULL';
  const techSubtype = p.techSubtype ? escapeSql(p.techSubtype) : 'NULL';
  const brand = escapeSql(p.brand || 'NovaBytex');
  const sku = escapeSql(p.sku || '');
  const warranty = escapeSql(p.warranty || '');
  const image = escapeSql(p.image || '');
  const imageType = escapeSql(p.imageType || 'switch');
  const createdAt = escapeSql(p.createdAt || new Date().toISOString());

  sql += `INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (${p.id}, ${escapeSql(p.name)}, ${escapeSql(p.category)}, ${brand}, ${sku}, ${warranty}, ${escapeSql(p.description)}, ${escapeSql(p.fullDescription)}, ${p.price}, ${prevPrice}, ${image}, ${gallery}, ${p.inStock}, ${p.available}, ${p.featured}, ${p.rating || 4.5}, ${p.reviewsCount || 0}, ${imageType}, ${escapeSql(p.type)}, ${techSubtype}, ${createdAt})
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  sku = EXCLUDED.sku,
  warranty = EXCLUDED.warranty,
  description = EXCLUDED.description,
  full_description = EXCLUDED.full_description,
  price = EXCLUDED.price,
  previous_price = EXCLUDED.previous_price,
  image = EXCLUDED.image,
  gallery = EXCLUDED.gallery,
  in_stock = EXCLUDED.in_stock,
  available = EXCLUDED.available,
  featured = EXCLUDED.featured,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  image_type = EXCLUDED.image_type,
  type = EXCLUDED.type,
  tech_subtype = EXCLUDED.tech_subtype;
`;
}

sql += `
-- Ajustar la secuencia de IDs numéricos para futuros productos
SELECT setval('public.products_id_seq', (SELECT GREATEST(MAX(id), 500) FROM public.products) + 1);
`;

const outputPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261028000000_create_products_schema.sql');
fs.writeFileSync(outputPath, sql, 'utf-8');
console.log('Migración generada exitosamente en:', outputPath);
