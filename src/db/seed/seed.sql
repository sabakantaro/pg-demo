INSERT INTO users (email)
VALUES
  ('user1@gmail.com'),
  ('user2@gmail.com'),
  ('user3@gmail.com'),
  ('user4@gmail.com'),
  ('user5@gmail.com');


INSERT INTO urls (user_id, url, created_at)
VALUES
  (1, 'https://translate.google.com', NOW()),
  (2, 'https://translate.google.com', NOW()),
  (2, 'https://translate.google.com', NOW()),
  (1, 'https://translate.google.com', NOW()),
  (3, 'https://translate.google.com', NOW());