import { Search, Filter, SearchX } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface NoResultsDisplayProps {
  hasSearched: boolean
  hasFiltered: boolean
  isSearchActive: boolean
}

export default function NoResultsDisplay({ hasSearched, hasFiltered, isSearchActive }: NoResultsDisplayProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 px-6 bg-gray-50">
      <div className="text-center max-w-lg">
        {/* Animated Icon Container */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-teal-700 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <SearchX className="w-10 h-10 text-white" />
            {hasFiltered && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center border-2 border-white">
                <Filter className="w-4 h-4 text-amber-600" />
              </div>
            )}
          </div>
          {/* Pulse animation */}
          <div className="absolute inset-0 w-24 h-24 bg-teal-200 rounded-full mx-auto animate-ping opacity-20"></div>
        </div>

        {/* Header */}
        <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
          No results found
        </h3>

        {/* Dynamic Message */}
        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
          {hasFiltered && isSearchActive
            ? "We couldn't find any services that match both your search terms and selected filters."
            : hasFiltered
            ? "No services match your current filter settings."
            : isSearchActive
            ? "We couldn't find any services matching your search."
            : "No services are currently available."}
        </p>

        {/* Suggestions Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center">
              <Search className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h4 className="font-semibold text-gray-900 mb-4">Try refining your search:</h4>
          
          <div className="space-y-3 text-left">
            {isSearchActive && (
              <div className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2.5"></div>
                <span className="text-gray-700">Use broader keywords or check spelling</span>
              </div>
            )}
            {hasFiltered && (
              <div className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2.5"></div>
                <span className="text-gray-700">Expand your price range or guest count</span>
              </div>
            )}
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2.5"></div>
              <span className="text-gray-700">Remove filters to see more options</span>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2.5"></div>
              <span className="text-gray-700">Explore different service categories</span>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-sm text-gray-500 mt-8">
          Need help? Try browsing by category or contact our support team.
        </p>
      </div>
    </div>
  )
}