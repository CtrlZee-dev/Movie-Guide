// Initial References
let movieNameRef = document.getElementById("movie-name");
let searchBtn = document.getElementById("search-btn");
let moviesContainer = document.getElementById("movies-container");
let pagination = document.getElementById("pagination");
let yearFilter = document.getElementById("year-filter");
let applyFiltersBtn = document.getElementById("apply-filters");

const apiKey = "47f6f87c";
let currentPage = 1;
const moviesPerPage = 12;
let totalResults = 0;
let currentQuery = "movie";
let selectedYear = "";

// Populate year filter
const years = Array.from(
  { length: 10 },
  (_, i) => new Date().getFullYear() - i
);
years.forEach((year) => {
  let option = document.createElement("option");
  option.value = year;
  option.textContent = year;
  yearFilter.appendChild(option);
});

const getMovies = async (page = 1) => {
  let url = `https://www.omdbapi.com/?s=${currentQuery}&page=${page}&apikey=${apiKey}`;

  if (selectedYear) {
    url += `&y=${selectedYear}`;
  }

  let response = await fetch(url);
  let data = await response.json();

  moviesContainer.innerHTML = "<h2 class='w-100 text-center'>Loading...</h2>";

  if (data.Response === "True") {
    totalResults = parseInt(data.totalResults);
    let moviesToShow = data.Search || [];

    moviesContainer.innerHTML = "";

    let movieDetailsPromises = moviesToShow.map(async (movie) => {
      let detailsUrl = `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`;
      let detailsResponse = await fetch(detailsUrl);
      return detailsResponse.json();
    });

    let movieDetails = await Promise.all(movieDetailsPromises);

    let currentRow;
    movieDetails.forEach((detailsData, index) => {
      if (index % 4 === 0) {
        currentRow = document.createElement("div");
        currentRow.className = "row w-100";
        moviesContainer.appendChild(currentRow);
      }
      let col = document.createElement("div");
      col.className = "col-md-3 mb-4";
      col.innerHTML = `
        <div class="movie-card d-flex flex-column align-items-center p-2" data-id="${
          detailsData.imdbID
        }">
          <img src="${detailsData.Poster}" alt="${
        detailsData.Title
      }" class="poster img-fluid">
          <div class="movie-title">
            <span>${detailsData.Title} (${detailsData.Year})</span>
          </div>
          <p>Genre: ${detailsData.Genre || "N/A"}</p>
          <p>IMDb Rating: ${detailsData.imdbRating || "N/A"}</p>
          <button class="movie-type">${detailsData.Type}</button>
        </div>
      `;
      currentRow.appendChild(col);

      currentRow.appendChild(col);
    });

    updatePagination();
  } else {
    moviesContainer.innerHTML = `<h3 class='msg'>No movies found</h3>`;
    pagination.innerHTML = "";
  }
};
moviesContainer.addEventListener("click", async (event) => {
  let card = event.target.closest(".movie-card"); // Find the clicked movie card
  if (!card) return;

  let movieId = card.getAttribute("data-id");
  if (!movieId) return;

  let detailsUrl = `https://www.omdbapi.com/?i=${movieId}&apikey=${apiKey}`;
  let response = await fetch(detailsUrl);
  let movieDetails = await response.json();

  // Save movie details in localStorage to use on the new page
  localStorage.setItem("selectedMovie", JSON.stringify(movieDetails));

  // Navigate to the details page
  window.location.href = "movie-details.html";
});

const updatePagination = () => {
  pagination.innerHTML = "";
  const totalPages = Math.ceil(totalResults / moviesPerPage);
  let maxVisiblePages = 5;

  if (totalPages <= 1) return;

  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (currentPage > 1) {
    pagination.innerHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${
      currentPage - 1
    }">Prev</a></li>`;
  }

  if (startPage > 1) {
    pagination.innerHTML += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`;
    if (startPage > 2) {
      pagination.innerHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pagination.innerHTML += `<li class="page-item ${
      i === currentPage ? "active" : ""
    }"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pagination.innerHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
    pagination.innerHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
  }

  if (currentPage < totalPages) {
    pagination.innerHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${
      currentPage + 1
    }">Next</a></li>`;
  }
};

pagination.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    currentPage = parseInt(e.target.getAttribute("data-page"));
    getMovies(currentPage);
  }
});

searchBtn.addEventListener("click", () => {
  currentPage = 1;
  currentQuery = movieNameRef.value || "2025";
  getMovies(currentPage);
});

applyFiltersBtn.addEventListener("click", () => {
  selectedYear = yearFilter.value;
  getMovies(1);
});

getMovies();
