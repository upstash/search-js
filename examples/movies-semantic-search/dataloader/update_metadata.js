require("dotenv").config();
const axios = require("axios");
const { Index } = require("@upstash/vector");

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const UPSTASH_URL = process.env.UPSTASH_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_TOKEN;

// Initialize Upstash vector index
const index = new Index({
  url: UPSTASH_URL,
  token: UPSTASH_TOKEN,
});

// Function to fetch movie details from TMDB
async function fetchMovieDetails(movieId) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });

    return {
      adult: response.data.adult,
      popularity: response.data.popularity,
    };
  } catch (error) {
    console.error(
      `Error fetching movie details for movie ID ${movieId}:`,
      error,
    );
    return null;
  }
}

// Function to update movie metadata in Upstash
async function updateMovieMetadata(movie, adult, popularity) {
  try {
    const updatedMetadata = {
      ...movie.metadata,
      adult: adult,
      popularity: popularity,
    };

    await index.update({
      id: movie.id,
      metadata: updatedMetadata,
    });

    console.log(
      `Updated movie ${movie.metadata.name} with adult field in Upstash`,
    );
  } catch (error) {
    console.log(movie);
    console.error(
      `Error updating movie ${movie.metadata.name} in Upstash:`,
      error,
    );
  }
}

// Main function
(async function () {
  let cursor = 60000;

  do {
    const response = await index.range({
      cursor: cursor,
      limit: 100,
      includeVectors: false,
      includeMetadata: true,
    });
    console.log(response);

    if (!response) break;

    const { vectors, nextCursor } = response;

    for (const movie of vectors) {
      const movieId = movie.id;

      const tmdbMovieId = movieId.substring(movieId.indexOf(":") + 1);
      const movieDetails = await fetchMovieDetails(tmdbMovieId);
      console.log(movieDetails);
      console.log(cursor);
      if (movieDetails) {
        await updateMovieMetadata(
          movie,
          movieDetails.adult,
          movieDetails.popularity,
        );
      }
    }
    console.log("e:" + nextCursor);

    cursor = nextCursor;
  } while (cursor);

  console.log("Completed updating metadata for all movies.");
})();
