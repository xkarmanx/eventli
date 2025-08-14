'use client'

import { useState, useEffect, useRef } from 'react'
import { User, LogOut, ChevronDown, Home, Calendar, LayoutDashboard } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/shared/components/ui/button'
import { createClient } from '@/shared/lib/supabase/client'
import { signOut } from '@/features/auth/actions'

export function Header() {
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
          setLoading(false)
          return
        }
        
        setUser(session?.user || null)

        if (session?.user?.id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            console.error('Error fetching profile:', profileError)
            setProfile(null)
          } else if (profileData) {
            setProfile(profileData)
          } else {
            setProfile(null)
          }
        } else {
          setProfile(null)
        }
      } catch (e) {
        console.error('Error fetching user data:', e)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_evt, session) => {
      setUser(session?.user || null)
      
      if (!session?.user) {
        setProfile(null)
        setLoading(false)
        return
      }
      
      // Re-fetch profile on sign-in
      if (session?.user?.id) {
        setLoading(true)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          
        if (profileError) {
          console.error('Error fetching profile in auth change:', profileError)
          setProfile(null)
        } else if (profileData) {
          setProfile(profileData)
        } else {
          setProfile(null)
        }
        setLoading(false)
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

  // Helper functions
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

  const getUserRole = (): 'seller' | 'customer' => {
    if (loading) return 'customer'
    
    if (profile?.role) {
      return profile.role as 'seller' | 'customer'
    }
    
    if (user?.user_metadata?.role) {
      return user.user_metadata.role as 'seller' | 'customer'
    }
    
    return 'customer'
  }

  const role = getUserRole()

  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold">Eventli</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            {loading ? (
              // Loading state - show login/signup as fallback
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            ) : user ? (
              // User is authenticated - show avatar and dropdown
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                  aria-label="User menu"
                >
                  {/* Avatar */}
                  <div className="cursor-pointer relative">
                    {getAvatarUrl() ? (
                      <Image
                        src={getAvatarUrl()!}
                        alt={getDisplayName()}
                        width={40}
                        height={40}
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
                          <Image
                            src={getAvatarUrl()!}
                            alt={getDisplayName()}
                            width={32}
                            height={32}
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
                          <div className="text-xs text-teal-600 font-medium capitalize">{role}</div>
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
              // User is not authenticated - show login/signup buttons
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}