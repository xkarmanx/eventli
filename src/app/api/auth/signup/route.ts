import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password)
      return Response.json({ error: 'Email and password are required.' }, { status: 400 });

    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password 
    });

    if (error) {
      if (error.message.includes('User already registered'))
        return Response.json({ error: 'User already exists.' }, { status: 400 });

      console.error('Sign Up Route - Supabase signUp error:' + error.message);
      return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }

    if (data.user) {
      try {
        // Create user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: data.user.id, name: name || data.user.email }]);
        
        if (profileError) {
          console.error('Signup Route - Error creating user profile:', profileError.message);
          return Response.json({ error: 'User signed up but profile could not be created.' }, { status: 500 });
        }
      } catch (profileError) {
        console.error('Signup Route - Error creating user profile:', profileError);
        return Response.json({ error: 'User signed up but profile could not be created.' }, { status: 500 });
      }
    }

    return Response.json({ message: 'User created successfully.' }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
