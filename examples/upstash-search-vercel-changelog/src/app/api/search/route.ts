import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";
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

    const tokens = (query as string).split(/\s+/);

    const mustFilter = [
      ...(dateFrom ? [{ updated: { $gte: dateFrom as string } }] : []),
      ...(dateUntil ? [{ updated: { $lte: dateUntil as string } }] : []),
      ...(contentType && contentType !== "all"
        ? [{ kind: { $eq: contentType } }]
        : []),
    ]

    const shouldFilter = [
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
    
    const filter = {
      $must: mustFilter.length ? mustFilter : undefined,
      $should: shouldFilter,
    }

    const searchResults = await index.query({
      // @ts-expect-error – typing issue with Upstash SDK
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
