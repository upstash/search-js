import { Result, ResultCode } from "@/lib/types";
import KeyValue from "@/components/tag";
import type { DefinedUseQueryResult } from "@tanstack/react-query";

export default function ResultData({
  state,
  onChangeQuery = () => {},
  onSubmit = () => {},
}: {
  state: DefinedUseQueryResult<Result | undefined, Error>;
  onChangeQuery: (q: string) => void;
  onSubmit: () => void;
}) {
  if (state.isFetching) {
    return <div>Loading...</div>;
  }

  if (state.data?.code === ResultCode.UnknownError) {
    return (
      <div className="text-red-600">
        <h3>An error occurred, please try again.</h3>
      </div>
    );
  }

  if (state.data?.code === ResultCode.MinLengthError) {
    return (
      <div className="text-red-600">
        <h3>
          Please enter at least 2 characters to start searching for movies.
        </h3>
      </div>
    );
  }

  if (state.data?.code === ResultCode.Empty) {
    return (
      <ol className="grid gap-6 text-lg">
        <li>
          <h4 className="opacity-60">
            Search movies by title, genre, or description...
          </h4>
          <button
            className="underline font-bold"
            onClick={() => {
              onChangeQuery("a mafia movie in 1940s New York");
              setTimeout(() => onSubmit(), 100);
            }}
          >
            a mafia movie in 1940s New York
          </button>
        </li>

        <li>
          <h4 className="opacity-60">
            Find movies by plot, characters, or themes...
          </h4>
          <button
            className="underline font-bold"
            onClick={() => {
              onChangeQuery("a movie where a detective solves a mystery");
              setTimeout(() => onSubmit(), 100);
            }}
          >
            a movie where a detective solves a mystery
          </button>
        </li>

        <li>
          <h4 className="opacity-60 font-bold">
            Type a movie’s storyline, genre, or cast...
          </h4>
          <button
            className="underline font-bold"
            onClick={() => {
              onChangeQuery("a fantasy film with dragons");
              setTimeout(() => onSubmit(), 100);
            }}
          >
            a fantasy film with dragons
          </button>
        </li>
      </ol>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 md:gap-8">
      {state.data?.movies.map((movie) => (
        <a
          key={movie.metadata?.movie_id}
          className="hover:shadow-2xl hover:border-gray-500 transition bg-white border border-gray-200 rounded-2xl overflow-hidden"
          href={movie.metadata?.imdb_link || ""}
          target="_blank"
        >
          <img
            src={movie.metadata?.poster_link || ""}
            alt={movie.metadata?.name || ""}
            width={180}
            height={270}
            className="w-full object-cover object-top"
          />

          <div className="p-4">
            <h3 className="font-bold text-xl">{movie.metadata?.name}</h3>

            <div className="mt-4 flex justify-center flex-wrap gap-1.5 text-sm">
              <KeyValue label="Release" value={movie.metadata?.release_year!} />
              <KeyValue label="Rating" value={movie.metadata?.vote_average!} />
              <KeyValue
                label="Popularity"
                value={movie.metadata?.popularity!}
              />
              <KeyValue label="Relevance" value={movie.score.toFixed(2)} />
              <KeyValue label="Score" value={movie.total.toFixed(2)} />
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
