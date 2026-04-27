CREATE UNIQUE INDEX unique_post_user_reaction ON public.reactions USING btree (post_id, user_id);

alter table "public"."reactions" add constraint "unique_post_user_reaction" UNIQUE using index "unique_post_user_reaction";


