'use client'

import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { createClient } from '@/shared/lib/supabase/client';
import { Role } from '@/shared/types/database';
import { ModerationError } from '@/shared/lib/moderation-errors';
import { useState, useEffect, useTransition } from 'react';
import { toast } from 'sonner';

type profile = {
  role: Role;
  is_setup_complete: boolean | null;
}

export default function SetupSellerPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, startTransition] = useTransition();
  
  const [formData, setFormData] = useState({
    bio: '',
    phone: '',
    website: '',
    location: ''
  });

  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          window.location.href = '/login';
          return;
        }

        setUser(user);

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, is_setup_complete')
          .eq('id', user.id)
          .single() as { data: profile };

        setProfile(profile);

        // This page is only for sellers who have NOT completed setup.
        if (profile?.role !== 'seller' || profile?.is_setup_complete) {
          window.location.href = '/dashboard';
        }
      } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.bio || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    startTransition(async () => {
      try {
        const formDataObj = new FormData();
        formDataObj.append('bio', formData.bio);
        formDataObj.append('phone', formData.phone);
        formDataObj.append('website', formData.website);
        formDataObj.append('location', formData.location);

        const { updateSellerProfile } = await import('@/features/auth/actions');
        await updateSellerProfile(formDataObj);
        
        toast.success('Profile setup completed successfully!');
        window.location.href = '/dashboard/seller';
      } catch (error: any) {
        console.error('Setup error:', error);
        
        if (error.message.includes('inappropriate content') || error.message.includes('flagged')) {
          toast.error('Content Moderation Alert', {
            description: error.message,
            duration: 8000,
          });
        } else if (error.message.includes('rate limit') || error.message.includes('Too many requests')) {
          toast.error('Rate Limit Reached', {
            description: 'Please wait a moment before trying again.',
            duration: 5000,
          });
        } else {
          toast.error('Setup Failed', {
            description: error.message || 'Unable to complete profile setup. Please try again.',
            duration: 5000,
          });
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-teal-900 p-4">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
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
            Let&apos;s set up your public profile. This information will be visible to potential customers.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio / Company Description</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
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
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
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
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://your-business.com"
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location / Service Area</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., San Francisco Bay Area"
                required
                className="h-10 text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? 'Completing Profile...' : 'Complete Profile & Go to Dashboard'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
