[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fupstash%2Fsearch-docs&env=NEXT_PUBLIC_UPSTASH_SEARCH_URL,NEXT_PUBLIC_UPSTASH_SEARCH_READONLY_TOKEN,UPSTASH_SEARCH_REST_TOKEN&envDescription=Credentials%20needed%20for%20Upstash%20Search%20Component%20use&envLink=https%3A%2F%2Fconsole.upstash.com%2Fsearch&project-name=search-docs&repository-name=search-docs&demo-title=Documentation%20Library&demo-description=Search%20across%20all%20your%20documentation%20sources%20and%20discover%20the%20latest%20updates&demo-url=https%3A%2F%2Fsearch-docs.vercel.app%2F)
## Description

A modern documentation library to search and track the docs.

## Getting Started

First, run the development server:

```bash
npm install
npm run dev
```

## How it Works
- Search: Uses Upstash Search UI to query multiple indexes in parallel, sorts and groups results, and displays them with section headers.
- Recent Updates: Upstash Qstash fetches all documents from multiple indexes in batches, filters for those crawled in the last 24 hours.

## Set the Crawler

- Upstash Qstash can call this endpoint: `/api/crawl` on schedule to crawl the relevant data
- Providing the URL and the index name in the body, you may manage the crawler,
e.g.

```
{
    "docsUrl": "https://nextjs.org/docs",
    "index": "next-js"
}
```

## Conclusion
Finally, the UI will make use of these components to serve users to find whatever they want from 
any source they want. Moreover, they can keep up with the updates in their favorite docs.


