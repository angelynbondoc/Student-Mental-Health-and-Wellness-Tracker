drop extension if exists "pg_net";


  create table "public"."comments" (
    "id" uuid not null default gen_random_uuid(),
    "post_id" uuid,
    "author_id" uuid,
    "content" text not null,
    "created_at" timestamp without time zone default now()
      );



  create table "public"."communities" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "category" text,
    "created_by" uuid,
    "created_at" timestamp without time zone default now()
      );



  create table "public"."direct_messages" (
    "id" uuid not null default gen_random_uuid(),
    "sender_id" uuid,
    "receiver_id" uuid,
    "message_text" text not null,
    "is_read" boolean default false,
    "created_at" timestamp without time zone default now()
      );



  create table "public"."habit_logs" (
    "id" uuid not null default gen_random_uuid(),
    "habit_id" uuid,
    "user_id" uuid,
    "completed_date" date default CURRENT_DATE,
    "created_at" timestamp without time zone default now()
      );



  create table "public"."habits" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "habit_name" text not null,
    "created_at" timestamp without time zone default now()
      );


alter table "public"."habits" enable row level security;


  create table "public"."mood_journal" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "mood_rating" integer,
    "trigger_note" text,
    "gratitude_note" text,
    "reflection_note" text,
    "created_at" timestamp without time zone default now(),
    "entry_text" text
      );



  create table "public"."notifications" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "content" text,
    "type" text,
    "is_read" boolean default false,
    "created_at" timestamp without time zone default now()
      );



  create table "public"."posts" (
    "id" uuid not null default gen_random_uuid(),
    "author_id" uuid,
    "content" text not null,
    "is_anonymous" boolean default false,
    "is_flagged" boolean default false,
    "created_at" timestamp without time zone default now(),
    "community_id" uuid
      );



  create table "public"."profiles" (
    "id" uuid not null,
    "email" text not null,
    "display_name" text,
    "role" text default 'student'::text,
    "privacy_acknowledged" boolean default false,
    "created_at" timestamp without time zone default now()
      );



  create table "public"."reactions" (
    "id" uuid not null default gen_random_uuid(),
    "post_id" uuid,
    "user_id" uuid,
    "type" text,
    "created_at" timestamp without time zone default now()
      );



  create table "public"."recent_activity" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "community_id" uuid,
    "visited_at" timestamp without time zone default now()
      );



  create table "public"."reports" (
    "id" uuid not null default gen_random_uuid(),
    "post_id" uuid,
    "reporter_id" uuid,
    "reason" text,
    "created_at" timestamp without time zone default now()
      );



  create table "public"."resources" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "content" text,
    "category" text,
    "created_at" timestamp without time zone default now()
      );



  create table "public"."search_history" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "query" text not null,
    "searched_at" timestamp without time zone default now()
      );


CREATE UNIQUE INDEX comments_pkey ON public.comments USING btree (id);

CREATE UNIQUE INDEX communities_pkey ON public.communities USING btree (id);

CREATE UNIQUE INDEX direct_messages_pkey ON public.direct_messages USING btree (id);

CREATE UNIQUE INDEX habit_logs_pkey ON public.habit_logs USING btree (id);

CREATE UNIQUE INDEX habits_pkey ON public.habits USING btree (id);

CREATE UNIQUE INDEX journals_pkey ON public.mood_journal USING btree (id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX posts_pkey ON public.posts USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX reactions_pkey ON public.reactions USING btree (id);

CREATE UNIQUE INDEX reactions_post_id_user_id_key ON public.reactions USING btree (post_id, user_id);

CREATE UNIQUE INDEX recent_activity_pkey ON public.recent_activity USING btree (id);

CREATE UNIQUE INDEX reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX resources_pkey ON public.resources USING btree (id);

CREATE UNIQUE INDEX search_history_pkey ON public.search_history USING btree (id);

alter table "public"."comments" add constraint "comments_pkey" PRIMARY KEY using index "comments_pkey";

alter table "public"."communities" add constraint "communities_pkey" PRIMARY KEY using index "communities_pkey";

alter table "public"."direct_messages" add constraint "direct_messages_pkey" PRIMARY KEY using index "direct_messages_pkey";

alter table "public"."habit_logs" add constraint "habit_logs_pkey" PRIMARY KEY using index "habit_logs_pkey";

alter table "public"."habits" add constraint "habits_pkey" PRIMARY KEY using index "habits_pkey";

alter table "public"."mood_journal" add constraint "journals_pkey" PRIMARY KEY using index "journals_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."posts" add constraint "posts_pkey" PRIMARY KEY using index "posts_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."reactions" add constraint "reactions_pkey" PRIMARY KEY using index "reactions_pkey";

alter table "public"."recent_activity" add constraint "recent_activity_pkey" PRIMARY KEY using index "recent_activity_pkey";

alter table "public"."reports" add constraint "reports_pkey" PRIMARY KEY using index "reports_pkey";

alter table "public"."resources" add constraint "resources_pkey" PRIMARY KEY using index "resources_pkey";

alter table "public"."search_history" add constraint "search_history_pkey" PRIMARY KEY using index "search_history_pkey";

alter table "public"."comments" add constraint "comments_post_id_fkey" FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_post_id_fkey";

alter table "public"."comments" add constraint "comments_user_id_fkey" FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_user_id_fkey";

alter table "public"."communities" add constraint "communities_category_check" CHECK ((category = ANY (ARRAY['program_discussion'::text, 'shared_interest'::text]))) not valid;

alter table "public"."communities" validate constraint "communities_category_check";

alter table "public"."communities" add constraint "communities_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."communities" validate constraint "communities_created_by_fkey";

alter table "public"."direct_messages" add constraint "direct_messages_receiver_id_fkey" FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."direct_messages" validate constraint "direct_messages_receiver_id_fkey";

alter table "public"."direct_messages" add constraint "direct_messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."direct_messages" validate constraint "direct_messages_sender_id_fkey";

alter table "public"."habit_logs" add constraint "habit_logs_habit_id_fkey" FOREIGN KEY (habit_id) REFERENCES public.habits(id) ON DELETE CASCADE not valid;

alter table "public"."habit_logs" validate constraint "habit_logs_habit_id_fkey";

alter table "public"."habit_logs" add constraint "habit_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."habit_logs" validate constraint "habit_logs_user_id_fkey";

alter table "public"."habits" add constraint "habits_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."habits" validate constraint "habits_user_id_fkey";

alter table "public"."mood_journal" add constraint "journals_mood_rating_check" CHECK (((mood_rating >= 1) AND (mood_rating <= 5))) not valid;

alter table "public"."mood_journal" validate constraint "journals_mood_rating_check";

alter table "public"."mood_journal" add constraint "journals_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."mood_journal" validate constraint "journals_user_id_fkey";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."posts" add constraint "posts_community_id_fkey" FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE SET NULL not valid;

alter table "public"."posts" validate constraint "posts_community_id_fkey";

alter table "public"."posts" add constraint "posts_user_id_fkey" FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."posts" validate constraint "posts_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_role_check" CHECK ((role = ANY (ARRAY['student'::text, 'admin'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_role_check";

alter table "public"."reactions" add constraint "reactions_post_id_fkey" FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE not valid;

alter table "public"."reactions" validate constraint "reactions_post_id_fkey";

alter table "public"."reactions" add constraint "reactions_post_id_user_id_key" UNIQUE using index "reactions_post_id_user_id_key";

alter table "public"."reactions" add constraint "reactions_type_check" CHECK ((type = ANY (ARRAY['upvote'::text, 'downvote'::text]))) not valid;

alter table "public"."reactions" validate constraint "reactions_type_check";

alter table "public"."reactions" add constraint "reactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."reactions" validate constraint "reactions_user_id_fkey";

alter table "public"."recent_activity" add constraint "recent_activity_community_id_fkey" FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE not valid;

alter table "public"."recent_activity" validate constraint "recent_activity_community_id_fkey";

alter table "public"."recent_activity" add constraint "recent_activity_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."recent_activity" validate constraint "recent_activity_user_id_fkey";

alter table "public"."reports" add constraint "reports_post_id_fkey" FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_post_id_fkey";

alter table "public"."reports" add constraint "reports_reporter_id_fkey" FOREIGN KEY (reporter_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_reporter_id_fkey";

alter table "public"."search_history" add constraint "search_history_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."search_history" validate constraint "search_history_user_id_fkey";

grant delete on table "public"."comments" to "anon";

grant insert on table "public"."comments" to "anon";

grant references on table "public"."comments" to "anon";

grant select on table "public"."comments" to "anon";

grant trigger on table "public"."comments" to "anon";

grant truncate on table "public"."comments" to "anon";

grant update on table "public"."comments" to "anon";

grant delete on table "public"."comments" to "authenticated";

grant insert on table "public"."comments" to "authenticated";

grant references on table "public"."comments" to "authenticated";

grant select on table "public"."comments" to "authenticated";

grant trigger on table "public"."comments" to "authenticated";

grant truncate on table "public"."comments" to "authenticated";

grant update on table "public"."comments" to "authenticated";

grant delete on table "public"."comments" to "service_role";

grant insert on table "public"."comments" to "service_role";

grant references on table "public"."comments" to "service_role";

grant select on table "public"."comments" to "service_role";

grant trigger on table "public"."comments" to "service_role";

grant truncate on table "public"."comments" to "service_role";

grant update on table "public"."comments" to "service_role";

grant delete on table "public"."communities" to "anon";

grant insert on table "public"."communities" to "anon";

grant references on table "public"."communities" to "anon";

grant select on table "public"."communities" to "anon";

grant trigger on table "public"."communities" to "anon";

grant truncate on table "public"."communities" to "anon";

grant update on table "public"."communities" to "anon";

grant delete on table "public"."communities" to "authenticated";

grant insert on table "public"."communities" to "authenticated";

grant references on table "public"."communities" to "authenticated";

grant select on table "public"."communities" to "authenticated";

grant trigger on table "public"."communities" to "authenticated";

grant truncate on table "public"."communities" to "authenticated";

grant update on table "public"."communities" to "authenticated";

grant delete on table "public"."communities" to "service_role";

grant insert on table "public"."communities" to "service_role";

grant references on table "public"."communities" to "service_role";

grant select on table "public"."communities" to "service_role";

grant trigger on table "public"."communities" to "service_role";

grant truncate on table "public"."communities" to "service_role";

grant update on table "public"."communities" to "service_role";

grant delete on table "public"."direct_messages" to "anon";

grant insert on table "public"."direct_messages" to "anon";

grant references on table "public"."direct_messages" to "anon";

grant select on table "public"."direct_messages" to "anon";

grant trigger on table "public"."direct_messages" to "anon";

grant truncate on table "public"."direct_messages" to "anon";

grant update on table "public"."direct_messages" to "anon";

grant delete on table "public"."direct_messages" to "authenticated";

grant insert on table "public"."direct_messages" to "authenticated";

grant references on table "public"."direct_messages" to "authenticated";

grant select on table "public"."direct_messages" to "authenticated";

grant trigger on table "public"."direct_messages" to "authenticated";

grant truncate on table "public"."direct_messages" to "authenticated";

grant update on table "public"."direct_messages" to "authenticated";

grant delete on table "public"."direct_messages" to "service_role";

grant insert on table "public"."direct_messages" to "service_role";

grant references on table "public"."direct_messages" to "service_role";

grant select on table "public"."direct_messages" to "service_role";

grant trigger on table "public"."direct_messages" to "service_role";

grant truncate on table "public"."direct_messages" to "service_role";

grant update on table "public"."direct_messages" to "service_role";

grant delete on table "public"."habit_logs" to "anon";

grant insert on table "public"."habit_logs" to "anon";

grant references on table "public"."habit_logs" to "anon";

grant select on table "public"."habit_logs" to "anon";

grant trigger on table "public"."habit_logs" to "anon";

grant truncate on table "public"."habit_logs" to "anon";

grant update on table "public"."habit_logs" to "anon";

grant delete on table "public"."habit_logs" to "authenticated";

grant insert on table "public"."habit_logs" to "authenticated";

grant references on table "public"."habit_logs" to "authenticated";

grant select on table "public"."habit_logs" to "authenticated";

grant trigger on table "public"."habit_logs" to "authenticated";

grant truncate on table "public"."habit_logs" to "authenticated";

grant update on table "public"."habit_logs" to "authenticated";

grant delete on table "public"."habit_logs" to "service_role";

grant insert on table "public"."habit_logs" to "service_role";

grant references on table "public"."habit_logs" to "service_role";

grant select on table "public"."habit_logs" to "service_role";

grant trigger on table "public"."habit_logs" to "service_role";

grant truncate on table "public"."habit_logs" to "service_role";

grant update on table "public"."habit_logs" to "service_role";

grant delete on table "public"."habits" to "anon";

grant insert on table "public"."habits" to "anon";

grant references on table "public"."habits" to "anon";

grant select on table "public"."habits" to "anon";

grant trigger on table "public"."habits" to "anon";

grant truncate on table "public"."habits" to "anon";

grant update on table "public"."habits" to "anon";

grant delete on table "public"."habits" to "authenticated";

grant insert on table "public"."habits" to "authenticated";

grant references on table "public"."habits" to "authenticated";

grant select on table "public"."habits" to "authenticated";

grant trigger on table "public"."habits" to "authenticated";

grant truncate on table "public"."habits" to "authenticated";

grant update on table "public"."habits" to "authenticated";

grant delete on table "public"."habits" to "service_role";

grant insert on table "public"."habits" to "service_role";

grant references on table "public"."habits" to "service_role";

grant select on table "public"."habits" to "service_role";

grant trigger on table "public"."habits" to "service_role";

grant truncate on table "public"."habits" to "service_role";

grant update on table "public"."habits" to "service_role";

grant delete on table "public"."mood_journal" to "anon";

grant insert on table "public"."mood_journal" to "anon";

grant references on table "public"."mood_journal" to "anon";

grant select on table "public"."mood_journal" to "anon";

grant trigger on table "public"."mood_journal" to "anon";

grant truncate on table "public"."mood_journal" to "anon";

grant update on table "public"."mood_journal" to "anon";

grant delete on table "public"."mood_journal" to "authenticated";

grant insert on table "public"."mood_journal" to "authenticated";

grant references on table "public"."mood_journal" to "authenticated";

grant select on table "public"."mood_journal" to "authenticated";

grant trigger on table "public"."mood_journal" to "authenticated";

grant truncate on table "public"."mood_journal" to "authenticated";

grant update on table "public"."mood_journal" to "authenticated";

grant delete on table "public"."mood_journal" to "service_role";

grant insert on table "public"."mood_journal" to "service_role";

grant references on table "public"."mood_journal" to "service_role";

grant select on table "public"."mood_journal" to "service_role";

grant trigger on table "public"."mood_journal" to "service_role";

grant truncate on table "public"."mood_journal" to "service_role";

grant update on table "public"."mood_journal" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."posts" to "anon";

grant insert on table "public"."posts" to "anon";

grant references on table "public"."posts" to "anon";

grant select on table "public"."posts" to "anon";

grant trigger on table "public"."posts" to "anon";

grant truncate on table "public"."posts" to "anon";

grant update on table "public"."posts" to "anon";

grant delete on table "public"."posts" to "authenticated";

grant insert on table "public"."posts" to "authenticated";

grant references on table "public"."posts" to "authenticated";

grant select on table "public"."posts" to "authenticated";

grant trigger on table "public"."posts" to "authenticated";

grant truncate on table "public"."posts" to "authenticated";

grant update on table "public"."posts" to "authenticated";

grant delete on table "public"."posts" to "service_role";

grant insert on table "public"."posts" to "service_role";

grant references on table "public"."posts" to "service_role";

grant select on table "public"."posts" to "service_role";

grant trigger on table "public"."posts" to "service_role";

grant truncate on table "public"."posts" to "service_role";

grant update on table "public"."posts" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."reactions" to "anon";

grant insert on table "public"."reactions" to "anon";

grant references on table "public"."reactions" to "anon";

grant select on table "public"."reactions" to "anon";

grant trigger on table "public"."reactions" to "anon";

grant truncate on table "public"."reactions" to "anon";

grant update on table "public"."reactions" to "anon";

grant delete on table "public"."reactions" to "authenticated";

grant insert on table "public"."reactions" to "authenticated";

grant references on table "public"."reactions" to "authenticated";

grant select on table "public"."reactions" to "authenticated";

grant trigger on table "public"."reactions" to "authenticated";

grant truncate on table "public"."reactions" to "authenticated";

grant update on table "public"."reactions" to "authenticated";

grant delete on table "public"."reactions" to "service_role";

grant insert on table "public"."reactions" to "service_role";

grant references on table "public"."reactions" to "service_role";

grant select on table "public"."reactions" to "service_role";

grant trigger on table "public"."reactions" to "service_role";

grant truncate on table "public"."reactions" to "service_role";

grant update on table "public"."reactions" to "service_role";

grant delete on table "public"."recent_activity" to "anon";

grant insert on table "public"."recent_activity" to "anon";

grant references on table "public"."recent_activity" to "anon";

grant select on table "public"."recent_activity" to "anon";

grant trigger on table "public"."recent_activity" to "anon";

grant truncate on table "public"."recent_activity" to "anon";

grant update on table "public"."recent_activity" to "anon";

grant delete on table "public"."recent_activity" to "authenticated";

grant insert on table "public"."recent_activity" to "authenticated";

grant references on table "public"."recent_activity" to "authenticated";

grant select on table "public"."recent_activity" to "authenticated";

grant trigger on table "public"."recent_activity" to "authenticated";

grant truncate on table "public"."recent_activity" to "authenticated";

grant update on table "public"."recent_activity" to "authenticated";

grant delete on table "public"."recent_activity" to "service_role";

grant insert on table "public"."recent_activity" to "service_role";

grant references on table "public"."recent_activity" to "service_role";

grant select on table "public"."recent_activity" to "service_role";

grant trigger on table "public"."recent_activity" to "service_role";

grant truncate on table "public"."recent_activity" to "service_role";

grant update on table "public"."recent_activity" to "service_role";

grant delete on table "public"."reports" to "anon";

grant insert on table "public"."reports" to "anon";

grant references on table "public"."reports" to "anon";

grant select on table "public"."reports" to "anon";

grant trigger on table "public"."reports" to "anon";

grant truncate on table "public"."reports" to "anon";

grant update on table "public"."reports" to "anon";

grant delete on table "public"."reports" to "authenticated";

grant insert on table "public"."reports" to "authenticated";

grant references on table "public"."reports" to "authenticated";

grant select on table "public"."reports" to "authenticated";

grant trigger on table "public"."reports" to "authenticated";

grant truncate on table "public"."reports" to "authenticated";

grant update on table "public"."reports" to "authenticated";

grant delete on table "public"."reports" to "service_role";

grant insert on table "public"."reports" to "service_role";

grant references on table "public"."reports" to "service_role";

grant select on table "public"."reports" to "service_role";

grant trigger on table "public"."reports" to "service_role";

grant truncate on table "public"."reports" to "service_role";

grant update on table "public"."reports" to "service_role";

grant delete on table "public"."resources" to "anon";

grant insert on table "public"."resources" to "anon";

grant references on table "public"."resources" to "anon";

grant select on table "public"."resources" to "anon";

grant trigger on table "public"."resources" to "anon";

grant truncate on table "public"."resources" to "anon";

grant update on table "public"."resources" to "anon";

grant delete on table "public"."resources" to "authenticated";

grant insert on table "public"."resources" to "authenticated";

grant references on table "public"."resources" to "authenticated";

grant select on table "public"."resources" to "authenticated";

grant trigger on table "public"."resources" to "authenticated";

grant truncate on table "public"."resources" to "authenticated";

grant update on table "public"."resources" to "authenticated";

grant delete on table "public"."resources" to "service_role";

grant insert on table "public"."resources" to "service_role";

grant references on table "public"."resources" to "service_role";

grant select on table "public"."resources" to "service_role";

grant trigger on table "public"."resources" to "service_role";

grant truncate on table "public"."resources" to "service_role";

grant update on table "public"."resources" to "service_role";

grant delete on table "public"."search_history" to "anon";

grant insert on table "public"."search_history" to "anon";

grant references on table "public"."search_history" to "anon";

grant select on table "public"."search_history" to "anon";

grant trigger on table "public"."search_history" to "anon";

grant truncate on table "public"."search_history" to "anon";

grant update on table "public"."search_history" to "anon";

grant delete on table "public"."search_history" to "authenticated";

grant insert on table "public"."search_history" to "authenticated";

grant references on table "public"."search_history" to "authenticated";

grant select on table "public"."search_history" to "authenticated";

grant trigger on table "public"."search_history" to "authenticated";

grant truncate on table "public"."search_history" to "authenticated";

grant update on table "public"."search_history" to "authenticated";

grant delete on table "public"."search_history" to "service_role";

grant insert on table "public"."search_history" to "service_role";

grant references on table "public"."search_history" to "service_role";

grant select on table "public"."search_history" to "service_role";

grant trigger on table "public"."search_history" to "service_role";

grant truncate on table "public"."search_history" to "service_role";

grant update on table "public"."search_history" to "service_role";


  create policy "Admins can delete habits"
  on "public"."habits"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Admins can insert habits"
  on "public"."habits"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Users can read habits"
  on "public"."habits"
  as permissive
  for select
  to public
using ((auth.role() = 'authenticated'::text));



