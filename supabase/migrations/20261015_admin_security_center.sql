-- Admin "Security & Server" center
-- Safe to run several times.

-- 1) Audit logs: admins read them, admins write their own entries
DROP POLICY IF EXISTS "Admins read audit logs" ON public.audit_logs;
CREATE POLICY "Admins read audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins write own audit logs" ON public.audit_logs;
CREATE POLICY "Admins write own audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (
    public.is_admin()
    AND actor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );
-- No UPDATE / DELETE policy: audit entries cannot be altered from the website.

-- entity_id may hold non-UUID references (e.g. application numbers)
ALTER TABLE public.audit_logs ALTER COLUMN entity_id TYPE TEXT USING entity_id::text;

-- 2) Admin access to tables that had no admin policy (needed for full backups)
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'admissions', 'application_status_history', 'application_universities',
    'jw_documents', 'messages', 'notifications'
  ] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS "Admins manage %s" ON public.%I', t, t);
      EXECUTE format('CREATE POLICY "Admins manage %s" ON public.%I FOR ALL USING (public.is_admin())', t, t);
    END IF;
  END LOOP;
END $$;

-- 3) RLS status report, readable by admins only
CREATE OR REPLACE FUNCTION public.security_overview()
RETURNS TABLE (table_name TEXT, rls_enabled BOOLEAN, policy_count INT, row_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r RECORD; n BIGINT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admins only';
  END IF;

  FOR r IN
    SELECT c.relname::TEXT AS tname, c.relrowsecurity AS rls,
           (SELECT COUNT(*)::INT FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename = c.relname) AS pcount
    FROM pg_class c
    JOIN pg_namespace ns ON ns.oid = c.relnamespace
    WHERE ns.nspname = 'public' AND c.relkind = 'r'
    ORDER BY c.relname
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM public.%I', r.tname) INTO n;
    table_name := r.tname; rls_enabled := r.rls; policy_count := r.pcount; row_count := n;
    RETURN NEXT;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.security_overview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.security_overview() TO authenticated;
