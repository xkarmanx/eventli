import { createSupabaseServerClient } from '@/shared/lib/database/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  let next = requestUrl.searchParams.get('next') || '/main/seller-dashboard'; // kcs: Default to seller dashboard

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
      
      // kcs: Check if this is a new user that needs to complete profile setup
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        // kcs: If no profile exists, create one and redirect to setup
        if (!profile) {
          // kcs: Create seller profile for OAuth signup
          const { error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              user_id: user.id,
              email: user.email,
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              role: 'SELLER', // kcs: Set as seller for all OAuth signups
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);
            
          if (createError) {
            console.error('Error creating OAuth user profile:', createError);
          }
          
          // kcs: Redirect to setup organization for new OAuth users
          next = '/auth/setup-organization';
        } else {
          // kcs: Existing user - redirect based on role or next parameter
          if (next.includes('/auth/setup-organization')) {
            // kcs: Respect the setup organization redirect
            next = '/auth/setup-organization';
          } else if (profile?.role === 'SELLER') {
            next = '/main/seller-dashboard';
          } else {
            next = '/main/dashboard';
          }
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