const axios = require('axios');
const db = require('./db');

const COCKTAIL_DB_BASE_URL = 'https://www.thecocktaildb.com/api/json/v1/1';

/** Fetch and seed cocktail data into the database */
async function fetchAndSeedCocktails() {
	try {
		const alphabet = 'abcdefghijklmnopqrstuvwxyz';

		for (let char of alphabet) {
			const { data } = await axios.get(
				`${COCKTAIL_DB_BASE_URL}/search.php?f=${char}`
			);

			if (data.drinks) {
				for (let drink of data.drinks) {
					await db.query(
						`INSERT INTO cocktails (
              cocktail_id, name, category, alcoholic, glass, instructions, ingredients, measurements, thumbnail
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (cocktail_id) DO NOTHING`,
						[
							drink.idDrink,
							drink.strDrink,
							drink.strCategory,
							drink.strAlcoholic,
							drink.strGlass,
							drink.strInstructions,
							JSON.stringify(extractFields(drink, 'strIngredient')),
							JSON.stringify(extractFields(drink, 'strMeasure')),
							drink.strDrinkThumb,
						]
					);
				}
			}
		}

		console.log('Cocktail data successfully seeded.');
	} catch (err) {
		console.error('Error fetching cocktail data:', err);
		process.exit(1); // Exit process on failure
	}
}

/** Extracts non-null ingredients or measurements from drink data */
function extractFields(drink, fieldPrefix) {
	return Array.from(
		{ length: 15 },
		(_, i) => drink[`${fieldPrefix}${i + 1}`]
	).filter(Boolean);
}

fetchAndSeedCocktails();
