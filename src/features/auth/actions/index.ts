'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const signupSchema = z
  .object({
    fullName: z.string().min(2, { message: 'Full name is required.' }),
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
    role: z.enum(['customer', 'seller'], { required_error: 'You must select a role.' }),
  })

export async function signup(formData: FormData) {
  const headersList = await headers()
  const origin = headersList.get('origin')
  const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()))

  // Return errors if validation fails
  if (!validatedFields.success) {
    const errorParams = new URLSearchParams()
    errorParams.set('error', 'Invalid form data.')
    const fieldErrors = JSON.stringify(validatedFields.error.flatten().fieldErrors)
    errorParams.set('errors', fieldErrors)
    return redirect(`/signup?${errorParams.toString()}`)
  }
    const { fullName, email, password, role } = validatedFields.data

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
      // Pass metadata to the SQL trigger
      data: {
        full_name: fullName,
        role: role,
      },
    },
  })

  if (error) {
    console.error("Signup Error:", error.message)
    return redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  // A confirmation email has been sent.
  return redirect('/signup?message=Check your email to confirm your account.')
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
    return redirect(`/login?error=${encodeURIComponent('Could not authenticate user')}`)
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
    return redirect(`/login?error=${encodeURIComponent('Could not authenticate with Google')}`)
  }

  if (data.url) {
    redirect(data.url) // Redirect to Google OAuth
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}