-- Migración 006: bucket de Supabase Storage para banners
-- Run desde Supabase Dashboard → SQL Editor

-- 1) Crear bucket público "banners"
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banners',
  'banners',
  true,
  3145728,  -- 3 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2) Lectura pública (cualquiera puede ver los banners en producción)
DROP POLICY IF EXISTS "Public read banners" ON storage.objects;
CREATE POLICY "Public read banners"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

-- 3) Solo usuarios autenticados pueden subir
DROP POLICY IF EXISTS "Authenticated upload banners" ON storage.objects;
CREATE POLICY "Authenticated upload banners"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'banners');

-- 4) Solo usuarios autenticados pueden eliminar
DROP POLICY IF EXISTS "Authenticated delete banners" ON storage.objects;
CREATE POLICY "Authenticated delete banners"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'banners');
