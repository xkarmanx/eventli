import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  let next = requestUrl.searchParams.get('next') || '/main/dashboard';

  if (code) {
    const supabase = await createSupabaseServerClient();
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('Error exchanging OAuth code for session:', error.message);
        const loginUrl = new URL('/auth/login', requestUrl.origin);
        loginUrl.searchParams.set('error', 'OAuth callback failed');
        loginUrl.searchParams.set('message', encodeURIComponent(error.message));
        return NextResponse.redirect(loginUrl);
      }
      // Fetch user and profile to determine role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile?.role === 'SELLER') {
          next = '/main/seller-dashboard';
        } else {
          next = '/main/dashboard';
        }
      }
    } catch (errorCatch) {
      console.error('Catch block: Error exchanging code for session:', errorCatch);
      const loginUrl = new URL('/auth/login', requestUrl.origin);
      loginUrl.searchParams.set('error', 'OAuth callback exception');
      return NextResponse.redirect(loginUrl);
    }
  } else {
    console.warn('OAuth callback called without a code.');
    const loginUrl = new URL('/auth/login', requestUrl.origin);
    loginUrl.searchParams.set('error', 'OAuth missing code');
    return NextResponse.redirect(loginUrl);
  }

  // If successful, redirect to the 'next' URL
  return NextResponse.redirect(new URL(next, requestUrl.origin).toString());
}