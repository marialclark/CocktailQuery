const db = require('../db');
const ExpressError = require('../helpers/expressError');
/**
 * Cocktail class - interface for interacting with the "cocktails" table
 */
class Cocktail {
	/**
	 * getAll method - retrieves cocktails based on search criteria with optional filters.
	 *
	 * Accepts an object with optional filters for the query:
	 *    - search: keyword-based search that matches against name, category, alcoholic status, and ingredients (case-insensitive, multi-word support)
	 *    - name: partial name search for autocomplete functionality (case-insensitive)
	 *    - category: filters by the cocktail's category
	 *    - alcoholic: filters by whether the cocktail contains alcohol
	 *    - ingredient: filters cocktails that contain a specific ingredient (case-insensitive match)
	 *
	 * Returns:
	 *    - An array of cocktails matching the search criteria and/or filters
	 *    - Throws an error if fetching fails
	 */

	static async getAll({ search, name, category, alcoholic, ingredient } = {}) {
		let query = `
			SELECT 
				id,
				cocktail_id,
				name,
				category,
				alcoholic,
				glass,
				instructions,
				ingredients,
				measurements,
				thumbnail
			FROM cocktails`;

		const conditions = [];
		const values = [];

		// Search by exact or partial cocktail name (for autocomplete dropdown)
		if (name) {
			conditions.push(
				`LOWER(name) ILIKE LOWER('%' || $${values.length + 1} || '%')`
			);
			values.push(name);
		}

		// General keyword-based search (Full search case)
		if (search) {
			const keywords = search.toLowerCase().split(/\s+/); // Split search string into words
			const searchConditions = keywords.map(
				(_, idx) => `
				(LOWER(name) ILIKE LOWER('%' || $${values.length + idx + 1} || '%') 
				OR LOWER(category) ILIKE LOWER('%' || $${values.length + idx + 1} || '%')
				OR LOWER(alcoholic) ILIKE LOWER('%' || $${values.length + idx + 1} || '%')
				OR LOWER(ingredients::text) ILIKE LOWER('%' || $${
					values.length + idx + 1
				} || '%'))`
			);

			conditions.push(`(${searchConditions.join(' AND ')})`);
			values.push(...keywords);
		}

		if (category) {
			conditions.push(`category = $${values.length + 1}`);
			values.push(category);
		}

		if (alcoholic) {
			conditions.push(`alcoholic = $${values.length + 1}`);
			values.push(alcoholic);
		}

		if (ingredient) {
			conditions.push(
				`LOWER(ingredients::text) LIKE LOWER('%' || $${
					values.length + 1
				} || '%')`
			);
			values.push(ingredient);
		}

		if (conditions.length > 0) {
			query += ` WHERE ${conditions.join(' AND ')}`;
		}

		try {
			const result = await db.query(query, values);
			return result.rows;
		} catch (err) {
			throw new ExpressError('Error fetching cocktails', 500);
		}
	}

	/**
	 * getById method - finds a cocktail by its unique ID
	 *  Accepts:
	 *   - cocktailId: the unique identifier for the cocktail
	 *
	 *  Returns:
	 *   - An object containing the cocktail data or null if not found
	 *   - Throws error if the cocktail is not found
	 */
	static async getById(cocktailId) {
		const result = await db.query(
			`
      SELECT
        id,
        cocktail_id,
        name,
        category,
        alcoholic,
        glass,
        instructions,
        ingredients,
        measurements,
        thumbnail
      FROM cocktails WHERE cocktail_id = $1`,
			[cocktailId]
		);
		const cocktail = result.rows[0];
		if (!cocktail) {
			throw new ExpressError('Cocktail not found', 404);
		}
		return cocktail;
	}
}

module.exports = Cocktail;
