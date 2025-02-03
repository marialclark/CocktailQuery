const db = require('../db');
const seedTestDB = require('../utils/seedTestDB');
const Favorite = require('../models/favorite');

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

/************************************** add */
describe('add', () => {
	test('adds a new favorite', async () => {
		const favorite = await Favorite.add({ user_id: 2, cocktail_id: 'c1' });
		expect(favorite).toEqual({
			id: expect.any(Number),
			user_id: 2,
			cocktail_id: 'c1',
		});
	});
});

/************************************** getAllByUser */
describe('getAllByUser', () => {
	test('retrieves all favorites for a specific user', async () => {
		const favorites = await Favorite.getAllByUser(1);
		expect(favorites).toEqual([
			{
				id: expect.any(Number),
				user_id: 1,
				cocktail_id: 'c1',
				name: 'Margarita',
				category: 'Cocktail',
				thumbnail: 'https://example.com/margarita.jpg',
			},
			{
				id: expect.any(Number),
				user_id: 1,
				cocktail_id: 'c2',
				name: 'Mojito',
				category: 'Cocktail',
				thumbnail: 'https://example.com/mojito.jpg',
			},
		]);
	});

	test('returns an empty array if the user has no favorites', async () => {
		const favorites = await Favorite.getAllByUser(999); // Non-existent user
		expect(favorites).toEqual([]);
	});
});

/************************************** delete */
describe('delete', () => {
	test('deletes a favorite', async () => {
		const favorites = await Favorite.getAllByUser(1);
		const favoriteToDelete = favorites[0];

		const result = await Favorite.delete(favoriteToDelete.id);
		expect(result).toEqual({ message: 'Favorite deleted' });

		const updatedFavorites = await Favorite.getAllByUser(1);
		expect(updatedFavorites).not.toContainEqual(favoriteToDelete);
	});

	test('throws error if favorite not found', async () => {
		await expect(Favorite.delete(999)).rejects.toThrow('Favorite not found');
	});
});
