document.addEventListener("DOMContentLoaded", () => {
  let movieDetails = JSON.parse(localStorage.getItem("selectedMovie"));

  if (!movieDetails) {
    document.body.innerHTML = "<h2>Movie not found</h2>";
    return;
  }

  document.getElementById("movie-poster").src = movieDetails.Poster;
  document.getElementById(
    "movie-title"
  ).textContent = `${movieDetails.Title} (${movieDetails.Year})`;
  document.getElementById("movie-description").textContent =
    movieDetails.Plot || "No description available.";
  document.getElementById("movie-cast").textContent =
    movieDetails.Actors || "N/A";
  document.getElementById("movie-genre").textContent =
    movieDetails.Genre || "N/A";
});
