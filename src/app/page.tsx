'use client'

import { useState } from 'react'
import Navbar from "@/shared/components/ui/Navbar"
import CategoryNavigation from "@/shared/components/ui/CategoryNavigation"
import ServicesGrid from "@/shared/components/ui/ServicesGrid"
import { mockServices } from "@/shared/lib/mockData"
import { FilterValues } from "@/shared/components/ui/FilterModal"

export default function HomePage() {
  const [filteredServices, setFilteredServices] = useState(mockServices)

  const handleFilterChange = (filters: FilterValues) => {
    let filtered = [...mockServices]

    // Filter by guest number
    if (filters.guestNumber) {
      filtered = filtered.filter(service => {
        if (filters.guestNumber === 'under-20') return service.guests.includes('20') || service.guests.includes('10')
        if (filters.guestNumber === '20-40') return service.guests.includes('40')
        if (filters.guestNumber === '40-60') return service.guests.includes('60')
        if (filters.guestNumber === '60-100') return service.guests.includes('100')
        if (filters.guestNumber === 'over-100') return service.guests.includes('100') || service.guests.includes('150')
        return true
      })
    }

    // Filter by price range
    if (filters.priceRange) {
      filtered = filtered.filter(service => {
        const priceText = service.price.toLowerCase()
        if (filters.priceRange === 'under-5000') return priceText.includes('3000') || priceText.includes('2000')
        if (filters.priceRange === '5000-10000') return priceText.includes('5000') || priceText.includes('8000') || priceText.includes('10000')
        if (filters.priceRange === '10000-20000') return priceText.includes('15000') || priceText.includes('20000')
        if (filters.priceRange === '20000-30000') return priceText.includes('25000') || priceText.includes('30000')
        if (filters.priceRange === 'over-30000') return priceText.includes('35000') || priceText.includes('40000')
        return true
      })
    }

    setFilteredServices(filtered)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onFilterChange={handleFilterChange} />
      <CategoryNavigation />
      <ServicesGrid services={filteredServices} />
    </div>
  )
}