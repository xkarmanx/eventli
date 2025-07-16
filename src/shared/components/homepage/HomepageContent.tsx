'use client'

import { useState, useEffect, useCallback } from 'react'
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import Navbar from "@/shared/components/ui/Navbar"
import CategoryNavigation from "@/shared/components/ui/CategoryNavigation"
import ServicesGrid from "@/shared/components/ui/ServicesGrid"
import NoResultsDisplay from "@/shared/components/ui/NoResultsDisplay" // JC: Import the new component
import { Service } from "@/shared/types/service"
import { FilterValues } from "@/shared/components/ui/FilterModal"

interface HomepageContentProps {
  initialServices: Service[]
  searchParams?: {
    q?: string
    price?: string
    guests?: string
  }
}

export default function HomepageContent({ initialServices, searchParams }: HomepageContentProps) {
  const router = useRouter()
  const [filteredServices, setFilteredServices] = useState<Service[]>(initialServices)
  const [locationSearchResults, setLocationSearchResults] = useState<Service[]>(initialServices)
  const [eventSearchResults, setEventSearchResults] = useState<Service[]>(initialServices)
  const [hasSearched, setHasSearched] = useState(Boolean(searchParams?.q || searchParams?.price || searchParams?.guests)) // JC: Track if user has searched
  const [hasFiltered, setHasFiltered] = useState(Boolean(searchParams?.price || searchParams?.guests)) // JC: Track if user has filtered

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

  const handleFilterChange = useCallback((filters: FilterValues) => {
    // JC: Get the current combined search results as the base
    const baseResults = locationSearchResults.filter(service => 
      eventSearchResults.some(eventResult => eventResult.id === service.id)
    )
    
    // JC: Start with the base results instead of previous filtered results
    let filtered = [...baseResults]

    // JC: Only apply filters if they exist, otherwise show all base results
    if (filters.guestNumber) {
      filtered = filtered.filter(service => {
        const guestText = service.guests.toLowerCase()
        if (filters.guestNumber === 'under-20') return guestText.includes('20') || guestText.includes('10') || guestText.includes('15')
        if (filters.guestNumber === '20-40') return guestText.includes('40') || guestText.includes('30') || guestText.includes('25')
        if (filters.guestNumber === '40-60') return guestText.includes('60') || guestText.includes('50')
        if (filters.guestNumber === '60-100') return guestText.includes('100') || guestText.includes('80') || guestText.includes('70')
        if (filters.guestNumber === 'over-100') return guestText.includes('100') || guestText.includes('150') || guestText.includes('200')
        return true
      })
    }

    if (filters.priceRange) {
      filtered = filtered.filter(service => {
        const priceText = service.price.toLowerCase()
        
        if (priceText.includes('price on request') || priceText.includes('request')) {
          return true
        }
        
        // JC: fixed the price filtering logic
        const priceNumbers = priceText
          .replace(/[$,\s]/g, '') // Remove $, commas, and spaces
          .match(/\d+/g)?.map(Number) || []
        if (priceNumbers.length === 0) return true
        
        const maxPrice = Math.max(...priceNumbers)
        const minPrice = Math.min(...priceNumbers)
        
        if (filters.priceRange === 'under-5000') return maxPrice < 5000
        if (filters.priceRange === '5000-10000') return minPrice >= 5000 && maxPrice <= 10000
        if (filters.priceRange === '10000-20000') return minPrice >= 10000 && maxPrice <= 20000
        if (filters.priceRange === '20000-30000') return minPrice >= 20000 && maxPrice <= 30000
        if (filters.priceRange === 'over-30000') return minPrice > 30000
        return true
      })
    }

    // JC: Track if user has applied any filters
    const hasActiveFilters = Object.keys(filters).length > 0 && 
      Object.values(filters).some(value => value !== undefined && value !== '')
    setHasFiltered(hasActiveFilters)

    // JC: Set the filtered results (will be base results if no filters applied)
    setFilteredServices(filtered)
  }, [locationSearchResults, eventSearchResults])

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
        onFilterChange={handleFilterChange}
        listings={initialServices}
        onLocationSearchResults={handleLocationSearchResults}
        onEventSearchResults={handleEventSearchResults}
      />
      <CategoryNavigation />
      
      {/* Search Results Header */}
      {(searchParams?.q || searchParams?.price || searchParams?.guests) && (
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
