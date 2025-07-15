import SearchComponent from "../components/SearchComponent"
import RecentUpdates from "../components/RecentUpdates"
import { BookOpen } from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Documentation Library</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Search across all your documentation sources and discover the latest updates
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
          <SearchComponent />
          <RecentUpdates />     
      </main>
    </div>
  )
}