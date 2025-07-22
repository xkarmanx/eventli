'use client'

import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { Button } from "@/shared/components/ui/button" 
import Image from "next/image"
import Link from "next/link"
import FilterModal from "./FilterModal"
import AuthModal from "./AuthModal"
import SearchInput from "@/features/searchfilter/SearchInput"
import { Service } from "@/shared/types/service"

interface NavbarProps {
  listings?: Service[]
  onLocationSearchResults?: (results: Service[]) => void
  onEventSearchResults?: (results: Service[]) => void
}

export default function Navbar({ 
  listings = [], 
  onLocationSearchResults, 
  onEventSearchResults 
}: NavbarProps) {

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // JC: Handler for when location search input filters the listings
  const handleLocationFilter = (filteredListings: Service[]) => {
    onLocationSearchResults?.(filteredListings)
  }

  // JC: Handler for when event search input filters the listings
  const handleEventFilter = (filteredListings: Service[]) => {
    onEventSearchResults?.(filteredListings)
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="px-3 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo - Hidden on mobile, visible on desktop */}
          <div className="hidden md:flex items-center flex-shrink-0">
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

          {/* Search Section - Mobile Style */}
          <div className="md:hidden flex items-center flex-1 mx-2">
            <div className="flex items-center w-full bg-gray-100 border border-gray-200 rounded-lg overflow-hidden focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent">
              {/* Location Input */}
              <div className="relative flex items-center w-32">
                <svg className="absolute left-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <SearchInput
                  label=""
                  placeholder="Location"
                  type="location"
                  variant="mobile"
                  listings={listings}
                  onFilteredResults={handleLocationFilter}
                  className=""
                  inputClassName="w-full pl-10 pr-2 py-2.5 bg-transparent border-none outline-none text-sm placeholder-gray-500"
                />
              </div>
              
              {/* Divider Line */}
              <div className="w-px h-8 bg-gray-300"></div>
              
              {/* Search Input */}
              <div className="relative flex items-center flex-1">
                <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                <SearchInput
                  label=""
                  placeholder="Search events..."
                  type="event"
                  variant="mobile"
                  listings={listings}
                  onFilteredResults={handleEventFilter}
                  className=""
                  inputClassName="w-full pl-10 pr-3 py-2.5 bg-transparent border-none outline-none text-sm placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Search Section - Desktop Style */}
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

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* Login and Signup buttons - Hidden on mobile */}
            <Link 
              href="/login" 
              className="hidden sm:flex text-gray-700 hover:text-gray-900 px-2 sm:px-4 py-2 text-sm font-medium"
            >
              Login
            </Link>
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="hidden sm:flex bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        type="signup"
        onSwitchMode={() => {}}
      />
    </header>
  )
}

// cspell:words Eventli