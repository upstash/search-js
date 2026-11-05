---
title: "SearchIndex"
description: "API reference for index-level operations like upsert, search, fetch, and range."
---

`SearchIndex` is created by calling `Search.index(name)`. It scopes all document operations to a single index (namespace).

**Source**: `src/search-index.ts`

## Constructor
```ts
new SearchIndex<TContent, TIndexMetadata>(httpClient, vectorIndex, indexName)
```

You typically do not instantiate this class directly. Use `Search.index()` instead.

## Methods
### upsert
```ts
upsert(
  params: UpsertParameters<TContent, TIndexMetadata> | UpsertParameters<TContent, TIndexMetadata>[]
): Promise<string>
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| params | `UpsertParameters<TContent, TIndexMetadata>` \| `UpsertParameters<TContent, TIndexMetadata>[]` | — | Single document or array of documents with `id`, `content`, and optional `metadata`. |

Returns a string status from the REST API.

```ts index.ts
await index.upsert({ id: "doc-1", content: { title: "Hello" } });
```

### search
```ts
search(params: {
  query: string;
  limit?: number;
  filter?: string | TreeNode<TContent, TIndexMetadata>;
  reranking?: boolean;
  semanticWeight?: number;
  inputEnrichment?: boolean;
  keepOriginalQueryAfterEnrichment?: boolean;
}): Promise<SearchResult<TContent, TIndexMetadata>>
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| query | string | — | Search query text. |
| limit | number \| undefined | `5` | Maximum number of results. |
| filter | string \| `TreeNode<TContent, TIndexMetadata>` \| undefined | — | Filter expression or typed filter tree. |
| reranking | boolean \| undefined | `false` | Enable reranking for higher‑quality results. |
| semanticWeight | number \| undefined | `0.75` | Balance between semantic and full‑text relevance (0–1). |
| inputEnrichment | boolean \| undefined | `true` | Enable query enrichment. |
| keepOriginalQueryAfterEnrichment | boolean \| undefined | `false` | Keep original query alongside enriched query. |

```ts index.ts
const results = await index.search({
  query: "edge runtime",
  limit: 5,
  reranking: true,
  filter: { AND: [{ category: { equals: "docs" } }] },
});
```

### fetch
```ts
fetch(params: Parameters<VectorIndex["fetch"]>[0]): Promise<(Document<TContent, TIndexMetadata> | null)[]>
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| params | `Parameters<VectorIndex["fetch"]>[0]` | — | Fetch options from `@upstash/vector` (e.g., `{ ids: string[] }`). |

```ts index.ts
const docs = await index.fetch({ ids: ["doc-1", "doc-2"] });
```

### delete
```ts
delete(params: Parameters<VectorIndex["delete"]>[0]): Promise<{ deleted: number }>
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| params | `Parameters<VectorIndex["delete"]>[0]` | — | Delete options from `@upstash/vector` (e.g., `{ ids: string[] }`). |

```ts index.ts
await index.delete({ ids: ["doc-1"] });
```

### range
```ts
range(params: { cursor: string; limit: number; prefix?: string }): Promise<{ nextCursor: string; documents: Document<TContent, TIndexMetadata>[] }>
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| cursor | string | — | Cursor string for pagination. Use "0" to start. |
| limit | number | — | Max documents to return. |
| prefix | string \| undefined | — | Only return IDs with this prefix. |

```ts index.ts
const { nextCursor, documents } = await index.range({ cursor: "0", limit: 20, prefix: "doc_" });
```

### reset
```ts
reset(): Promise<{ success: boolean }>
```

Clears all documents in the index.

```ts index.ts
await index.reset();
```

### deleteIndex
```ts
deleteIndex(): Promise<{ success: boolean }>
```

Deletes the entire index and all documents.

```ts index.ts
await index.deleteIndex();
```

### info
```ts
info(): Promise<{ pendingDocumentCount: number; documentCount: number }>
```

Returns document counts for the index.

```ts index.ts
const info = await index.info();
console.log(info.documentCount);
```

**Related**: [Search (Node.js)](./search-nodejs), [Filters](../filters)
