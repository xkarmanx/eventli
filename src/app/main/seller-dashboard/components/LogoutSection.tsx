'use client';

import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LogoutSection() {
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    const handleLogout = async () => {
        const confirmed = confirm('Are you sure you want to logout?');
        if (!confirmed) return;

        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Logout</h2>
            <p className="text-gray-600 mb-6">
                Are you sure you want to logout from your seller dashboard?
            </p>
            <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
            >
                Logout
            </button>
        </div>
    );
}
