-- Cocktails Table
CREATE TABLE cocktails (
    id SERIAL PRIMARY KEY,
    cocktail_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    alcoholic VARCHAR(20),
    glass VARCHAR(100),
    instructions TEXT,
    ingredients JSONB,
    measurements JSONB,
    thumbnail VARCHAR(255)
);

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) UNIQUE NOT NULL,
    password VARCHAR(75) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(256) UNIQUE
);


-- Favorites Table
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cocktail_id VARCHAR(255) NOT NULL REFERENCES cocktails(cocktail_id) ON DELETE CASCADE,
    UNIQUE (user_id, cocktail_id)
);
