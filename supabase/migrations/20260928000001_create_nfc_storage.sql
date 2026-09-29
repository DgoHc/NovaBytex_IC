-- ==========================================
-- BUCKET: nfc-media
-- ==========================================
-- Insertar el bucket si no existe (Requiere permisos de administrador sobre la tabla storage.buckets)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('nfc-media', 'nfc-media', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- POLÍTICAS DE STORAGE (storage.objects)
-- ==========================================
-- Permitir lectura pública de las imágenes
CREATE POLICY "Public Access for nfc-media"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'nfc-media' );

-- Permitir a los administradores subir imágenes
CREATE POLICY "Admins can upload to nfc-media"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK ( bucket_id = 'nfc-media' );

-- Permitir a los administradores actualizar imágenes
CREATE POLICY "Admins can update in nfc-media"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING ( bucket_id = 'nfc-media' );

-- Permitir a los administradores eliminar imágenes
CREATE POLICY "Admins can delete from nfc-media"
    ON storage.objects FOR DELETE
    TO authenticated
    USING ( bucket_id = 'nfc-media' );
