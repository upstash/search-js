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

    // Build filter object using the new query API
    const filterConditions: Record<string, any>[] = [
      { "content.title": { $eq: query } },
    ];

    // Add date range filters
    if (fromInt !== undefined) {
      filterConditions.push({ "metadata.dateInt": { $gte: fromInt } });
    }
    if (untilInt !== undefined) {
      filterConditions.push({ "metadata.dateInt": { $lte: untilInt } });
    }

    // Add content type filter
    if (contentType && contentType !== "all") {
      filterConditions.push({ "metadata.kind": { $eq: contentType } });
    }

  const searchResults = await index.query({
    filter: filterConditions.length > 1 ? { $and: filterConditions } : filterConditions[0],
    limit: 20,
  });

    // Map results to match expected format
    const mappedResults = searchResults.map((result) => ({
      id: result.key,
      key: result.key,
      content: result.data as any,
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
