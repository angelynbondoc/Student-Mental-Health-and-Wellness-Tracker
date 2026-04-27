create extension if not exists "pg_net" with schema "extensions";

CREATE OR REPLACE TRIGGER trigger_moderate_post
AFTER INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION net.http_post(
  url := 'https://<your-project-ref>.supabase.co/functions/v1/moderate-post',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer <your-anon-key>"}'::jsonb,
  body := concat('{"post_id":"', NEW.post_id, '"}')::jsonb
);