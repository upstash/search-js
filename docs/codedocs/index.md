---
title: "Getting Started"
description: "Use Upstash Search JS to index documents and run semantic + full‑text search over HTTP from any runtime."
---

Upstash Search JS is a connectionless HTTP client that lets you index documents and run AI-powered search (semantic + full‑text) on Upstash Search from Node.js, serverless, and edge runtimes.

**The Problem**
- Traditional search SDKs assume long‑lived TCP connections that don’t fit serverless or edge runtimes.
- Building a useful search experience requires combining semantic search, keyword search, and filtering without re‑implementing infrastructure.
- Multi‑environment apps (Node.js, Cloudflare Workers, Vercel, browser) need consistent APIs with runtime‑safe defaults.
- Index management tasks (upsert, delete, range scans) become tedious without a clear, typed client.

**The Solution**
Upstash Search JS wraps Upstash Search’s REST API with a small, typed client. You create a `Search` instance, select an index, and use `upsert`, `search`, `fetch`, and `range` without managing TCP connections or custom request signing.

```ts index.ts
import { Search } from "@upstash/search";

type Content = { title: string; genre: string; category: "classic" | "modern" };
type Metadata = { director: string };

const client = new Search({
  url: process.env.UPSTASH_SEARCH_REST_URL!,
  token: process.env.UPSTASH_SEARCH_REST_TOKEN!,
});

const movies = client.index<Content, Metadata>("movies");

await movies.upsert({
  id: "star-wars",
  content: { title: "Star Wars", genre: "sci-fi", category: "classic" },
  metadata: { director: "George Lucas" },
});

const results = await movies.search({ query: "space opera", limit: 2, reranking: true });
console.log(results.map((r) => r.id));
```

**Installation**
<Tabs items={['npm', 'pnpm', 'yarn', 'bun']}>
<Tab value="npm">
```bash
npm install @upstash/search
```
</Tab>
<Tab value="pnpm">
```bash
pnpm add @upstash/search
```
</Tab>
<Tab value="yarn">
```bash
yarn add @upstash/search
```
</Tab>
<Tab value="bun">
```bash
bun add @upstash/search
```
</Tab>
</Tabs>

**Quick Start**
The smallest working example uses a single index and a single search.

```ts index.ts
import { Search } from "@upstash/search";

type Note = { text: string };

const client = new Search({
  url: process.env.UPSTASH_SEARCH_REST_URL!,
  token: process.env.UPSTASH_SEARCH_REST_TOKEN!,
});

const notes = client.index<Note>("notes");

await notes.upsert({ id: "n1", content: { text: "hello world" } });
const results = await notes.search({ query: "hello", limit: 1 });

console.log(results[0].content.text);
```

Expected output:

```txt
hello world
```

**Key Features**
- Connectionless HTTP client suitable for serverless and edge runtimes
- Semantic + full‑text search with optional reranking
- Typed documents and metadata, with strongly typed filters
- Index management helpers: upsert, fetch, range, reset, delete
- Runtime‑aware telemetry headers (optional)

<Cards>
  <Card title="Architecture" href="/docs/architecture">How modules fit together and the request flow</Card>
  <Card title="Core Concepts" href="/docs/search-client">Understand clients, indexes, and filters</Card>
  <Card title="API Reference" href="/docs/api-reference/search-nodejs">Complete API for Search and SearchIndex</Card>
</Cards>
