'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { createClient } from '@/shared/lib/supabase/client';

type Props = {
  children: ReactNode;
  redirectTo?: string;
};

export default function AuthWrapper({ children, redirectTo = '/login' }: Props) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    (async () => { // KSch: Use an anonymous function instead of defining and calling one
      const { data: { user } } = await supabase.auth.getUser();
      if (!user)
        router.push(redirectTo);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session)
        router.push(redirectTo);
    });

    return () => subscription.unsubscribe();
  }, [router, redirectTo, supabase]);

  return <>{children}</>;
}
