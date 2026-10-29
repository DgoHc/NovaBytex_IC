-- ================================================================
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
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" 
    ON public.products FOR SELECT 
    USING (true);

-- Modificación para anon y authenticated
DROP POLICY IF EXISTS "Anon can modify products" ON public.products;
CREATE POLICY "Anon can modify products"
    ON public.products FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated full access to products" ON public.products;
CREATE POLICY "Authenticated full access to products" 
    ON public.products FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- RLS para custom_categories
DROP POLICY IF EXISTS "Public read custom_categories" ON public.custom_categories;
CREATE POLICY "Public read custom_categories" 
    ON public.custom_categories FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Anon can modify custom_categories" ON public.custom_categories;
CREATE POLICY "Anon can modify custom_categories" 
    ON public.custom_categories FOR ALL 
    TO anon 
    USING (true) 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated full access to custom_categories" ON public.custom_categories;
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (1, 'Switch Cisco Catalyst 9200L-48P-4G', 'Redes', 'Cisco', 'C9200L-48P-4G-E', 'Garantía limitada de por vida con soporte NBD', 'Switch empresarial administrable de 48 puertos Gigabit PoE+ con 4 Uplinks SFP 1G.', 'El Cisco Catalyst 9200L ofrece la potencia de la red sin fronteras con seguridad integrada, resiliencia PoE+ de 740W y capacidad de apilamiento StackWise-160. Ideal para sucursales y oficinas corporativas que requieren alta disponibilidad.', 8999, NULL, '', '{}', true, false, true, 4.9, 38, 'switch', 'technology', NULL, '2025-08-01T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (2, 'Servidor Dell PowerEdge R750 Rack 2U', 'Servidores', 'Dell', 'PER750-XEON-64G', '3 Años ProSupport 24/7 NBD Onsite', 'Servidor de 2 conectores de alto rendimiento para cargas de trabajo críticas y virtualización.', 'El Dell PowerEdge R750 con procesadores Intel Xeon Scalable de 3ª generación es el servidor empresarial ideal para virtualización VMware/Hyper-V, bases de datos SQL/Oracle y analítica de datos a gran escala.', 25999, NULL, '', '{}', true, false, true, 5, 24, 'server', 'technology', NULL, '2025-08-02T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (3, 'Firewall Fortinet FortiGate 100F NGFW', 'Seguridad', 'Fortinet', 'FG-100F-BDL-950-36', '3 Años FortiCare Premium + FortiGuard UTP', 'Firewall de próxima generación con protección SD-WAN segura integrada para medianas y grandes empresas.', 'El FortiGate 100F combina firewall inspeccionado por hardware SPU ASIC SP5, IPS de 1 Gbps, antivirus en línea, inspección SSL profunda y conectividad SD-WAN de alto rendimiento en una solución rentable de 1U.', 12599, 14299, '', '{}', true, false, true, 4.8, 42, 'firewall', 'technology', NULL, '2025-08-03T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (4, 'Laptop Lenovo ThinkPad X1 Carbon Gen 11', 'Equipos', 'Lenovo', '21HM005CLM', '3 Años Premier Support Onsite con cobertura accidental', 'Ultrabook empresarial de fibra de carbono ligera de 1.12 kg con Intel Evo Core i7 de 13a Gen.', 'Diseñada para ejecutivos y profesionales móviles, la ThinkPad X1 Carbon Gen 11 combina una pantalla táctil 2.8K OLED, teclado legendario resistente a derrames y seguridad biométrica con certificación militar MIL-STD-810H.', 9499, NULL, '', '{}', true, false, true, 4.9, 56, 'laptop', 'technology', NULL, '2025-08-04T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (5, 'Switch HP Aruba CX 6100 24G 4SFP+', 'Redes', 'HP', 'JL678A', 'Garantía de por vida limitada Aruba', 'Switch administrable Layer 2+ de 24 Puertos Gigabit con 4 puertos de enlace ascendente 10G SFP+.', 'La serie Aruba CX 6100 ofrece acceso simplificado y seguro con la arquitectura Aruba AOS-CX. Cuenta con análisis integrado en tiempo real y configuración basada en API REST para automatización de red moderna.', 5499, NULL, '', '{}', true, false, false, 4.7, 19, 'switch', 'technology', NULL, '2025-08-05T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (6, 'Sistema de Almacenamiento Dell PowerStore 500T', 'Almacenamiento', 'Dell', 'PSTORE-500T-NVME', '3 Años ProSupport Plus 4 Horas Onsite 24/7', 'Almacenamiento All-Flash NVMe unificado para cargas de trabajo SAN y NAS de máxima velocidad.', 'Dell PowerStore 500T ofrece rendimiento All-Flash con arquitectura centrada en datos, deduplicación y compresión sin impacto garantizada 4:1. Perfecto para consolidación de servidores, bases de datos y entornos multiprotocolo.', 48999, NULL, '', '{}', true, false, false, 5, 12, 'storage', 'technology', NULL, '2025-08-06T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (7, 'Access Point Ubiquiti UniFi U6 Pro Enterprise', 'Redes', 'Ubiquiti', 'U6-PRO', '2 Años de garantía directa', 'Access Point Wi-Fi 6 de banda dual y alto rendimiento para más de 300 clientes simultáneos.', 'El UniFi U6 Pro es un punto de acceso Wi-Fi 6 (802.11ax) diseñado para entornos corporativos de alta densidad. Con tecnología 4x4 MU-MIMO en 5GHz y 2x2 en 2.4GHz, alcanza tasas agregadas de hasta 5.3 Gbps.', 1199, NULL, '', '{}', true, false, true, 4.9, 88, 'accesspoint', 'technology', NULL, '2025-08-07T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (8, 'Router Mikrotik CCR2004-16G-2S+ Cloud Core', 'Redes', 'Mikrotik', 'CCR2004-16G-2S+', '2 Años de garantía', 'Router de alto rendimiento de 16 puertos Gigabit con 2 puertos 10G SFP+ y procesador 64-bit Quad Core.', 'Diseñado para proveedores de servicios e ISPs locales, el Mikrotik CCR2004 ofrece la mejor relación costo-rendimiento por núcleo. Cuenta con RouterOS v7 nivel 6, fuentes de alimentación dobles redundantes y gabinete rack de 1U.', 2899, 3199, '', '{}', true, false, false, 4.8, 31, 'router', 'technology', NULL, '2025-08-08T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (101, 'Papel Fotocopia Bond Report A4 75g (Caja x 5 Empaques)', 'Papelería', 'Report', 'LIB-PAP-REP-75A4-CJ', 'Garantía de calidad de fábrica', 'Caja con 5 millares (2,500 hojas) de papel bond A4 75g.', 'El papel bond Report A4 de 75g es el estándar corporativo preferido en oficinas y colegios del Perú. Producido con tecnología que minimiza atascos en impresoras láser, inkjet y fotocopiadoras de alta velocidad, garantizando impresiones nítidas en blanco y negro o color.', 85, 98, '', '{}', true, true, true, 4.9, 320, 'office', 'library', NULL, '2025-09-10T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (102, 'Cuaderno Cuadriculado Stanford Colegial 100H (Pack x 5)', 'Cuadernos', 'Stanford', 'LIB-CUA-STAN-100CX5', 'Garantía contra defectos de imprenta', 'Pack de 5 cuadernos cuadriculados de 100 hojas colegial.', 'El cuaderno Stanford es el tradicional de las aulas y academias en el Perú. Sus hojas cuadriculadas con cuadrícula de 4.5 mm están impresas con líneas guías nítidas en papel bond blanco grueso que no traspasa la tinta de lapiceros ni plumones escolares.', 32.5, NULL, '', '{}', true, true, true, 4.8, 142, 'notebook', 'library', NULL, '2025-09-11T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (103, 'Cuaderno Universitario Espiral A4 100 Hojas Stanford (Pack x 3)', 'Cuadernos', 'Stanford', 'LIB-CUA-STAN-A4ESPX3', 'Garantía de fabricante', 'Pack de 3 cuadernos espiral A4 de 100 hojas Stanford.', 'Diseñado para universitarios, técnicos y profesionales. Cuenta con anillado espiral metálico continuo que permite abrir 360 grados sin atascos, microperforado para arrancar hojas limpias y bolsillo de plástico transparente para documentos sueltos.', 25.5, 30, '', '{}', true, true, true, 4.9, 215, 'notebook', 'library', NULL, '2025-09-12T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (104, 'Caja de Lapiceros Faber-Castell Trilux 032 Medium x 50 (Azul)', 'Escritura', 'Faber-Castell', 'LIB-LAP-FC-TRILUX50', 'Garantía de tinta indeleble', 'Caja con 50 bolígrafos punta media 1.0 mm color azul.', 'El bolígrafo más vendido y reconocido en todo el Perú. Su punta de carburo de tungsteno ofrece un trazo uniforme sin manchar ni gotear. Su forma triangular ergonómica permite escribir durante horas sin fatiga en la mano.', 48, 55, '', '{}', true, true, true, 5, 450, 'pen', 'library', NULL, '2025-09-13T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (105, 'Archivador de Palanca A4 Lomo Ancho Vinifan (Pack x 3)', 'Archivadores', 'Vinifan', 'LIB-ARC-VIN-A4LAX3', 'Garantía de mecanismo 1 año', 'Pack de 3 archivadores A4 con lomo ancho de 8 cm.', 'El archivador estándar para contabilidad, administración y archivo general en empresas peruanas. Fabricado en cartón prensado reforzado de gran resistencia, forrado en polipropileno lavable que no absorbe humedad ni grasa.', 31.5, NULL, '', '{}', true, true, false, 4.7, 180, 'office', 'library', NULL, '2025-09-14T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (106, 'Set de Resaltadores Faber-Castell Textliner 46 Pastel x 6', 'Escritura', 'Faber-Castell', 'LIB-RES-FC-PASTEL', 'Garantía de tinta 6 meses', 'Estuche de 6 resaltadores en tonos pastel punta bisel.', 'Resaltadores premium que no fatigan la vista al estudiar o revisar documentos extensos. Su tinta a base de agua no traspasa las hojas finas de papel bond ni apuntes de lapicero, ofreciendo trazos limpios de 1, 2 y 5 mm.', 24.5, 28, '', '{}', true, true, true, 4.9, 230, 'highlighter', 'library', NULL, '2025-09-15T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (107, 'Plumones para Pizarra Acrílica Artesco x 8 Colores + Mota', 'Escritura', 'Artesco', 'LIB-PLU-ART-PIZ8', 'Garantía de fábrica', 'Set de 8 plumones de pizarra surtidos con mota imantada.', 'Imprescindible en salas de reuniones corporativas, colegios e institutos. Tinta de secado rápido que se borra con facilidad usando franela o borrador de mota sin dejar sombras ni marcas residuales en la pizarra.', 28, NULL, '', '{}', true, true, false, 4.7, 112, 'marker', 'library', NULL, '2025-09-16T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (108, 'Paquete de Fólderes Manila A4 con Faster Artesco x 50', 'Oficina', 'Artesco', 'LIB-FOL-MAN-A4X50', 'Garantía de calidad', '50 fólderes manila A4 con 50 broches faster metálicos.', 'El fólder manila clásico utilizado para expedientes, trámites documentarios, licitaciones y legajos de personal en el Perú.', 25, 29, '', '{}', true, true, false, 4.8, 95, 'office', 'library', NULL, '2025-09-17T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (109, 'Caja de Marcadores Permanentes Sharpie Fine Point x 12 (Negro)', 'Arte', 'Sharpie', 'LIB-MAR-SHA-FINE12', 'Garantía de tinta 1 año', 'Caja con 12 marcadores punta fina 1.0 mm tinta negra.', 'El marcador permanente por excelencia en almacenes, logística y oficinas. Escribe de forma permanente sobre cualquier superficie no grasa, resistente al agua y a la decoloración solar.', 54, 62, '', '{}', true, true, false, 4.9, 168, 'marker', 'library', NULL, '2025-09-18T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (110, 'Pack Tacos Notas Adhesivas 3x3 Artesco Neon x 6 Unidades', 'Oficina', 'Artesco', 'LIB-NOT-POST-3X3X6', 'Garantía de adhesivo', 'Pack de 6 tacos de 100 notas adhesivas de 76 x 76 mm.', 'Ideales para recordatorios rápidos en pantallas, escritorios, agendas y carpetas.', 22, NULL, '', '{}', true, true, false, 4.7, 88, 'office', 'library', NULL, '2025-09-19T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (111, 'Set Tijera de Oficina Acero Inoxidable 8" + Cúter Metálico', 'Accesorios', 'Artesco', 'LIB-TIJ-CUT-SET', 'Garantía de filo 1 año', 'Tijera de 8 pulgadas en acero más cúter metálico 18 mm.', 'Diseñada para uso continuo en oficina y almacén. Corta fácilmente papel, cartón grueso, cintas adhesivas y telas con suavidad.', 20, NULL, '', '{}', true, true, false, 4.8, 135, 'desk', 'library', NULL, '2025-09-20T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (112, 'Engrapadora Metálica de Oficina Pesada 24/6 + Perforador 2H', 'Oficina', 'Artesco', 'LIB-ENG-PERF-KIT', 'Garantía 1 año', 'Engrapadora para 30 hojas, perforador y 1,000 grapas.', 'Herramienta indispensable en escritorios administrativos. Mecanismo de acero templado con resorte de alta precisión que evita atascos de grapas.', 45, 52, '', '{}', true, true, true, 4.9, 160, 'office', 'library', NULL, '2025-09-21T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (113, 'Set Pluma Estilográfica & Bolígrafo Parker Jotter Premium', 'Escritura', 'Parker', 'LIB-PAR-JOTT-SET', 'Garantía oficial Parker de por vida', 'Juego de pluma y bolígrafo Parker Jotter en estuche.', 'El regalo y artículo de distinción ejecutiva por excelencia. Fabricado con cuerpo de acero inoxidable cepillado, clip icónico en forma de flecha y plumín de acero inoxidable con trazo medio perfecto para firmas y acuerdos.', 220, 250, '', '{}', true, true, true, 5, 84, 'pen', 'library', NULL, '2025-09-22T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (201, 'Adobe Acrobat PRO (Licencia Permanente)', 'Licencias & Software', 'Adobe', 'LIC-ADOBE-ACROBAT-PERM', 'Activación Digital Permanente Garantizada', 'Licencia digital de por vida para Adobe Acrobat PRO. Edición avanzada de documentos PDF.', 'Licencia permanente original para Adobe Acrobat PRO. Permite crear, editar, firmar, convertir y proteger archivos PDF con herramientas profesionales completas sin mensualidades.', 60, 85, '/assets/Licencias, subs/Adobe Acrobat PRO (Licencia Permanente) - 60.00.jpg', '{}', true, true, true, 4.9, 42, 'software', 'technology', 'license', '2026-10-20T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (202, 'Adobe Acrobat PRO DC Windows (Preactivado)', 'Licencias & Software', 'Adobe', 'LIC-ADOBE-DC-WIN', 'Soporte de instalación garantizado', 'Versión preactivada de Adobe Acrobat PRO DC lista para instalar en Windows.', 'Adobe Acrobat PRO DC para entornos de trabajo Windows. Instalador preactivado con todas las funciones de edición y organización de PDF habilitadas.', 15, 25, '/assets/Licencias, subs/Adobe Acrobat PRO DC (Windows)  Preactivado - 15.00.jpg', '{}', true, true, false, 4.7, 18, 'software', 'technology', 'license', '2026-10-20T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (203, 'ESET NOD32 Internet Security', 'Seguridad & Antivirus', 'ESET', 'LIC-ESET-IS', 'Garantía oficial ESET por el periodo contratado', 'Seguridad avanzada para navegación web, banca en línea y protección integral contra malware.', 'ESET Internet Security brinda protección completa para tu vida digital: escudo contra ransomware, protección de banca online y firewall personal con consumo mínimo de recursos.', 65, 85, '/assets/Licencias, subs/Eset Nod32 internet Security - 65.00.jpg', '{}', true, true, true, 5, 65, 'software', 'technology', 'license', '2026-10-20T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (204, 'ESET NOD32 Antivirus x 1 Año', 'Seguridad & Antivirus', 'ESET', 'LIC-ESET-NOD32-1Y', '1 Año de protección oficial', 'El legendario antivirus rápido y liviano para gamers y profesionales por 12 meses.', 'Protección galardonada que no ralentiza tu equipo. Incluye modo jugador para sesiones sin interrupciones y detección heurística líder en la industria.', 50, 70, '/assets/Licencias, subs/Eset Nod32 x 1año - 50.00.jpg', '{}', true, true, false, 4.8, 39, 'software', 'technology', 'license', '2026-10-20T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (205, 'Kaspersky Plus + VPN (1 Año / 1 PC)', 'Seguridad & Antivirus', 'Kaspersky', 'LIC-KASP-PLUS-1Y', 'Licencia oficial Kaspersky 12 meses', 'Ciberseguridad de última generación con VPN ilimitada y optimizador de rendimiento del sistema.', 'Kaspersky Plus ofrece defensa total contra virus, malware y troyanos, combinada con VPN ultrarrápida ilimitada para navegación privada y herramientas de limpieza del disco duro.', 75, 95, '/assets/Licencias, subs/kaspersky Plus VPN 1 año PC - 75.00.jpg', '{}', true, true, true, 4.9, 52, 'software', 'technology', 'license', '2026-10-20T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (206, 'McAfee Total Protection (2 Años)', 'Seguridad & Antivirus', 'McAfee', 'LIC-MCAFEE-2Y', '2 Años de garantía y soporte oficial', 'Protección antivirus completa para dispositivos con firewall, destructor de archivos y protección web.', 'McAfee Total Protection brinda seguridad premium durante 2 años contra virus, ransomware y amenazas en la web con una puntuación de protección del 100%.', 40, 65, '/assets/Licencias, subs/Mc Afee Total x 2 años - 40.00.jpg', '{}', true, true, false, 4.7, 31, 'software', 'technology', 'license', '2026-10-20T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (207, 'McAfee Protection Multidispositivo (5 Años)', 'Seguridad & Antivirus', 'McAfee', 'LIC-MCAFEE-5Y', '5 Años de suscripción garantizada', 'La máxima tranquilidad a largo plazo con 5 años de seguridad completa para tus equipos.', 'Plan extendido de 5 años para despreocuparte de renovaciones antivirus. Defiende tus equipos contra el robo de identidad, malware y sitios web fraudulentos.', 80, 120, '/assets/Licencias, subs/Mc Afee x 5 años - 80.00.jpg', '{}', true, true, true, 4.9, 44, 'software', 'technology', 'license', '2026-10-20T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (208, 'Microsoft 365 Personal (1TB Cloud - 1 PC/Mac)', 'Suscripciones Cloud', 'Microsoft', 'SUB-MS365-1TB-1PC', '1 Año de suscripción oficial Microsoft', 'Suscripción anual a Word, Excel, PowerPoint y 1000 GB (1TB) de almacenamiento en la nube OneDrive.', 'Todo lo que necesitas para tu trabajo diario y estudio. Accede a las aplicaciones premium de Office con las últimas funciones de Inteligencia Artificial y sincronización automática en la nube.', 70, 95, '/assets/Licencias, subs/Microsoft 365 1TB 1PC - 70.00.jpg', '{}', true, true, true, 5, 88, 'software', 'technology', 'license', '2026-10-20T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (209, 'Nitro PRO PDF (Licencia Digital)', 'Licencias & Software', 'Nitro', 'LIC-NITRO-PRO', 'Licencia digital perpetua', 'Software profesional líder para crear, editar, combinar y firmar archivos PDF de forma rápida.', 'Alternativa potente y ligera a Adobe Acrobat. Permite transformar documentos escaneados en archivos editables mediante OCR, proteger con contraseña y firmar contratos digitales con facilidad.', 15, 28, '/assets/Licencias, subs/Nitro PRO - 15.00.jpg', '{}', true, true, false, 4.6, 22, 'software', 'technology', 'license', '2026-10-20T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (210, 'Microsoft Office 2024 Profesional (Permanente)', 'Licencias & Software', 'Microsoft', 'LIC-OFFICE-2024-PRO', 'Activación Digital Permanente Oficial', 'Licencia definitiva de Office 2024. Compra única para siempre sin suscripciones ni mensualidades.', 'La versión más moderna y completa de Office para empresas y profesionales. Incluye Word 2024, Excel 2024, PowerPoint 2024, Outlook 2024 y Access 2024 con activación enlazable a tu equipo.', 50, 85, '/assets/Licencias, subs/Office 2024 Permanente - 50.00.jpg', '{}', true, true, true, 5, 97, 'software', 'technology', 'license', '2026-10-20T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (211, 'Office 365 Familia x 1 Año (1TB para 5 Dispositivos)', 'Suscripciones Cloud', 'Microsoft', 'SUB-OFFICE365-5PC-1TB', '1 Año de suscripción multiusuario', 'El plan más completo para hogares y oficinas pequeñas. Hasta 5 dispositivos con 1 TB de nube cada uno.', 'Comparte todos los beneficios de Microsoft 365 con tu familia o equipo. Cada persona disfruta de 1 TB de almacenamiento independiente y las aplicaciones de Office en computadoras, tablets y teléfonos.', 120, 160, '/assets/Licencias, subs/Office 365 x 1 año con almacenamiento 1TB para 5PC - 120.00.jpg', '{}', true, true, true, 5, 64, 'software', 'technology', 'license', '2026-10-20T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (212, 'Office 365 x 1 Año sin Almacenamiento (5 Dispositivos)', 'Suscripciones Cloud', 'Microsoft', 'SUB-OFFICE365-5PC-NO1TB', '1 Año de activación garantizada', 'Plan económico de aplicaciones de Office para 5 equipos sin costo extra de almacenamiento cloud.', 'Ideal para colegios, academias o pequeñas empresas que solo necesitan el paquete ofimático Office en sus máquinas sin contratar espacio adicional en la nube.', 35, 55, '/assets/Licencias, subs/Office 365 x 1 año sin almacenamiento para 5PC - 35.00.jpg', '{}', true, true, false, 4.8, 29, 'software', 'technology', 'license', '2026-10-20T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (213, 'Windows 10 / 11 Pro & Home OEM (Activación Digital)', 'Sistemas Operativos', 'Microsoft', 'LIC-WIN-OEM', 'Garantía de activación digital de por vida', 'Licencia digital genuina OEM para ensambladores y computadoras personales o de oficina.', 'Activa Windows 10 Pro o Windows 11 Pro de manera legal y definitiva. Se enlaza al hardware de la placa madre y permite recibir todas las actualizaciones oficiales de seguridad de Microsoft.', 35, 50, '/assets/Licencias, subs/Win 10 11 PRO Home OEM - 35.00.jpg', '{}', true, true, true, 4.9, 110, 'software', 'technology', 'license', '2026-10-20T10:00:00.000Z')
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
INSERT INTO public.products (id, name, category, brand, sku, warranty, description, full_description, price, previous_price, image, gallery, in_stock, available, featured, rating, reviews_count, image_type, type, tech_subtype, created_at)
VALUES (214, 'Windows 10 / 11 Pro Retail (Transferible)', 'Sistemas Operativos', 'Microsoft', 'LIC-WIN-RETAIL', 'Licencia perpetua oficial Microsoft Retail', 'Licencia Retail transferible. Si cambias de equipo o componentes, mantienes tu clave de activación.', 'La máxima categoría de licencia para Windows. Permite ser transferida a una nueva computadora en el futuro si renuevas tu hardware, brindando la máxima inversión y durabilidad.', 50, 75, '/assets/Licencias, subs/Win 10 11 PRO Retail - 50.00.jpg', '{}', true, true, true, 5, 76, 'software', 'technology', 'license', '2026-10-20T10:00:00.000Z')
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

-- Ajustar la secuencia de IDs numéricos para futuros productos
SELECT setval('public.products_id_seq', (SELECT GREATEST(MAX(id), 500) FROM public.products) + 1);
