[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fupstash%2Fupstash%2Fsearch-js%2Ftree%2Fmain%2Fexamples%2Fsearch-docs&env=NEXT_PUBLIC_UPSTASH_SEARCH_URL,NEXT_PUBLIC_UPSTASH_SEARCH_READONLY_TOKEN,UPSTASH_SEARCH_REST_TOKEN&envDescription=Credentials%20needed%20for%20Upstash%20Search%20Component%20use&envLink=https%3A%2F%2Fconsole.upstash.com%2Fsearch&project-name=search-docs&repository-name=search-docs&demo-title=Documentation%20Library&demo-description=Search%20across%20all%20your%20documentation%20sources%20and%20discover%20the%20latest%20updates&demo-url=https%3A%2F%2Fsearch-docs.vercel.app%2F)
## Description

A modern documentation library to search and track the docs.

## How it Works
- Search: Uses Upstash Search UI to query multiple indexes in parallel, sorts and groups results, and displays them with section headers.
- Recent Updates: Upstash Qstash fetches all documents from multiple indexes in batches, filters for those crawled in the last week.


## Setup

Follow these steps to get the application running:

2.  **Create Upstash Search Database:**
    - Go to the [Upstash Console](https://console.upstash.com/search) and create a new Search database.
    - Once created, copy your `UPSTASH_SEARCH_REST_URL`, `UPSTASH_SEARCH_REST_TOKEN` and `UPSTASH_SEARCH_READONLY_TOKEN`.

3.  **Deploy Crawler Script:**
    Click on the vercel deploy button above and provide the requested Upstash Search credentials.

    ```env
    NEXT_PUBLIC_UPSTASH_SEARCH_URL="YOUR_UPSTASH_SEARCH_REST_URL"
    NEXT_PUBLIC_UPSTASH_SEARCH_READONLY_TOKEN="YOUR_UPSTASH_SEARCH_READONLY_TOKEN"
    UPSTASH_SEARCH_REST_TOKEN="YOUR_UPSTASH_SEARCH_REST_TOKEN"
    ```
    
4.  **Populate the Database:**
    Now that we deployed the project, our crawler resides at `/api/crawl`.

    - Upstash Qstash can call the `/api/crawl` endpoint with a schedule to crawl the relevant data and upsert it to the specified Search Database
    - Providing the URL and the index name in the body, you may manage the crawler from [Upstash Console](https://console.upstash.com/qstash/request-builder),
    e.g.

    ```
    {
        "docsUrl": "https://upstash.com/docs",
        "index": "upstash"
    }
    ```

6.  **Search for Docs:**
    The UI also resides in the same deployment, so now using the UI, you can track your docs and do search accross all the docs you have added as scheduled.


## Final Remarks

The crawler operates incrementally, automatically discarding outdated content and keeping your Search database synchronized with the latest website updates each time it runs on schedule. 
