const Router = require('express').Router;
const router = new Router();
const { createToken } = require('../helpers/createToken');
const ExpressError = require('../helpers/expressError');
const User = require('../models/user');

/**
 * POST /login - Authenticates a user and returns a JWT token.
 *  Accepts:
 * 		- { username, password }
 *  Returns:
 * 		- { token }
 */
router.post('/login', async (req, res, next) => {
	try {
		const { username, password } = req.body;
		if (!username || !password) {
			throw new ExpressError('Username and password required', 400);
		}
		const user = await User.authenticate(username, password);

		if (user) {
			const token = createToken({ username: user.username, id: user.id });
			return res.json({ token });
		}

		throw new ExpressError('Invalid username/password', 401);
	} catch (err) {
		return next(err);
	}
});

/**
 * POST /register - Registers a new user and returns a JWT token.
 *  Accepts:
 * 		- { username, password, first_name, last_name, email }
 *  Returns:
 * 		- { token }
 */
router.post('/register', async (req, res, next) => {
	try {
		const { username, password, first_name, last_name, email } = req.body;
		if (!username || !password || !first_name || !last_name || !email) {
			throw new ExpressError('All fields are required', 400);
		}
		const user = await User.register({
			username,
			password,
			first_name,
			last_name,
			email,
		});

		const token = createToken({ username: user.username, id: user.id });
		return res.status(201).json({ token });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
