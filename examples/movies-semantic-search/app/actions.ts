"use server"

import { z } from "zod";
import { Search } from '@upstash/search';
import movies from './movies.json';
import { ResultCode, Dataset, IndexContent, IndexMetadata, Result } from '@/lib/types';
import { BATCH_SIZE, INDEX_NAME } from "@/lib/constants";

const client = new Search({
  url: process.env.UPSTASH_SEARCH_REST_URL!,
  token: process.env.UPSTASH_SEARCH_REST_TOKEN!,
});

const index = client.index<IndexContent, IndexMetadata>(INDEX_NAME);

const rerankingEnabled = process.env.RERANKING_ENABLED === 'true';

export async function fetchMovie(movie_id: string) {
  const response = await index.fetch({ ids: [movie_id] })

  const movie = response[0];

  if (!movie) {
    throw new Error(`Movie with ID ${movie_id} not found`);
  }

  return movie
}

export async function fetchSimilarMovies(options: { query: string, limit: number, filter?: string }): Promise<Result> {
  const { query, limit, filter } = options;

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

    const response = await index.search({
      query,
      limit,
      filter,
      reranking: rerankingEnabled,
    });

    return {
      code: ResultCode.Success,
      movies: response as Result['movies'],
    };
  } catch (error) {
    return {
      code: ResultCode.UnknownError,
      movies: [],
    };
  }
}



export async function upsertData() {
  const dataset = movies as Dataset;

  for (let index_ = 0; index_ < dataset.length; index_ += BATCH_SIZE) {
    const batch = dataset.slice(index_, index_ + BATCH_SIZE).map((data) => {
      const { data: content, ...rest } = data;
      return {
        ...rest,
        content,
      };
    });

    await fetch(
      `${process.env.UPSTASH_SEARCH_REST_URL}/upsert/${INDEX_NAME}`,
      {
        headers: {
          authorization: `Bearer ${process.env.UPSTASH_SEARCH_REST_TOKEN}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(batch),
        method: 'POST',
        keepalive: false,
      }
    );
  }
}