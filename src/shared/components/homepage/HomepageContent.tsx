'use client'

import { useState, useEffect, useCallback } from 'react'
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import Navbar from "@/shared/components/ui/Navbar"
import CategoryNavigation from "@/shared/components/ui/CategoryNavigation"
import ServicesGrid from "@/shared/components/ui/ServicesGrid"
import NoResultsDisplay from "@/shared/components/ui/NoResultsDisplay" // JC: Import the new component
import { Service } from "@/shared/types/service"

interface HomepageContentProps {
  initialServices: Service[]
  searchParams?: {
    q?: string
    price?: string
    guests?: string
    eventType?: string
  }
}

export default function HomepageContent({ initialServices, searchParams }: HomepageContentProps) {
  const router = useRouter()
  const [filteredServices, setFilteredServices] = useState<Service[]>(initialServices)
  const [locationSearchResults, setLocationSearchResults] = useState<Service[]>(initialServices)
  const [eventSearchResults, setEventSearchResults] = useState<Service[]>(initialServices)
  const [hasSearched, setHasSearched] = useState(Boolean(searchParams?.q || searchParams?.price || searchParams?.guests || searchParams?.eventType)) // JC: Track if user has searched
  const [hasFiltered, setHasFiltered] = useState(Boolean(searchParams?.price || searchParams?.guests || searchParams?.eventType)) // JC: Track if user has filtered

  // JC: Update states when initialServices changes
  useEffect(() => {
    setFilteredServices(initialServices)
    setLocationSearchResults(initialServices)
    setEventSearchResults(initialServices)
    setHasSearched(false) // JC: Reset search state
    setHasFiltered(false) // JC: Reset filter state
  }, [initialServices])

  // JC: Combine search results when either changes
  useEffect(() => {
    const combinedResults = locationSearchResults.filter(service => 
      eventSearchResults.some(eventResult => eventResult.id === service.id)
    )
    setFilteredServices(combinedResults)
  }, [locationSearchResults, eventSearchResults])

  // JC: Stable callback functions using useCallback
  const handleLocationSearchResults = useCallback((searchResults: Service[]) => {
    setLocationSearchResults(searchResults)
    setHasSearched(true) // JC: Track that user has searched
  }, [])

  const handleEventSearchResults = useCallback((searchResults: Service[]) => {
    setEventSearchResults(searchResults)
    setHasSearched(true) // JC: Track that user has searched
  }, [])

  // JC: Calculate if search is active
  const isSearchActive = hasSearched && (
    locationSearchResults.length !== initialServices.length || 
    eventSearchResults.length !== initialServices.length
  )

  const handleClearSearch = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        listings={initialServices}
        onLocationSearchResults={handleLocationSearchResults}
        onEventSearchResults={handleEventSearchResults}
      />
      <CategoryNavigation />
      
      {/* Search Results Header */}
      {(searchParams?.q || searchParams?.price || searchParams?.guests || searchParams?.eventType) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Search Results</h2>
                <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-600">
                  {searchParams.q && (
                    <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full">
                      &ldquo;{searchParams.q}&rdquo;
                    </span>
                  )}
                  {searchParams.eventType && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Event Type: {searchParams.eventType}
                    </span>
                  )}
                  {searchParams.price && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Price: {searchParams.price.replace('-', ' - ').replace('under-', 'Under ').replace('over-', 'Over ')}
                    </span>
                  )}
                  {searchParams.guests && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      Guests: {searchParams.guests.replace('-', ' - ').replace('under-', 'Under ').replace('over-', 'Over ')}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-500">
                    {filteredServices.length} result{filteredServices.length !== 1 ? 's' : ''} found
                  </p>
                  <button
                    onClick={handleClearSearch}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* JC: Conditional rendering based on results */}
      {filteredServices.length === 0 ? (
        <NoResultsDisplay 
          hasSearched={hasSearched}
          hasFiltered={hasFiltered}
          isSearchActive={isSearchActive}
        />
      ) : (
        <ServicesGrid services={filteredServices} />
      )}
    </div>
  )
}
