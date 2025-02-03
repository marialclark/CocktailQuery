require('dotenv').config();

/** Application Configuration */
const SECRET_KEY = process.env.SECRET_KEY || 'development-secret-key';
const PORT = +process.env.PORT || 5000;
const BCRYPT_WORK_FACTOR = 12;

/** Database URI Setup */
const DB_URI =
	process.env.NODE_ENV === 'test'
		? 'postgresql:///cocktailquery_test'
		: process.env.DATABASE_URL || 'postgresql:///cocktailquery';

module.exports = {
	BCRYPT_WORK_FACTOR,
	SECRET_KEY,
	PORT,
	DB_URI,
};
