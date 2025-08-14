import { createClient } from '@/shared/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  try {
    const supabase = await createClient()
    
    // Add timeout wrapper for auth check
    const authPromise = supabase.auth.getUser()
    const authResult = await Promise.race([
      authPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 8000)
      )
    ]) as Awaited<typeof authPromise>

    const { data: { user } } = authResult

    if (!user) {
      return redirect('/login')
    }

    // Add timeout wrapper for profile fetch  
    const profilePromise = supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    const profileResult = await Promise.race([
      profilePromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
      )
    ]) as Awaited<typeof profilePromise>

    const { data: profile } = profileResult

    if (profile?.role === 'seller') {
      return redirect('/dashboard/seller')
    } else if (profile?.role === 'customer') {
      return redirect('/dashboard/customer')
    } else {
      // No profile or role found - redirect to home page where they can set up their profile
      console.log('No profile/role found for user:', user.id)
      return redirect('/')
    }
  } catch (error) {
    console.error('Dashboard redirect error:', error)
    // On any error, redirect to home page
    return redirect('/')
  }
}