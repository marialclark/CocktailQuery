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
			try {
				const res = await fetch(`/api/cocktails?name=${query}`);
				const data = await res.json();

				suggestionsList.innerHTML = '';
				selectedIndex = -1;

				if (data.cocktails.length > 0) {
					suggestionsList.style.display = 'block';
					data.cocktails.forEach((drink, index) => {
						const li = document.createElement('li');
						li.textContent = drink.name;
						li.classList.add('suggestion-item');
						li.dataset.index = index;

						li.addEventListener('click', () => {
							searchInput.value = drink.name;
							suggestionsList.style.display = 'none';
						});

						suggestionsList.appendChild(li);
					});
				} else {
					suggestionsList.style.display = 'none';
				}
			} catch (err) {
				console.error('Error fetching suggestions:', err);
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
});
