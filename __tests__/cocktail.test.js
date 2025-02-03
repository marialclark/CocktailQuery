const db = require('../db');
const seedTestDB = require('../utils/seedTestDB');
const Cocktail = require('../models/cocktail');

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

/************************************** getAll */
describe('getAll', () => {
	test('retrieves all cocktails without filters', async () => {
		const cocktails = await Cocktail.getAll();
		expect(cocktails).toEqual([
			{
				id: expect.any(Number),
				cocktail_id: 'c1',
				name: 'Margarita',
				category: 'Cocktail',
				alcoholic: 'Alcoholic',
				glass: 'Cocktail glass',
				instructions: 'Shake and strain into a cocktail glass.',
				ingredients: ['Tequila', 'Triple sec', 'Lime juice'],
				measurements: ['2 oz', '1 oz', '1 oz'],
				thumbnail: 'https://example.com/margarita.jpg',
			},
			{
				id: expect.any(Number),
				cocktail_id: 'c2',
				name: 'Mojito',
				category: 'Cocktail',
				alcoholic: 'Alcoholic',
				glass: 'Highball glass',
				instructions: 'Muddle mint leaves and lime, then add rum and soda.',
				ingredients: ['White rum', 'Mint', 'Lime', 'Sugar', 'Soda water'],
				measurements: ['2 oz', '10 leaves', '1', '2 tsp', 'Fill'],
				thumbnail: 'https://example.com/mojito.jpg',
			},
		]);
	});

	test('retrieves cocktails filtered by category', async () => {
		const cocktails = await Cocktail.getAll({ category: 'Cocktail' });
		expect(cocktails.length).toBe(2);
	});

	test('retrieves cocktails filtered by ingredient', async () => {
		const cocktails = await Cocktail.getAll({ ingredient: 'Tequila' });
		expect(cocktails).toEqual([
			expect.objectContaining({
				name: 'Margarita',
				ingredients: expect.arrayContaining(['Tequila']),
			}),
		]);
	});
});

/************************************** getAll - Partial Name Search (Autocomplete) */
describe('getAll - Name Autocomplete', () => {
	test('retrieves cocktails matching partial name', async () => {
		const cocktails = await Cocktail.getAll({ name: 'Margar' });
		expect(cocktails).toEqual([expect.objectContaining({ name: 'Margarita' })]);
	});

	test('is case-insensitive for partial name search', async () => {
		const cocktails = await Cocktail.getAll({ name: 'mArGa' });
		expect(cocktails).toEqual([expect.objectContaining({ name: 'Margarita' })]);
	});

	test('returns an empty array if no name matches', async () => {
		const cocktails = await Cocktail.getAll({ name: 'NonExistentDrink' });
		expect(cocktails).toEqual([]);
	});
});

/************************************** getAll - Keyword Search */
describe('getAll - Keyword-Based Search', () => {
	test('retrieves cocktails matching search keywords in name', async () => {
		const cocktails = await Cocktail.getAll({ search: 'Margarita' });
		expect(cocktails).toEqual([expect.objectContaining({ name: 'Margarita' })]);
	});

	test('retrieves cocktails matching search keywords in category', async () => {
		const cocktails = await Cocktail.getAll({ search: 'Cocktail' });
		expect(cocktails.length).toBe(2);
	});

	test('retrieves cocktails matching search keywords in ingredients', async () => {
		const cocktails = await Cocktail.getAll({ search: 'Tequila' });
		expect(cocktails).toEqual([
			expect.objectContaining({
				name: 'Margarita',
				ingredients: expect.arrayContaining(['Tequila']),
			}),
		]);
	});

	test('retrieves cocktails matching multiple keywords (AND logic)', async () => {
		const cocktails = await Cocktail.getAll({ search: 'Tequila Alcoholic' });
		expect(cocktails).toEqual([
			expect.objectContaining({
				name: 'Margarita',
				alcoholic: 'Alcoholic',
				ingredients: expect.arrayContaining(['Tequila']),
			}),
		]);
	});

	test('is case-insensitive for search keywords', async () => {
		const cocktails = await Cocktail.getAll({ search: 'tEqUiLa' });
		expect(cocktails).toEqual([
			expect.objectContaining({
				name: 'Margarita',
				ingredients: expect.arrayContaining(['Tequila']),
			}),
		]);
	});

	test('returns an empty array if no keyword matches', async () => {
		const cocktails = await Cocktail.getAll({ search: 'randomword' });
		expect(cocktails).toEqual([]);
	});
});

/************************************** getById */
describe('getById', () => {
	test('retrieves a cocktail by ID', async () => {
		const cocktail = await Cocktail.getById('c1');
		expect(cocktail).toEqual({
			id: expect.any(Number),
			cocktail_id: 'c1',
			name: 'Margarita',
			category: 'Cocktail',
			alcoholic: 'Alcoholic',
			glass: 'Cocktail glass',
			instructions: 'Shake and strain into a cocktail glass.',
			ingredients: ['Tequila', 'Triple sec', 'Lime juice'],
			measurements: ['2 oz', '1 oz', '1 oz'],
			thumbnail: 'https://example.com/margarita.jpg',
		});
	});

	test('throws error if cocktail not found', async () => {
		await expect(Cocktail.getById('invalid_id')).rejects.toThrow(
			'Cocktail not found'
		);
	});
});
