
  create policy "Users can insert their own activity"
  on "public"."recent_activity"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update their own activity"
  on "public"."recent_activity"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view their own activity"
  on "public"."recent_activity"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



