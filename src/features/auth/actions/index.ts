// cspell:words supabase
'use server';

import axios from 'axios';
import filter  from 'leo-profanity';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/shared/lib/supabase/server';

// load the English dictionary for `leo-profanity`
filter.loadDictionary('en');

/* -------------------------------------------------------------------------- */
/* SignUp Schema (strong password policy + role required)                            */
/* -------------------------------------------------------------------------- */
const signupSchema = z.object({
  fullName: z.string().min(2, {
    message: 'Full name is required.'
  }),
  email: z.string().email({
    message: 'Invalid email address.'
  }),
  password: z.string()
    .min(8, {
      message: 'Password must be at least 8 characters long.'
    })
    .regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter.'
    })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter.'
    })
    .regex(/[\d\W]/, {
      message: 'Password must contain at least one symbol or number.'
    }),
  role: z.enum(['customer', 'seller'], {
    required_error: 'You must select a role.'
  }),
  recaptchaToken: z.string().min(1, {
    message: 'reCAPTCHA verification is required.'
  })
});

/* -------------------------------------------------------------------------- */
/* Login Schema                                                               */
/* -------------------------------------------------------------------------- */
const loginSchema = z.object({
  email: z.string().email({
    message: 'Invalid email address.'
  }),
  password: z.string().min(1, {
    message: 'Password is required.'
  }),
  recaptchaToken: z.string().min(1, {
    message: 'reCAPTCHA verification is required.'
  })
});

type ReCaptchaVerificationResponse = {
  success: boolean; // whether this request was a valid reCAPTCHA verification
  challenge_ts?: string; // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
  hostname?: string; // the hostname of the site where the reCAPTCHA was solved
  'error-codes'?: string[]; // optional: array of error codes
  score?: number; // optional: only for reCAPTCHA v3, the score for the request (0.0 - 1.0)
  action?: string; // optional: only for reCAPTCHA v3, the action name for the request
}

/* -------------------------------------------------------------------------- */
/* Environment Variable for reCAPTCHA Secret Key                              */
/* -------------------------------------------------------------------------- */
const RECAPTCHA_SECRET_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SECRET_KEY;

/* -------------------------------------------------------------------------- */
/* Sign-up                                                                    */
/* -------------------------------------------------------------------------- */
export async function signup(formData: FormData) {
  const origin = (await headers()).get('origin');
  const fromEntries = Object.fromEntries(formData.entries());
  const validated = signupSchema.safeParse(fromEntries);

  if (!validated.success) {
    const fieldErrors = validated.error.flatten().fieldErrors;
    const combined = Object.values(fieldErrors).flat().join(' ');
    throw new Error(combined || 'Invalid form data. Please check your inputs and try again.');
  }

  const { fullName, email, password, role, recaptchaToken } = validated.data;

  if (filter.check(fullName))
    throw new Error('Your full name contains innappropiate language. Please choose a different name.');

  // Verify reCAPTCHA secret key is in environmental variables
  if (!RECAPTCHA_SECRET_KEY)
    throw new Error('Server configuration error: reCAPTCHA secret key is missing.');

  try {
    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const verificationResponse = await axios.post(verificationUrl, null, {
      params: {
        secret: RECAPTCHA_SECRET_KEY,
        response: recaptchaToken
      }
    });

    const reCaptchaData: ReCaptchaVerificationResponse = verificationResponse.data;

    if (!reCaptchaData.success) {
      console.error('reCAPTCHA verification failed:', reCaptchaData['error-codes']);
      throw new Error('reCAPTCHA verification failed. Please try again.');
    }
  } catch (error) {
    console.error('Error during reCAPTCHA verification request:', error);
    throw new Error('Failed to verify reCAPTCHA. Please try again.');
  }

  // ✅ Continue with signup after successful reCAPTCHA verification
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Metadata picked up by `handle_new_user` trigger (or insert manually later)
      data: {
        full_name: fullName,
        role,
        is_setup_complete: role === 'customer' // ✅ customers complete by default
      },
      emailRedirectTo: `${origin}/api/auth/callback` // ✅ ENABLED email confirmation
    }
  });

  if (error || !user) {
    console.error('Signup Error:', error?.message);
    throw new Error(error?.message || 'Could not sign up user.');
  }

  // ✅ Don't redirect immediately - let user check email first
  revalidatePath('/', 'layout');

  // Show success message instead of redirecting
  throw new Error('SUCCESS: Please check your email to confirm your account before signing in.');
}

/* -------------------------------------------------------------------------- */
/* Login                                                                      */
/* -------------------------------------------------------------------------- */
export async function login(formData: FormData) {
  const fromEntries = Object.fromEntries(formData.entries());
  const validated = loginSchema.safeParse(fromEntries);

  if (!validated.success) {
    const fieldErrors = validated.error.flatten().fieldErrors;
    const combined = Object.values(fieldErrors).flat().join(' ');
    throw new Error(combined || 'Invalid login data. Please check your inputs and try again.');
  }

  const { email, password, recaptchaToken } = validated.data;

  // Verify reCAPTCHA secret key is in environmental variables
  if (!RECAPTCHA_SECRET_KEY)
    throw new Error('Server configuration error: reCAPTCHA secret key is missing.');

  try {
    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const verificationResponse = await axios.post(verificationUrl, null, {
      params: {
        secret: RECAPTCHA_SECRET_KEY,
        response: recaptchaToken
      }
    });

    const reCaptchaData: ReCaptchaVerificationResponse = verificationResponse.data;

    if (!reCaptchaData.success) {
      console.error('reCAPTCHA verification failed:', reCaptchaData['error-codes']);
      throw new Error('reCAPTCHA verification failed. Please try again.');
    }
  } catch (error) {
    console.error('Error during reCAPTCHA verification request:', error);
    throw new Error('Failed to verify reCAPTCHA. Please try again.');
  }

  // ✅ Continue with login after successful reCAPTCHA verification
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('Login Error:', error.message);
    throw new Error('Could not authenticate user');
  }

  revalidatePath('/', 'layout');
  
  // Return success instead of redirecting to avoid NEXT_REDIRECT error in toast
  throw new Error('SUCCESS: Login successful');
}

/* -------------------------------------------------------------------------- */
/* Google OAuth                                                               */
/* -------------------------------------------------------------------------- */
export async function signInWithGoogle() {
  const origin = (await headers()).get('origin');
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin}/api/auth/callback` }
  });

  if (error) {
    console.error('Google Sign-in Error:', error.message);
    redirect(`/login?error=${encodeURIComponent('Could not authenticate with Google')}`);
  }

  if (data.url) redirect(data.url);
}

/* -------------------------------------------------------------------------- */
/* Seller Profile Setup (marks is_setup_complete = true)                      */
/* -------------------------------------------------------------------------- */
export async function updateSellerProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();

  if (authErr || !user) throw new Error('User not authenticated.');

  const profileData = {
    bio: formData.get('bio') as string,
    phone: formData.get('phone') as string,
    website: formData.get('website') as string,
    location: formData.get('location') as string,
    is_setup_complete: true
  };

  if (filter.check(profileData.bio))
    throw new Error('Your bio contains innappropiate language. Please use appropiate language in your bio.');

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
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}