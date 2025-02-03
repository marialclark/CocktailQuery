const express = require('express');
const { authenticateJWT } = require('./middleware/auth');
const ExpressError = require('./helpers/expressError');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const cocktailsRoutes = require('./routes/cocktails');
const favoritesRoutes = require('./routes/favorites');
const path = require('path');

const app = express();

app.use(express.json());

// Apply authentication middleware
app.use(authenticateJWT);

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

/** Routes */
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/cocktails', cocktailsRoutes);
app.use('/api/favorites', favoritesRoutes);

// Serve index.html for all unmatched routes (for frontend routing). Will edit
// this in the future to ensure the 404 handler catches non-existing routes.
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle 404 errors for undefined routes
app.use(function (req, res, next) {
	return next(new ExpressError('Not Found', 404));
});

// General error handler
app.use((err, req, res, next) => {
	res.status(err.status || 500).json({
		status: err.status || 500,
		message: err.message,
	});
});

module.exports = app;
