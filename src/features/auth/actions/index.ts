'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import axios from 'axios';
import { createClient } from '@/shared/lib/supabase/server';
import { loginSchema, signupSchema } from './schemas';

type ActionResult = { ok: true } | { ok: false; message: string };

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY; // <- one server-only var

export async function login(formData: FormData): Promise<ActionResult> {
  const data = Object.fromEntries(formData.entries());
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    const msg =
      Object.values(parsed.error.flatten().fieldErrors).flat().join(' ') ||
      'Invalid login data';
    return { ok: false, message: msg };
  }

  const { email, password, recaptchaToken } = parsed.data;

  if (!RECAPTCHA_SECRET_KEY) {
    return { ok: false, message: 'Server misconfigured: missing reCAPTCHA key' };
  }

  try {
    const res = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      { params: { secret: RECAPTCHA_SECRET_KEY, response: recaptchaToken } }
    );
    if (!res.data.success) {
      return { ok: false, message: 'reCAPTCHA failed. Try again.' };
    }
  } catch (e) {
    return { ok: false, message: 'reCAPTCHA request failed. Try again.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('Login Error:', error.message);
    return { ok: false, message: 'Could not authenticate user' };
  }

  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function signup(formData: FormData): Promise<ActionResult> {
  const origin = (await headers()).get('origin')!;
  const data = Object.fromEntries(formData.entries());
  const parsed = signupSchema.safeParse(data);
  if (!parsed.success) {
    const msg =
      Object.values(parsed.error.flatten().fieldErrors).flat().join(' ') ||
      'Invalid signup data';
    return { ok: false, message: msg };
  }

  const { fullName, email, password, role, recaptchaToken } = parsed.data;

  if (!RECAPTCHA_SECRET_KEY) {
    return { ok: false, message: 'Server misconfigured: missing reCAPTCHA key' };
  }

  try {
    const res = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      { params: { secret: RECAPTCHA_SECRET_KEY, response: recaptchaToken } }
    );
    if (!res.data.success) {
      return { ok: false, message: 'reCAPTCHA failed. Try again.' };
    }
  } catch (e) {
    return { ok: false, message: 'reCAPTCHA request failed. Try again.' };
  }

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
        is_setup_complete: role === 'customer',
      },
      emailRedirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (error || !user) {
    console.error('Signup Error:', error?.message);
    return { ok: false, message: error?.message || 'Could not sign up user' };
  }

  revalidatePath('/', 'layout');
  return { ok: true };
}
