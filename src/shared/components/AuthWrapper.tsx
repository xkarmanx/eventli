import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { createClient } from '@/shared/lib/supabase/client';

type Props = {
  children: ReactNode;
  redirectTo?: string;
};

export default function AuthWrapper({ children, redirectTo = '/login' }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    (async () => { // KSch: Use an anonymous function instead of defining and calling one
      const { data: { user } } = await supabase.auth.getUser();

      if (!user)
        router.push(redirectTo);
      else
        setIsAuthenticated(true);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
        router.push(redirectTo);
      } else
        setIsAuthenticated(true);
    });

    return () => subscription.unsubscribe();
  }, [router, redirectTo, supabase]);

  if (!isAuthenticated)
    return null; // Don't render children if not authenticated

  return <>{children}</>;
}
