-- Admin unpublished submissions (and WP probe tables) are read with the
-- service role after the admin email check. Early migrations revoked ALL from
-- PUBLIC / anon / authenticated and never granted service_role explicitly.
-- BYPASSRLS does not replace table GRANTs — without SELECT, PostgREST returns
-- permission denied and /admin shows "Submissions could not be read."

grant select on table public.submissions to service_role;
grant select on table public.reviews to service_role;

-- Probe tables (migration 20261025060000) also revoke from anon/authenticated
-- and rely on the service role for /admin and ingest.
grant select, insert, update, delete on table public.wp_probes to service_role;
grant select, insert, update, delete on table public.wp_probe_settings to service_role;
