const express = require('express');
const router = new express.Router();
const Favorite = require('../models/favorite');
const { requireLogin } = require('../middleware/auth');
const db = require('../db');
const ExpressError = require('../helpers/expressError');

/** POST /toggle - Toggle a cocktail as favorite or unfavorite
 *
 *   Accepts:
 *     - { cocktail_id }
 *
 *   Returns:
 *     - { favorite: true }  // If cocktail is now favorited
 *     - { favorite: false } // If cocktail is now unfavorited
 */
router.post('/toggle', requireLogin, async (req, res, next) => {
	try {
		const { cocktail_id } = req.body;
		const user_id = req.user.id;

		// Check if cocktail exists in the database
		const existingCocktail = await db.query(
			`SELECT 1 FROM cocktails WHERE cocktail_id = $1`,
			[cocktail_id]
		);
		if (existingCocktail.rows.length === 0) {
			throw new ExpressError('Cocktail not found in database', 404);
		}

		// Check if cocktail is already favorited
		const existingFavorite = await db.query(
			`SELECT id FROM favorites WHERE user_id = $1 AND cocktail_id = $2`,
			[user_id, cocktail_id]
		);

		if (existingFavorite.rows.length > 0) {
			// If already favorited, remove it
			await Favorite.delete(existingFavorite.rows[0].id);
			return res.json({ favorite: false });
		}

		// Otherwise, add to favorites
		await Favorite.add({ user_id, cocktail_id });
		return res.json({ favorite: true });
	} catch (err) {
		return next(err);
	}
});

/** GET / - Retrieve all favorites for the logged-in user
 *   Returns:
 *    - { favorites: [{ id, user_id, cocktail_id, name, category, thumbnail }, ...] }
 */
router.get('/', requireLogin, async (req, res, next) => {
	try {
		const user_id = req.user.id;
		const favorites = await Favorite.getAllByUser(user_id);
		return res.json({ favorites });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
