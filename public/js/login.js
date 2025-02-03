document.addEventListener('DOMContentLoaded', () => {
	const loginForm = document.getElementById('login-form');

	loginForm.addEventListener('submit', async (event) => {
		event.preventDefault();

		const username = document.getElementById('username').value.trim();
		const password = document.getElementById('password').value.trim();

		if (!username || !password) {
			alert('Please enter both username and password.');
			return;
		}

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
			}
		} catch (err) {
			console.error('Error logging in:', err);
			alert('An unexpected error occurred. Please try again.');
		}
	});
});
