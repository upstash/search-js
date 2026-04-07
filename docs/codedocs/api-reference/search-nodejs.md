---
title: "Search (Node.js)"
description: "API reference for the Node.js Search client entry point."
---

The Node.js entry point exports `Search` and `ClientConfig`. It reads credentials from environment variables by default and injects runtime telemetry headers unless disabled.

**Source**: `src/platforms/nodejs.ts`

## Constructor
```ts
new Search(config: ClientConfig)
```

### ClientConfig
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| url | `string \| undefined` | — | REST URL for Upstash Search. If omitted, the client checks `NEXT_PUBLIC_UPSTASH_SEARCH_REST_URL` and `UPSTASH_SEARCH_REST_URL`. |
| token | `string \| undefined` | — | REST token for Upstash Search. If omitted, the client checks `NEXT_PUBLIC_UPSTASH_SEARCH_REST_TOKEN` and `UPSTASH_SEARCH_REST_TOKEN`. |
| enableTelemetry | `boolean \| undefined` | `true` | When `false`, telemetry headers are not sent. Disabled automatically if `UPSTASH_DISABLE_TELEMETRY` is set. |
| retry | `false \| { retries?: number; backoff?: (retryCount: number) => number }` | default retries/backoff | Controls retry behavior for network errors. |
| cache | `"default" \| "force-cache" \| "no-cache" \| "no-store" \| "only-if-cached" \| "reload" \| false \| undefined` | `"no-store"` | Controls Fetch API cache behavior. |

## Static factory
```ts
Search.fromEnv(
  env?: { UPSTASH_SEARCH_REST_URL: string; UPSTASH_SEARCH_REST_TOKEN: string },
  config?: Omit<ClientConfig, "url" | "token">
): Search
```

Use this when you want to explicitly pass environment variables (useful in serverless frameworks) but still allow retry/cache overrides.

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

## Usage example
```ts index.ts
import { Search } from "@upstash/search";

const client = new Search({
  url: process.env.UPSTASH_SEARCH_REST_URL!,
  token: process.env.UPSTASH_SEARCH_REST_TOKEN!,
});

const index = client.index("movies");
const stats = await client.info();
console.log(stats.documentCount);
```

**Related**: [SearchIndex](./search-index), [Types](../types)
