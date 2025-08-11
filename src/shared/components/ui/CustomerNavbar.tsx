'use client'

import { useState, useEffect, useRef } from "react"
import { User, LogOut, ChevronDown, Home, Calendar, Settings } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import AuthModal from "./AuthModal"
import { createClient } from '@/shared/lib/supabase/client'
import { signOut } from '@/features/auth/actions'

export default function CustomerNavbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get user data and profile from database
  useEffect(() => {
    const supabase = createClient()
    
    const getUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          return
        }
        
        setUser(session?.user || null)
        
        // Fetch user profile data
        if (session?.user?.id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (!profileError && profileData) {
            setProfile(profileData)
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        if (!session?.user) {
          setProfile(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Get user display name
  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  // Get user avatar
  const getAvatarUrl = () => {
    if (profile?.avatar_url) return profile.avatar_url
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url
    return null
  }

  // Generate initials for avatar fallback
  const getInitials = () => {
    const name = getDisplayName()
    return name
      .split(' ')
      .map((part: string) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  // Get user role
  const getUserRole = () => {
    return profile?.role || 'customer'
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
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

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {loading ? (
              /* Loading state */
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            ) : user ? (
              /* User Menu */
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
                        src={getAvatarUrl()}
                        alt={getDisplayName()}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 group-hover:border-teal-700 transition-colors duration-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center border-2 border-gray-200 group-hover:border-teal-700 transition-colors duration-200">
                        <span className="text-white font-semibold text-sm">{getInitials()}</span>
                      </div>
                    )}
                  </div>

                  {/* User Info - Hidden on mobile */}
                  <div className="cursor-pointer hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900 group-hover:text-teal-700 transition-colors duration-200">
                      {getDisplayName()}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {getUserRole()}
                    </div>
                  </div>

                  {/* Dropdown Arrow */}
                  <ChevronDown 
                    className={`cursor-pointer w-4 h-4 text-gray-500 group-hover:text-teal-700 transition-all duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 transform transition-all duration-200 ease-out">
                    {/* User Info in Dropdown */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        {getAvatarUrl() ? (
                          <img
                            src={getAvatarUrl()}
                            alt={getDisplayName()}
                            className="w-8 h-8 rounded-full object-cover"
                          />
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

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Home className="w-4 h-4" />
                        Browse Listings
                      </Link>

                      {getUserRole() === 'customer' ? (
                        <>
                          <Link
                            href="/customer-bookings"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <Calendar className="w-4 h-4" />
                            My Bookings
                          </Link>

                          <Link
                            href="/customer-profile"
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
                            <Settings className="w-4 h-4" />
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
                      <form action={signOut}>
                        <button
                          type="submit"
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Login and Signup buttons - Show when not logged in */
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
