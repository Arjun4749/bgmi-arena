/*
# Storage Bucket for Media

## 1. Overview
Creates a public storage bucket `media` for tournament posters, winner screenshots, payment screenshots, team logos, and profile pictures.

## 2. Storage
- Bucket `media` is public (readable by anyone) so images can be displayed on the site.
- Insert/Update/Delete limited to authenticated users for their own uploads (admin-managed content).
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for the media bucket
DROP POLICY IF EXISTS "media_public_read" ON storage.objects;
CREATE POLICY "media_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'media');

DROP POLICY IF EXISTS "media_auth_insert" ON storage.objects;
CREATE POLICY "media_auth_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "media_auth_update" ON storage.objects;
CREATE POLICY "media_auth_update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'media');

DROP POLICY IF EXISTS "media_auth_delete" ON storage.objects;
CREATE POLICY "media_auth_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'media');
