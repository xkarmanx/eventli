'use client';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      if (!supabase) {
        console.error("Supabase client not initialized");
        router.push('/auth/login?error=client_init_failed');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // Fetch profile
        const { data: userProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(userProfile);
        }
      } else {
        router.push('/auth/login');
      }
    };
    fetchUserAndProfile();
  }, [router, supabase]);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading user data...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Welcome to your Dashboard, {profile?.name || user.email}!</h1>
        <p className="text-gray-600 mb-2">User ID: {user.id}</p>
        <p className="text-gray-600 mb-2">Email: {user.email}</p>
        {profile?.role && <p className="text-gray-600 mb-2">Role: {profile.role}</p>}
        {profile?.company_name && <p className="text-gray-600 mb-2">Company: {profile.company_name}</p>}
        {profile?.avatar_url && (
            <img src={profile.avatar_url} alt="User avatar" className="w-20 h-20 rounded-full mx-auto my-4" />
        )}
        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
