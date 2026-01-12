import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";
import { dateToInt } from "@/lib/dateUtils";
import { SearchAPIResponse } from "@/lib/types";
import { INDEX_NAME, SCHEMA } from "@/lib/constants";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});


// Access the search index
const index = redis.search.index(INDEX_NAME, SCHEMA);

export async function POST(request: NextRequest) {
  try {
    const { query, dateFrom, dateUntil, contentType } = await request.json();

    if (!query) {
      return Response.json({ error: "Query is required" }, { status: 400 });
    }

    const fromInt = dateFrom ? dateToInt(new Date(dateFrom)) : undefined;
    const untilInt = dateUntil ? dateToInt(new Date(dateUntil)) : undefined;

    const tokens = (query as string).split(/\s+/);

    const filter = {
      $should: [
        ...tokens.flatMap((token) => ([
          { title: { $eq: token, $boost: 10 } },
          { title: { $fuzzy: { value: token, distance: 2, transpositionCostOne: true }, $boost: 5 } },
          { title: { $fuzzy: { value: token, distance: 1 }, $boost: 1 } },
          { title: { $regex: `${token}.*`, $boost: 5 } },
        ])),
        ...(tokens.length > 1 ? [
          { title: { $phrase: query, $boost: 20 } },
          { title: { $phrase: { value: query, slop: 3 }, $boost: 10 } },
        ] : [])
      ]
    }
    
    console.log(JSON.stringify(filter, null, 2));

    const searchResults = await index.query({
      filter,
      limit: 20,
    });

    // Map results to match expected format
    const mappedResults = searchResults.map((result) => ({
      id: result.key,
      key: result.key,
      content: {
        content: {
          title: result.data.title,
          content: result.data.content,
          authors: result.data.authors
        },
        metadata: {
          dateInt: result.data.dateInt,
          url: result.data.url,
          updated: result.data.updated,
          kind: result.data.kind as "blog" | "changelog",
        }
      },
    }));

    return Response.json({
      results: mappedResults,
      query,
      filters: {
        dateFrom,
        dateUntil,
        contentType,
      },
    } satisfies SearchAPIResponse);
  } catch (error) {
    console.error("Search error:", error);
    return Response.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
