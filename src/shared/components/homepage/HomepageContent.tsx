'use client'

import { useState, useEffect, useCallback } from 'react'
import Navbar from "@/shared/components/ui/Navbar"
import CategoryNavigation from "@/shared/components/ui/CategoryNavigation"
import ServicesGrid from "@/shared/components/ui/ServicesGrid"
import { Service } from "@/shared/types/service"
import { FilterValues } from "@/shared/components/ui/FilterModal"

interface HomepageContentProps {
  initialServices: Service[]
}

export default function HomepageContent({ initialServices }: HomepageContentProps) {
  const [filteredServices, setFilteredServices] = useState<Service[]>(initialServices)
  const [locationSearchResults, setLocationSearchResults] = useState<Service[]>(initialServices)
  const [eventSearchResults, setEventSearchResults] = useState<Service[]>(initialServices)

  // JC: Update states when initialServices changes
  useEffect(() => {
    setFilteredServices(initialServices)
    setLocationSearchResults(initialServices)
    setEventSearchResults(initialServices)
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
  }, [])

  const handleEventSearchResults = useCallback((searchResults: Service[]) => {
    setEventSearchResults(searchResults)
  }, [])

  const handleFilterChange = useCallback((filters: FilterValues) => {
    setFilteredServices(prevFiltered => {
      let filtered = [...prevFiltered]

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
          
          const priceNumbers = priceText.match(/\d+/g)?.map(Number) || []
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

      return filtered
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onFilterChange={handleFilterChange}
        listings={initialServices}
        onLocationSearchResults={handleLocationSearchResults}
        onEventSearchResults={handleEventSearchResults}
      />
      <CategoryNavigation />
      <ServicesGrid services={filteredServices} />
    </div>
  )
}
