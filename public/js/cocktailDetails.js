document.addEventListener('DOMContentLoaded', async () => {
	const urlParams = new URLSearchParams(window.location.search);
	const cocktailId = urlParams.get('id');
	const cocktailContainer = document.getElementById('cocktail-container');
	const spinner = document.getElementById('loading-spinner');

	if (!cocktailContainer) {
		console.error('Error: Missing #cocktail-container in the DOM');
		return;
	}

	if (!cocktailId) {
		console.error('Error: Invalid cocktail ID.');
		cocktailContainer.innerHTML = '<p>Error loading cocktail.</p>';
		return;
	}

	const token = localStorage.getItem('authToken');
	let isFavorited = false;

	// Show spinner before fetching details
	spinner.style.display = 'block';
	cocktailContainer.style.display = 'none';

	try {
		// Fetch cocktail details from the API.
		const res = await fetch(`/api/cocktails/${cocktailId}`);
		if (!res.ok) throw new Error('Cocktail not found');

		const { cocktail } = await res.json();

		// Hide spinner when data is loaded
		spinner.style.display = 'none';
		cocktailContainer.style.display = 'block';

		// Populate the container with cocktail details.
		cocktailContainer.innerHTML = `
      <h1>${cocktail.name}</h1>
      <div class="cocktail-details">
        <img src="${cocktail.thumbnail}" alt="${cocktail.name}">
        <div class="details-text">
          <p><strong>Category:</strong> ${cocktail.category}</p>
          <p><strong>Alcoholic:</strong> ${cocktail.alcoholic}</p>
          <p><strong>Glass:</strong> ${cocktail.glass}</p>
          <p><strong>Instructions:</strong> ${cocktail.instructions}</p>
          <p><strong>Ingredients:</strong></p>
          <ul>
            ${cocktail.ingredients
							.map(
								(ingredient, index) =>
									`<li>${ingredient} - ${
										cocktail.measurements[index] || ''
									}</li>`
							)
							.join('')}
          </ul>
          <button id="favorite-btn" class="favorite-button">Add to Favorites</button>
        </div>
      </div>
    `;

		const favButton = document.getElementById('favorite-btn');

		if (token) {
			// Check if the cocktail is already favorited by the user.
			const favRes = await fetch('/api/favorites', {
				headers: { Authorization: `Bearer ${token}` },
			});
			const favData = await favRes.json();
			isFavorited = favData.favorites.some(
				(fav) => fav.cocktail_id === cocktailId
			);

			// Update the favorite button based on the favorited state.
			const updateFavoriteButton = (isFavorited) => {
				favButton.textContent = isFavorited
					? 'Remove from Favorites'
					: 'Add to Favorites';
				favButton.classList.toggle('add', !isFavorited);
				favButton.classList.toggle('remove', isFavorited);
			};

			updateFavoriteButton(isFavorited);

			// Toggle favorite status on button click.
			favButton.addEventListener('click', async () => {
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
						const data = await response.json();
						isFavorited = data.favorite;
						updateFavoriteButton(isFavorited);
					} else {
						const error = await response.json();
						alert(error.message);
					}
				} catch (err) {
					console.error('Error toggling favorite:', err);
					alert('An error occurred while updating your favorites.');
				}
			});
		} else {
			// If the user is not logged in, alert on favorite button click.
			favButton.addEventListener('click', () => {
				alert('You must be logged in to favorite a cocktail.');
			});
		}
	} catch (err) {
		console.error('Error fetching cocktail details:', err);
		cocktailContainer.innerHTML = '<p>Failed to load cocktail details.</p>';
		spinner.style.display = 'none';
		cocktailContainer.style.display = 'block';
	}
});
