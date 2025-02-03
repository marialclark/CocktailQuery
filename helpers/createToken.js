const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

/**
 * Generate and return a signed JWT for a user.
 * Accepts a user object with `username` and `id`.
 */
function createToken(user) {
	const payload = { username: user.username, id: user.id };
	return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
