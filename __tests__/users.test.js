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

/************************************** GET /:username */

describe('GET /api/users/:username', () => {
	test('works for the correct user', async () => {
		const response = await request(app)
			.get('/api/users/testuser1')
			.set('Authorization', `Bearer ${u1Token}`);

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			user: {
				id: expect.any(Number),
				username: 'testuser1',
				first_name: 'Test',
				last_name: 'User1',
				email: 'testuser1@example.com',
			},
		});
	});

	test('unauthorized for wrong user', async () => {
		const response = await request(app)
			.get('/api/users/testuser1')
			.set('Authorization', `Bearer ${u2Token}`);

		expect(response.statusCode).toBe(401);
	});

	test('unauthorized for non-existent user', async () => {
		const response = await request(app)
			.get('/api/users/nonexistentuser')
			.set('Authorization', `Bearer ${u1Token}`);

		expect(response.statusCode).toBe(401);
	});
});

/************************************** PATCH /:username */

describe('PATCH /api/users/:username', () => {
	test('works for the correct user', async () => {
		const response = await request(app)
			.patch('/api/users/testuser1')
			.set('Authorization', `Bearer ${u1Token}`)
			.send({
				first_name: 'Updated',
				last_name: 'User1',
				email: 'updated1@example.com',
			});

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			user: {
				id: expect.any(Number),
				username: 'testuser1',
				first_name: 'Updated',
				last_name: 'User1',
				email: 'updated1@example.com',
			},
		});
	});

	test('unauthorized for wrong user', async () => {
		const response = await request(app)
			.patch('/api/users/testuser1')
			.set('Authorization', `Bearer ${u2Token}`)
			.send({ first_name: 'Updated' });

		expect(response.statusCode).toBe(401);
	});

	test('unauthorized for non-existent user', async () => {
		const response = await request(app)
			.patch('/api/users/nonexistentuser')
			.set('Authorization', `Bearer ${u1Token}`)
			.send({ first_name: 'Updated' });

		expect(response.statusCode).toBe(401);
	});

	test('bad request with no fields to update', async () => {
		const response = await request(app)
			.patch('/api/users/testuser1')
			.set('Authorization', `Bearer ${u1Token}`)
			.send({});

		expect(response.statusCode).toBe(400);
	});
});

/************************************** DELETE /:username */

describe('DELETE /api/users/:username', () => {
	test('works for the correct user', async () => {
		const response = await request(app)
			.delete('/api/users/testuser1')
			.set('Authorization', `Bearer ${u1Token}`);

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({ message: 'User deleted' });
	});

	test('unauthorized for wrong user', async () => {
		const response = await request(app)
			.delete('/api/users/testuser1')
			.set('Authorization', `Bearer ${u2Token}`);

		expect(response.statusCode).toBe(401);
	});

	test('unauthorized for non-existent user', async () => {
		const response = await request(app)
			.delete('/api/users/nonexistentuser')
			.set('Authorization', `Bearer ${u1Token}`);

		expect(response.statusCode).toBe(401);
	});
});
