'use client';

import { Filter, Home, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthModal from '@/shared/components/ui/AuthModal';
import SearchSlideSheet, { FilterValues } from '@/shared/components/ui/SearchSlideSheet';
import { useAuth } from '@/shared/hooks/useAuth';
import { createClient } from '@/shared/lib/supabase/client';
import { cn } from '@/shared/lib/utils';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'signup'>('login');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  // Fetch user profile to get role
  useEffect(() => {
    (async () => { // KSch: Use an anonymous function instead of defining one and calling it
      // Don't fetch profile if no user is authenticated
      if (!user?.id) {
        setUserRole(null);
        setRoleLoading(false);
        return;
      }

      setRoleLoading(true);
      try {
        const supabase = createClient();
        if (!supabase) {
          throw new Error('Supabase client not available');
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          setUserRole(null); // Don't default to customer on error
        } else {
          setUserRole(profile?.role || 'customer');
        }
      } catch (error) {
        setUserRole(null); // Don't default to customer on error
      } finally {
        setRoleLoading(false);
      }
    })();
  }, [user?.id]); // Only depend on user.id to avoid unnecessary re-runs

  // Hide mobile bottom nav on listing detail pages
  if (pathname?.startsWith('/listing/'))
    return null;

  // Don't render if router is not ready
  if (!router)
    return null;

  const handleSearchClick = () => setIsSearchModalOpen(true);

  const handleSearchClose = () => setIsSearchModalOpen(false);

  function handleProfileClick() {
    try {
      // If we're still in initial loading state, don't do anything
      if (loading)
        return;

      // If user is definitely not authenticated, show auth modal immediately
      if (!user) {
        setAuthModalType('login');
        setIsAuthModalOpen(true);
        return;
      }

      // At this point we have a user, but let's check if role loading is complete
      if (roleLoading)
        return;

      // User is authenticated and we have role data
      if (user && userRole) {
        // Navigate based on user role
        router.push(userRole === 'seller'
          ? '/dashboard/seller/profile'
          : '/customer-profile');
      } else if (user && userRole === null) {
        // User is authenticated but role fetch failed or no role found
        setAuthModalType('login');
        setIsAuthModalOpen(true);
      }
    } catch {
      // Fallback: show login modal
      setAuthModalType('login');
      setIsAuthModalOpen(true);
    }
  }

  const handleAuthClose = () => setIsAuthModalOpen(false);

  const handleAuthModeSwitch = (newType: 'login' | 'signup') => setAuthModalType(newType);

  function handleSearchApply(query: string, filters: FilterValues) {
    const condition = !query.trim() &&
      (!filters.priceRange || filters.priceRange.length === 0) &&
      (!filters.guestNumber || filters.guestNumber.length === 0) &&
      !filters.eventType;

    // If everything is empty, just go to homepage to show all listings
    if (condition) {
      setIsSearchModalOpen(false);

      // Always navigate to clear any existing search params
      router.push('/');
      return;
    }

    // Create URL search params to pass search query and filters
    const searchParams = new URLSearchParams();

    if (query.trim())
      searchParams.set('q', query.trim());

    if (filters.priceRange && filters.priceRange.length > 0)
      searchParams.set('price', filters.priceRange.join(','));

    if (filters.guestNumber && filters.guestNumber.length > 0)
      searchParams.set('guests', filters.guestNumber.join(','));

    if (filters.eventType)
      searchParams.set('eventType', filters.eventType);

    // Navigate to homepage with search parameters
    const searchParamsString = searchParams.toString();
    const targetUrl = searchParamsString ? `/?${searchParamsString}` : '/';

    setIsSearchModalOpen(false);

    router.push(targetUrl);
  }

  return (
    <>
      <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 sm:hidden z-50'>
        <div className='flex justify-around items-center'>
          {/* Home */}
          <Link
            href='/'
            className={cn(
              'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors',
              `${pathname === '/' ? 'text-teal-600 bg-teal-50': 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'}`
            )}
          >
            <Home className='w-5 h-5 mb-1' />
            <span className='text-xs font-medium'>Home</span>
          </Link>

          {/* Filter */}
          <button
            onClick={handleSearchClick}
            className={cn(
              'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors',
              'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
            )}
          >
            <Filter className='w-5 h-5 mb-1' />
            <span className='text-xs font-medium'>Filter</span>
          </button>

          {/* Profile */}
          <button
            onClick={handleProfileClick}
            className={cn(
              'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors',
              'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
            )}
          >
            <User className='w-5 h-5 mb-1' />
            <span className='text-xs font-medium'>Profile</span>
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
  );
}
