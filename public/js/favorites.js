document.addEventListener('DOMContentLoaded', async () => {
	const favoritesContainer = document.getElementById('favorites-container');
	const token = localStorage.getItem('authToken');

	if (!token) {
		favoritesContainer.innerHTML = `<p>You must be logged in to view favorites. <a href="/login.html">Login here</a></p>`;
		return;
	}

	// Displays spinner while fetching favorites
	favoritesContainer.innerHTML = `<div class="spinner"></div>`;

	try {
		const res = await fetch('/api/favorites', {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.ok) throw new Error('Failed to fetch favorites.');

		const data = await res.json();

		if (data.favorites.length === 0) {
			favoritesContainer.innerHTML = `<p>No favorites yet. Go explore and favorite some cocktails!</p>`;
			return;
		}

		// Fetch details for each favorite cocktail
		const cocktailDetails = await Promise.all(
			data.favorites.map(async (fav) => {
				try {
					const cocktailRes = await fetch(`/api/cocktails/${fav.cocktail_id}`);
					if (!cocktailRes.ok)
						throw new Error(`Failed to fetch details for ${fav.name}`);
					const { cocktail } = await cocktailRes.json();
					const ingredientsList =
						cocktail.ingredients && cocktail.ingredients.length
							? cocktail.ingredients.join(', ')
							: 'Unknown Ingredients';
					return `
            <div class="cocktail-card" data-cocktail-id="${fav.cocktail_id}">
              <img src="${fav.thumbnail}" alt="${fav.name}" class="cocktail-image">
              <h3>${fav.name}</h3>
              <p><strong>Ingredients:</strong> ${ingredientsList}</p> 
              <button class="heart-toggle" data-cocktail-id="${fav.cocktail_id}">
                <i class="fas fa-heart"></i>
              </button>
            </div>
          `;
				} catch (err) {
					console.error(`Error fetching details for ${fav.name}:`, err);
					return ''; // Skip rendering this card if it fails
				}
			})
		);

		// Remove spinner and display favorites
		favoritesContainer.innerHTML = cocktailDetails
			.filter((html) => html !== '')
			.join('');

		// Navigate to cocktail details when a card is clicked.
		document.querySelectorAll('.cocktail-card').forEach((card) => {
			card.addEventListener('click', function (event) {
				// Prevent redirection when clicking the heart button.
				if (!event.target.closest('.heart-toggle')) {
					const cocktailId = this.dataset.cocktailId;
					window.location.href = `/cocktailDetails.html?id=${cocktailId}`;
				}
			});
		});

		// Toggle favorite status on heart button click
		document.querySelectorAll('.heart-toggle').forEach((button) => {
			button.addEventListener('click', async (event) => {
				event.stopPropagation();
				const cocktailId = button.dataset.cocktailId;
				try {
					const response = await fetch('/api/favorites/toggle', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify({ cocktail_id: cocktailId }),
					});
					if (response.ok) {
						button.closest('.cocktail-card').remove();
					} else {
						const error = await response.json();
						alert(error.message);
					}
				} catch (err) {
					console.error('Error unfavoriting:', err);
				}
			});
		});
	} catch (err) {
		console.error('Error fetching favorites:', err);
		favoritesContainer.innerHTML = `<p>Failed to load favorites. Please try again later.</p>`;
	}
});
