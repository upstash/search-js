"use client"

import { useEffect, useState } from 'react';
import { Card, Spin } from 'antd';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { fetchMovie, fetchSimilarMovies } from '../../actions';

export default function MoviePage() {
  const { movie_id } = useParams<{ movie_id: string }>();
  const searchParams = useSearchParams();
  const reranking = searchParams.get("reranking") === "true";
  const decodedMovieId = decodeURIComponent(movie_id);

  return (
    <main className="min-h-screen bg-emerald-50 flex flex-col items-center py-10">
      <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
        <MovieDetailsWithSimilarMovies movie_id={decodedMovieId} reranking={reranking} />
      </div>
    </main>
  );
}

function MovieDetailsWithSimilarMovies({ movie_id, reranking }: { movie_id: string; reranking: boolean }) {
  const [movieDetails, setMovieDetails] = useState<Awaited<ReturnType<typeof fetchMovie>> | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      const details = await fetchMovie(movie_id);
      setMovieDetails(details);
    };
    void fetchDetails();
  }, [movie_id]);

  return (
    <>
      {!movieDetails ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      ) : (
        <div className="mb-6">
          <header className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-emerald-800 mb-4">{movieDetails.content.title}</h1>
          </header>
          <div className="flex gap-6">
            <Image
              src={movieDetails.metadata.poster_link}
              alt={movieDetails.metadata.name}
              width={300}
              height={450}
              className="rounded-md"
            />
            <div className="flex-1">
              <p className="text-emerald-600 mb-4">{movieDetails.content.overview}</p>
              {movieDetails.content.release_date && (
                <p className="text-sm text-gray-600 mb-4">Release Date: {movieDetails.content.release_date}</p>
              )}
              <button
                onClick={() => window.open(movieDetails.metadata.imdb_link, '_blank')}
                className="bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600"
              >
                View on IMDb
              </button>
            </div>
          </div>
        </div>
      )}
      <SimilarMoviesComponent movie={movieDetails} reranking={reranking} />
    </>
  );
}

function SimilarMoviesComponent({ movie, reranking }: { movie: Awaited<ReturnType<typeof fetchMovie>> | null; reranking: boolean }) {
  const [similarMovies, setSimilarMovies] = useState<Awaited<ReturnType<typeof fetchSimilarMovies>>>([]);

  useEffect(() => {
    if (movie) {
      const fetchSimilar = async () => {
        const query = `${movie.content.title} - ${movie.content.overview}`;
        const results = await fetchSimilarMovies({ query, reranking, limit: 6 });
        setSimilarMovies(results);
      };
      void fetchSimilar();
    }
  }, [movie, reranking]);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-emerald-800 mb-4">Similar Movies</h2>
      {!similarMovies.length ? (
        <div className="flex justify-center items-center h-48">
          <Spin size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {similarMovies.map((movie) => (
            movie.metadata && (
              <Card
                key={movie.id}
                title={movie.metadata.name}
                cover={<Image alt={movie.metadata.name} src={movie.metadata.poster_link} width={200} height={300} className="rounded-md" />}
              >
                {movie.metadata.release_year && (
                  <p className="text-sm">Release Year: {movie.metadata.release_year}</p>
                )}
              </Card>
            )
          ))}
        </div>
      )}
    </div>
  );
}
