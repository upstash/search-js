import { cn } from "@/lib/utils";
import type { DefinedUseQueryResult } from "@tanstack/react-query";
import { Result } from "@/lib/types";

export default function SearchForm({
  state,
  query,
  onChangeQuery = () => {},
  onSubmit = () => {},
}: {
  state: DefinedUseQueryResult<Result | undefined, Error>;
  query: string;
  onChangeQuery: (q: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="flex flex-col sm:flex-row max-w-screen-md mx-auto items-center rounded-xl gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        return onSubmit();
      }}
    >
      <input
        type="search"
        name="query"
        value={query}
        onChange={(e) => onChangeQuery(e.target.value)}
        placeholder="Search for a movie..."
        className="grow w-full sm:w-auto h-12 rounded-lg border border-indigo-300 px-4 text-xl"
        disabled={state.isFetching}
      />
      <button
        type="submit"
        className={cn(
          "h-12 w-full sm:w-auto text-xl px-4 bg-indigo-900 text-indigo-50 rounded-lg",
          state.isFetching && "opacity-50",
        )}
        disabled={state.isFetching}
      >
        Search
      </button>
    </form>
  );
}
