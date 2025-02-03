Capstone Project: CocktailQuery
===============================

Deployed URL
------------
[CocktailQuery](https://cocktailquery-1c6d0c33adcf.herokuapp.com/)

API Link
--------

[The Cocktail DB API](https://www.thecocktaildb.com/api.php)

Project Overview
----------------

Cocktail Query is a cocktail recipe search engine that lets users search for drinks by name, category, alcohol content, and ingredients. Users can view detailed cocktail pages with all necessary information needed to make the cocktail, as well as log in to interact with the app by favoriting recipes. The app bridges the gap between cocktail creators and consumers, making it easier for bartenders, restaurant staff, and home enthusiasts to share and discover cocktail recipes.

Features
--------

-   **Search Cocktails:** Find recipes by name or ingredient.
-   **Cocktail Details:** View cocktail recipes with instructions, ingredients, measurements, and images.
-   **User Accounts:** Register, log in, update account info, and delete accounts.
-   **Favorites:** Mark cocktails as favorites and manage your favorites list.
-   **Responsive Design:** Fully responsive website built with Bootstrap.
-   **API Integration:** Data is fetched from [The Cocktail DB API](https://www.thecocktaildb.com/api.php).

Tech Stack
----------

-   **Backend:** Node.js, Express, PostgreSQL
-   **Frontend:** Vanilla JavaScript, HTML, CSS, Bootstrap
-   **Testing:** Jest, Supertest

Run Tests With
--------------

```
npx jest --runInBand

```

Installation
------------

### 1\. Clone the Repository:

```
git clone <repository-url>
cd cocktailquery

```

### 2\. Install Dependencies:

```
npm install

```

### 3\. Set Up Environment Variables (Optional):

By default, the application will use a development configuration. To customize settings, create a `.env` file in the root directory:

```
SECRET_KEY=your_secret_key
DATABASE_URL=your_database_url
PORT=5000
DATABASE_TEST_URL=postgresql:///cocktailquery_test

```

If no `.env` file is present, the app will fall back to default values.

### 4\. Database Setup:

-   Create your PostgreSQL databases (`cocktailquery` and `cocktailquery_test`).
-   Run the schema and seed files:

```
psql cocktailquery < cocktailquery-schema.sql
psql cocktailquery < cocktailquery-seed.sql

```

The test database is configured in `config.js`.

### 5\. Seeding the Database

To avoid making repeated external API calls and improve app performance, the `fetchAndSeed.js` script populates the `cocktails` table with data from [The Cocktail DB API](https://www.thecocktaildb.com/api.php). This allows the application to quickly retrieve cocktail data from the local database.

Run the following command to fetch and seed cocktail data into your local PostgreSQL database:

```
node fetchAndSeed.js

```

-   The app will then be able to query cocktail data efficiently without relying on live API calls.
-   If an error occurs, the script will log the error and exit the process.

Once seeding is complete, you can start the server and use the app with pre-populated cocktail data.

### 6\. Running the Application

Start the server in development mode:

```
npm run dev

```

The server will run on the port specified in your `.env` file (default is `5000`).


Contact
-------
For questions or feedback, please contact [marialclarktech@gmail.com].