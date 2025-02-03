const express = require('express');
const router = new express.Router();
const Cocktail = require('../models/cocktail');
const ExpressError = require('../helpers/expressError');

/** GET / - Retrieve cocktails with optional filtering.
 *
 * 	 Accepts query parameters:
 *    - search (string): keyword-based search (matches name, category, alcoholic, or ingredients)
 *    - name (string): partial match for cocktail name (autocomplete only)
 *    - ingredient (string): filters by ingredient
 *    - category (string): filters by category
 *    - alcoholic (string): filters by alcoholic status
 *
 * 	 Returns:
 *    - { cocktails: [{ id, name, category, glass, instructions, image, ingredients, measurements }, ...] }
 */
router.get('/', async (req, res, next) => {
	try {
		const { search, name, ingredient, category, alcoholic } = req.query;

		const filters = { search, name, ingredient, category, alcoholic };

		const cocktails = await Cocktail.getAll(filters);
		return res.json({ cocktails });
	} catch (err) {
		return next(err);
	}
});

/** GET /:id - Retrieve details of a single cocktail by ID
 *  	Accepts:
 *     - id (string): cocktail ID
 *  	Returns:
 *   	 - { cocktail: { id, name, category, glass, instructions, image, ingredients: [{ name, measure }, ...] } }
 */
router.get('/:id', async (req, res, next) => {
	try {
		const cocktail = await Cocktail.getById(req.params.id);
		if (!cocktail) throw new ExpressError('Cocktail not found', 404);
		return res.json({ cocktail });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
