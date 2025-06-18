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

// Function to fetch tvSeries details from TMDB
async function fetchTvSeriesDetails(mtvSeriesId) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/tv/${mtvSeriesId}`, {
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
      `Error fetching series details for series ID ${mseriesId}:`,
      error,
    );
    return null;
  }
}

// Function to update series metadata in Upstash
async function updateTvSeriesMetadata(series, adult, popularity) {
  try {
    const updatedMetadata = {
      ...series.metadata,
      adult: adult,
      popularity: popularity,
    };

    await index.update({
      id: series.id,
      metadata: updatedMetadata,
    });

    console.log(
      `Updated series ${series.metadata.name} with adult field in Upstash`,
    );
  } catch (error) {
    console.log(series);
    console.error(
      `Error updating series ${series.metadata.name} in Upstash:`,
      error,
    );
  }
}

// Main function
(async function () {

  while (true) {
    const response = await index.query({
      data: "series about an adventure of a hobbit in a fantasy world.",
      includeVectors: false,
      includeMetadata: true,
      topK: 10,
      filter: "popularity = 0",
    });

    console.log(response);

    if (!response || response.length == 0) break;

    for (const series of response) {
      const mseriesId = series.id;

      const tmdbTvSeriesId = mseriesId.substring(mseriesId.indexOf(":") + 1);
      const mseriesDetails = await fetchTvSeriesDetails(tmdbTvSeriesId);
      console.log(mseriesDetails);
      if (mseriesDetails) {
        await updateTvSeriesMetadata(
          series,
          mseriesDetails.adult,
          mseriesDetails.popularity,
        );
      }
    }

  } 

  console.log("Completed updating metadata for all mseriess.");
})();
