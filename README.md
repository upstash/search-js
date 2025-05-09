# Upstash AI Search Node.js Client &middot; ![license](https://img.shields.io/npm/l/%40upstash%2Fsearch) [![Tests](https://github.com/upstash/search-js/actions/workflows/tests.yaml/badge.svg)](https://github.com/upstash/search-js/actions/workflows/tests.yaml) ![npm (scoped)](https://img.shields.io/npm/v/@upstash/search) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/@upstash/search) ![npm weekly download](https://img.shields.io/npm/dw/%40upstash%2Fsearch)

> [!NOTE]  
> **This project is in GA Stage.**
>
> The Upstash Professional Support fully covers this project. It receives regular updates, and bug fixes.
> The Upstash team is committed to maintaining and improving its functionality.

It is a connectionless (HTTP based) AI Search client and designed for:

- Serverless functions (AWS Lambda ...)
- Cloudflare Workers
- Next.js, Jamstack ...
- Client side web/mobile applications
- WebAssembly
- and other environments where HTTP is preferred over TCP.

## Quick Start

### Install

#### Node.js

```bash
npm install @upstash/search
```

### Create Collection

Create a new collection on [Upstash](https://console.upstash.com/search)

## Basic Usage:

```ts
import { Search } from "@upstash/search";

type Metadata = {
  title: string;
  genre: "sci-fi" | "fantasy" | "horror" | "action";
  category: "classic" | "modern";
};

// Initialize Search client
const client = new Search({
  url: "<SEARCH_INDEX_REST_URL>",
  token: "<SEARCH_INDEX_REST_TOKEN>",
});

// Create or access a index
const index = client.index<Metadata>("movies");

// Upsert data into the index
await index.upsert([
  {
    id: "star-wars",
    data: "Star Wars is a sci-fi space opera.",
    fields: { title: "Star Wars", genre: "sci-fi", category: "classic" },
  },
  {
    id: "inception",
    data: "Inception is a mind-bending thriller.",
    fields: { title: "Inception", genre: "action", category: "modern" },
  },
]);

// Fetch documents by IDs
const documents = await index.fetch({
  ids: ["star-wars", "inception"],
});
console.log(documents);

// Search documents by query
const searchResults = await index.search({
  query: "space opera",
  limit: 2,
});
console.log(searchResults);

// Delete a document by ID
await index.delete({
  ids: ["star-wars"],
});

// Search within a document range
const { nextCursor, documents: rangeDocuments } = await index.range({
  cursor: 0,
  limit: 1,
  prefix: "in",
});
console.log(rangeDocuments);

// Reset the index (delete all documents)
await index.reset();

// Get index and namespace info
const info = await search.info();
console.log(info);
```
