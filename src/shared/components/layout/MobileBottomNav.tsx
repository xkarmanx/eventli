'use client'

import { Filter, User, Home } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import SearchSlideSheet, { FilterValues } from "@/shared/components/ui/SearchSlideSheet"
import AuthModal from "@/shared/components/ui/AuthModal"
import { useAuth } from "@/shared/hooks/useAuth"

export default function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalType, setAuthModalType] = useState<'login' | 'signup'>('login')

  // Hide mobile bottom nav on listing detail pages
  if (pathname.startsWith('/listing/')) {
    return null
  }

  const handleSearchClick = () => {
    setIsSearchModalOpen(true)
  }

  const handleSearchClose = () => {
    setIsSearchModalOpen(false)
  }

  const handleProfileClick = () => {
    if (loading) return // Wait for auth check to complete
    
    if (user) {
      // User is logged in, navigate to profile
      router.push('/dashboard/customer/profile')
    } else {
      // User is not logged in, show login modal
      setAuthModalType('login')
      setIsAuthModalOpen(true)
    }
  }

  const handleAuthClose = () => {
    setIsAuthModalOpen(false)
  }

  const handleAuthModeSwitch = (newType: 'login' | 'signup') => {
    setAuthModalType(newType)
  }

  const handleSearchApply = (query: string, filters: FilterValues) => {
    console.log('📱 MobileBottomNav: handleSearchApply called with:', { query, filters })
    
    // If everything is empty, just go to homepage to show all listings
    if (!query.trim() && 
        (!filters.priceRange || filters.priceRange.length === 0) && 
        (!filters.guestNumber || filters.guestNumber.length === 0) && 
        !filters.eventType) {
      console.log('📱 MobileBottomNav: Empty search detected, redirecting to homepage')
      setIsSearchModalOpen(false)
      
      // Always navigate to clear any existing search params
      console.log('📱 MobileBottomNav: Navigating to / to clear search')
      router.push('/')
      return
    }

    // Create URL search params to pass search query and filters
    const searchParams = new URLSearchParams()
    
    if (query.trim()) {
      searchParams.set('q', query.trim())
    }
    
    if (filters.priceRange && filters.priceRange.length > 0) {
      searchParams.set('price', filters.priceRange.join(','))
    }
    
    if (filters.guestNumber && filters.guestNumber.length > 0) {
      searchParams.set('guests', filters.guestNumber.join(','))
    }

    if (filters.eventType) {
      searchParams.set('eventType', filters.eventType)
    }

    // Navigate to homepage with search parameters
    const searchParamsString = searchParams.toString()
    const targetUrl = searchParamsString ? `/?${searchParamsString}` : '/'
    
    console.log('📱 MobileBottomNav: Navigating to:', targetUrl)
    setIsSearchModalOpen(false)
    
    router.push(targetUrl)
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

          {/* Filter */}
          <button
            onClick={handleSearchClick}
            className="flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors text-gray-600 hover:text-teal-600 hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Filter</span>
          </button>

          {/* Profile */}
          <button
            onClick={handleProfileClick}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors ${
              pathname.startsWith('/dashboard/customer/profile')
                ? 'text-teal-600 bg-teal-50'
                : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
            }`}
          >
            <User className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>

      {/* Search Slide Sheet */}
      <SearchSlideSheet
        isOpen={isSearchModalOpen}
        onClose={handleSearchClose}
        onSearch={handleSearchApply}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthClose}
        type={authModalType}
        onSwitchMode={handleAuthModeSwitch}
      />
    </>
  )
}
