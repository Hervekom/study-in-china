-- Student applications stored in the database (replaces browser-only storage)
-- One row per application; the full application document lives in `data` (JSONB).
-- Safe to run several times.

CREATE TABLE IF NOT EXISTS public.student_applications (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'deposit_pending',
  student_email TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS student_applications_user_idx ON public.student_applications(user_id);
CREATE INDEX IF NOT EXISTS student_applications_updated_idx ON public.student_applications(updated_at DESC);

ALTER TABLE public.student_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students read own applications" ON public.student_applications;
CREATE POLICY "Students read own applications" ON public.student_applications
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Students create own applications" ON public.student_applications;
CREATE POLICY "Students create own applications" ON public.student_applications
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Students update own applications" ON public.student_applications;
CREATE POLICY "Students update own applications" ON public.student_applications
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins delete applications" ON public.student_applications;
CREATE POLICY "Admins delete applications" ON public.student_applications
  FOR DELETE USING (public.is_admin());

-- Guard: what a student may and may not change in their own application
CREATE OR REPLACE FUNCTION public.guard_student_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  claims TEXT := NULLIF(current_setting('request.jwt.claims', true), '');
  -- Staff = admins, the service role (Edge Functions), or direct SQL (no API request at all)
  is_staff BOOLEAN := public.is_admin()
    OR COALESCE(claims::jsonb->>'role', '') = 'service_role'
    OR (claims IS NULL AND NULLIF(current_setting('request.jwt.claim.sub', true), '') IS NULL);
  k TEXT;
  d JSONB;
  old_doc JSONB;
  old_len INT;
  new_len INT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT is_staff THEN
      NEW.user_id := auth.uid();
      -- A new application always starts unpaid and unverified; payments are confirmed by admins
      NEW.data := jsonb_set(NEW.data, '{status}', '"deposit_pending"');
      NEW.data := jsonb_set(NEW.data, '{payments,deposit,paid}', 'false', false);
      NEW.data := jsonb_set(NEW.data, '{payments,deposit,status}', '"pending"', false);
      NEW.data := jsonb_set(NEW.data, '{payments,admissionPayment,paid}', 'false', false);
      NEW.data := jsonb_set(NEW.data, '{payments,finalPayment,paid}', 'false', false);
      NEW.data := NEW.data - 'admissionNotice' - 'jw202Form' - 'adminNotes';
      IF NEW.data ? 'documents' THEN
        NEW.data := jsonb_set(NEW.data, '{documents}', COALESCE((
          SELECT jsonb_agg(
            CASE WHEN e->>'status' IN ('missing', 'pending', 'uploaded') THEN e - 'receivedAt' - 'receivedBy'
                 ELSE (e - 'receivedAt' - 'receivedBy') || '{"status":"pending"}'::jsonb END
            ORDER BY i)
          FROM jsonb_array_elements(NEW.data->'documents') WITH ORDINALITY t(e, i)
        ), '[]'::jsonb));
      END IF;
    END IF;
  ELSE
    IF NOT is_staff THEN
      IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION 'You cannot transfer an application';
      END IF;

      -- Fields only the admissions team can change
      FOREACH k IN ARRAY ARRAY['status', 'payments', 'timeline', 'admissionNotice', 'jw202Form', 'advisor', 'institutionDeposit', 'adminNotes'] LOOP
        IF (NEW.data -> k) IS DISTINCT FROM (OLD.data -> k) THEN
          RAISE EXCEPTION 'Only the admissions team can change "%"', k;
        END IF;
      END LOOP;

      -- Documents: students may upload / replace files (status back to pending),
      -- but cannot verify documents or fake an acknowledgment of receipt
      FOR d IN SELECT * FROM jsonb_array_elements(COALESCE(NEW.data->'documents', '[]'::jsonb)) LOOP
        SELECT e INTO old_doc FROM jsonb_array_elements(COALESCE(OLD.data->'documents', '[]'::jsonb)) e WHERE e->>'id' = d->>'id';
        IF (d->>'status') NOT IN ('missing', 'pending', 'uploaded') THEN
          IF old_doc IS NULL OR (old_doc->>'status') IS DISTINCT FROM (d->>'status') OR (old_doc->'feedback') IS DISTINCT FROM (d->'feedback') THEN
            RAISE EXCEPTION 'Only the admissions team can review documents';
          END IF;
        END IF;
        IF (d->'receivedAt') IS NOT NULL AND (d->'receivedAt') IS DISTINCT FROM (old_doc->'receivedAt') THEN
          RAISE EXCEPTION 'Only the admissions team can acknowledge documents';
        END IF;
      END LOOP;

      -- Messages: students can only append their own messages
      old_len := COALESCE(jsonb_array_length(OLD.data->'messages'), 0);
      new_len := COALESCE(jsonb_array_length(NEW.data->'messages'), 0);
      IF new_len < old_len OR COALESCE((
          SELECT jsonb_agg(e ORDER BY i) FROM jsonb_array_elements(NEW.data->'messages') WITH ORDINALITY t(e, i) WHERE i <= old_len
        ), '[]'::jsonb) IS DISTINCT FROM COALESCE(OLD.data->'messages', '[]'::jsonb) THEN
        RAISE EXCEPTION 'Messages cannot be edited or deleted';
      END IF;
      IF EXISTS (
        SELECT 1 FROM jsonb_array_elements(NEW.data->'messages') WITH ORDINALITY t(e, i)
        WHERE i > old_len AND e->>'sender' <> 'student'
      ) THEN
        RAISE EXCEPTION 'Students can only send their own messages';
      END IF;
    END IF;
  END IF;

  NEW.status := COALESCE(NEW.data->>'status', NEW.status);
  NEW.student_email := COALESCE(NEW.data->'personal'->>'email', NEW.student_email);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.guard_student_application() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS student_applications_guard ON public.student_applications;
CREATE TRIGGER student_applications_guard
  BEFORE INSERT OR UPDATE ON public.student_applications
  FOR EACH ROW EXECUTE FUNCTION public.guard_student_application();

-- Uploaded documents bucket (private). Path: <user_id>/<application_id>/<file>
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('student-documents', 'student-documents', false, 10485760)
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 10485760;

DROP POLICY IF EXISTS "Students can read own files" ON storage.objects;
CREATE POLICY "Students can read own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'student-documents' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
  );

DROP POLICY IF EXISTS "Students can upload own files" ON storage.objects;
CREATE POLICY "Students can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'student-documents' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
  );

DROP POLICY IF EXISTS "Admins delete student files" ON storage.objects;
CREATE POLICY "Admins delete student files" ON storage.objects
  FOR DELETE USING (bucket_id = 'student-documents' AND public.is_admin());
