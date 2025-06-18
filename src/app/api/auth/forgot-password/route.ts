import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required.' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    });

    if (error) {
      console.error('Forgot Password Route - Supabase error:', error.message);
      return Response.json({ error: 'Failed to send reset password email.' }, { status: 500 });
    }

    return Response.json({ 
      message: 'If an account with this email exists, a password reset link has been sent.' 
    }, { status: 200 });
  } catch (err) {
    console.error('Forgot Password Route - General error:', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
