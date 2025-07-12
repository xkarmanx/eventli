'use client'

import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { Button } from "@/shared/components/ui/button" 
import Image from "next/image"
import Link from "next/link"
import AuthModal from "./AuthModal"
import FilterModal, { FilterValues } from "./FilterModal"

interface NavbarProps {
  onFilterChange?: (filters: FilterValues) => void
}

export default function Navbar({ onFilterChange }: NavbarProps) {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  const handleApplyFilters = (filters: FilterValues) => {
    onFilterChange?.(filters)
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
            <div className="flex-1 px-4 lg:px-6 py-1 border-r border-gray-300">
              <div className="text-xs font-medium text-gray-500 mb-0">Where?</div>
              <input
                type="text"
                placeholder="Search Location"
                className="w-full text-sm text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none"
              />
            </div>
            <div className="flex-1 px-4 lg:px-6 py-1">
              <div className="text-xs font-medium text-gray-500 mb-0">Search</div>
              <input
                type="text"
                placeholder="What are you looking for?"
                className="w-full text-sm text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none"
              />
            </div>
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

          {/* Mobile Search Button - Airbnb Style */}
          <div className="md:hidden flex-1 mx-4">
            <button 
              onClick={() => setIsMobileSearchOpen(true)}
              className="w-full flex items-center bg-white border border-gray-300 rounded-full shadow-sm px-4 py-2 hover:shadow-md transition-shadow"
            >
              <Search className="w-4 h-4 text-gray-400 mr-3" />
              <span className="text-sm text-gray-600">Search</span>
            </button>
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

      {/* Mobile Search Slide-up Modal */}
      {isMobileSearchOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileSearchOpen(false)}
          />
          
          {/* Slide-up panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 animate-slide-up max-h-[80vh] overflow-y-auto">
            {/* Handle bar */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Search & Filters</h2>
              <button 
                onClick={() => setIsMobileSearchOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                ✕
              </button>
            </div>

            {/* Search Inputs */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Where?</label>
                <input
                  type="text"
                  placeholder="Search location"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">What are you looking for?</label>
                <input
                  type="text"
                  placeholder="Wedding, Birthday, Ceremony..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Event Type</h3>
              <div className="flex flex-wrap gap-2">
                {['Wedding', 'Birthday', 'Ceremony', 'Funeral', 'Others'].map((type) => (
                  <button
                    key={type}
                    className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:border-teal-500 hover:bg-teal-50"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Filters Button */}
            <button 
              onClick={() => {
                setIsMobileSearchOpen(false)
                setIsFilterModalOpen(true)
              }}
              className="w-full mb-4 p-3 border border-gray-300 rounded-xl text-left hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">More filters</span>
                <span className="text-xs text-gray-500">Price, guests, etc.</span>
              </div>
            </button>

            {/* Search Button */}
            <button 
              onClick={() => {
                setIsMobileSearchOpen(false)
                // Handle search logic here
              }}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-xl transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      )}

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