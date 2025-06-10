"use client"

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Spin } from "antd";
import { fetchSimilarMovies } from "@/app/actions";
import { Card } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";


export default function Home() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const reranking = searchParams.get("reranking") === "true";

  return (
    <main className="min-h-screen bg-emerald-50 flex flex-col items-center py-10">
      <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
        {query ? (
          <SearchResultsComponent query={query} reranking={reranking} />
        ) : (
          <IntroSection />
        )}
      </div>
    </main>
  );
}

function IntroSection() {
  const router = useRouter();

  const exampleQueries = ["Star Wars", "Godfather", "Matrix"];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-emerald-800 mb-4">Welcome to the Movies Search App</h2>
        <p className="text-gray-700 mb-2">
          This app is powered by Upstash Search and allows you to upsert a movies dataset to your database and perform AI-powered searches on it.
        </p>
        <p className="text-gray-700 mb-4">
          Click the Upsert Data button to add movies to your database, and search for your favourite movie in the search bar to get started.
        </p>
        <p className="text-sm text-gray-500">
          Note: The &quot;Upsert Data&quot; button is only visible when running the application in a localhost environment.
        </p>
      </div>

      <div className="p-6 border border-emerald-200 rounded-lg bg-emerald-50">
        <h3 className="text-2xl font-semibold text-emerald-800 mb-3">About Upstash Search</h3>
        <p className="text-gray-700 mb-4">
          Upstash Search is a lightweight, AI-powered search solution for developers. It combines full-text and semantic search for fast, relevant results with zero infrastructure to manage.
        </p>
        <div className="flex gap-x-6 gap-y-2 flex-wrap">
          <a
            href="https://upstash.com/docs/search/overall/getstarted"
            target="_blank"
            className="text-emerald-600 underline hover:text-emerald-800"
          >
            Get Started
          </a>
          <a
            href="https://upstash.com/pricing/search"
            target="_blank"
            className="text-emerald-600 underline hover:text-emerald-800"
          >
            Pricing
          </a>
          <a
            href="https://github.com/upstash/search-js"
            target="_blank"
            className="text-emerald-600 underline hover:text-emerald-800"
          >
            GitHub
          </a>
          <a
            href="https://upstash.com/docs/search/tutorials/nextjs"
            target="_blank"
            className="text-emerald-600 underline hover:text-emerald-800"
          >
            Tutorials
          </a>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-semibold text-emerald-800 mb-3">Example Queries</h3>
        <div className="flex gap-x-4 gap-y-2 flex-wrap">
          {exampleQueries.map((query) => (
            <span
              key={query}
              className="text-emerald-600 underline cursor-pointer hover:text-emerald-800"
              onClick={() => {
                router.push(`/?query=${encodeURIComponent(query)}`)
              }}
            >
              {query}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SearchResultsComponent({ query, reranking }: { query: string, reranking: boolean }) {
  const router = useRouter();
  const [similarMovies, setSimilarMovies] = useState<Awaited<ReturnType<typeof fetchSimilarMovies>>>([]);

  useEffect(() => {
    const updateSimilarMovies = async () => {
      const results = await fetchSimilarMovies({ query, limit: 15, reranking });
      setSimilarMovies(results);
    };
    void updateSimilarMovies();
  }, [query, reranking]);

  return similarMovies.length === 0 ? (
    <div className="flex justify-center items-center h-48">
      <Spin size="large" />
    </div>
  ) : (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {similarMovies.map((result) =>
        result.metadata ? (
          <Card
            key={result.id}
            title={result.metadata.name}
            cover={
              <Image
                alt={result.metadata.name}
                src={result.metadata.poster_link}
                width={200}
                height={300}
                className="rounded-md"
              />
            }
            onClick={() => router.push(`/movie/${result.id}`)}
            className="cursor-pointer"
          >
            <p className="text-sm">Release Year: {result.metadata.release_year}</p>
          </Card>
        ) : null
      )}
    </div>
  );
}
