'use client'

import { useState, useEffect, useRef } from 'react'
import { User, LogOut, ChevronDown, Home } from 'lucide-react'
import { signOut } from '@/features/auth/actions'
import { createClient } from '@/shared/lib/supabase/client' // JC: Get user data from database
import Link from 'next/link'

// JC: Define what props the header needs
interface DashboardHeaderProps {
  userType: 'seller' | 'customer'
  title?: string
  subtitle?: string
}

export default function DashboardHeader({ userType, title = 'Dashboard', subtitle }: DashboardHeaderProps) {
  // JC: State for dropdown menu and user data
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // JC: Get correct routes based on user type
  const profileRoute = userType === 'seller' ? '/dashboard/seller/profile' : '/dashboard/customer/profile'

  // JC: Get user data and profile from database
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

  if (loading) {
    return (
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            {subtitle && <div className="h-4 w-32 bg-gray-200 rounded mt-1 animate-pulse"></div>}
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Title Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>

        {/* User Menu */}
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

            {/* User Info */}
            <div className="cursor-pointer hidden sm:block text-left">
              <div className="text-sm font-medium text-gray-900 group-hover:text-teal-700 transition-colors duration-200">
                {getDisplayName()}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {userType}
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

                <Link
                  href={profileRoute}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
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
      </div>
    </header>
  )
}
