"use client"

import { Search } from "@upstash/search"
import { FileText, Clock } from "lucide-react"
import { useState, useEffect } from "react"

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

async function getLatestDocs(): Promise<SearchResult[]> {
  try {
    const indexes = await client.listIndexes()
    
    const currentDate = new Date()
    currentDate.setDate(currentDate.getDate() - 7)
    const oneDayAgo = currentDate.getTime()
    
    const rangePromises = indexes.map(async (indexName) => {
      try {
        const index = client.index(indexName)
        let recentDocuments: SearchResult[] = []
        let cursor = ""
        
        while (true) {
          const results = await index.range({
            cursor: cursor,
            limit: 100 
          })
          //TODO: use metadata filter instead as param
          const recentBatch = results.documents
            .filter(result => {
              if (!result.metadata?.crawledAt) return false
              const crawledTime = new Date(result.metadata.crawledAt as string).getTime()
              return crawledTime >= oneDayAgo
            })
            .map((result) => ({
              ...result,
              id: `${indexName}-${result.id}`,
              indexName
            })) as SearchResult[]
          
          recentDocuments = recentDocuments.concat(recentBatch)

          if (!results.nextCursor || results.nextCursor === cursor || recentDocuments.length >= 10) {
            break
          }
          cursor = results.nextCursor
        }
        
        return recentDocuments.slice(0, 10)
      } catch (error) {
        console.error(`Error getting documents from ${indexName}:`, error)
        return []
      }
    })
    
    const allResultArrays = await Promise.all(rangePromises)
    
    const allResults = allResultArrays.flat() as SearchResult[]
    
    return allResults

  } catch (error) {
    console.error('Error getting latest docs:', error)
    return []
  }
}

export default function RecentUpdates() {
  const [latestDocs, setLatestDocs] = useState<SearchResult[]>([])
  const [loadingLatest, setLoadingLatest] = useState(true)

  useEffect(() => {
    const loadLatestDocs = async () => {
      const latest = await getLatestDocs()
      setLatestDocs(latest)
      setLoadingLatest(false)
    }

    loadingLatest && loadLatestDocs()
  }, [latestDocs])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

    return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Clock className="w-5 h-5" />
          Recent Updates
        </h2>
      </div>
      
      <div className="p-4">
        {loadingLatest ? (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading...</span>
          </div>
        ) : (
          <div className="h-96 overflow-y-auto">
            <div className="space-y-1">
              {latestDocs.map((doc, index) => (
                <div key={doc.id}>
                  <div 
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
                    onClick={() => window.open(doc.metadata?.url, "_blank")}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <FileText className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {doc.content?.title || 'Documentation'}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {doc.indexName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(doc.metadata.crawledAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {index < latestDocs.length - 1 && (
                    <div className="border-b border-gray-100 my-1"></div>
                  )}
                </div>
              ))}
              
              {latestDocs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No recent updates in the last week</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 