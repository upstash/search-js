[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fupstash%2Fsearch-js%2Ftree%2Fmain%2Fexamples%2Fnextjs-movies&env=UPSTASH_SEARCH_REST_URL,UPSTASH_SEARCH_REST_TOKEN&project-name=upstash-search-movies)

# Upstash Search - Movies Example

This is a [Next.js](https://nextjs.org) application demonstrating the capabilities of [Upstash Search](https://upstash.com/docs/search). It allows you to search for movies from a dataset and view their details.

## Features

- **AI-Powered Search:** Utilizes Upstash Search to find movies based on your queries.
- **Movie Details:** View more information about a specific movie by clicking on it.
- **Data Upsert (Localhost only):** A button to easily populate your Upstash Search database with the movie dataset. This feature is available only when running the application in a localhost environment.

## Setup

Follow these steps to get the application running:

1.  **Install Dependencies:**
    Open your terminal and navigate to the project directory (`examples/nextjs-movies`). Then run:
    ```bash
    npm install
    ```

2.  **Create Upstash Search Database:**
    - Go to the [Upstash Console](https://console.upstash.com/search) and create a new Search database.
    - Once created, copy your `UPSTASH_SEARCH_REST_URL` and `UPSTASH_SEARCH_REST_TOKEN`.

3.  **Set Environment Variables:**
    Create a `.env.local` file in the `examples/nextjs-movies` directory and add your credentials:
    ```env
    UPSTASH_SEARCH_REST_URL="YOUR_UPSTASH_SEARCH_REST_URL"
    UPSTASH_SEARCH_REST_TOKEN="YOUR_UPSTASH_SEARCH_REST_TOKEN"
    ```
    Replace `"YOUR_UPSTASH_SEARCH_REST_URL"` and `"YOUR_UPSTASH_SEARCH_REST_TOKEN"` with the actual values you copied.

4.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
    This will typically start the app on `http://localhost:3000`.

5.  **Upsert Movie Data:**
    - Open your browser and navigate to `http://localhost:3000`.
    - You should see an "Upsert Data" button. Click this button to populate your Upstash Search database with the movie dataset.
    - **Note:** This button is only visible and functional when the application is running in a localhost environment.

6.  **Search for Movies:**
    Once the data is upserted, you can use the search bar to find movies. Try example queries or search for your favorite films!

## Learn More About Upstash Search

- [Upstash Search Documentation](https://upstash.com/docs/search)
- [Upstash Search GitHub Repository](https://github.com/upstash/search-js)
