-- Security hardening (2026-11-08)
update storage.buckets
   set allowed_mime_types = array['application/pdf','image/jpeg','image/png','image/webp','image/heic','image/heif','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
 where id = 'student-documents';
update storage.buckets
   set file_size_limit = 5242880,
       allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','image/avif']
 where id = 'site-assets';
alter policy "Students can update own documents when allowed" on public.application_documents
  with check (((student_id in (select profiles.id from profiles where profiles.user_id = auth.uid())) and (status = any (array['uploaded'::text, 'correction_required'::text]))) or is_admin());
alter policy "Students can update own draft applications" on public.applications
  with check (((student_id in (select profiles.id from profiles where profiles.user_id = auth.uid())) and (status = any (array['draft'::text, 'incomplete'::text]))) or is_admin());
alter policy "Users can update own notifications" on public.notifications
  with check (user_id in (select profiles.id from profiles where profiles.user_id = auth.uid()));
alter policy "Users can update own profile" on public.profiles
  with check ((user_id = auth.uid()) or is_admin());
