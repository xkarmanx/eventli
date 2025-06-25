import { createClient } from '@/shared/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { updateSellerProfile } from '@/features/auth/actions'
import Link from 'next/link'
import Image from 'next/image'

export default async function SetupSellerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_setup_complete')
    .eq('id', user.id)
    .single()
  
  // This page is only for sellers who have NOT completed setup.
  if (profile?.role !== 'seller' || profile?.is_setup_complete) {
    return redirect('/dashboard')
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-teal-900 p-4">
      <Card className="w-full max-w-md bg-white shadow-md rounded-lg border">
        <CardHeader className="text-center p-4">
          <Link href="/" className="inline-block mx-auto">
            <Image src="/logo.svg" alt="Eventli Logo" width={32} height={32} className="h-8 w-auto" />
          </Link>
          <CardTitle className="text-xl font-bold text-gray-900 pt-3">Complete Your Profile</CardTitle>
          <CardDescription className="pt-1 text-sm text-gray-600">
            Let's set up your public profile. This information will be visible to potential customers.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form action={updateSellerProfile} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio / Company Description</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell us about your services, what you specialize in, and what makes you stand out."
                rows={4}
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(123) 456-7890"
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                name="website"
                type="url"
                placeholder="https://your-business.com"
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location / Service Area</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g., San Francisco Bay Area"
                required
                className="h-10 text-sm"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-10 bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              Complete Profile & Go to Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}