import { createClient } from '@/shared/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'

// Server Action to update the profile
async function updateSellerProfile(formData: FormData) {
  'use server'
  const supabase = await createClient(); // Add await here
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const profileData = {
    bio: formData.get('bio') as string,
    phone: formData.get('phone') as string,
    website: formData.get('website') as string,
    location: formData.get('location') as string,
    is_setup_complete: true,
  };

  const { error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id);

  if (error) {
    console.error("Error updating seller profile:", error.message);
    return redirect(`/setup-seller?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/dashboard');
}

export default async function SetupSellerPage() {
  const supabase = await createClient() // Add await here
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_setup_complete')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'seller' || profile?.is_setup_complete) {
    return redirect('/dashboard')
  }

  return (
    <div className="min-h-screen w-full flex bg-white">
        {/* Left Column: Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-8 overflow-y-auto">
            <div className="mb-8">
                {/* Use a placeholder or remove the logo if it doesn't exist */}
                <div className="h-10 text-2xl font-bold text-primary">Eventli</div>
            </div>
            <Card className="w-full max-w-md border-0 shadow-none">
                <CardHeader className="px-0">
                    <CardTitle className="text-2xl">Complete Your Seller Profile</CardTitle>
                    <CardDescription>This information will be visible to potential customers.</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <form action={updateSellerProfile} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio / Company Description</Label>
                            <Textarea id="bio" name="bio" placeholder="Tell us about your services..." rows={4} required className="py-2 px-3" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" name="phone" type="tel" placeholder="(123) 456-7890" className="py-2 px-3" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Website (Optional)</Label>
                            <Input id="website" name="website" type="url" placeholder="https://your-business.com" className="py-2 px-3" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location / Service Area</Label>
                            <Input id="location" name="location" placeholder="e.g., San Francisco Bay Area" required className="py-2 px-3" />
                        </div>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-semibold py-2">
                            Save and Go to Dashboard
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
        {/* Right Column: Placeholder or remove if no image */}
        <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-blue-500 to-purple-600">
            <div className="flex items-center justify-center w-full">
                <div className="text-white text-center">
                    <h2 className="text-3xl font-bold mb-4">Welcome to Eventli</h2>
                    <p className="text-lg">Complete your profile to start offering your services</p>
                </div>
            </div>
        </div>
    </div>
  )
}