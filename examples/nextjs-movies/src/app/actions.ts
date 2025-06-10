"use server"

import { Search } from '@upstash/search';
import { BATCH_SIZE, INDEX_NAME } from './constants';
import movies from './movies.json';
import { Dataset, IndexContent, IndexMetadata } from '@/types';

const client = new Search({
  url: process.env.UPSTASH_SEARCH_REST_URL!,
  token: process.env.UPSTASH_SEARCH_REST_TOKEN!,
});



const index = client.index<IndexContent, IndexMetadata>(INDEX_NAME);

export async function fetchMovie(movie_id: string) {
  const response = await index.fetch({ ids: [movie_id] })

  const movie = response[0];

  if (!movie) {
    throw new Error(`Movie with ID ${movie_id} not found`);
  }

  return movie
}

export async function fetchSimilarMovies(options: { query: string, reranking: boolean, limit: number, filter?: string}) {
  const { query, reranking, limit, filter } = options;
  const response = await index.search({
    query,
    limit,
    filter,
    reranking,
  });

  return response
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