'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/client';
import { Button } from './ui/button';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <Button onClick={handleLogout} variant='destructive'>
      <LogOut className='mr-2 h-4 w-4' />
      Logout
    </Button>
  );
}
