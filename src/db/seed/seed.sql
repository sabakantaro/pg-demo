INSERT INTO projects (name, description) 
VALUES
  ('project1', 'It is about project1'),
  ('project2', 'It is about project2'),
  ('project3', 'It is about project3'),
  ('project4', 'It is about project4'),
  ('project5', 'It is about project5');


INSERT INTO tasks (project_id, name, description, start_date, end_date) 
VALUES
  (1,'Task1', 'It is about Task1', NOW(), NULL),
  (2,'Task2', 'It is about Task2', NOW(), NULL),
  (2,'Task3', 'It is about Task3', NULL, NULL),
  (1,'Task4', 'It is about Task4', NULL, NULL),
  (3,'Task5', 'It is about Task5', NOW(), NULL);