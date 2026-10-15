-- Applied on 2026-10-15 (Supabase security advisor fixes)
ALTER FUNCTION public.is_admin() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.prevent_role_self_change() SET search_path = public, pg_temp;

-- Trigger-only functions must not be callable through the API
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_role_self_change() FROM PUBLIC, anon, authenticated;

-- security_overview is for signed-in admins only (it also checks is_admin() itself)
REVOKE EXECUTE ON FUNCTION public.security_overview() FROM PUBLIC, anon;
