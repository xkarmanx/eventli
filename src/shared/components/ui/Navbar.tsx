'use client'

import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { Button } from "@/shared/components/ui/button" 
import Image from "next/image"
import Link from "next/link"
import AuthModal from "./AuthModal"
import FilterModal, { FilterValues } from "./FilterModal"
import SearchInput from "@/features/searchfilter/SearchInput"
import { Service } from "@/shared/types/service"

interface NavbarProps {
  onFilterChange?: (filters: FilterValues) => void
  listings?: Service[]
  onLocationSearchResults?: (filteredListings: Service[]) => void
  onEventSearchResults?: (filteredListings: Service[]) => void
}

export default function Navbar({ 
  onFilterChange, 
  listings = [], 
  onLocationSearchResults, 
  onEventSearchResults 
}: NavbarProps) {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  const handleApplyFilters = (filters: FilterValues) => {
    onFilterChange?.(filters)
  }

  // JC: Handler for when location search input filters the listings
  const handleLocationFilter = (filteredListings: Service[]) => {
    onLocationSearchResults?.(filteredListings)
  }

  // JC: Handler for when event search input filters the listings
  const handleEventFilter = (filteredListings: Service[]) => {
    onEventSearchResults?.(filteredListings)
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-3 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/">
              <Image
                src="/logo.svg"
                alt="Eventli Logo"
                width={120}
                height={40}
                className="h-6 sm:h-8 w-auto"
              />
            </Link>
          </div>

          {/* Search Section - Hidden on mobile, visible on tablet+ */}
          <div className="hidden md:flex items-center space-x-0 bg-white border border-gray-300 rounded-full shadow-sm overflow-hidden max-w-2xl flex-1 mx-4 lg:mx-8">
            {/* JC: Location search input component - filters listings by location field */}
            <SearchInput
              label="Where?"
              placeholder="Search Location"
              type="location"
              variant="desktop"
              listings={listings}
              onFilteredResults={handleLocationFilter}
              className="border-r border-gray-300"
            />
            {/* JC: Event search input component - filters listings by title/description */}
            <SearchInput
              label="Search"
              placeholder="What are you looking for?"
              type="event"
              variant="desktop"
              listings={listings}
              onFilteredResults={handleEventFilter}
            />
            <div className="flex items-center px-2 space-x-2">
              <button className="bg-teal-600 hover:bg-teal-700 rounded-full p-2 w-8 h-8 flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </button>
              <button 
                className="bg-white border border-teal-600 text-teal-600 hover:bg-teal-50 rounded-full p-2 w-8 h-8 flex items-center justify-center"
                onClick={() => setIsFilterModalOpen(true)}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Search - Direct Airbnb-style search input */}
          <div className="md:hidden flex-1 mx-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <SearchInput
                label=""
                placeholder="Search"
                type="event"
                variant="desktop"
                listings={listings}
                onFilteredResults={handleEventFilter}
                className="w-full bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow pl-11 pr-4 py-2 text-sm text-gray-600 placeholder-gray-600"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* Login button - Hidden on mobile */}
            <Button asChild variant="ghost" className="hidden sm:flex text-gray-700 hover:text-gray-900 px-2 sm:px-4 py-2 text-sm font-medium">
              <Link href="/login">Login</Link>
            </Button>
            {/* Signup button */}
            <Button 
              className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium"
              onClick={() => setIsSignupModalOpen(true)}
            >
              <span className="sm:hidden">Sign up</span>
              <span className="hidden sm:inline">Sign up</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Signup Modal Only */}
      <AuthModal 
        isOpen={isSignupModalOpen} 
        onClose={() => setIsSignupModalOpen(false)} 
        type="signup" 
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </header>
  )
}

// cspell:words Eventli