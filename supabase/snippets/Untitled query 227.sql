INSERT INTO recent_activity (user_id, community_id)
VALUES (
  (SELECT id FROM profiles LIMIT 1),
  (SELECT id FROM communities LIMIT 1)
);