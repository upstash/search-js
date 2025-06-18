require("dotenv").config();
const axios = require("axios");
const { z } = require("zod");
const { performance } = require("perf_hooks");
const { Index: Parse_movies } = require("@upstash/vector");

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const LLM_API_TOKEN = process.env.LLM_API_TOKEN;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const LLM_API_URL = "https://qstash.upstash.io/llm/v1/chat/completions";
const UPSTASH_URL = process.env.UPSTASH_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_TOKEN;

// Initialize Upstash vector index
const index = new Parse_movies({
  url: UPSTASH_URL,
  token: UPSTASH_TOKEN,
});

// Variable to switch between models
const LLM_MODEL = process.env.LLM_MODEL || "mistralai/Mistral-7B-Instruct-v0.2";

// Schema for validating the LLM response
const LLMResponseSchema = z.object({
  summary: z.string(),
  keywords: z.array(z.string()),
  abstract: z.string(),
});

// Function to fetch all movies for a specific year from TMDB
async function fetchMoviesByYear(year, page = 1) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        language: "en-US",
        sort_by: "popularity.desc",
        year: year,
        page: page,
      },
    });

    const movies = response.data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      poster_path: movie.poster_path,
      overview: movie.overview,
      genre_ids: movie.genre_ids,
    }));
    return { movies, total_pages: response.data.total_pages };
  } catch (error) {
    console.error(`Error fetching movies for year ${year}:`, error);
    return { movies: [], total_pages: 0 };
  }
}

// Function to fetch genres from TMDB
async function fetchGenres() {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
      params: {
        api_key: TMDB_API_KEY,
        language: "en-US",
      },
    });

    const genres = response.data.genres;
    return genres.reduce((acc, genre) => {
      acc[genre.id] = genre.name;
      return acc;
    }, {});
  } catch (error) {
    console.error("Error fetching genres:", error);
    return {};
  }
}

// Function to fetch acting credits and director for a movie
async function fetchCredits(movieId) {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/${movieId}/credits`,
      {
        params: {
          api_key: TMDB_API_KEY,
        },
      },
    );

    const cast = response.data.cast.slice(0, 5).map((actor) => ({
      name: actor.name,
      character: actor.character,
    }));

    const director = response.data.crew.find(
      (crewMember) => crewMember.job === "Director",
    );

    return {
      cast,
      director: director ? director.name : "Director not available",
    };
  } catch (error) {
    console.error(`Error fetching credits for movie ID ${movieId}:`, error);
    return { cast: [], director: "Director not available" };
  }
}

// Function to get a summary, keywords, and abstract of the movie using LLM API
async function getMovieSummaryKeywordsAndAbstract(movie) {
  const prompt = `Provide a JSON object with the following structure:
{
  "summary": "string",
  "keywords": ["string"],
  "abstract": "string"
}.
Summarize the movie: ${movie.title} - ${movie.overview}. Limit the response to 1500 characters. Also, provide 5 keywords about the movie, separated by commas. Finally, give a single-sentence abstract of what the movie is about. Return only the JSON object.`;

  try {
    const response = await axios.post(
      LLM_API_URL,
      {
        model: LLM_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${LLM_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    const content = response.data.choices[0].message.content.trim();
    const jsonResponseStart = content.indexOf("{");
    const jsonResponseEnd = content.lastIndexOf("}") + 1;

    if (jsonResponseStart === -1 || jsonResponseEnd === -1) {
      throw new Error("Invalid JSON response");
    }

    const jsonResponse = content.substring(jsonResponseStart, jsonResponseEnd);
    const parsed = JSON.parse(jsonResponse);

    const validation = LLMResponseSchema.safeParse(parsed);
    if (!validation.success) {
      console.error("Validation error:", validation.error);
      return {
        summary: "Summary not available",
        keywords: [],
        abstract: "Abstract not available",
      };
    }

    return validation.data;
  } catch (error) {
    console.error(
      "Error fetching movie summary, keywords, and abstract:",
      error,
    );
    return {
      summary: "Summary not available",
      keywords: [],
      abstract: "Abstract not available",
    };
  }
}

// Function to fetch IMDb link using TMDB API
async function fetchImdbLink(movieId) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        append_to_response: "external_ids",
      },
    });

    const imdbId = response.data.external_ids?.imdb_id;
    return imdbId
      ? `https://www.imdb.com/title/${imdbId}/`
      : "IMDb link not available";
  } catch (error) {
    console.error(`Error fetching IMDb link for movie ID ${movieId}:`, error);
    return "IMDb link not available";
  }
}

// Function to check if a movie already exists in Upstash
async function movieExists(movieId) {
  try {
    const response = await index.fetch([`movie:${movieId}`]);
    return response[0] !== null;
  } catch (error) {
    console.error(`Error checking existence of movie ${movieId}:`, error);
    return false;
  }
}

// Function to insert data into Upstash vector
async function insertIntoUpstash(
  movie,
  summaryData,
  credits,
  genres,
  imdbLink,
) {
  try {
    const data = {
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      poster_path: movie.poster_path,
      overview: movie.overview,
      genres: movie.genre_ids.map((id) => genres[id]).join(", "),
      director: credits.director,
      cast: credits.cast
        .map((actor) => `${actor.name} as ${actor.character}`)
        .join(", "),
      summary: summaryData.summary,
      keywords: summaryData.keywords.join(", "),
      abstract: summaryData.abstract,
    };

    const metadata = {
      movie_id: movie.id,
      name: movie.title,
      release_year: movie.release_date.split("-")[0],
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      imdb_link: imdbLink,
      poster_link: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
    };

    await index.upsert({
      id: `movie:${movie.id}`,
      data: JSON.stringify(data),
      metadata: metadata,
    });

    console.log(`Inserted movie ${movie.title} into Upstash`);
  } catch (error) {
    console.error(`Error inserting movie ${movie.title} into Upstash:`, error);
  }
}

// Sleep function to wait for a specified number of milliseconds
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Main function
(async function () {
  const startTime = performance.now();

  const genres = await fetchGenres();
  const startYear = 2020; // Start year for fetching movies
  const endYear = new Date().getFullYear(); // End year for fetching movies

  for (let year = startYear; year <= endYear; year++) {
    let currentPage = 226;
    let totalPages = currentPage;

    while (currentPage <= totalPages) {
      const { movies, total_pages } = await fetchMoviesByYear(
        year,
        currentPage,
      );
      totalPages = total_pages;

      if (movies.length > 0) {
        console.log(
          `Processing year ${year}, page ${currentPage} of ${totalPages}`,
        );
        for (const movie of movies) {
          const exists = await movieExists(movie.id);
          if (exists) {
            console.log(
              `Movie ${movie.title} already exists in Upstash. Skipping...`,
            );
            continue;
          }

          const summaryData = await getMovieSummaryKeywordsAndAbstract(movie);
          const credits = await fetchCredits(movie.id);
          const imdbLink = await fetchImdbLink(movie.id);
          await insertIntoUpstash(
            movie,
            summaryData,
            credits,
            genres,
            imdbLink,
          );

          console.log(`Page: ${currentPage}, Year: ${year}`);
          console.log(`Title: ${movie.title}`);
          console.log(`Release Date: ${movie.release_date}`);
          console.log(`Rating: ${movie.vote_average}`);
          console.log(`Vote Count: ${movie.vote_count}`);
          console.log(
            `Poster Path: https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          );
          console.log(`Overview: ${movie.overview}`);
          console.log(
            `Genres: ${movie.genre_ids.map((id) => genres[id]).join(", ")}`,
          );
          console.log(`Director: ${credits.director}`);
          console.log(`Summary: ${summaryData.summary}`);
          console.log(`Keywords: ${summaryData.keywords.join(", ")}`);
          console.log(`Abstract: ${summaryData.abstract}`);
          console.log(`IMDb Link: ${imdbLink}`);
          console.log("Top 5 Acting Credits:");
          credits.cast.forEach((actor, index) => {
            console.log(`${index + 1}. ${actor.name} as ${actor.character}`);
          });
          console.log("---");
        }
      } else {
        console.log(`No movies found for year ${year}, page ${currentPage}.`);
      }

      currentPage++;
      await sleep(1); // Sleep for 1 second to avoid rate limiting
    }
  }

  const endTime = performance.now();
  console.log(
    `Total process time: ${(endTime - startTime).toFixed(2)} milliseconds`,
  );
})();
