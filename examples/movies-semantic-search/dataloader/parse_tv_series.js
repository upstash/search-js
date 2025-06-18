require("dotenv").config();
const axios = require("axios");
const { z } = require("zod");
const { performance } = require("perf_hooks");
const { Index } = require("@upstash/vector");

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const LLM_API_TOKEN = process.env.LLM_API_TOKEN;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const LLM_API_URL = "https://qstash.upstash.io/llm/v1/chat/completions";
const UPSTASH_URL = process.env.UPSTASH_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_TOKEN;

// Initialize Upstash vector index
const index = new Index({
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

// Function to fetch top-rated TV series from TMDB
async function fetchTopRatedTvSeries(page = 1) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/tv/top_rated`, {
      params: {
        api_key: TMDB_API_KEY,
        language: "en-US",
        page: page,
      },
    });

    const series = response.data.results.map((show) => ({
      id: show.id,
      name: show.name,
      first_air_date: show.first_air_date,
      vote_average: show.vote_average,
      vote_count: show.vote_count,
      poster_path: show.poster_path,
      overview: show.overview,
    }));
    return { series, total_pages: response.data.total_pages };
  } catch (error) {
    console.error("Error fetching top-rated TV series:", error);
    return { series: [], total_pages: 0 };
  }
}

// Function to fetch TV series details from TMDB
async function fetchTvSeriesDetails(tvId) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/tv/${tvId}`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });

    return {
      popularity: response.data.popularity,
      genres: response.data.genres.map((genre) => genre.name).join(", "),
    };
  } catch (error) {
    console.error(`Error fetching TV series details for ID ${tvId}:`, error);
    return null;
  }
}

// Function to fetch acting credits for a TV series
async function fetchCredits(tvId) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/tv/${tvId}/credits`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });

    const cast = response.data.cast.slice(0, 5).map((actor) => ({
      name: actor.name,
      character: actor.character,
    }));

    return { cast };
  } catch (error) {
    console.error(`Error fetching credits for TV ID ${tvId}:`, error);
    return { cast: [] };
  }
}

// Function to fetch IMDb link using TMDB API
async function fetchImdbLink(tvId) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/tv/${tvId}`, {
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
    console.error(`Error fetching IMDb link for TV ID ${tvId}:`, error);
    return "IMDb link not available";
  }
}

// Function to get a summary, keywords, and abstract of the TV series using LLM API
async function getTvSeriesSummaryKeywordsAndAbstract(series) {
  const prompt = `Provide a JSON object with the following structure:
{
  "summary": "string",
  "keywords": ["string"],
  "abstract": "string"
}.
Summarize the TV series: ${series.name} - ${series.overview}. Limit the response to 1500 characters. Also, provide 5 keywords about the series, separated by commas. Finally, give a single-sentence abstract of what the series is about. Return only the JSON object.`;

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
      "Error fetching TV series summary, keywords, and abstract:",
      error,
    );
    return {
      summary: "Summary not available",
      keywords: [],
      abstract: "Abstract not available",
    };
  }
}

// Function to insert data into Upstash vector
async function insertIntoUpstash(
  series,
  summaryData,
  credits,
  genres,
  imdbLink,
) {
  try {
    const data = {
      id: series.id,
      name: series.name,
      first_air_date: series.first_air_date,
      vote_average: series.vote_average,
      vote_count: series.vote_count,
      poster_path: series.poster_path,
      overview: series.overview,
      genres: genres,
      cast: credits.cast
        .map((actor) => `${actor.name} as ${actor.character}`)
        .join(", "),
      summary: summaryData.summary,
      keywords: summaryData.keywords.join(", "),
      abstract: summaryData.abstract,
    };

    const metadata = {
      series_id: series.id,
      name: series.name,
      first_air_year: series.first_air_date.split("-")[0],
      vote_average: series.vote_average,
      vote_count: series.vote_count,
      imdb_link: imdbLink,
      poster_link: `https://image.tmdb.org/t/p/w500${series.poster_path}`,
      popularity: series.popularity,
    };

    await index.upsert({
      id: `tv:${series.id}`,
      data: JSON.stringify(data),
      metadata: metadata,
    });

    console.log(`Inserted TV series ${series.name} into Upstash`);
    console.log(`Popularity: ${series.popularity}`);
  } catch (error) {
    console.error(
      `Error inserting TV series ${series.name} into Upstash:`,
      error,
    );
  }
}

// Main function
(async function () {
  const startTime = performance.now();
  let currentPage = 1;
  let totalPages = 1;

  do {
    const { series, total_pages } = await fetchTopRatedTvSeries(currentPage);
    totalPages = total_pages;

    if (series.length > 0) {
      console.log(`Processing page ${currentPage} of ${totalPages}`);
      for (const show of series) {
        const showDetails = await fetchTvSeriesDetails(show.id);
        const imdbLink = await fetchImdbLink(show.id);
        const credits = await fetchCredits(show.id);
        const summaryData = await getTvSeriesSummaryKeywordsAndAbstract(show);
        if (showDetails && credits && summaryData) {
          await insertIntoUpstash(
            show,
            summaryData,
            credits,
            showDetails.genres,
            imdbLink,
          );

          console.log(`Page: ${currentPage}`);
          console.log(`Name: ${show.name}`);
          console.log(`First Air Date: ${show.first_air_date}`);
          console.log(`Rating: ${show.vote_average}`);
          console.log(`Vote Count: ${show.vote_count}`);
          console.log(
            `Poster Path: https://image.tmdb.org/t/p/w500${show.poster_path}`,
          );
          console.log(`Overview: ${show.overview}`);
          console.log(`Genres: ${showDetails.genres}`);
          console.log(`Popularity: ${showDetails.popularity}`);
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
      }
    } else {
      console.log("No TV series found on this page.");
    }

    currentPage++;
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Sleep for 1 second to avoid rate limiting
  } while (currentPage <= totalPages);

  const endTime = performance.now();
  console.log(
    `Total process time: ${(endTime - startTime).toFixed(2)} milliseconds`,
  );
})();
