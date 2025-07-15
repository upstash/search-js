"use client"

import { SearchBar } from "@upstash/search-ui"
import "@upstash/search-ui/dist/index.css"
import { Search } from "@upstash/search"
import { FileText } from "lucide-react"

// Initialize Upstash Search client
const client = new Search({
  url: process.env.NEXT_PUBLIC_UPSTASH_SEARCH_URL || "<UPSTASH_SEARCH_URL>",
  token: process.env.NEXT_PUBLIC_UPSTASH_SEARCH_READONLY_TOKEN || "<YOUR_SEARCH_READONLY_TOKEN>",
})

interface SearchResult {
  id: string
  content: {
    title: string
    fullContent: string
  }
  metadata: {
    url: string
    path: string
    contentLength: number
    crawledAt: string
  }
  score: number
  indexName?: string
}


  async function searchDocs(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return []

    try {
      const indexes = await client.listIndexes()

      const searchPromises = indexes.map(async (indexName) => {
        try {
          const index = client.index(indexName)
          const searchParams: any = {
            query,
            limit: 10,
            reranking: true
          }

          const results = await index.search(searchParams)

          return (results as any[]).map((result, i) => ({
            ...result,
            id: `${indexName}-${result.id}`,
            indexName
          }))
        } catch (error) {
          console.error(`Error searching ${indexName}:`, error)
          return []
        }
      })

      const resultArrays = await Promise.all(searchPromises)

      const allResults = resultArrays.flat() as SearchResult[]

      const topResults = allResults
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 10)

      return topResults

    } catch (error) {
      console.error('Search error:', error)
      return []
    }
  }


export default function SearchComponent() {

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="max-w-sm mx-auto lg:mx-0">
        <SearchBar.Dialog>
          <SearchBar.DialogTrigger placeholder="Search docs..." />

          <SearchBar.DialogContent>
            <SearchBar.Input placeholder="Type to search documentation..." />
            <SearchBar.Results
              searchFn={searchDocs}
            >
              {(result) => (
                <SearchBar.Result value={result.id} key={result.id}>
                  <SearchBar.ResultIcon>
                    <FileText className="text-gray-600" />
                  </SearchBar.ResultIcon>

                  <SearchBar.ResultContent>
                    <SearchBar.ResultTitle onClick={() => {
                      window.open(result.metadata?.url, "_blank")
                    }}>
                      {result.content?.title}
                    </SearchBar.ResultTitle>
                    <p className="text-xs text-gray-500 mt-0.5">{result.indexName}</p>
                  </SearchBar.ResultContent>
                </SearchBar.Result>
              )}
            </SearchBar.Results>
          </SearchBar.DialogContent>
        </SearchBar.Dialog>
      </div>
    </div>
  )
} 