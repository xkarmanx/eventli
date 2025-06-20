'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardWelcome } from '@/features/dashboard/components/DashboardWelcome';
import { useAuth } from '@/shared/hooks/useAuth';

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">      <DashboardWelcome
        user={user}
        profile={profile || undefined}
        onLogout={handleLogout}
      />
    </div>
  );
}
