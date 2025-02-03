const request = require('supertest');
const app = require('../app');
const db = require('../db');
const seedTestDB = require('../utils/seedTestDB');
const { createToken } = require('../helpers/createToken');

let u1Token, u2Token;

beforeEach(async () => {
	await db.query('BEGIN');
	await seedTestDB();

	// Generate tokens for test users
	u1Token = createToken({ username: 'testuser1', id: 1 });
	u2Token = createToken({ username: 'testuser2', id: 2 });
});

afterEach(async () => {
	await db.query('ROLLBACK');
});

afterAll(async () => {
	await db.end();
});

/************************************** POST /api/favorites/toggle */
describe('POST /api/favorites/toggle', () => {
	test('adds a favorite when not already favorited', async () => {
		const response = await request(app)
			.post('/api/favorites/toggle')
			.set('Authorization', `Bearer ${u2Token}`)
			.send({ cocktail_id: 'c1' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({ favorite: true });

		// Verify the cocktail is now in favorites
		const favoritesRes = await db.query(
			`SELECT * FROM favorites WHERE user_id = 2 AND cocktail_id = 'c1'`
		);
		expect(favoritesRes.rows.length).toBe(1);
	});

	test('removes a favorite if already favorited', async () => {
		const response = await request(app)
			.post('/api/favorites/toggle')
			.set('Authorization', `Bearer ${u2Token}`)
			.send({ cocktail_id: 'c2' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({ favorite: false });

		// Verify the cocktail is no longer in favorites
		const favoritesRes = await db.query(
			`SELECT * FROM favorites WHERE user_id = 2 AND cocktail_id = 'c2'`
		);
		expect(favoritesRes.rows.length).toBe(0);
	});

	test('returns 404 if cocktail does not exist in the database', async () => {
		const response = await request(app)
			.post('/api/favorites/toggle')
			.set('Authorization', `Bearer ${u1Token}`)
			.send({ cocktail_id: 'nonexistent_id' });

		expect(response.statusCode).toBe(404);
		expect(response.body).toEqual({
			status: 404,
			message: 'Cocktail not found in database',
		});
	});

	test('returns 401 if user is not logged in', async () => {
		const response = await request(app)
			.post('/api/favorites/toggle')
			.send({ cocktail_id: 'c2' });

		expect(response.statusCode).toBe(401);
		expect(response.body).toEqual({ status: 401, message: 'Unauthorized' });
	});
});

/************************************** GET /api/favorites */
describe('GET /api/favorites', () => {
	test('retrieves all favorites for the logged-in user', async () => {
		const response = await request(app)
			.get('/api/favorites')
			.set('Authorization', `Bearer ${u2Token}`);

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			favorites: expect.arrayContaining([
				expect.objectContaining({
					id: 3,
					user_id: 2,
					cocktail_id: 'c2',
					name: 'Mojito',
					category: 'Cocktail',
					thumbnail: expect.any(String),
				}),
			]),
		});
	});

	test('returns an empty array if user has no favorites', async () => {
		await db.query(`DELETE FROM favorites WHERE user_id = 2`);

		const response = await request(app)
			.get('/api/favorites')
			.set('Authorization', `Bearer ${u2Token}`);

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({ favorites: [] });
	});

	test('returns 401 if user is not logged in', async () => {
		const response = await request(app).get('/api/favorites');
		expect(response.statusCode).toBe(401);
		expect(response.body).toEqual({ status: 401, message: 'Unauthorized' });
	});
});
