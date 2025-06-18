import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return Response.json({ error: 'Email and password are required.' }, { status: 400 });

    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials'))
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });

      console.error('Login Route - Supabase signIn error:' + error.message);
      return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }

    const token = data?.session?.access_token;

    return Response.json({ message: 'Login successful', token }, { status: 200 });
  } catch (err) {
    console.error('Login Route - General error:', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
