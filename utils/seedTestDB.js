const db = require('../db');
const fs = require('fs');

/**
 * Seed the test database with predefined data.
 * Ensures that each test run starts with a clean database state.
 */
const seedTestDB = async () => {
	try {
		await db.query('BEGIN'); // Start transaction
		const seedSQL = fs.readFileSync('cocktailquery-seed.sql', 'utf-8');

		// Clear all tables and reset identity sequences to maintain consistency across test runs
		await db.query(
			'TRUNCATE favorites, users, cocktails RESTART IDENTITY CASCADE;'
		);

		await db.query(seedSQL);
		await db.query('COMMIT'); // Commit transaction
	} catch (err) {
		await db.query('ROLLBACK'); // Rollback transaction on error
		throw err;
	}
};

module.exports = seedTestDB;
