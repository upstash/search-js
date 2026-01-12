[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fupstash%2Fsearch-js%2Ftree%2Fmain%2Fexamples%2Fupstash-search-vercel-changelog&project-name=upstash-search-vercel-changelog&repository-name=upstash-search-vercel-changelog&products=%5B%7B%22type%22%3A%22integration%22%2C%22integrationSlug%22%3A%22upstash%22%2C%22productSlug%22%3A%22upstash-search%22%2C%22protocol%22%3A%22storage%22%7D%5D)

# Vercel Changelog Search

A Next.js application that provides search functionality for Vercel's changelog using Upstash Redis Search.

## Features

- **Full-text Search**: Search through Vercel changelog entries with powerful full-text search capabilities
- **Date & Content Type Filtering**: Filter results by date range (From/Until dates) and content type (Blog/Changelog)
- **Schema-based Indexing**: Type-safe search using schema definitions

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Environment Configuration

> [!TIP]
> If you created the project with the `Deploy with Vercel` button, you can skip this section.

Copy the example environment file and configure your Upstash Redis credentials:

```bash
cp .env.example .env.local
```

To set up Upstash Redis with Search:

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Copy the REST URL and Token to your `.env.local` file as:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 3. Load the Database

Upload the data from `https://vercel.com/atom` to Upstash Redis:

```bash
bun upload-data
```

This script will:
- Create a search index named `vercel-changelog`
- Parse and upload all changelog entries from Vercel's Atom feed

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
- **Upstash Redis** - Search with Redis full-text search capabilities
