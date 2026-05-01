drop policy "Admins can delete habits" on "public"."habits";

drop policy "Admins can insert habits" on "public"."habits";

drop policy "Users can read habits" on "public"."habits";

alter table "public"."comments" enable row level security;

alter table "public"."communities" enable row level security;

alter table "public"."direct_messages" enable row level security;

alter table "public"."habit_logs" enable row level security;

alter table "public"."mood_journal" enable row level security;

alter table "public"."notifications" enable row level security;

alter table "public"."posts" enable row level security;

alter table "public"."profiles" enable row level security;

alter table "public"."reactions" enable row level security;

alter table "public"."recent_activity" enable row level security;

alter table "public"."reports" enable row level security;

alter table "public"."resources" enable row level security;

alter table "public"."search_history" enable row level security;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$function$
;

create or replace view "public"."posts_view" as  SELECT id,
    community_id,
    content,
    is_anonymous,
    is_flagged,
    created_at,
        CASE
            WHEN ((is_anonymous = true) AND (( SELECT profiles.role
               FROM public.profiles
              WHERE (profiles.id = auth.uid())) <> 'admin'::text)) THEN NULL::uuid
            ELSE author_id
        END AS author_id
   FROM public.posts p;



  create policy "comments_delete_own"
  on "public"."comments"
  as permissive
  for delete
  to public
using ((auth.uid() = author_id));



  create policy "comments_insert_own"
  on "public"."comments"
  as permissive
  for insert
  to public
with check ((auth.uid() = author_id));



  create policy "comments_select_authenticated"
  on "public"."comments"
  as permissive
  for select
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "communities_select_authenticated"
  on "public"."communities"
  as permissive
  for select
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "dm_insert_own"
  on "public"."direct_messages"
  as permissive
  for insert
  to public
with check ((auth.uid() = sender_id));



  create policy "dm_select_participant"
  on "public"."direct_messages"
  as permissive
  for select
  to public
using (((auth.uid() = sender_id) OR (auth.uid() = receiver_id)));



  create policy "dm_update_receiver"
  on "public"."direct_messages"
  as permissive
  for update
  to public
using ((auth.uid() = receiver_id))
with check ((auth.uid() = receiver_id));



  create policy "habit_logs_all_own"
  on "public"."habit_logs"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "habits_all_own"
  on "public"."habits"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "mood_journal_all_own"
  on "public"."mood_journal"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "notifications_insert_service"
  on "public"."notifications"
  as permissive
  for insert
  to public
with check ((auth.role() = 'service_role'::text));



  create policy "notifications_select_own"
  on "public"."notifications"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "notifications_update_own"
  on "public"."notifications"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "posts_delete_admin"
  on "public"."posts"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "posts_delete_own"
  on "public"."posts"
  as permissive
  for delete
  to public
using ((auth.uid() = author_id));



  create policy "posts_insert_own"
  on "public"."posts"
  as permissive
  for insert
  to public
with check ((auth.uid() = author_id));



  create policy "posts_select_authenticated"
  on "public"."posts"
  as permissive
  for select
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "posts_update_admin"
  on "public"."posts"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "profiles_select_admin"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles profiles_1
  WHERE ((profiles_1.id = auth.uid()) AND (profiles_1.role = 'admin'::text)))));



  create policy "profiles_select_own"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((auth.uid() = id));



  create policy "profiles_update_own"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id))
with check ((auth.uid() = id));



  create policy "reactions_delete_own"
  on "public"."reactions"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "reactions_insert_own"
  on "public"."reactions"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "reactions_select_authenticated"
  on "public"."reactions"
  as permissive
  for select
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "reactions_update_own"
  on "public"."reactions"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "recent_activity_all_own"
  on "public"."recent_activity"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "reports_insert_authenticated"
  on "public"."reports"
  as permissive
  for insert
  to public
with check ((auth.role() = 'authenticated'::text));



  create policy "reports_select_admin"
  on "public"."reports"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "resources_all_admin"
  on "public"."resources"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "resources_select_authenticated"
  on "public"."resources"
  as permissive
  for select
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "search_history_all_own"
  on "public"."search_history"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


