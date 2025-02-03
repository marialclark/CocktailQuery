const db = require('../db');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config');
const ExpressError = require('../helpers/expressError');

/**
 * User class - interface for interacting with the "users" table
 */
class User {
	/**
	 * register method - adds a new user to the database
	 *  Accepts:
	 *    - username: the unique username for the user
	 *    - password: the plain text password to be hashed
	 *    - first_name, last_name, email: additional user details
	 *
	 *  Returns:
	 *    - An object containing user's id, username, first_name, last_name, and email
	 *    - Throw an ExpressError is the username or email already exists
	 */
	static async register({ username, password, first_name, last_name, email }) {
		const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
		try {
			const result = await db.query(
				`INSERT INTO users (username, password, first_name, last_name, email)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, username, first_name, last_name, email`,
				[username, hashedPassword, first_name, last_name, email]
			);
			return result.rows[0];
		} catch (err) {
			if (err.code === '23505') {
				// Unique constraint violation
				throw new ExpressError('Username or email already exists', 400);
			}
			throw err;
		}
	}

	/**
	 * authentication method - verifies user credentials
	 *  Accepts:
	 *    - username: the username provided by the user
	 *    - password: the plain text password to verify
	 *
	 *  Returns:
	 *    - An object containing the user's id, username, first_name,
	 *      last_name, and email if authenticated
	 *    - Throws an ExpressError if authentication fails
	 */
	static async authenticate(username, password) {
		const result = await db.query(
			`
      SELECT 
        id, 
        username, 
        password,
        first_name,
        last_name,
        email
      FROM users WHERE username = $1`,
			[username]
		);

		const user = result.rows[0];
		if (user) {
			const isValid = await bcrypt.compare(password, user.password);
			if (isValid) {
				delete user.password; // Remove sensitive data before returning
				return user;
			}
		}
		throw new ExpressError('Invalid username/password', 401);
	}

	/**
	 * getAll method - fetches all users
	 *  Returns:
	 *    - An array of objects containing user details (id, username, first_name, last_name, email)
	 */
	static async getAll() {
		const result = await db.query(
			`SELECT id, username, first_name, last_name, email FROM users`
		);
		return result.rows;
	}

	/**
	 * getById method - fetches user details by ID
	 *  Accepts:
	 *    - id: the unique identifier for the user
	 *
	 *  Returns:
	 *   - An object containing the user's id, username, first_name,
	 *     last_name, and email, or throws an ExpressError if not found
	 */
	static async getById(id) {
		const result = await db.query(
			`
      SELECT 
        id, 
        username, 
        first_name,
        last_name,
        email
        FROM users WHERE id = $1`,
			[id]
		);
		if (!result.rows[0]) {
			throw new ExpressError('User not found', 404);
		}
		return result.rows[0];
	}

	/**
	 * getByUsername method - fetches user details by username
	 * 	Accepts:
	 *   - username: the unique username for the user
	 *
	 * 	Returns:
	 *   - An object containing the user's id, username, first_name,
	 *     last_name, and email, or throws an ExpressError if not found
	 */
	static async getByUsername(username) {
		const result = await db.query(
			`
		SELECT 
			id, 
			username, 
			first_name,
			last_name,
			email
		FROM users WHERE username = $1`,
			[username]
		);
		if (!result.rows[0]) {
			throw new ExpressError('User not found', 404);
		}
		return result.rows[0];
	}

	/**
	 * update method - updates user details by username
	 * 	Accepts:
	 *   - username: the unique username of the user to update
	 *   - data: an object containing the fields to update (e.g., { first_name, last_name, email })
	 *
	 * 	Returns:
	 *   - An object containing the updated user's details
	 */
	static async update(username, data) {
		const keys = Object.keys(data);
		if (keys.length === 0) {
			throw new ExpressError('No data to update', 400);
		}

		const userExists = await db.query(
			`SELECT 1 FROM users WHERE username = $1`,
			[username]
		);
		if (!userExists.rows.length) throw new ExpressError('User not found', 404);

		// Build the SET clause dynamically
		const cols = keys
			.map((colName, idx) => `${colName}=$${idx + 1}`)
			.join(', ');

		const values = Object.values(data);

		const result = await db.query(
			`
				UPDATE users
				SET ${cols}
				WHERE username = $${keys.length + 1}
				RETURNING id, username, first_name, last_name, email`,
			[...values, username]
		);

		return result.rows[0];
	}

	/**
	 * delete method - deletes a user by ID
	 * 	Accepts:
	 *   - id: the unique identifier for the user
	 *
	 *	Returns:
	 *   - A message confirming deletion or throws an ExpressError if the user is not found
	 */
	static async delete(id) {
		const userExists = await db.query(`SELECT 1 FROM users WHERE id = $1`, [
			id,
		]);
		if (!userExists.rows.length) throw new ExpressError('User not found', 404);

		await db.query(`DELETE FROM users WHERE id = $1`, [id]);
		return { message: 'User deleted' };
	}
}

module.exports = User;
