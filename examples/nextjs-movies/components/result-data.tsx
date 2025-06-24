import { Result, ResultCode } from "@/lib/types";
import KeyValue from "@/components/tag";
import type { DefinedUseQueryResult } from "@tanstack/react-query";

export default function ResultData({
  state,
  onChangeQuery = () => { },
  onSubmit = () => { },
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
              onChangeQuery("an epic space adventure");
              setTimeout(() => onSubmit(), 100);
            }}
          >
            an epic space adventure
          </button>
        </li>

        <li>
          <h4 className="opacity-60">
            Find movies by plot, characters, or themes...
          </h4>
          <button
            className="underline font-bold"
            onClick={() => {
              onChangeQuery("a crime saga about a powerful mafia family");
              setTimeout(() => onSubmit(), 100);
            }}
          >
            a crime saga about a powerful mafia family
          </button>
        </li>

        <li>
          <h4 className="opacity-60 font-bold">
            Type a movie’s storyline, genre, or cast...
          </h4>
          <button
            className="underline font-bold"
            onClick={() => {
              onChangeQuery("a sci-fi film where reality is questioned by a computer hacker");
              setTimeout(() => onSubmit(), 100);
            }}
          >
            a sci-fi film where reality is questioned by a computer hacker
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
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
