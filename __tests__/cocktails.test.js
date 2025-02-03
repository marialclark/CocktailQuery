const request = require('supertest');
const app = require('../app');
const db = require('../db');
const seedTestDB = require('../utils/seedTestDB');

beforeEach(async () => {
	await db.query('BEGIN');
	await seedTestDB();
});

afterEach(async () => {
	await db.query('ROLLBACK');
});

afterAll(async () => {
	await db.end();
});

/************************************** GET /api/cocktails */
describe('GET /api/cocktails', () => {
	test('retrieves all cocktails without filters', async () => {
		const response = await request(app).get('/api/cocktails');
		expect(response.statusCode).toBe(200);
		expect(response.body.cocktails.length).toBeGreaterThan(0);
		expect(response.body.cocktails).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					cocktail_id: expect.any(String),
					name: expect.any(String),
					category: expect.any(String),
					alcoholic: expect.any(String),
					glass: expect.any(String),
					instructions: expect.any(String),
					thumbnail: expect.any(String),
					ingredients: expect.arrayContaining([expect.any(String)]),
					measurements: expect.arrayContaining([expect.any(String)]),
				}),
			])
		);
	});

	/********** Autocomplete (Partial Name) **********/
	test('retrieves cocktails matching partial name (autocomplete)', async () => {
		const response = await request(app).get('/api/cocktails?name=margar');
		expect(response.statusCode).toBe(200);
		expect(response.body.cocktails).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: 'Margarita',
				}),
			])
		);
	});

	test('is case-insensitive for partial name search', async () => {
		const response = await request(app).get('/api/cocktails?name=MarGar');
		expect(response.statusCode).toBe(200);
		expect(response.body.cocktails).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: 'Margarita',
				}),
			])
		);
	});

	test('returns empty array if no cocktails match name', async () => {
		const response = await request(app).get('/api/cocktails?name=nonexistent');
		expect(response.statusCode).toBe(200);
		expect(response.body.cocktails).toEqual([]);
	});

	/********** Keyword Search (Full Search) **********/
	test('retrieves cocktails matching search keywords in name', async () => {
		const response = await request(app).get('/api/cocktails?search=Margarita');
		expect(response.statusCode).toBe(200);
		expect(response.body.cocktails).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: 'Margarita',
				}),
			])
		);
	});

	test('retrieves cocktails matching search keywords in category', async () => {
		const response = await request(app).get('/api/cocktails?search=Cocktail');
		expect(response.statusCode).toBe(200);
		expect(response.body.cocktails.length).toBeGreaterThan(0);
	});

	test('retrieves cocktails matching search keywords in ingredients', async () => {
		const response = await request(app).get('/api/cocktails?search=Tequila');
		expect(response.statusCode).toBe(200);
		expect(response.body.cocktails).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: 'Margarita',
					ingredients: expect.arrayContaining(['Tequila']),
				}),
			])
		);
	});

	test('retrieves cocktails matching multiple keywords (AND logic)', async () => {
		const response = await request(app).get(
			'/api/cocktails?search=Tequila Alcoholic'
		);
		expect(response.statusCode).toBe(200);
		expect(response.body.cocktails).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: 'Margarita',
					alcoholic: 'Alcoholic',
					ingredients: expect.arrayContaining(['Tequila']),
				}),
			])
		);
	});

	test('is case-insensitive for search keywords', async () => {
		const response = await request(app).get('/api/cocktails?search=TEQUILA');
		expect(response.statusCode).toBe(200);
		expect(response.body.cocktails).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: 'Margarita',
					ingredients: expect.arrayContaining(['Tequila']),
				}),
			])
		);
	});

	test('returns empty array if no keyword matches', async () => {
		const response = await request(app).get(
			'/api/cocktails?search=nonexistentword'
		);
		expect(response.statusCode).toBe(200);
		expect(response.body.cocktails).toEqual([]);
	});

	/********** Filtering **********/
	test('retrieves cocktails filtered by ingredient', async () => {
		const response = await request(app).get(
			'/api/cocktails?ingredient=Tequila'
		);
		expect(response.statusCode).toBe(200);
		expect(response.body.cocktails).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: 'Margarita',
					ingredients: expect.arrayContaining(['Tequila']),
				}),
			])
		);
	});

	test('retrieves cocktails filtered by category', async () => {
		const response = await request(app).get('/api/cocktails?category=Cocktail');
		expect(response.statusCode).toBe(200);
		expect(response.body.cocktails.length).toBeGreaterThan(0);
	});

	test('retrieves cocktails filtered by alcoholic status', async () => {
		const response = await request(app).get(
			'/api/cocktails?alcoholic=Alcoholic'
		);
		expect(response.statusCode).toBe(200);
		expect(response.body.cocktails.length).toBeGreaterThan(0);
	});
});

/************************************** GET /api/cocktails/:id */
describe('GET /api/cocktails/:id', () => {
	test('retrieves a cocktail by ID', async () => {
		const response = await request(app).get('/api/cocktails/c1');
		expect(response.statusCode).toBe(200);
		expect(response.body.cocktail).toEqual({
			id: expect.any(Number),
			cocktail_id: 'c1',
			name: 'Margarita',
			category: 'Cocktail',
			alcoholic: 'Alcoholic',
			glass: 'Cocktail glass',
			instructions: 'Shake and strain into a cocktail glass.',
			thumbnail: 'https://example.com/margarita.jpg',
			ingredients: ['Tequila', 'Triple sec', 'Lime juice'],
			measurements: ['2 oz', '1 oz', '1 oz'],
		});
	});

	test('returns 404 if cocktail not found', async () => {
		const response = await request(app).get('/api/cocktails/invalid_id');
		expect(response.statusCode).toBe(404);
		expect(response.body).toEqual({
			status: 404,
			message: 'Cocktail not found',
		});
	});
});
