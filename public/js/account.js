document.addEventListener('DOMContentLoaded', async () => {
	const token = localStorage.getItem('authToken');
	if (!token) {
		window.location.href = '/login.html';
		return;
	}

	// Decode token to get username.
	const payload = JSON.parse(atob(token.split('.')[1]));
	const username = payload.username;

	// Select DOM elements.
	const usernameDisplay = document.getElementById('username-display');
	const firstNameDisplay = document.getElementById('first-name-display');
	const lastNameDisplay = document.getElementById('last-name-display');
	const emailDisplay = document.getElementById('email-display');
	const firstNameInput = document.getElementById('first-name-input');
	const lastNameInput = document.getElementById('last-name-input');
	const emailInput = document.getElementById('email-input');
	const editBtn = document.getElementById('edit-btn');
	const saveBtn = document.getElementById('save-btn');
	const deleteBtn = document.getElementById('delete-account-btn');
	const errorMessage = document.getElementById('error-message');
	const successMessage = document.getElementById('success-message');
	const loadingSpinner = document.getElementById('loading-spinner');

	if (
		!usernameDisplay ||
		!firstNameDisplay ||
		!lastNameDisplay ||
		!emailDisplay ||
		!editBtn ||
		!saveBtn ||
		!deleteBtn
	) {
		console.error('One or more elements are missing on the account page.');
		return;
	}

	// Show spinner while loading
	loadingSpinner.style.display = 'block';

	// Fetch and display user info.
	try {
		const res = await fetch(`/api/users/${username}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.ok) throw new Error('Failed to fetch user info.');
		const { user } = await res.json();

		// Hide spinner after loading
		loadingSpinner.style.display = 'none';

		// Populate the display elements.
		usernameDisplay.textContent = username;
		firstNameDisplay.textContent = user.first_name;
		lastNameDisplay.textContent = user.last_name;
		emailDisplay.textContent = user.email;

		// Set the input fields to current user values.
		firstNameInput.value = user.first_name;
		lastNameInput.value = user.last_name;
		emailInput.value = user.email;
	} catch (err) {
		console.error('Error fetching user data:', err);
		loadingSpinner.style.display = 'none';
		accountContainer.innerHTML = `<p>Failed to load account information. Please try again.</p>`;
	}

	// Switch to edit mode.
	editBtn.addEventListener('click', () => {
		document.querySelectorAll('.account-field').forEach((field) => {
			if (field.querySelector('input')) {
				field.querySelector('span').style.display = 'none';
				field.querySelector('input').style.display = 'block';
			}
		});
		saveBtn.style.display = 'inline-block';
		editBtn.style.display = 'none';
		successMessage.style.display = 'none';
	});

	// Save changes.
	saveBtn.addEventListener('click', async () => {
		const updatedFirstName = firstNameInput.value.trim();
		const updatedLastName = lastNameInput.value.trim();
		const updatedEmail = emailInput.value.trim();

		// Temporary validation fix. Will update backend schema/models to
		// validate this later on in the development process.
		if (!updatedFirstName || !updatedLastName || !updatedEmail) {
			errorMessage.textContent = 'All fields must be filled out before saving.';
			errorMessage.style.display = 'block';
			return;
		}

		// Change Save button to loading spinner
		saveBtn.innerHTML = '<div class="btn-spinner"></div>';
		saveBtn.disabled = true;

		try {
			const res = await fetch(`/api/users/${username}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					first_name: updatedFirstName,
					last_name: updatedLastName,
					email: updatedEmail,
				}),
			});
			if (!res.ok) throw new Error('Failed to update account.');
			const { user } = await res.json();

			// Update display elements with the new user data.
			firstNameDisplay.textContent = user.first_name;
			lastNameDisplay.textContent = user.last_name;
			emailDisplay.textContent = user.email;

			// Switch back to display mode.
			document.querySelectorAll('.account-field').forEach((field) => {
				if (field.querySelector('input')) {
					field.querySelector('span').style.display = 'block';
					field.querySelector('input').style.display = 'none';
				}
			});
			saveBtn.style.display = 'none';
			editBtn.style.display = 'inline-block';
			errorMessage.style.display = 'none';

			successMessage.textContent = 'Account updated succesfully.';
			successMessage.style.display = 'block';
		} catch (err) {
			console.error('Error updating account:', err);
			alert('Failed to update account. Please try again.');
		} finally {
			saveBtn.innerHTML = 'Save';
			saveBtn.disabled = false;
		}
	});

	// Delete account.
	deleteBtn.addEventListener('click', () => {
		const confirmDelete = confirm(
			'Warning: Deleting your account cannot be undone and will erase all account data along with it. Do you wish to proceed?'
		);
		if (!confirmDelete) return;

		fetch(`/api/users/${username}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => {
				if (!res.ok) throw new Error('Failed to delete account.');
				return res.json();
			})
			.then(() => {
				alert('Account deleted successfully.');
				localStorage.removeItem('authToken');
				window.location.href = '/';
			})
			.catch((err) => {
				console.error('Error deleting account:', err);
				alert('Failed to delete account. Please try again.');
			});
	});
});
