const db = require('../db');
const ExpressError = require('../helpers/expressError');

/**
 * Favorite class - interface for interacting with the "favorites" table
 */
class Favorite {
	/**
	 * add method - adds a new favorite to the database
	 *  Accepts:
	 *   - user_id: the ID of the user
	 *   - cocktail_id: the ID of the cocktail to be favorited
	 *
	 *  Returns:
	 *   - An object containing the new favorite's id, user_id, and cocktail_id
	 */
	static async add({ user_id, cocktail_id }) {
		if (!user_id) throw new ExpressError('user_id is required', 400);
		if (!cocktail_id) throw new ExpressError('cocktail_id is required', 400);

		try {
			const result = await db.query(
				`INSERT INTO favorites (user_id, cocktail_id)
					 VALUES ($1, $2)
					 RETURNING id, user_id, cocktail_id`,
				[user_id, cocktail_id]
			);
			return result.rows[0];
		} catch (err) {
			if (err.code === '23505') {
				// Handle duplicate key constraint violation
				throw new ExpressError(
					`Cocktail "${cocktail_id}" is already in user's favorites.`,
					400
				);
			}
			throw err;
		}
	}

	/**
	 * getAllByUser method - fetches all favorites for a specific user
	 * Accepts:
	 *   - user_id: the ID of the user
	 *
	 * Returns:
	 *   - An array of objects containing favorite details (id, user_id, cocktail_id)
	 */
	static async getAllByUser(user_id) {
		if (!user_id) {
			throw new ExpressError('user_id is required', 400);
		}
		const result = await db.query(
			`SELECT f.id, f.user_id, f.cocktail_id, c.name, c.category, c.thumbnail
         FROM favorites f
         JOIN cocktails c ON f.cocktail_id = c.cocktail_id
         WHERE f.user_id = $1`,
			[user_id]
		);
		return result.rows;
	}

	/**
	 * delete method - removes a favorite from the database
	 * Accepts:
	 *   - id: the ID of the favorite to delete
	 *
	 * Returns:
	 *   - A message confirming deletion
	 *   - Throws an ExpressError if the favorite is not found
	 */
	static async delete(id) {
		const result = await db.query(
			`DELETE FROM favorites WHERE id = $1 RETURNING id`,
			[id]
		);
		if (!result.rows[0]) {
			throw new ExpressError('Favorite not found', 404);
		}
		return { message: 'Favorite deleted' };
	}
}

module.exports = Favorite;
