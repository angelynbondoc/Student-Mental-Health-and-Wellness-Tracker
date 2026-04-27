ALTER TABLE reactions
ADD CONSTRAINT unique_post_user_reaction UNIQUE (post_id, user_id);