const db = require('../db');
const User = require('../models/user');

beforeEach(async () => {
	await db.query('BEGIN');
});

afterEach(async () => {
	await db.query('ROLLBACK');
});

afterAll(async () => {
	await db.end();
});

/************************************** register */
describe('register', () => {
	test('creates a new user', async () => {
		const newUser = await User.register({
			username: 'newuser',
			password: 'password',
			first_name: 'New',
			last_name: 'User',
			email: 'newuser@example.com',
		});

		expect(newUser).toEqual({
			id: expect.any(Number),
			username: 'newuser',
			first_name: 'New',
			last_name: 'User',
			email: 'newuser@example.com',
		});
	});

	test('throws error for duplicate username', async () => {
		await expect(
			User.register({
				username: 'testuser1', // Duplicate username
				password: 'password',
				first_name: 'Duplicate',
				last_name: 'User',
				email: 'duplicate@example.com',
			})
		).rejects.toThrow('Username or email already exists');
	});

	test('throws error for duplicate email', async () => {
		await expect(
			User.register({
				username: 'uniqueuser',
				password: 'password',
				first_name: 'Duplicate',
				last_name: 'User',
				email: 'testuser1@example.com', // Duplicate email
			})
		).rejects.toThrow('Username or email already exists');
	});
});

/************************************** authenticate */
describe('authenticate', () => {
	test('works with valid credentials', async () => {
		const user = await User.authenticate('testuser1', 'password');
		expect(user).toEqual({
			id: expect.any(Number),
			username: 'testuser1',
			first_name: 'Test',
			last_name: 'User1',
			email: 'testuser1@example.com',
		});
	});

	test('fails with invalid username', async () => {
		await expect(User.authenticate('invaliduser', 'password')).rejects.toThrow(
			'Invalid username/password'
		);
	});

	test('fails with invalid password', async () => {
		await expect(
			User.authenticate('testuser1', 'wrongpassword')
		).rejects.toThrow('Invalid username/password');
	});
});

/************************************** getAll */
describe('getAll', () => {
	test('retrieves all users', async () => {
		const users = await User.getAll();
		expect(users).toEqual([
			{
				id: expect.any(Number),
				username: 'testuser1',
				first_name: 'Test',
				last_name: 'User1',
				email: 'testuser1@example.com',
			},
			{
				id: expect.any(Number),
				username: 'testuser2',
				first_name: 'Test',
				last_name: 'User2',
				email: 'testuser2@example.com',
			},
		]);
	});
});

/************************************** getById */
describe('getById', () => {
	test('retrieves a user by ID', async () => {
		const user = await User.getById(1);
		expect(user).toEqual({
			id: 1,
			username: 'testuser1',
			first_name: 'Test',
			last_name: 'User1',
			email: 'testuser1@example.com',
		});
	});

	test('throws error if user not found', async () => {
		await expect(User.getById(999)).rejects.toThrow('User not found');
	});
});

/************************************** getByUsername */
describe('User.getByUsername', () => {
	test('returns user for valid username', async () => {
		const user = await User.getByUsername('testuser1');
		expect(user).toEqual({
			id: expect.any(Number),
			username: 'testuser1',
			first_name: 'Test',
			last_name: 'User1',
			email: 'testuser1@example.com',
		});
	});

	test('throws error for non-existent username', async () => {
		await expect(User.getByUsername('nonexistentuser')).rejects.toThrow(
			'User not found'
		);
	});
});

/************************************** update */
describe('User.update', () => {
	test('successfully updates user details', async () => {
		const updatedUser = await User.update('testuser1', {
			first_name: 'UpdatedFirst',
			email: 'updated@example.com',
		});
		expect(updatedUser).toEqual({
			id: expect.any(Number),
			username: 'testuser1',
			first_name: 'UpdatedFirst',
			last_name: 'User1',
			email: 'updated@example.com',
		});
	});

	test('throws error for invalid username', async () => {
		await expect(
			User.update('nonexistentuser', { first_name: 'NewName' })
		).rejects.toThrow('User not found');
	});

	test('throws error for empty update data', async () => {
		await expect(User.update('testuser1', {})).rejects.toThrow(
			'No data to update'
		);
	});
});

/************************************** delete */
describe('delete', () => {
	test('deletes a user by ID', async () => {
		const result = await User.delete(1);
		expect(result).toEqual({ message: 'User deleted' });

		await expect(User.getById(1)).rejects.toThrow('User not found');
	});

	test('throws error if user not found', async () => {
		await expect(User.delete(999)).rejects.toThrow('User not found');
	});
});
