create extension if not exists "pg_net" with schema "extensions";

CREATE TRIGGER trigger_moderate_post AFTER INSERT ON public.reports FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('http://host.docker.internal:54321/functions/v1/moderate-post', 'POST', '{"Content-type":"application/json"}', '{}', '5000');


