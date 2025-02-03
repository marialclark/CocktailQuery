const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const ExpressError = require('../helpers/expressError');
const User = require('../models/user');

/** Authenticate user token, if provided. */
function authenticateJWT(req, res, next) {
	try {
		const token = req.headers.authorization?.replace('Bearer ', '');

		if (token) {
			const payload = jwt.verify(token, SECRET_KEY);
			req.user = payload;
		}
		return next();
	} catch (err) {
		return next();
	}
}

/** Ensure the correct user is accessing a route. */
async function ensureCorrectUser(req, res, next) {
	try {
		if (!req.user || req.user.username !== req.params.username) {
			throw new ExpressError('Unauthorized', 401);
		}

		// Fetch user from DB to attach their ID to req.user
		const user = await User.getByUsername(req.user.username);
		req.user.id = user.id;

		return next();
	} catch (err) {
		return next(err);
	}
}

/** Ensure the user is logged in to perform action. */
function requireLogin(req, res, next) {
	try {
		if (!req.user) {
			throw new ExpressError('Unauthorized', 401);
		}
		return next();
	} catch (err) {
		return next(err);
	}
}

module.exports = {
	authenticateJWT,
	ensureCorrectUser,
	requireLogin,
};
