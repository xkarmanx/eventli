// cspell:words supabase
'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

/* -------------------------------------------------------------------------- */
/* Schema (strong password policy + role required)                            */
/* -------------------------------------------------------------------------- */
const signupSchema = z
  .object({
    fullName: z.string().min(2, { message: 'Full name is required.' }),
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
      .regex(/[\d\W]/, { message: 'Password must contain at least one symbol or number.' }),
    role: z.enum(['customer', 'seller'], {
      required_error: 'You must select a role.',
    }),
  })

/* -------------------------------------------------------------------------- */
/* Sign-up                                                                    */
/* -------------------------------------------------------------------------- */
export async function signup(formData: FormData) {
  const origin = (await headers()).get('origin')
  const validated = signupSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validated.success) {
    const combined = Object.values(validated.error.flatten().fieldErrors).flat().join(' ')
    throw new Error(combined || 'Invalid form data. Please check your inputs and try again.')
  }

  const { fullName, email, password, role } = validated.data
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Metadata picked up by `handle_new_user` trigger (or insert manually later)
      data: {
        full_name: fullName,
        role,
        is_setup_complete: role === 'customer', // ✅ customers complete by default
      },
      emailRedirectTo: `${origin}/api/auth/callback`, // ✅ ENABLED email confirmation
    },
  })

  if (error || !user) {
    console.error('Signup Error:', error?.message)
    throw new Error(error?.message || 'Could not sign up user.')
  }

  // ✅ Don't redirect immediately - let user check email first
  revalidatePath('/', 'layout')
  
  // Show success message instead of redirecting
  throw new Error('SUCCESS: Please check your email to confirm your account before signing in.')
}

/* -------------------------------------------------------------------------- */
/* Login                                                                      */
/* -------------------------------------------------------------------------- */
export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error('Login Error:', error.message)
    throw new Error('Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

/* -------------------------------------------------------------------------- */
/* Google OAuth                                                               */
/* -------------------------------------------------------------------------- */
export async function signInWithGoogle() {
  const origin = (await headers()).get('origin')
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin}/api/auth/callback` },
  })

  if (error) {
    console.error('Google Sign-in Error:', error.message)
    redirect(`/login?error=${encodeURIComponent('Could not authenticate with Google')}`)
  }

  if (data.url) redirect(data.url)
}

/* -------------------------------------------------------------------------- */
/* Seller Profile Setup (marks is_setup_complete = true)                      */
/* -------------------------------------------------------------------------- */
export async function updateSellerProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) throw new Error('User not authenticated.')

  const profileData = {
    bio: formData.get('bio') as string,
    phone: formData.get('phone') as string,
    website: formData.get('website') as string,
    location: formData.get('location') as string,
    is_setup_complete: true,
  }

  const { error } = await supabase.from('profiles').update(profileData).eq('id', user.id)

  if (error) {
    console.error('Profile Update Error:', error.message)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

/* -------------------------------------------------------------------------- */
/* Sign-out                                                                   */
/* -------------------------------------------------------------------------- */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}