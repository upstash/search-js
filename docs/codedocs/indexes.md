---
title: "Indexes and Namespaces"
description: "Learn how SearchIndex scopes data, manages documents, and bridges REST and Vector APIs."
---

An index (namespace) is the primary unit of data isolation in Upstash Search JS. The `SearchIndex` class gives you a scoped view of a single index, letting you upsert, search, fetch, range‑scan, and delete documents without passing the index name to every call.

**Why this exists**
Search databases often contain multiple logical collections (movies, products, support articles). Namespaces let you separate them and operate on each collection independently. `SearchIndex` wraps these operations in a typed, ergonomic interface.

**How it relates to other concepts**
- You create a `SearchIndex` by calling `Search.index()` from `src/search.ts`.
- Search operations (`search`, `upsert`) go through the SDK’s REST client (`src/client/search-client.ts`).
- Fetch, delete, range, and reset operations use the `@upstash/vector` `Index` with the namespace set to the index name.
- Filters (see `TreeNode` in `src/client/metadata.ts`) can be passed to `search` to apply structured constraints.

**Internal mechanics**
`SearchIndex` is implemented in `src/search-index.ts` and receives three constructor parameters: `httpClient`, `vectorIndex`, and `indexName`. It uses each depending on the operation:
- `upsert` posts to `/upsert-data/{indexName}` using the HTTP client.
- `search` posts to `/search/{indexName}` and maps results into `{ id, content, metadata, score }`.
- `fetch`, `delete`, `range`, `reset`, and `deleteIndex` delegate to `@upstash/vector` with `{ namespace: indexName }`.

```mermaid
flowchart TD
  A[Search.index("movies")] --> B[SearchIndex]
  B -->|upsert/search| C[HttpClient -> REST API]
  B -->|fetch/delete/range/reset| D[@upstash/vector Index]
  D --> E[Namespace = indexName]
```

**Basic usage**
```ts index.ts
import { Search } from "@upstash/search";

type Movie = { title: string; genre: string };

type Meta = { director: string; year: number };

const client = new Search({
  url: process.env.UPSTASH_SEARCH_REST_URL!,
  token: process.env.UPSTASH_SEARCH_REST_TOKEN!,
});

const movies = client.index<Movie, Meta>("movies");

await movies.upsert([
  { id: "m1", content: { title: "Alien", genre: "sci-fi" }, metadata: { director: "Ridley Scott", year: 1979 } },
  { id: "m2", content: { title: "Arrival", genre: "sci-fi" }, metadata: { director: "Denis Villeneuve", year: 2016 } },
]);

const results = await movies.search({ query: "first contact", limit: 2 });
console.log(results.map((r) => r.id));
```

**Advanced usage: pagination and cleanup**
```ts index.ts
import { Search } from "@upstash/search";

type Doc = { text: string };

const client = new Search({
  url: process.env.UPSTASH_SEARCH_REST_URL!,
  token: process.env.UPSTASH_SEARCH_REST_TOKEN!,
});

const docs = client.index<Doc>("docs");

// Range-scan all documents with a prefix
let cursor = "0";
const all: Doc[] = [];

do {
  const { nextCursor, documents } = await docs.range({
    cursor,
    limit: 50,
    prefix: "doc_",
  });

  all.push(...documents.map((d) => d.content));
  cursor = nextCursor;
} while (cursor !== "0");

// Remove the entire index when it is no longer needed
await docs.deleteIndex();
```

<Callout type="warn">`SearchIndex.search` validates `semanticWeight` and throws if it is outside the `0`–`1` range. Guard or clamp user input before passing it into search to avoid throwing errors in production.</Callout>

<Accordions>
<Accordion title="REST search vs Vector SDK operations">
Search results are returned by the REST API because they include AI search features and reranking parameters not exposed in the Vector SDK. In contrast, fetch/delete/range/reset operations use `@upstash/vector` because those endpoints are already stable and optimized for vector‑style document operations. This split keeps the SDK surface small and avoids duplicating logic. The trade‑off is that two different request paths are used internally, which can make debugging harder if you expect all operations to flow through the same HTTP client.
</Accordion>
<Accordion title="Index naming and isolation">
The index name is injected into every request path or namespace option. This gives strong isolation between datasets but also means that typos create new, empty indexes rather than errors. If you build dynamic index names, consider normalizing them (lowercase, stable prefixes) and validating them before calling `Search.index()`. For multi‑tenant systems, treat the index name as part of your tenancy boundary and avoid using user‑supplied raw input directly.
</Accordion>
<Accordion title="Upsert semantics">
`upsert` treats the document `id` as a unique key; inserting the same ID overwrites the previous document. This is convenient for incremental updates but can hide accidental ID collisions if your ID generation is weak. For append‑only workflows, bake in a strong unique suffix (like a timestamp or UUID). For replacement workflows, explicitly log the IDs you update so it is clear when a document changes.
</Accordion>
</Accordions>
