import { createClient } from '@/shared/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/shared/components/LogoutButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import Link from 'next/link'
import { Button } from '@/shared/components/ui/button'

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
    .select('role, full_name, is_setup_complete')
    .eq('id', user.id)
    .single()

  // Central logic: Redirect seller to setup if their profile is incomplete
  if (profile?.role === 'seller' && !profile.is_setup_complete) {
    return redirect('/setup-seller') // ✅ Fixed: Remove /auth prefix
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center p-4 sm:p-8 space-y-8">
      <div className="w-full max-w-5xl flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <LogoutButton />
      </div>

      <div className="w-full max-w-5xl">
        {profile?.role === 'seller' ? (
          <SellerDashboard fullName={profile.full_name || 'Seller'} />
        ) : (
          <CustomerDashboard fullName={profile?.full_name || 'Customer'} />
        )}
      </div>
    </div>
  )
}

function SellerDashboard({ fullName }: { fullName: string }) {
  return (
      <Card>
        <CardHeader>
            <CardTitle>Welcome, {fullName}!</CardTitle>
            <CardDescription>This is your seller dashboard. Manage your service listings and view your analytics here.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Your seller-specific content, such as recent inquiries, performance metrics, and quick links, will appear here.</p>
            <Link href="/dashboard/listings/new">
                <Button className="mt-4">Create New Service Listing</Button>
            </Link>
        </CardContent>
      </Card>
  )
}

function CustomerDashboard({ fullName }: { fullName: string }) {
  return (
      <Card>
        <CardHeader>
            <CardTitle>Welcome, {fullName}!</CardTitle>
            <CardDescription>This is your customer dashboard. View your bookings and browse new services.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Your customer-specific content, such as your upcoming booked services and messages, will appear here.</p>
             <Link href="/services">
                <Button className="mt-4">Browse Services</Button>
            </Link>
        </CardContent>
      </Card>
  )
}