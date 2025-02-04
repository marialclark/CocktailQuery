document.addEventListener('DOMContentLoaded', () => {
	const loginForm = document.getElementById('login-form');
	const loginButton = document.getElementById('login-btn');

	loginForm.addEventListener('submit', async (event) => {
		event.preventDefault();

		const username = document.getElementById('username').value.trim();
		const password = document.getElementById('password').value.trim();

		if (!username || !password) {
			alert('Please enter both username and password.');
			return;
		}

		const loginButtonText = loginButton.innerHTML;

		// Spinner functionality
		loginButton.innerHTML = '<div class="btn-spinner"></div>';
		loginButton.disabled = true;

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password }),
			});

			const data = await response.json();

			if (response.ok) {
				// Store token for authentication
				localStorage.setItem('authToken', data.token);
				window.location.href = '/index.html';
			} else {
				alert(data.message || 'Login failed. Please try again.');
				loginButton.innerHTML = loginButtonText;
				loginButton.disabled = false;
			}
		} catch (err) {
			console.error('Error logging in:', err);
			alert('An unexpected error occurred. Please try again.');
			loginButton.innerHTML = loginButtonText;
			loginButton.disabled = false;
		}
	});
});
