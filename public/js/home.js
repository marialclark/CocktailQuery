document.addEventListener('DOMContentLoaded', () => {
	const searchInput = document.getElementById('search-input');
	const searchBtn = document.getElementById('search-btn');
	const suggestionsList = document.getElementById('suggestions');

	let selectedIndex = -1; // Track highlighted suggestion

	// Listen for input changes in the search box.
	// Future improvement: Consider debouncing this handler to reduce API calls.
	searchInput.addEventListener('input', async () => {
		const query = searchInput.value.trim();

		if (query.length > 0) {
			suggestionsList.innerHTML = ''; // Clear old suggestions
			selectedIndex = -1;

			// Show animated "Searching for cocktails..." text
			const loadingText = document.createElement('li');
			loadingText.textContent = 'Searching for cocktails';
			loadingText.classList.add('loading-text');
			suggestionsList.appendChild(loadingText);

			animateLoadingDots(loadingText);

			try {
				const res = await fetch(`/api/cocktails?name=${query}`);
				const data = await res.json();

				suggestionsList.innerHTML = ''; // Clears searching message

				if (data.cocktails.length > 0) {
					suggestionsList.style.display = 'block';
					suggestionsList.innerHTML = data.cocktails
						.map((drink) => `<li class="suggestion-item">${drink.name}</li>`)
						.join('');

					document.querySelectorAll('.suggestion-item').forEach((li, index) => {
						li.dataset.index = index;
						li.addEventListener('click', () => {
							searchInput.value = li.textContent;
							suggestionsList.style.display = 'none';
						});
					});
				} else {
					suggestionsList.style.display = 'none';
				}
			} catch (err) {
				console.error('Error fetching suggestions:', err);
				suggestionsList.innerHTML = '';
				suggestionsList.innerHTML =
					'<li class="suggestion-error-message">Error fetching data</li>';
				suggestionsList.style.display = 'block';
			}
		} else {
			suggestionsList.style.display = 'none';
		}
	});

	// Handle keyboard navigation for suggestions.
	searchInput.addEventListener('keydown', (e) => {
		const items = document.querySelectorAll('.suggestion-item');

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (selectedIndex < items.length - 1) {
				selectedIndex++;
			}
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (selectedIndex > 0) {
				selectedIndex--;
			}
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (selectedIndex >= 0 && items.length > 0) {
				searchInput.value = items[selectedIndex].textContent;
				suggestionsList.style.display = 'none';
			}
			performSearch();
		}

		items.forEach((item, index) => {
			item.classList.toggle('selected', index === selectedIndex);
		});
	});

	const performSearch = () => {
		if (searchInput.value.trim() !== '') {
			window.location.href = `/searchResults.html?search=${searchInput.value.trim()}`;
		}
	};

	searchBtn.addEventListener('click', performSearch);

	// Close suggestions when clicking outside the search area.
	document.addEventListener('click', (e) => {
		if (
			!searchInput.contains(e.target) &&
			!suggestionsList.contains(e.target)
		) {
			suggestionsList.style.display = 'none';
		}
	});

	// Function to animate "..." in "Searching for cocktails..."
	function animateLoadingDots(element) {
		let dots = 0;
		const interval = setInterval(() => {
			dots = (dots + 1) % 4;
			element.textContent = `Searching for cocktails${'.'.repeat(dots)}`;
		}, 500);

		setTimeout(() => clearInterval(interval), 3000);
	}
});
