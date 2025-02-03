/** Custom error class for handling Express errors */
class ExpressError extends Error {
	constructor(message, status) {
		super(message);
		this.status = status;

		// Log the error stack if not in the test environment
		if (process.env.NODE_ENV !== 'test') {
			console.error(this.stack);
		}
	}
}

module.exports = ExpressError;
