INSERT INTO recent_activity (user_id, post_id)
VALUES (
    (SELECT id FROM profiles LIMIT 1),
    (SELECT id FROM posts LIMIT 1)
);