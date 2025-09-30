import { Search } from "@upstash/search";
import { NextRequest } from "next/server";
import { dateToInt } from "@/lib/dateUtils";
import { SearchAPIResponse, VercelContent, VercelMetadata } from "@/lib/types";
import { NAMESPACE } from "@/lib/constants";

// Initialize Search client
const client = new Search({
  url: process.env.UPSTASH_SEARCH_REST_URL!,
  token: process.env.UPSTASH_SEARCH_REST_TOKEN!,
});

// Create or access a index
const index = client.index<VercelContent, VercelMetadata>(NAMESPACE);

export async function POST(request: NextRequest) {
  try {
    const { query, dateFrom, dateUntil, contentType } = await request.json();

    if (!query) {
      return Response.json({ error: "Query is required" }, { status: 400 });
    }

    const fromInt = dateFrom ? dateToInt(new Date(dateFrom)) : undefined;
    const untilInt = dateUntil ? dateToInt(new Date(dateUntil)) : undefined;

    const filters = []
    if (fromInt !== undefined) {
      filters.push(`@metadata.dateInt >= ${fromInt}`);
    }
    if (untilInt !== undefined) {
      filters.push(`@metadata.dateInt <= ${untilInt}`);
    }
    if (contentType && contentType !== "all") {
      filters.push(`@metadata.kind = "${contentType}"`);
    }

    const searchResults = await index.search({
      query,
      limit: 20,
      reranking: false,
      filter: filters.length > 0 ? filters.join(" AND ") : undefined,
    });

    return Response.json({
      results: searchResults,
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
