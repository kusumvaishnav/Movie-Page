
const form = document.querySelector('form');
const gallery = document.querySelector('.image-container');
const playerContainer = document.createElement('div');
const watchlistContainer = document.createElement('div');
const apiKey = '8f3160a1'; 


playerContainer.className = 'movie-player hidden';
document.body.appendChild(playerContainer);
playerContainer.innerHTML = `<div id="player"></div><button class="close-player">Close Player</button>`;


watchlistContainer.className = 'watchlist-container';
document.body.appendChild(watchlistContainer);
watchlistContainer.innerHTML = `<h2>Your Watchlist</h2><div id="watchlist"></div>`;


let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
renderWatchlist();


playerContainer.querySelector('.close-player').addEventListener('click', () => {
    playerContainer.classList.add('hidden');
    playerContainer.querySelector('#player').innerHTML = ''; 
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let query = form.querySelector('input').value.trim();
    form.querySelector('input').value = '';

    if (query === '') {
        query = "nothing";
    }
    await searchMovies(query);
});

async function searchMovies(query) {
    try {
        const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${apiKey}`);
        const data = await res.json();

        if (data.Response === "False") {
            gallery.innerHTML = `<p>${data.Error}</p>`;
            return;
        }

        displayMovies(data.Search);
    } catch (error) {
        console.error('Error fetching data:', error);
        gallery.innerHTML = `<p>Error fetching data. Please try again later.</p>`;
    }
}

function displayMovies(movies) {
    gallery.innerHTML = ''; 

    for (let movie of movies) {
        if (movie.Poster !== 'N/A') {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <img src="${movie.Poster}" alt="${movie.Title}" />
                <h3>${movie.Title} (${movie.Year})</h3>
            `;
            movieCard.addEventListener('click', () => showMovieDetails(movie.imdbID));
            gallery.appendChild(movieCard);
        }
    }
}

async function showMovieDetails(id) {
    try {
        const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`);
        const movie = await res.json();

        if (movie.Response === "False") {
            gallery.innerHTML = `<p>${movie.Error}</p>`;
            return;
        }

        displayMovieDetails(movie);
    } catch (error) {
        console.error('Error fetching movie details:', error);
        gallery.innerHTML = `<p>Error fetching movie details. Please try again later.</p>`;
    }
}

function displayMovieDetails(movie) {
    gallery.innerHTML = `
        <div class="movie-details">
            <button class="close-details">Close</button>
            <h2>${movie.Title} (${movie.Year})</h2>
            <img src="${movie.Poster}" alt="${movie.Title}" />
            <p><strong>Director:</strong> ${movie.Director}</p>
            <p><strong>Cast:</strong> ${movie.Actors}</p>
            <p><strong>Plot:</strong> ${movie.Plot}</p>
            <p><strong>Genre:</strong> ${movie.Genre}</p>
            <p><strong>Language:</strong> ${movie.Language}</p>
            <p><strong>Runtime:</strong> ${movie.Runtime}</p>
           
            <button onclick="addToWatchlist('${movie.Title}', '${movie.Poster}', '${movie.imdbID}')">Add to Watchlist</button>
        </div>
    `;

    document.querySelector('.close-details').addEventListener('click', () => {
        gallery.innerHTML = ''; 
    });
}



function addToWatchlist(title, poster, imdbID) {
    const existingIndex = watchlist.findIndex(movie => movie.imdbID === imdbID);
    if (existingIndex === -1) {
        watchlist.push({ title, poster, imdbID });
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        renderWatchlist();
    } else {
        alert('Movie is already in the watchlist.');
    }
}

function renderWatchlist() {
    const watchlistContainer = document.querySelector('#watchlist');
    watchlistContainer.innerHTML = ''; 

    if (watchlist.length === 0) {
        watchlistContainer.innerHTML = '<p>No movies in watchlist.</p>';
        return;
    }

    for (let movie of watchlist) {
        const watchlistCard = document.createElement('div');
        watchlistCard.className = 'watchlist-movie-card';
        watchlistCard.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}" />
            <h4>${movie.title}</h4>
            <button onclick="removeFromWatchlist('${movie.imdbID}')">Remove</button>
        `;

        watchlistCard.addEventListener('click', async () => {
            await showMovieDetails(movie.imdbID);
        });

        watchlistContainer.appendChild(watchlistCard);
    }
}

function removeFromWatchlist(imdbID) {
    watchlist = watchlist.filter(movie => movie.imdbID !== imdbID);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    renderWatchlist();
}

async function playMovieFromWatchlist(imdbID) {
    try {
        const res = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`);
        const movie = await res.json();

        if (movie.Response === "False") {
            alert('Error fetching movie details.');
            return;
        }

        const movieURL =  `https://example.com/path-to-your-movie/my_movie.mp4`; // Replace with the actual URL

        showMoviePlayer(movieURL);
    } catch (error) {
        console.error('Error fetching movie details from watchlist:', error);
        alert('Error fetching movie details. Please try again later.');
    }
}
