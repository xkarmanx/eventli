import { createClient } from '@/shared/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/shared/components/LogoutButton'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Fetch the user's profile to get their role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex-1 w-full flex flex-col gap-10 items-center p-8">
        <h1 className="text-3xl font-bold">Welcome to your Dashboard</h1>
        <div className="text-lg text-center">
            <p>User: {profile?.full_name || user.email}</p>
            <p>Role: <span className="font-bold capitalize">{profile?.role}</span></p>
            <div className="mt-6">
                <LogoutButton />
            </div>
        </div>
    </div>
  )
}