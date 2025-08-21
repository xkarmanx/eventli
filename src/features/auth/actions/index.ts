// cspell:words supabase
'use server';

import axios from 'axios';
import filter from 'leo-profanity';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/shared/lib/supabase/server';
import { ensureTextIsSafe, ModerationError, RateLimitError } from '@/shared/lib/moderation';

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
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
      data: {
        full_name: fullName,
        role,
        is_setup_complete: role === 'customer'
      },
      // ✅ CHANGE: Use the reliable siteUrl instead of the dynamic origin
      emailRedirectTo: `${siteUrl}/api/auth/callback`
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

  // Get user profile to determine redirect path
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    revalidatePath('/', 'layout');
    
    // Redirect based on user role
    if (profile?.role === 'seller') {
      redirect('/dashboard/seller');
    } else {
      redirect('/');
    }
  }

  revalidatePath('/', 'layout');

  return { status: 'success', message: 'Login successful' };

}

/* -------------------------------------------------------------------------- */
/* Google OAuth                                                               */
/* -------------------------------------------------------------------------- */
export async function signInWithGoogle() {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${siteUrl}/api/auth/callback` }
  });

  if (error) {
    console.error('Google Sign-in Error:', error.message);
    redirect(`/login?error=${encodeURIComponent('Could not authenticate with Google')}`);
  }

  if (data?.url) redirect(data.url);
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

  // Enhanced moderation for bio field
  try {
    console.log(`🔍 MODERATING SELLER SETUP BIO: "${profileData.bio.substring(0, 50)}${profileData.bio.length > 50 ? '...' : ''}"`);
    await ensureTextIsSafe(profileData.bio, 'setup_bio');
  } catch (moderationError) {
    if (moderationError instanceof ModerationError) {
      console.error('Moderation failed for bio:', moderationError.message);
      throw new Error(`Your bio contains inappropriate content and was flagged: ${moderationError.categories.join(', ')}. Please revise your bio to describe your services professionally.`);
    } else if (moderationError instanceof RateLimitError) {
      console.error('Rate limit error during bio moderation:', moderationError.message);
      throw new Error('Too many requests - please wait a moment and try again.');
    }
    throw moderationError;
  }

  const { error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id);

  if (error) {
    console.error('Profile Update Error:', error.message);
    throw new Error(error.message);
  }

  revalidatePath('/dashboard');
  redirect('/dashboard/seller');
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

/* -------------------------------------------------------------------------- */
/* Password Reset Request                                                     */
/* -------------------------------------------------------------------------- */
/**
 * Initiate a password reset by sending a reset email to the user.  This will
 * always respond with a success message even if the email does not exist in the
 * database in order to avoid revealing which emails are registered.
 *
 * The reset link will redirect back to the `/reset-password` route on the
 * configured site URL where the user can enter a new password.
 */
export async function requestPasswordReset(
  formData: FormData
): Promise<{ status: 'success' | 'error'; message: string }> {
  const fromEntries = Object.fromEntries(formData.entries());
  const email = (fromEntries.email ?? '') as string;
  if (!email || typeof email !== 'string') {
    return { status: 'error', message: 'Please provide a valid email address.' };
  }
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`
    });
    if (error) {
      console.error('Password reset request error:', error);
      return { status: 'error', message: error.message || 'Failed to send password reset email.' };
    }
    return {
      status: 'success',
      message: 'If this email exists in our system, you will receive a password reset link shortly.'
    };
  } catch (err: any) {
    console.error('Password reset request error:', err);
    return { status: 'error', message: err?.message || 'Failed to send password reset email.' };
  }
}

/* -------------------------------------------------------------------------- */
/* Update User Password                                                       */
/* -------------------------------------------------------------------------- */
/**
 * Update the currently authenticated user's password.  Supabase will only allow
 * this call if the user is logged in or has arrived via a valid password-reset
 * token (the access token embedded in the reset link).
 */
export async function updateUserPassword(
  formData: FormData
): Promise<{ status: 'success' | 'error'; message: string }> {
  const fromEntries = Object.fromEntries(formData.entries());
  const password = fromEntries.password as string;
  if (!password || typeof password !== 'string' || password.length < 8) {
    return { status: 'error', message: 'Password must be at least 8 characters long.' };
  }
  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      console.error('Password update error:', error);
      return { status: 'error', message: error.message || 'Failed to update password.' };
    }
    // Invalidate caches so the user sees updated state after password change
    revalidatePath('/', 'layout');
    return { status: 'success', message: 'Password updated successfully.' };
  } catch (err: any) {
    console.error('Password update error:', err);
    return { status: 'error', message: err?.message || 'Failed to update password.' };
  }
}
