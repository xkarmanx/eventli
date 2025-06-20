import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/shared/lib/database/server';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password)
      return Response.json({ error: 'Email and password are required.' }, { status: 400 });

    console.log('Starting signup process for email:', email);
    const supabase = await createSupabaseServerClient();
    
    // kcs: Check if user already exists by email in profiles table
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (existingProfile) {
      return Response.json({ error: 'User already exists.' }, { status: 400 });
    }
    
    // kcs: Use standard Supabase auth signup (should work now with fixed schema)
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password
    });

    console.log('Signup response - data:', data);
    console.log('Signup response - error:', error);

    if (error) {
      if (error.message.includes('User already registered'))
        return Response.json({ error: 'User already exists.' }, { status: 400 });

      console.error('Sign Up Route - Supabase signUp error:', error.message);
      console.error('Sign Up Route - Full error object:', error);
      // kcs: Return the exact Supabase error message to frontend
      return Response.json({ error: error.message }, { status: 400 });
    }

    // kcs: If auth signup succeeded, create profile with the actual database schema
    if (data.user) {
      try {
        // kcs: Create user profile using the actual profiles table schema from your database
        console.log('Creating profile for user:', data.user.id);
        const profileData = { 
          id: data.user.id, // kcs: Primary key matches auth.users.id
          user_id: data.user.id, // kcs: Also set user_id for compatibility
          email: data.user.email,
          name: name || data.user.email?.split('@')[0] || 'User',
          role: 'SELLER' as const, // kcs: Override default CUSTOMER role for seller signups
          // kcs: Other fields can be updated later in seller setup
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log('Profile data to insert:', profileData);
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profileData]);
        
        if (profileError) {
          console.error('Signup Route - Error creating user profile:', profileError.message);
          console.error('Signup Route - Full profile error:', profileError);
          // kcs: Return more specific error message with actual database error
          return Response.json({ error: `Profile creation failed: ${profileError.message}` }, { status: 500 });
        }
        
        console.log('Profile created successfully for user:', data.user.id);
      } catch (profileError) {
        console.error('Signup Route - Error creating user profile:', profileError);
        return Response.json({ error: 'User signed up but profile could not be created.' }, { status: 500 });
      }
    }

    // kcs: Return success with redirect info for seller setup
    return Response.json({ 
      message: 'User created successfully.',
      redirect: '/auth/setup-organization' // kcs: Redirect to seller setup, not dashboard
    }, { status: 201 });
  } catch (err) {
    console.error(err);
    // kcs: Return more descriptive error message for unexpected errors
    return Response.json({ error: 'An unexpected error occurred during signup. Please try again.' }, { status: 500 });
  }
}
