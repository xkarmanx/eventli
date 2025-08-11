'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Filter, User, LogOut, ChevronDown, Home, Calendar, LayoutDashboard } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/shared/components/ui/button'
import FilterModal from './FilterModal'
import AuthModal from './AuthModal'
import SearchInput from '@/features/searchfilter/SearchInput'
import { Service } from '@/shared/types/service'
import { createClient } from '@/shared/lib/supabase/client'
import { signOut } from '@/features/auth/actions'


interface NavbarProps {
  listings?: Service[]
  onLocationSearchResults?: (results: Service[]) => void
  onEventSearchResults?: (results: Service[]) => void
}

export default function Navbar({
  listings = [],
  onLocationSearchResults,
  onEventSearchResults,
}: NavbarProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Session + live auth updates
  useEffect(() => {
    const supabase = createClient()

    const load = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          return
        }
        setUser(session?.user || null)

        if (session?.user?.id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!profileError && profileData) setProfile(profileData)
        } else {
          setProfile(null)
        }
      } catch (e) {
        console.error('Error fetching user data:', e)
      } finally {
        setLoading(false)
      }
    }

    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_evt, session) => {
      setUser(session?.user || null)
      if (!session?.user) setProfile(null)
      // Optionally re-fetch profile on sign-in
      if (session?.user?.id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(profileData || null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  // Helpers
  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name
    if (user?.email) return user.email.split('@')[0]
    return 'User'

  }

  const getAvatarUrl = () => {
    if (profile?.avatar_url) return profile.avatar_url
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url
    return null
  }

  const getInitials = () =>
    getDisplayName()
      .split(' ')
      .map((p: string) => p.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')

  const role = (profile?.role as 'seller' | 'customer' | undefined) || 'customer'

  // Search handlers
  const handleLocationFilter = (filtered: Service[]) => onLocationSearchResults?.(filtered)
  const handleEventFilter = (filtered: Service[]) => onEventSearchResults?.(filtered)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="px-3 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo (desktop) */}
          <div className="hidden md:flex items-center flex-shrink-0">
            <Link href="/">
              <Image src="/logo.svg" alt="Eventli Logo" width={120} height={40} className="h-6 sm:h-8 w-auto" />
            </Link>
          </div>

          {/* Mobile search */}
          <div className="md:hidden flex items-center flex-1 mx-2">
            <div className="flex items-center w-full bg-gray-100 border border-gray-200 rounded-lg overflow-hidden focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent">
              {/* Location */}
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

              <div className="w-px h-8 bg-gray-300" />

              {/* Event */}
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

          {/* Desktop search */}
          <div className="hidden md:flex items-center space-x-0 bg-white border border-gray-300 rounded-full shadow-sm overflow-hidden max-w-2xl flex-1 mx-4 lg:mx-8">
            <SearchInput
              label="Where?"
              placeholder="Search Location"
              type="location"
              variant="desktop"
              listings={listings}
              onFilteredResults={handleLocationFilter}
              className="border-r border-gray-300"
            />
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
                className="cursor-pointer bg-white border border-teal-600 text-teal-600 hover:bg-teal-700 hover:text-white rounded-full p-2 w-8 h-8 flex items-center justify-center"
                onClick={() => setIsFilterModalOpen(true)}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">

            {loading ? (
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                  aria-label="User menu"
                >
                  {/* Avatar */}
                  <div className="cursor-pointer relative">
                    {getAvatarUrl() ? (
                      <img
                        src={getAvatarUrl()!}
                        alt={getDisplayName()}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 group-hover:border-teal-700 transition-colors duration-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center border-2 border-gray-200 group-hover:border-teal-700 transition-colors duration-200">
                        <span className="text-white font-semibold text-sm">{getInitials()}</span>
                      </div>
                    )}
                  </div>

                  {/* User info (desktop) */}
                  <div className="cursor-pointer hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900 group-hover:text-teal-700 transition-colors duration-200">
                      {getDisplayName()}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{role}</div>
                  </div>

                  <ChevronDown
                    className={`cursor-pointer w-4 h-4 text-gray-500 group-hover:text-teal-700 transition-all duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>


                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        {getAvatarUrl() ? (
                          <img src={getAvatarUrl()!} alt={getDisplayName()} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">{getInitials()}</span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{getDisplayName()}</div>
                          <div className="text-xs text-gray-500">{user?.email}</div>
                        </div>
                      </div>
                    </div>


                    <div className="py-1">
                      <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >

                        <Home className="w-4 h-4" />
                        Browse Listings
                      </Link>

                      {role === 'customer' ? (
                        <>
                          {/* If your app uses dashboard paths, prefer these */}
                          <Link
                            href="/dashboard/customer/bookings"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <Calendar className="w-4 h-4" />
                            My Bookings
                          </Link>
                          <Link
                            href="/dashboard/customer/profile"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            Profile
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/dashboard/seller"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <Link
                            href="/dashboard/seller/profile"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            Profile
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="border-t border-gray-100 py-1">
                      {/* Server action signout (correct usage) */}
                      <form action={signOut}>
                        <button

                          type="submit"
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>

                      </form>
n/booking-backend
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} type="signup" onSwitchMode={() => {}} />
    </header>
  )
}


// cspell:words Eventli

