---
title: "Types"
description: "TypeScript types exported by Upstash Search JS and how to use them."
---

This SDK ships with TypeScript types that describe documents, search results, and configuration. The definitions below are taken from the source files so you can rely on them in your own code.

**Source**: `src/types.ts`, `src/client/search-client.ts`, `src/platforms/nodejs.ts`, `src/platforms/cloudflare.ts`, `src/client/metadata.ts`

## Core data types
```ts
export type Dict = Record<string, unknown>;

export type UpsertParameters<TContent extends Dict, TIndexMetadata extends Dict> = {
  id: string;
  content: TContent;
  metadata?: TIndexMetadata;
};

export type Document<
  TContent extends Dict,
  TMetadata extends Dict,
  TWithScore extends boolean = false,
> = {
  id: string;
  content: TContent;
  metadata?: TMetadata;
} & (TWithScore extends true ? { score: number } : {});

export type SearchResult<TContent extends Dict, TMetadata extends Dict> = Document<
  TContent,
  TMetadata,
  true
>[];
```

These types let you strongly type content and metadata. For example, `SearchResult<Movie, Meta>` ensures each result includes the fields your application expects and includes `score`.

## Filter tree
```ts
export type TreeNode<TContent, TMetadata> =
  | Leaf<MergedFields<TContent, TMetadata>>
  | { OR: TreeNode<TContent, TMetadata>[] }
  | { AND: TreeNode<TContent, TMetadata>[] };
```

`TreeNode` lets you build structured filters. It merges content fields with metadata fields prefixed as `@metadata.<key>` so you can filter across both namespaces without collisions.

## Client configuration
```ts
export type RetryConfig =
  | false
  | {
      retries?: number;
      backoff?: (retryCount: number) => number;
    };

export type RequesterConfig = {
  retry?: RetryConfig;
  cache?: "default" | "force-cache" | "no-cache" | "no-store" | "only-if-cached" | "reload" | false;
};
```

`RequesterConfig` is included in the platform `ClientConfig` type, so you can configure retries and cache behavior regardless of runtime.

## Platform client config
```ts
export type ClientConfig = {
  url?: string;
  token?: string;
  enableTelemetry?: boolean;
} & RequesterConfig;
```

This type is exported in both `src/platforms/nodejs.ts` and `src/platforms/cloudflare.ts`. Use it when you want to type custom wrappers or factory helpers around `Search`.

## Re-exported vector types
```ts
export type { QueryResult, Index as VectorIndex } from "@upstash/vector";
```

These types are re-exported from `@upstash/vector` and are useful when you need to interact with lower‑level vector operations or annotate advanced integrations.
