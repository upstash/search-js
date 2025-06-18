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
        Upstash Search using a movie dataset. With this app, you can upsert
        a dataset to your search database and search for movies them across
        multiple dimensions.
      </p>

      <p>
        <b>
          👉 Check out the{" "}
          <a
            className="underline"
            target="_blank"
            href="https://github.com/upstash/search-js/tree/main/examples/nextjs-movies"
          >
            Github Repo
          </a>
        </b>
      </p>
    </div>
  );
};
