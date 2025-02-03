document.addEventListener('DOMContentLoaded', async () => {
	const urlParams = new URLSearchParams(window.location.search);
	const searchQuery = urlParams.get('search');
	const resultsDiv = document.getElementById('results');

	const token = localStorage.getItem('authToken');
	let userFavorites = new Set();

	// If the user is logged in, fetch their favorite cocktail IDs.
	if (token) {
		try {
			const favRes = await fetch('/api/favorites', {
				headers: { Authorization: `Bearer ${token}` },
			});
			const favData = await favRes.json();
			userFavorites = new Set(favData.favorites.map((fav) => fav.cocktail_id));
		} catch (err) {
			console.error('Error fetching user favorites:', err);
		}
	}

	if (searchQuery) {
		try {
			const res = await fetch(`/api/cocktails?search=${searchQuery}`);
			const data = await res.json();

			if (data.cocktails.length > 0) {
				resultsDiv.innerHTML = data.cocktails
					.map((cocktail) => {
						const isFavorited = userFavorites.has(cocktail.cocktail_id);
						return `
              <div class="cocktail-card" data-cocktail-id="${
								cocktail.cocktail_id
							}">
                <img src="${cocktail.thumbnail}" alt="${
							cocktail.name
						}" class="cocktail-image">
                <h3>${cocktail.name}</h3>
                <p><strong>Ingredients:</strong> ${cocktail.ingredients.join(
									', '
								)}</p>
                <button class="heart-toggle" data-cocktail-id="${
									cocktail.cocktail_id
								}">
                  <i class="fa${isFavorited ? 's' : 'r'} fa-heart"></i>
                </button>
              </div>
            `;
					})
					.join('');

				// Redirect when clicking a cocktail card.
				document.querySelectorAll('.cocktail-card').forEach((card) => {
					card.addEventListener('click', function (event) {
						// Prevent redirection when clicking the heart button.
						if (!event.target.closest('.heart-toggle')) {
							const cocktailId = this.dataset.cocktailId;
							window.location.href = `/cocktailDetails.html?id=${cocktailId}`;
						}
					});
				});

				// Handle favorite toggling on heart buttons.
				document.querySelectorAll('.heart-toggle').forEach((button) => {
					button.addEventListener('click', async (event) => {
						event.preventDefault();
						event.stopPropagation();
						const cocktailId = button.dataset.cocktailId;

						if (!token) {
							alert('You must be logged in to favorite a cocktail.');
							return;
						}

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
								const icon = button.querySelector('i');
								icon.classList.toggle('fas');
								icon.classList.toggle('far');
							} else {
								const error = await response.json();
								alert(error.message);
							}
						} catch (err) {
							console.error('Error toggling favorite:', err);
						}
					});
				});
			} else {
				resultsDiv.innerHTML = '<p>No cocktails found.</p>';
			}
		} catch (err) {
			console.error('Error fetching search results:', err);
			resultsDiv.innerHTML = '<p>Failed to load search results.</p>';
		}
	} else {
		resultsDiv.innerHTML = '<p>Please enter a search term.</p>';
	}
});
