// cspell:words supabase
'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Updated schema with strong password validation
const signupSchema = z
  .object({
    fullName: z.string().min(2, { message: 'Full name is required.' }),
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string()
      .min(8, { message: 'Password must be at least 8 characters long.' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.'})
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.'})
      .regex(/[\d\W]/, { message: 'Password must contain at least one symbol or number.'}), // Updated regex
    role: z.enum(['customer', 'seller'], { required_error: 'You must select a role.' }),
  })

// --- The rest of the file remains the same ---
export async function signup(formData: FormData) {
  const headersList = await headers()
  const origin = headersList.get('origin')
  const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.flatten().fieldErrors;
    console.error("Validation Errors:", errorMessages);
    // Combine error messages for a more informative response
    const combinedError = Object.values(errorMessages).flat().join(' ');
    throw new Error(combinedError || 'Invalid form data. Please check your inputs and try again.');
  }
  
  const { fullName, email, password, role } = validatedFields.data

  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
        is_setup_complete: false,
      },
    },
  })

  if (error || !user) {
    console.error("Signup Error:", error?.message)
    throw new Error(error?.message || "Could not sign up user.");
  }

  revalidatePath('/', 'layout')

  if (role === 'seller') {
    redirect('/auth/setup-seller')
  } else {
    redirect('/dashboard')
  }
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Login Error:", error.message)
    throw new Error('Could not authenticate user');
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signInWithGoogle() {
  const headersList = await headers()
  const origin = headersList.get('origin')
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/api/auth/callback`,
    },
  })

  if (error) {
    console.error("Google Sign-in Error:", error.message)
    redirect(`/login?error=${encodeURIComponent('Could not authenticate with Google')}`)
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}