---
title: "Search (Cloudflare Workers)"
description: "API reference for the Cloudflare Workers Search client entry point."
---

The Cloudflare entry point exports `Search` and `ClientConfig`. It expects credentials to be provided explicitly and sets platform telemetry to `cloudflare` by default.

**Source**: `src/platforms/cloudflare.ts`

## Constructor
```ts
new Search(config: ClientConfig)
```

### ClientConfig
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| url | `string \| undefined` | — | REST URL for Upstash Search. Required in Cloudflare Workers. |
| token | `string \| undefined` | — | REST token for Upstash Search. Required in Cloudflare Workers. |
| enableTelemetry | `boolean \| undefined` | `true` | When `false`, telemetry headers are not sent. |
| retry | `false \| { retries?: number; backoff?: (retryCount: number) => number }` | default retries/backoff | Controls retry behavior for network errors. |
| cache | `"default" \| "force-cache" \| "no-cache" \| "no-store" \| "only-if-cached" \| "reload" \| false \| undefined` | Fetch default | Controls Fetch API cache behavior. |

## Static factory
```ts
Search.fromEnv(
  env?: { UPSTASH_SEARCH_REST_URL: string; UPSTASH_SEARCH_REST_TOKEN: string },
  config?: Omit<ClientConfig, "url" | "token">
): Search
```

This helper mirrors the Node.js API but is often used with Worker `env` bindings instead of `process.env`.

## Methods
### index
```ts
index<TContent extends Dict = Dict, TIndexMetadata extends Dict = Dict>(indexName: string): SearchIndex<TContent, TIndexMetadata>
```
Creates a `SearchIndex` scoped to the provided index name.

### listIndexes
```ts
listIndexes(): Promise<string[]>
```
Returns a list of index names (namespaces) available in the database.

### info
```ts
info(): Promise<{
  diskSize: number;
  pendingDocumentCount: number;
  documentCount: number;
  indexes: Record<string, { pendingDocumentCount: number; documentCount: number }>;
}>
```
Returns storage and document counts for the entire database and per index.

## Usage example (Cloudflare Workers)
```ts worker.ts
import { Search } from "@upstash/search/cloudflare";

export default {
  async fetch(request: Request, env: { UPSTASH_SEARCH_REST_URL: string; UPSTASH_SEARCH_REST_TOKEN: string }) {
    const client = new Search({
      url: env.UPSTASH_SEARCH_REST_URL,
      token: env.UPSTASH_SEARCH_REST_TOKEN,
    });

    const index = client.index<{ text: string }>("notes");
    const results = await index.search({ query: "hello", limit: 3 });

    return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
  },
};
```

**Related**: [SearchIndex](./search-index), [Types](../types)
