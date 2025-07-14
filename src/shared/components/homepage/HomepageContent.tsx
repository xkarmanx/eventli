'use client'

import { useState, useEffect, useCallback } from 'react'
import Navbar from "@/shared/components/ui/Navbar"
import CategoryNavigation from "@/shared/components/ui/CategoryNavigation"
import ServicesGrid from "@/shared/components/ui/ServicesGrid"
import NoResultsDisplay from "@/shared/components/ui/NoResultsDisplay" // JC: Import the new component
import { Service } from "@/shared/types/service"
import { FilterValues } from "@/shared/components/ui/FilterModal"

interface HomepageContentProps {
  initialServices: Service[]
}

export default function HomepageContent({ initialServices }: HomepageContentProps) {
  const [filteredServices, setFilteredServices] = useState<Service[]>(initialServices)
  const [locationSearchResults, setLocationSearchResults] = useState<Service[]>(initialServices)
  const [eventSearchResults, setEventSearchResults] = useState<Service[]>(initialServices)
  const [hasSearched, setHasSearched] = useState(false) // JC: Track if user has searched
  const [hasFiltered, setHasFiltered] = useState(false) // JC: Track if user has filtered

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onFilterChange={handleFilterChange}
        listings={initialServices}
        onLocationSearchResults={handleLocationSearchResults}
        onEventSearchResults={handleEventSearchResults}
      />
      <CategoryNavigation />
      
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
