// cspell:words supabase
'use server';

import axios from 'axios';
import filter from 'leo-profanity';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/shared/lib/supabase/server';

// Load profanity dictionary
filter.loadDictionary('en');

/* -------------------------------------------------------------------------- */
/* Zod Schemas                                                                */
/* -------------------------------------------------------------------------- */
const signupSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
    .regex(/[\d\W]/, { message: 'Password must contain at least one symbol or number.' }),
  role: z.enum(['customer', 'seller'], { required_error: 'You must select a role.' }),
  recaptchaToken: z.string().min(1, { message: 'reCAPTCHA verification is required.' })
});

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  recaptchaToken: z.string().min(1, { message: 'reCAPTCHA verification is required.' })
});

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */
type ReCaptchaVerificationResponse = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  score?: number;
  action?: string;
};

type ActionSuccess = { success: true; message: string };

/* -------------------------------------------------------------------------- */
/* Env                                                                        */
/* -------------------------------------------------------------------------- */
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
async function verifyRecaptcha(token: string) {
  if (!RECAPTCHA_SECRET_KEY) {
    throw new Error('Server configuration error: reCAPTCHA secret key is missing.');
  }

  try {
    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const verificationResponse = await axios.post(verificationUrl, null, {
      params: {
        secret: RECAPTCHA_SECRET_KEY,
        response: token
      }
    });

    const data: ReCaptchaVerificationResponse = verificationResponse.data;

    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes']);
      throw new Error('reCAPTCHA verification failed. Please try again.');
    }
  } catch (error) {
    console.error('Error during reCAPTCHA verification request:', error);
    throw new Error('Failed to verify reCAPTCHA. Please try again.');
  }
}

/* -------------------------------------------------------------------------- */
/* Sign-up                                                                    */
/* -------------------------------------------------------------------------- */
export async function signup(formData: FormData): Promise<ActionSuccess> {
  const origin =
    headers().get('origin') ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000';

  const fromEntries = Object.fromEntries(formData.entries());
  const validated = signupSchema.safeParse(fromEntries);

  if (!validated.success) {
    const fieldErrors = validated.error.flatten().fieldErrors;
    const combined = Object.values(fieldErrors).flat().join(' ');
    throw new Error(
      combined || 'Invalid form data. Please check your inputs and try again.'
    );
  }

  const { fullName, email, password, role, recaptchaToken } = validated.data;

  if (filter.check(fullName)) {
    throw new Error(
      'Your full name contains inappropriate language. Please choose a different name.'
    );
  }

  await verifyRecaptcha(recaptchaToken);

  const supabase = createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
        is_setup_complete: role === 'customer'
      },
      emailRedirectTo: `${origin}/api/auth/callback`
    }
  });

  if (error || !user) {
    console.error('Signup Error:', error?.message);
    throw new Error(error?.message || 'Could not sign up user.');
  }

  revalidatePath('/', 'layout');

  // ✅ Return success instead of throwing
  return {
    success: true,
    message: 'Please check your email to confirm your account before signing in.'
  };
}

/* -------------------------------------------------------------------------- */
/* Login                                                                      */
/* -------------------------------------------------------------------------- */
export async function login(formData: FormData): Promise<ActionSuccess> {
  const fromEntries = Object.fromEntries(formData.entries());
  const validated = loginSchema.safeParse(fromEntries);

  if (!validated.success) {
    const fieldErrors = validated.error.flatten().fieldErrors;
    const combined = Object.values(fieldErrors).flat().join(' ');
    throw new Error(
      combined || 'Invalid login data. Please check your inputs and try again.'
    );
  }

  const { email, password, recaptchaToken } = validated.data;

  await verifyRecaptcha(recaptchaToken);

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('Login Error:', error.message);
    throw new Error('Could not authenticate user');
  }

  revalidatePath('/', 'layout');

  // ✅ Return success instead of throwing
  return { success: true, message: 'Login successful' };
}

/* -------------------------------------------------------------------------- */
/* Google OAuth                                                               */
/* -------------------------------------------------------------------------- */
export async function signInWithGoogle() {
  const origin =
    headers().get('origin') ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000';

  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin}/api/auth/callback` }
  });

  if (error) {
    console.error('Google Sign-in Error:', error.message);
    redirect(
      `/login?error=${encodeURIComponent(
        'Could not authenticate with Google'
      )}`
    );
  }

  if (data.url) redirect(data.url);
}

/* -------------------------------------------------------------------------- */
/* Seller Profile Setup (marks is_setup_complete = true)                      */
/* -------------------------------------------------------------------------- */
export async function updateSellerProfile(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
    error: authErr
  } = await supabase.auth.getUser();

  if (authErr || !user) throw new Error('User not authenticated.');

  const profileData = {
    bio: formData.get('bio') as string,
    phone: formData.get('phone') as string,
    website: formData.get('website') as string,
    location: formData.get('location') as string,
    is_setup_complete: true
  };

  if (filter.check(profileData.bio))
    throw new Error(
      'Your bio contains inappropriate language. Please use appropriate language in your bio.'
    );

  const { error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id);

  if (error) {
    console.error('Profile Update Error:', error.message);
    throw new Error(error.message);
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

/* -------------------------------------------------------------------------- */
/* Sign-out                                                                   */
/* -------------------------------------------------------------------------- */
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}
