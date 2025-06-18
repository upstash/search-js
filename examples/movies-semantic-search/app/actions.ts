"use server";

import { Index } from "@upstash/vector";
import { z } from "zod";
import { MovieMetadata, Result, ResultCode } from "@/lib/types";
import { normalize } from "@/lib/utils";

const index = new Index<MovieMetadata>({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

export async function getMovies(query: string): Promise<Result | undefined> {
  try {
    const parsedCredentials = z
      .object({
        query: z.string().min(2),
      })
      .safeParse({
        query,
      });

    if (parsedCredentials.error) {
      return {
        code: ResultCode.MinLengthError,
        movies: [],
      };
    }

    const response = await index.query<MovieMetadata>({
      data: query as string,
      topK: 50,
      includeVectors: false,
      includeMetadata: true,
    });

    if (!response || !Array.isArray(response)) {
      console.error("Unexpected response structure:", response);
      return {
        code: ResultCode.UnknownError,
        movies: [],
      };
    }

    const filteredResponse = response.filter(
      (movie) =>
        movie.metadata?.poster_link !== null &&
        !movie.metadata?.poster_link.endsWith("null") &&
        movie.metadata?.imdb_link !== "IMDb link not available",
    );

    // Extract vote counts and ratings for normalization
    const popularity = filteredResponse.map(
      (movie) => movie.metadata?.popularity ?? 0,
    );
    const ratings = filteredResponse.map(
      (movie) => movie.metadata?.vote_average ?? 0,
    );

    const minPopularity = Math.min(...popularity);
    const maxPopularity = Math.max(...popularity);
    const minRating = Math.min(...ratings);
    const maxRating = Math.max(...ratings);

    const movies = filteredResponse.map((match) => {
      const normalizedPopularity = normalize(
        match.metadata?.popularity ?? 0,
        minPopularity,
        maxPopularity,
      );

      const normalizedRating = normalize(
        match.metadata?.vote_average ?? 0,
        minRating,
        maxRating,
      );

      const relevance = match.score; // Assuming this is already normalized between 0 and 1

      const total =
        0.5 * normalizedPopularity + 0.2 * normalizedRating + 0.3 * relevance;
      return {
        ...match,
        total,
      };
    });

    movies.sort((a, b) => b.total - a.total);

    return {
      code: ResultCode.Success,
      movies: movies,
    };
  } catch (error) {
    console.error("Error querying Upstash:", error);
    return {
      code: ResultCode.UnknownError,
      movies: [],
    };
  }
}
