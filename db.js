const { Pool } = require('pg');
const { DB_URI } = require('./config');

/** Database connection setup */
const db = new Pool({
	connectionString: DB_URI,
});

module.exports = db;
