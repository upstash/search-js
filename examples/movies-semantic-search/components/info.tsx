import React from "react";
import { cn } from "@/lib/utils";

export const Info = ({ className }: React.ComponentProps<"div">) => {
  return (
    <div
      className={cn(
        "rounded-2xl grid gap-4 max-w-2xl mx-auto text-sm bg-indigo-900 text-indigo-50 p-4 sm:p-6",
        className,
      )}
    >
      <p>
        This project is an experiment to demonstrate the search quality of
        Upstash Vector using the TMDB movie dataset. We vectorized{" "}
        <b>71,673 TMDB movies</b> into a single Upstash Vector index and
        searched them across multiple dimensions, including title, abstract, and
        cast.
      </p>

      <p>
        <b>
          👉 Check out the{" "}
          <a
            className="underline"
            target="_blank"
            href="https://github.com/upstash/movies-semantic-search"
          >
            Github Repo
          </a>
        </b>
      </p>
    </div>
  );
};
