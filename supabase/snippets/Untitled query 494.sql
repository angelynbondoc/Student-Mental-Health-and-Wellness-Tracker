CREATE OR REPLACE FUNCTION search_community_posts(search_term TEXT)
RETURNS TABLE (
  id uuid, community_id uuid, content text,
  is_anonymous boolean, is_flagged boolean, created_at timestamptz,
  author_id uuid
)
LANGUAGE sql
SECURITY INVOKER
AS $$
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
$$;

GRANT EXECUTE ON FUNCTION search_community_posts(TEXT) TO authenticated;