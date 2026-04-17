set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.log_and_search(search_term text)
 RETURNS TABLE(id uuid, community_id uuid, content text, is_anonymous boolean, is_flagged boolean, created_at timestamp with time zone, author_id uuid)
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Log to search_history (RLS ensures own-data only)
  INSERT INTO search_history (user_id, query)
  VALUES (auth.uid(), search_term);

  -- Return search results with anon masking
  RETURN QUERY SELECT * FROM search_community_posts(search_term);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.search_community_posts(search_term text)
 RETURNS TABLE(id uuid, community_id uuid, content text, is_anonymous boolean, is_flagged boolean, created_at timestamp with time zone, author_id uuid)
 LANGUAGE sql
AS $function$
  SELECT
    id, community_id, content, is_anonymous, is_flagged, created_at,
    CASE
      WHEN is_anonymous = true AND (
        SELECT role FROM profiles WHERE id = auth.uid()
      ) != 'admin' THEN NULL
      ELSE author_id
    END AS author_id
  FROM posts
  WHERE to_tsvector('english', content) @@ plainto_tsquery('english', search_term)
  ORDER BY created_at DESC
  LIMIT 50;
$function$
;


