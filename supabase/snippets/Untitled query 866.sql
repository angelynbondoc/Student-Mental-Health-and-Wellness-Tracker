CREATE OR REPLACE FUNCTION log_and_search(search_term TEXT)
RETURNS TABLE (
  id uuid, community_id uuid, content text,
  is_anonymous boolean, is_flagged boolean, created_at timestamptz,
  author_id uuid
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  -- Log to search_history (RLS ensures own-data only)
  INSERT INTO search_history (user_id, query)
  VALUES (auth.uid(), search_term);

  -- Return search results with anon masking
  RETURN QUERY SELECT * FROM search_community_posts(search_term);
END;
$$;

GRANT EXECUTE ON FUNCTION log_and_search(TEXT) TO authenticated;