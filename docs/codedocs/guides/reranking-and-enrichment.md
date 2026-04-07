---
title: "Reranking and Enrichment"
description: "Tune search quality with reranking, semantic weighting, and input enrichment controls."
---

This guide shows how to tune search quality using `reranking`, `semanticWeight`, and `inputEnrichment`. These options let you trade off cost, latency, and relevance depending on the workload.

**Problem**
Keyword search can miss intent, while purely semantic search can over‑generalize. Teams need a way to blend the two and optionally rerank results for higher relevance, without changing their indexing pipeline.

**Solution**
Use the search parameters in `SearchIndex.search`. You can enable reranking for high‑value queries, balance semantic and keyword relevance with `semanticWeight`, and control query enrichment for improved intent understanding. Most teams start with a hybrid weight (0.6–0.8), then adjust based on click‑through or downstream conversion metrics.

<Steps>
<Step>
### Start with a balanced hybrid search
```ts index.ts
const results = await index.search({
  query: "space opera",
  limit: 5,
  semanticWeight: 0.75,
});
```
</Step>
<Step>
### Enable reranking for premium queries
```ts index.ts
const results = await index.search({
  query: "best sci-fi from the 70s",
  limit: 5,
  reranking: true,
});
```
</Step>
<Step>
### Control enrichment for deterministic behavior
```ts index.ts
const results = await index.search({
  query: "serverless search",
  limit: 5,
  inputEnrichment: false,
  keepOriginalQueryAfterEnrichment: false,
});
```
</Step>
</Steps>

**Complete example: feature flags for quality vs cost**
```ts search.ts
import { Search } from "@upstash/search";

const client = new Search({
  url: process.env.UPSTASH_SEARCH_REST_URL!,
  token: process.env.UPSTASH_SEARCH_REST_TOKEN!,
});

const index = client.index<{ title: string; body: string }>("docs");

export async function searchDocs(query: string, opts: { premium?: boolean }) {
  return await index.search({
    query,
    limit: opts.premium ? 10 : 5,
    reranking: opts.premium ? true : false,
    semanticWeight: opts.premium ? 0.8 : 0.6,
    inputEnrichment: true,
    keepOriginalQueryAfterEnrichment: true,
  });
}
```

**When to tune these knobs**
- If search feels too literal, increase `semanticWeight` toward 1.0.
- If results feel vague or off‑topic, decrease `semanticWeight` toward 0.5.
- Enable `reranking` for queries where the first few results must be excellent (support, documentation, or high‑value product pages).
- Disable `inputEnrichment` in deterministic workflows where you need exact query behavior for compliance or reproducible tests.

In this setup, premium users get better relevance at higher cost, while free‑tier users receive a balanced hybrid search with lower latency and cost.
