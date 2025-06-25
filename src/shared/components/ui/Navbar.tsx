'use client'

import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { Button } from "@/shared/components/core/Button"
import Image from "next/image"
import Link from "next/link"
import AuthModal from "./AuthModal"
import FilterModal, { FilterValues } from "./FilterModal"

interface NavbarProps {
  onFilterChange?: (filters: FilterValues) => void
}

export default function Navbar({ onFilterChange }: NavbarProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  const handleApplyFilters = (filters: FilterValues) => {
    onFilterChange?.(filters)
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="Eventli Logo"
              width={120}
              height={40}
              className="h-8"
            />
          </Link>
        </div>

        {/* Search Section */}
        <div className="flex items-center space-x-0 bg-white border border-gray-300 rounded-full shadow-sm overflow-hidden max-w-2xl flex-1 mx-8">
          <div className="flex-1 px-6 py-1 border-r border-gray-300">
            <div className="text-xs font-medium text-gray-500 mb-0">Where?</div>
            <input
              type="text"
              placeholder="Search Location"
              className="w-full text-sm text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none"
            />
          </div>
          <div className="flex-1 px-6 py-1">
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

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            className="text-gray-700 hover:text-gray-900 px-4 py-2 text-sm font-medium"
            onClick={() => setIsLoginModalOpen(true)}
          >
            Login
          </Button>
          <Button 
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-full text-sm font-medium"
            onClick={() => setIsSignupModalOpen(true)}
          >
            Sign up
          </Button>
        </div>
      </div>

      {/* Auth Modals */}
      <AuthModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        type="login" 
      />
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
