'use client'

import { Search, User, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import FilterModal, { FilterValues } from "@/shared/components/ui/FilterModal"

export default function MobileBottomNav() {
  const pathname = usePathname()
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

  const handleSearchClick = () => {
    setIsSearchModalOpen(true)
  }

  const handleSearchClose = () => {
    setIsSearchModalOpen(false)
  }

  const handleSearchApply = (filters: FilterValues) => {
    // For now, just close the modal. In a real app, you'd apply the filters
    console.log('Search filters applied:', filters)
    setIsSearchModalOpen(false)
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 sm:hidden z-50">
        <div className="flex justify-around items-center">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors ${
              pathname === '/'
                ? 'text-teal-600 bg-teal-50'
                : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
            }`}
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </Link>

          {/* Search */}
          <button
            onClick={handleSearchClick}
            className="flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors text-gray-600 hover:text-teal-600 hover:bg-gray-50"
          >
            <Search className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Search</span>
          </button>

          {/* Profile */}
          <Link
            href="/dashboard/customer/profile"
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors ${
              pathname.startsWith('/dashboard/customer/profile')
                ? 'text-teal-600 bg-teal-50'
                : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
            }`}
          >
            <User className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </div>

      {/* Search Modal */}
      <FilterModal
        isOpen={isSearchModalOpen}
        onClose={handleSearchClose}
        onApplyFilters={handleSearchApply}
      />
    </>
  )
}
