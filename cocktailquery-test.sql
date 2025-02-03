\echo 'Delete and recreate cocktailquery_test db?'
\prompt 'Press Enter to continue or Control-C to cancel > ' foo

-- Safely drop the test database if it exists
DROP DATABASE cocktailquery_test;
CREATE DATABASE cocktailquery_test;
\connect cocktailquery_test

-- Load schema and seed data
\i cocktailquery-schema.sql
\i cocktailquery-seed.sql
