-- Inserts sample data for test DB
-- Sample Cocktails
INSERT INTO cocktails (cocktail_id, name, category, alcoholic, glass, instructions, ingredients, measurements, thumbnail)
VALUES ( 
  'c1', 
  'Margarita', 
  'Cocktail', 
  'Alcoholic', 
  'Cocktail glass', 
  'Shake and strain into a cocktail glass.', 
  '["Tequila", "Triple sec", "Lime juice"]', 
  '["2 oz", "1 oz", "1 oz"]', 
  'https://example.com/margarita.jpg'
  ),
  (
  'c2', 
  'Mojito', 
  'Cocktail', 
  'Alcoholic', 
  'Highball glass', 
  'Muddle mint leaves and lime, then add rum and soda.', 
  '["White rum", "Mint", "Lime", "Sugar", "Soda water"]', 
  '["2 oz", "10 leaves", "1", "2 tsp", "Fill"]', 
  'https://example.com/mojito.jpg'
  )
ON CONFLICT (cocktail_id) DO NOTHING;


-- Sample Users, both using the hashed version of the password "password".
INSERT INTO users (username, password, first_name, last_name, email)
VALUES ('testuser1',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User1',
        'testuser1@example.com'),
       ('testuser2',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User2',
        'testuser2@example.com')
ON CONFLICT (username) DO NOTHING;;


-- Sample Favorites
INSERT INTO favorites (user_id, cocktail_id)
VALUES
(1, 'c1'),
(1, 'c2'),
(2, 'c2')
ON CONFLICT (user_id, cocktail_id) DO NOTHING;
