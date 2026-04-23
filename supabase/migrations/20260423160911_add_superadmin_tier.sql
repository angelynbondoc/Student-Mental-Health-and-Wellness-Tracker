-- 1. Alter the constraints and add the new role
ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'admin', 'superadmin'));

-- 2. Manually promote the Superadmin users by updating their roles in the profiles table
UPDATE public.profiles 
SET role = 'superadmin' 
WHERE email IN ( 'seanbooker.orioque@neu.edu.ph', 'tricia.labbao@neu.edu.ph', 'klynezyro.reyes@neu.edu.ph',
                 'jcezperanza@neu.edu.ph', 'angelyn.bondoc@neu.edu.ph', 'aletheosmikael.penarubia@neu.edu.ph' );

-- 3. Rebuild the anonymity view to expose authors to the Superadmin
CREATE OR REPLACE VIEW public.posts_view AS
SELECT
  id, community_id, content, is_anonymous, is_flagged, created_at,
  CASE
    WHEN is_anonymous = true AND (
      SELECT role FROM public.profiles WHERE id = auth.uid()
    ) NOT IN ('admin', 'superadmin') THEN NULL
    ELSE author_id
  END AS author_id
FROM public.posts;

-- 4. Rebuild all 5 Admin RLS Policies
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

DROP POLICY IF EXISTS "posts_delete_admin" ON public.posts;
CREATE POLICY "posts_delete_admin" ON public.posts FOR DELETE
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

DROP POLICY IF EXISTS "posts_update_admin" ON public.posts;
CREATE POLICY "posts_update_admin" ON public.posts FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

DROP POLICY IF EXISTS "reports_select_admin" ON public.reports;
CREATE POLICY "reports_select_admin" ON public.reports FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

DROP POLICY IF EXISTS "resources_all_admin" ON public.resources;
CREATE POLICY "resources_all_admin" ON public.resources FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));