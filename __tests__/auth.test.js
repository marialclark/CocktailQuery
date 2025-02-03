const request = require('supertest');
const app = require('../app');
const db = require('../db');
const User = require('../models/user');
const { createToken } = require('../helpers/createToken');

beforeEach(async () => {
	await db.query('BEGIN');
});

afterEach(async () => {
	await db.query('ROLLBACK');
});

afterAll(async () => {
	await db.end();
});

/************************************** POST /login */
describe('POST /api/auth/login', () => {
	test('successfully logs in with valid credentials', async () => {
		const response = await request(app)
			.post('/api/auth/login')
			.send({ username: 'testuser1', password: 'password' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			token: expect.any(String),
		});

		const expectedToken = createToken({ username: 'testuser1', id: 1 });
		expect(response.body.token).toEqual(expectedToken);
	});

	test('fails with invalid username', async () => {
		const response = await request(app)
			.post('/api/auth/login')
			.send({ username: 'wronguser', password: 'password' });

		expect(response.statusCode).toBe(401);
		expect(response.body).toEqual({
			status: 401,
			message: 'Invalid username/password',
		});
	});

	test('fails with invalid password', async () => {
		const response = await request(app)
			.post('/api/auth/login')
			.send({ username: 'testuser1', password: 'wrongpassword' });

		expect(response.statusCode).toBe(401);
		expect(response.body).toEqual({
			status: 401,
			message: 'Invalid username/password',
		});
	});

	test('fails when username and password are not provided', async () => {
		const response = await request(app).post('/api/auth/login').send({});

		expect(response.statusCode).toBe(400);
		expect(response.body).toEqual({
			status: 400,
			message: 'Username and password required',
		});
	});
});

/************************************** POST /register */
describe('POST /api/auth/register', () => {
	test('successfully registers a new user', async () => {
		const newUser = {
			username: 'newuser',
			password: 'password',
			first_name: 'New',
			last_name: 'User',
			email: 'newuser@example.com',
		};

		const response = await request(app)
			.post('/api/auth/register')
			.send(newUser);

		expect(response.statusCode).toBe(201);
		expect(response.body).toEqual({
			token: expect.any(String),
		});

		const user = await User.getByUsername('newuser');
		expect(user).toEqual({
			id: expect.any(Number),
			username: 'newuser',
			first_name: 'New',
			last_name: 'User',
			email: 'newuser@example.com',
		});

		const expectedToken = createToken({ username: 'newuser', id: user.id });
		expect(response.body.token).toEqual(expectedToken);
	});

	test('fails to register with missing required fields', async () => {
		const response = await request(app).post('/api/auth/register').send({
			username: 'incompleteuser',
		});

		expect(response.statusCode).toBe(400);
		expect(response.body).toEqual({
			status: 400,
			message: 'All fields are required',
		});
	});

	test('fails to register with duplicate username', async () => {
		const response = await request(app).post('/api/auth/register').send({
			username: 'testuser1', // User already exists
			password: 'password',
			first_name: 'Duplicate',
			last_name: 'User',
			email: 'duplicate@example.com',
		});

		expect(response.statusCode).toBe(400);
		expect(response.body).toEqual({
			status: 400,
			message: 'Username or email already exists',
		});
	});

	test('fails to register with duplicate email', async () => {
		const response = await request(app).post('/api/auth/register').send({
			username: 'uniqueuser',
			password: 'password',
			first_name: 'Duplicate',
			last_name: 'User',
			email: 'testuser1@example.com', // Email already exists
		});

		expect(response.statusCode).toBe(400);
		expect(response.body).toEqual({
			status: 400,
			message: 'Username or email already exists',
		});
	});
});
