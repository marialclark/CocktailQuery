document.addEventListener('DOMContentLoaded', () => {
	const homeLink = document.getElementById('home-link');
	const loginLink = document.getElementById('login-link');
	const favoritesLink = document.getElementById('favorites-link');
	const accountLink = document.getElementById('account-link');
	const logoutBtn = document.getElementById('logout-btn');

	// Set ARIA attributes for accessibility
	if (loginLink) loginLink.setAttribute('aria-label', 'Login');
	if (favoritesLink) favoritesLink.setAttribute('aria-label', 'Favorites');
	if (accountLink) accountLink.setAttribute('aria-label', 'My Account');
	if (logoutBtn) logoutBtn.setAttribute('aria-label', 'Logout');

	const token = localStorage.getItem('authToken');
	
	// Makes "CocktailQuery" clickable to redirect to home
	if (homeLink) {
		homeLink.style.cursor = 'pointer';
		homeLink.addEventListener('click', (event) => {
			event.preventDefault();
			window.location.href = '/';
		});
	}

	// Updates navbar visibility based on authentication state
	const updateNavbar = () => {
		if (token) {
			loginLink.style.display = 'none';
			favoritesLink.style.display = 'inline-block';
			accountLink.style.display = 'inline-block';
			logoutBtn.style.display = 'inline-block';
		} else {
			loginLink.style.display = 'inline-block';
			favoritesLink.style.display = 'none';
			accountLink.style.display = 'none';
			logoutBtn.style.display = 'none';
		}
	};

	updateNavbar();

	// Ensurea logout button clears authToken and redirects
	logoutBtn.addEventListener('click', () => {
		localStorage.removeItem('authToken');
		updateNavbar();
		window.location.href = '/';
	});
});
