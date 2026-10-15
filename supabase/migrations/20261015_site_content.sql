-- Editable website content (Admin Portal → Site Content). Safe to run several times.

CREATE TABLE IF NOT EXISTS public.site_content (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site content" ON public.site_content;
CREATE POLICY "Public read site content" ON public.site_content
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage site content" ON public.site_content;
CREATE POLICY "Admins manage site content" ON public.site_content
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Public bucket for website images (carousel). Only admins can upload or delete.
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read site assets" ON storage.objects;
CREATE POLICY "Public read site assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "Admins upload site assets" ON storage.objects;
CREATE POLICY "Admins upload site assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'site-assets' AND public.is_admin());

DROP POLICY IF EXISTS "Admins update site assets" ON storage.objects;
CREATE POLICY "Admins update site assets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'site-assets' AND public.is_admin());

DROP POLICY IF EXISTS "Admins delete site assets" ON storage.objects;
CREATE POLICY "Admins delete site assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'site-assets' AND public.is_admin());
