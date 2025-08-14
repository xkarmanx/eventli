'use client'

import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { SERVICE_TYPES } from "@/shared/types/service"

export default function CategoryNavigation() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentEventType = searchParams.get('eventType')

  // Updated categories to use standardized service types
  const categories = [
    {
      name: "All",
      icon: "/others.svg",
      eventType: "all" // Special value to show all listings
    },
    {
      name: "Wedding",
      icon: "/wedding.svg",
      eventType: SERVICE_TYPES.WEDDING
    },
    {
      name: "Birthday",
      icon: "/birthday.svg", 
      eventType: SERVICE_TYPES.BIRTHDAY
    },
    {
      name: "Baby Shower",
      icon: "/ceremony.svg",
      eventType: SERVICE_TYPES.BABY_SHOWER
    },
    {
      name: "Funeral",
      icon: "/funeral.svg",
      eventType: SERVICE_TYPES.FUNERAL
    }
  ]

  const handleCategoryClick = (eventType: string) => {
    if (eventType === "all") {
      // For "All", remove the eventType filter to show all listings
      const params = new URLSearchParams(searchParams.toString())
      params.delete('eventType')
      const queryString = params.toString()
      router.push(queryString ? `/?${queryString}` : '/')
    } else {
      // Create new URLSearchParams with the event type filter
      const params = new URLSearchParams(searchParams.toString())
      params.set('eventType', eventType)
      
      // Navigate to the home page with the filter applied
      router.push(`/?${params.toString()}`)
    }
  }

  const handleRemoveFilter = () => {
    // Create new URLSearchParams without the eventType filter
    const params = new URLSearchParams(searchParams.toString())
    params.delete('eventType')
    
    // Navigate to the home page without the event type filter
    const queryString = params.toString()
    router.push(queryString ? `/?${queryString}` : '/')
  }

  return (
    <div className="bg-white border-b border-gray-100 px-3 sm:px-6 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Active Filter Display */}
        {currentEventType && (
          <div className="mb-4 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
              <span>Filtering by: {currentEventType}</span>
              <button
                onClick={handleRemoveFilter}
                className="ml-1 p-1 hover:bg-teal-200 rounded-full transition-colors"
                aria-label="Remove filter"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Desktop and tablet view */}
        <div className="hidden sm:flex items-center justify-center space-x-8 md:space-x-12 lg:space-x-20">
          {categories.map((category) => {
            // For "All" category, it's active when no eventType filter is applied
            // For other categories, it's active when the current eventType matches
            const isActive = category.eventType === "all" 
              ? !currentEventType 
              : currentEventType === category.eventType
            return (
              <div 
                key={category.name} 
                className={`flex flex-col items-center space-y-2 lg:space-y-3 cursor-pointer group ${
                  isActive ? 'opacity-100' : 'opacity-75 hover:opacity-100'
                }`}
                onClick={() => handleCategoryClick(category.eventType)}
              >
                <div className={`flex items-center justify-center group-hover:scale-110 transition-transform ${
                  isActive ? 'scale-110' : ''
                }`}>
                  <Image
                    src={category.icon}
                    alt={category.name}
                    width={48}
                    height={48}
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                  />
                </div>
                <span className={`text-xs sm:text-sm font-medium transition-colors ${
                  isActive 
                    ? 'text-teal-600' 
                    : 'text-gray-700 group-hover:text-teal-600'
                }`}>
                  {category.name}
                </span>
              </div>
            )
          })}
        </div>

        {/* Mobile view - horizontal scroll */}
        <div className="sm:hidden overflow-x-auto scrollbar-hide">
          <div className="flex space-x-6 pb-2" style={{ minWidth: 'max-content' }}>
            {categories.map((category) => {
              // For "All" category, it's active when no eventType filter is applied
              // For other categories, it's active when the current eventType matches
              const isActive = category.eventType === "all" 
                ? !currentEventType 
                : currentEventType === category.eventType
              return (
                <div 
                  key={category.name} 
                  className={`flex flex-col items-center space-y-2 cursor-pointer group flex-shrink-0 ${
                    isActive ? 'opacity-100' : 'opacity-75 hover:opacity-100'
                  }`}
                  onClick={() => handleCategoryClick(category.eventType)}
                >
                  <div className={`flex items-center justify-center group-hover:scale-110 transition-transform ${
                    isActive ? 'scale-110' : ''
                  }`}>
                    <Image
                      src={category.icon}
                      alt={category.name}
                      width={40}
                      height={40}
                      className="w-10 h-10"
                    />
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive 
                      ? 'text-teal-600' 
                      : 'text-gray-700 group-hover:text-teal-600'
                  }`}>
                    {category.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
