import { createClient } from '@/shared/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'seller') {
    return redirect('/dashboard/seller')
  } else if (profile?.role === 'customer') {
    return redirect('/dashboard/customer')
  } else {
    // No profile or role found - redirect to home page where they can set up their profile
    return redirect('/')
  }
}