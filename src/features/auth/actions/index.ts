// cspell:words supabase
'use server';

import axios from 'axios';
import filter from 'leo-profanity';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/shared/lib/supabase/server';

// load the English dictionary for `leo-profanity`
filter.loadDictionary('en');

/* -------------------------------------------------------------------------- */
/* SignUp Schema (strong password policy + role required)                     */
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
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  score?: number;
  action?: string;
};

/* -------------------------------------------------------------------------- */
/* Sign-up                                                                    */
/* -------------------------------------------------------------------------- */
export async function signup(
  formData: FormData
): Promise<{ status: 'success' | 'error'; message: string }> {
  const origin = (await headers()).get('origin');
  const fromEntries = Object.fromEntries(formData.entries());
  const validated = signupSchema.safeParse(fromEntries);

  if (!validated.success) {
    const fieldErrors = validated.error.flatten().fieldErrors;
    const combined = Object.values(fieldErrors).flat().join(' ');
    // CHANGED: return structured error instead of throwing
    return { status: 'error', message: combined || 'Invalid form data. Please check your inputs and try again.' };
  }

  const { fullName, email, password, role, recaptchaToken } = validated.data;

  if (filter.check(fullName)) {
    // CHANGED: return structured error instead of throwing
    return { status: 'error', message: 'Your full name contains inappropriate language. Please choose a different name.' };
  }

  // CHANGED: read env var locally (keeps serverless cold starts cleaner)
  const RECAPTCHA_SECRET_KEY_VAR = process.env.RECAPTCHA_SECRET_KEY;
  if (!RECAPTCHA_SECRET_KEY_VAR) {
    // CHANGED: return structured error instead of throwing
    return { status: 'error', message: 'Server configuration error: reCAPTCHA secret key is missing.' };
  }

  try {
    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const verificationResponse = await axios.post(verificationUrl, null, {
      params: {
        secret: RECAPTCHA_SECRET_KEY_VAR,
        response: recaptchaToken
      }
    });

    const reCaptchaData: ReCaptchaVerificationResponse = verificationResponse.data;

    if (!reCaptchaData.success) {
      console.error('reCAPTCHA verification failed:', reCaptchaData['error-codes']);
      // CHANGED: return structured error instead of throwing
      return { status: 'error', message: 'reCAPTCHA verification failed. Please try again.' };
    }
  } catch (error) {
    console.error('Error during reCAPTCHA verification request:', error);
    // CHANGED: return structured error instead of throwing
    return { status: 'error', message: 'Failed to verify reCAPTCHA. Please try again.' };
  }

  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Metadata picked up by `handle_new_user` trigger (or insert manually later)
      data: {
        full_name: fullName,
        role,
        is_setup_complete: role === 'customer' // customers complete by default
      },
      emailRedirectTo: `${origin}/api/auth/callback` // enabled email confirmation
    }
  });

  if (error || !user) {
    console.error('Signup Error:', error?.message);
    // CHANGED: return structured error instead of throwing
    return { status: 'error', message: error?.message || 'Could not sign up user.' };
  }

  revalidatePath('/', 'layout'); // keep cache clean
  // CHANGED: return structured success instead of throwing "SUCCESS:..."
  return { status: 'success', message: 'Please check your email to confirm your account before signing in.' };
}

/* -------------------------------------------------------------------------- */
/* Login                                                                      */
/* -------------------------------------------------------------------------- */
export async function login(
  formData: FormData
): Promise<{ status: 'success' | 'error'; message: string }> {
  // CHANGED: function now returns a {status,message} object (consistent with signup)
  const fromEntries = Object.fromEntries(formData.entries());
  const validated = loginSchema.safeParse(fromEntries);

  if (!validated.success) {
    const fieldErrors = validated.error.flatten().fieldErrors;
    const combined = Object.values(fieldErrors).flat().join(' ');
    return { status: 'error', message: combined || 'Invalid login data.' };
  }

  const { email, password, recaptchaToken } = validated.data;
  const RECAPTCHA_SECRET_KEY_VAR = process.env.RECAPTCHA_SECRET_KEY; // CHANGED

  if (!RECAPTCHA_SECRET_KEY_VAR) {
    return { status: 'error', message: 'Server configuration error: reCAPTCHA secret key is missing.' };
  }

  try {
    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const verificationResponse = await axios.post(verificationUrl, null, {
      params: { secret: RECAPTCHA_SECRET_KEY_VAR, response: recaptchaToken },
    });
    const reCaptchaData: ReCaptchaVerificationResponse = verificationResponse.data;
    if (!reCaptchaData.success) {
      return { status: 'error', message: 'reCAPTCHA verification failed. Please try again.' };
    }
  } catch (_error) {
    return { status: 'error', message: 'Failed to verify reCAPTCHA. Please try again.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('Login Error:', error.message);
    return { status: 'error', message: 'Invalid login credentials. Please try again.' };
  }

  revalidatePath('/', 'layout');
  return { status: 'success', message: 'Login successful' };
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
