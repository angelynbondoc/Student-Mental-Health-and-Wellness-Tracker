create extension if not exists "pg_net" with schema "extensions";

CREATE OR REPLACE TRIGGER trigger_moderate_post
AFTER INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION net.http_post(
  url := 'https://lpxbuoaiimemloaipipz.supabase.co/functions/v1/moderate-post',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxweGJ1b2FpaW1lbWxvYWlwaXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMTgzNjUsImV4cCI6MjA5MDc5NDM2NX0.F64w49mLfM-5W7Ytp7iLdt_n7M8kxcaiJ_KSM9YSmUs"}'::jsonb,
  body := concat('{"post_id":"', NEW.post_id, '"}')::jsonb
);