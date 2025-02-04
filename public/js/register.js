document.addEventListener('DOMContentLoaded', () => {
	const registerForm = document.getElementById('register-form');
	const registerButton = document.getElementById('register-btn');

	// Handle registration form submission.
	registerForm.addEventListener('submit', async (event) => {
		event.preventDefault();

		const username = document.getElementById('username').value.trim();
		const password = document.getElementById('password').value.trim();
		const firstName = document.getElementById('first-name').value.trim();
		const lastName = document.getElementById('last-name').value.trim();
		const email = document.getElementById('email').value.trim();

		if (!username || !password || !firstName || !lastName || !email) {
			alert('Please fill out all fields.');
			return;
		}

		const registerButtonText = registerButton.innerHTML;

		// Spinner functionality
		registerButton.innerHTML = '<div class="btn-spinner"></div>';
		registerButton.disabled = true;

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username,
					password,
					first_name: firstName,
					last_name: lastName,
					email,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				// Store token for authentication and redirect to home.
				localStorage.setItem('authToken', data.token);
				window.location.href = '/index.html';
			} else {
				alert(data.message || 'Registration failed. Please try again.');
				registerButton.innerHTML = registerButtonText;
				registerButton.disabled = false;
			}
		} catch (err) {
			console.error('Error registering:', err);
			alert('An unexpected error occurred. Please try again.');
			registerButton.innerHTML = registerButtonText;
			registerButton.disabled = false;
		}
	});
});
