"use client";

import { ResultCode } from "@/lib/types";
import SearchForm from "@/components/search-form";
import ResultData from "@/components/result-data";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMovies } from "@/app/actions";
import { Info } from "@/components/info";

export default function Page() {
  const [query, setQuery] = useState<string>("");

  const state = useQuery({
    queryKey: ["movies", query],
    queryFn: async () => await getMovies(query),
    initialData: {
      movies: [],
      code: ResultCode.Empty,
    },
    enabled: false,
  });

  const onChangeQuery = (q: string) => {
    setQuery(q);
  };

  const onSubmit = () => {
    return state.refetch();
  };

  return (
    <div className="max-w-screen-xl mx-auto px-8 py-12 text-center">
      <header>
        <h1
          onClick={() => onChangeQuery("")}
          className="cursor-pointer text-3xl md:text-5xl tracking-tight font-bold text-indigo-900"
        >
          Movies Semantic Search
        </h1>
      </header>

      <div className="mt-10">
        <SearchForm
          state={state}
          query={query}
          onChangeQuery={onChangeQuery}
          onSubmit={onSubmit}
        />
      </div>

      <div className="mt-10">
        <ResultData
          state={state}
          onChangeQuery={onChangeQuery}
          onSubmit={onSubmit}
        />
      </div>

      <Info className="mt-20" />
    </div>
  );
}
