const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const { ensureCorrectUser } = require('../middleware/auth');
const ExpressError = require('../helpers/expressError');

/** GET /:username - Get details about a user
 *  Only the user themselves can access this route.
 *
 *   Returns:
 * 		- { user: { username, first_name, last_name, email } }
 */
router.get('/:username', ensureCorrectUser, async (req, res, next) => {
	try {
		const user = await User.getByUsername(req.params.username);
		return res.json({ user });
	} catch (err) {
		return next(err);
	}
});

/** PATCH /:username - Update user details
 *  Only the user themselves can access this route.
 *
 * 	 Accepts:
 * 		- { first_name, last_name, email }
 *
 * 	 Returns:
 * 		- { user: { username, first_name, last_name, email } }
 */
router.patch('/:username', ensureCorrectUser, async (req, res, next) => {
	try {
		const { first_name, last_name, email } = req.body;

		// Ensure at least one field is provided for update
		if (!first_name && !last_name && !email) {
			throw new ExpressError('At least one field is required to update', 400);
		}

		// Pass validated data to the model
		const user = await User.update(req.params.username, {
			first_name,
			last_name,
			email,
		});
		return res.json({ user });
	} catch (err) {
		return next(err);
	}
});

/** DELETE /:username - Delete a user
 *  Only the user themselves can access this route.
 *
 * 	Uses the authenticated user's ID instead of req.params.username
 *  to ensure deletion is accurate and secure.
 *
 *   Returns:
 * 		- { message: "User deleted" }
 */
router.delete('/:username', ensureCorrectUser, async (req, res, next) => {
	try {
		await User.delete(req.user.id);
		return res.json({ message: 'User deleted' });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
