[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fupstash%2Fsearch-js%2Ftree%2Fmain%2Fexamples%2Fupstash-search-vercel-changelog&project-name=upstash-search-vercel-changelog&repository-name=upstash-search-vercel-changelog&products=%5B%7B%22type%22%3A%22integration%22%2C%22integrationSlug%22%3A%22upstash%22%2C%22productSlug%22%3A%22upstash-search%22%2C%22protocol%22%3A%22storage%22%7D%5D)

# Vercel Changelog Search

A Next.js application that provides search functionality for Vercel's changelog using Upstash Search.

## Features

- **Full-text & Semantic Search**: Search through Vercel changelog entries with full text and semantic search capabilities
- **Input Enrichment & Reranking**: Enriches search queries and reranks search results
- **Date & Content Type Filtering**: Filter results by date range (From/Until dates) and content type (Blog/Changelog)
- **Search Scoring**: Display relevance scores for search results

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Environment Configuration

> [!TIP]
> If you created the project with the `Deploy with Vercel` button, you can skip this section.

Copy the example environment file and configure your Upstash Search credentials:

```bash
cp .env.example .env.local
```

To create an Upstash Search database:

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Search index named `vercel-changelog`
3. Copy the REST URL and Token to your `.env.local` file

### 3. Load the Database

Upload the data from `https://vercel.com/atom` to Upstash Search:

```bash
bun upload-data
```

## Development

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Ant Design** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **Upstash Search** - Semantic and full-text search
