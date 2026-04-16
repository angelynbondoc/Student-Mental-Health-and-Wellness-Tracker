-- ============================================================
-- SECTION 1: PROFILES TRIGGER
-- Auto-creates a profiles row on every new auth sign-up
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- SECTION 2: ANONYMOUS POST VIEW
-- RLS is row-level only — column masking requires a view.
-- Tell Dev 1 (Klyne) to ALWAYS query this view, never posts directly.
-- ============================================================

CREATE OR REPLACE VIEW public.posts_view
WITH (security_invoker = true)
AS
SELECT
  p.id,
  p.community_id,
  p.content,
  p.is_anonymous,
  p.is_flagged,
  p.created_at,
  CASE
    WHEN p.is_anonymous = true
     AND (
       SELECT role FROM public.profiles
       WHERE id = auth.uid()
     ) != 'admin'
    THEN NULL
    ELSE p.author_id
  END AS author_id
FROM public.posts p;


-- ============================================================
-- SECTION 3: ENABLE RLS ON ALL REMAINING TABLES
-- (habits already has RLS enabled, skipped)
-- ============================================================

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_journal     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_activity  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history   ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- SECTION 4: DROP INCORRECT HABITS POLICIES
-- The existing policies are wrong (admin-only insert/delete,
-- all-authenticated read). Correct behavior: own-data only.
-- ============================================================

DROP POLICY IF EXISTS "Admins can delete habits" ON public.habits;
DROP POLICY IF EXISTS "Admins can insert habits" ON public.habits;
DROP POLICY IF EXISTS "Users can read habits"    ON public.habits;


-- ============================================================
-- SECTION 5: RLS POLICIES
-- ============================================================

-- ---------------------------
-- profiles
-- ---------------------------
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---------------------------
-- posts
-- ---------------------------
CREATE POLICY "posts_select_authenticated"
  ON public.posts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "posts_insert_own"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "posts_delete_own"
  ON public.posts FOR DELETE
  USING (auth.uid() = author_id);

CREATE POLICY "posts_delete_admin"
  ON public.posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "posts_update_admin"
  ON public.posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---------------------------
-- comments
-- ---------------------------
CREATE POLICY "comments_select_authenticated"
  ON public.comments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "comments_insert_own"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "comments_delete_own"
  ON public.comments FOR DELETE
  USING (auth.uid() = author_id);

-- ---------------------------
-- reactions
-- ---------------------------
CREATE POLICY "reactions_select_authenticated"
  ON public.reactions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "reactions_insert_own"
  ON public.reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reactions_update_own"
  ON public.reactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reactions_delete_own"
  ON public.reactions FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------
-- communities
-- ---------------------------
CREATE POLICY "communities_select_authenticated"
  ON public.communities FOR SELECT
  USING (auth.role() = 'authenticated');

-- ---------------------------
-- mood_journal
-- ---------------------------
CREATE POLICY "mood_journal_all_own"
  ON public.mood_journal FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------
-- habits (corrected)
-- ---------------------------
CREATE POLICY "habits_all_own"
  ON public.habits FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------
-- habit_logs
-- ---------------------------
CREATE POLICY "habit_logs_all_own"
  ON public.habit_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------
-- resources
-- ---------------------------
CREATE POLICY "resources_select_authenticated"
  ON public.resources FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "resources_all_admin"
  ON public.resources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---------------------------
-- reports
-- ---------------------------
CREATE POLICY "reports_insert_authenticated"
  ON public.reports FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "reports_select_admin"
  ON public.reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---------------------------
-- notifications
-- ---------------------------
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Needed so the moderate-post Edge Function (service role) can insert
CREATE POLICY "notifications_insert_service"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ---------------------------
-- direct_messages
-- ---------------------------
CREATE POLICY "dm_select_participant"
  ON public.direct_messages FOR SELECT
  USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "dm_insert_own"
  ON public.direct_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "dm_update_receiver"
  ON public.direct_messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- ---------------------------
-- recent_activity
-- ---------------------------
CREATE POLICY "recent_activity_all_own"
  ON public.recent_activity FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------
-- search_history
-- ---------------------------
CREATE POLICY "search_history_all_own"
  ON public.search_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);