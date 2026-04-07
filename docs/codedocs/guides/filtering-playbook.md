---
title: "Filtering Playbook"
description: "Practical patterns for building and testing filters in real applications."
---

This guide shows how to build filters that match real application needs: attribute filters, metadata constraints, and nested boolean logic. You will use the typed filter tree where possible and fall back to raw strings only when needed.

**Problem**
Search results are noisy without the ability to filter by category, status, or metadata like region and rating. Developers often end up with stringly‑typed filters that break when fields change.

**Solution**
Use the `TreeNode` filter structure for most queries, then test the resulting behavior with a small set of seed documents. For complex scenarios, build reusable filter fragments and compose them with `AND`/`OR`.

<Steps>
<Step>
### Seed a small dataset
```ts index.ts
import { Search } from "@upstash/search";

type Content = { title: string; tags: string[]; category: string };

type Meta = { rating: number; region: string };

const client = new Search({
  url: process.env.UPSTASH_SEARCH_REST_URL!,
  token: process.env.UPSTASH_SEARCH_REST_TOKEN!,
});

const index = client.index<Content, Meta>("catalog");

await index.upsert([
  { id: "a", content: { title: "Edge Search", tags: ["serverless"], category: "docs" }, metadata: { rating: 4.9, region: "us-east" } },
  { id: "b", content: { title: "Keyword Indexing", tags: ["fulltext"], category: "blog" }, metadata: { rating: 4.2, region: "eu-west" } },
]);
```
</Step>
<Step>
### Build a structured filter
```ts index.ts
const filter = {
  AND: [
    { category: { equals: "docs" } },
    { tags: { contains: "serverless" } },
    { "@metadata.rating": { greaterThanOrEquals: 4.5 } },
  ],
} as const;

const results = await index.search({ query: "search", filter, limit: 5 });
```
</Step>
<Step>
### Handle OR groups and fall back to strings when needed
```ts index.ts
const results = await index.search({
  query: "indexing",
  filter: {
    OR: [
      { category: { equals: "docs" } },
      { category: { equals: "blog" } },
      { title: { glob: "*search*" } },
    ],
  },
});

// If you need a raw string (for dynamic operators or advanced syntax)
const stringFilter = "category = 'docs' AND title GLOB '*search*'";
const altResults = await index.search({ query: "search", filter: stringFilter });
```
</Step>
</Steps>

**Complete example: composing reusable filter fragments**
```ts filters.ts
export const docsOnly = { category: { equals: "docs" } } as const;
export const highRating = { "@metadata.rating": { greaterThanOrEquals: 4.5 } } as const;
export const inRegions = (regions: string[]) => ({ "@metadata.region": { in: regions } }) as const;
```

```ts index.ts
import { Search } from "@upstash/search";
import { docsOnly, highRating, inRegions } from "./filters";

const client = new Search({
  url: process.env.UPSTASH_SEARCH_REST_URL!,
  token: process.env.UPSTASH_SEARCH_REST_TOKEN!,
});

const index = client.index("catalog");

const results = await index.search({
  query: "edge",
  filter: { AND: [docsOnly, highRating, inRegions(["us-east", "eu-west"]) ] },
});
```

This pattern keeps filter logic centralized and makes it easy to evolve fields without touching every query in your codebase.
