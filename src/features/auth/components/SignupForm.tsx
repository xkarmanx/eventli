'use client';

import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import ReCaptchaComponent, { ReCaptchaComponentRef } from '@/shared/components/ReCaptchaInstance';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';
import { signInWithGoogle, signup } from '../actions';
import { PasswordStrength } from './PasswordStrength';

// Google Icon Component for consistent styling
const GoogleIcon = () => (
  <svg className='mr-3 h-5 w-5' viewBox='0 0 24 24'>
    <path
      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
      fill='#4285F4'
    />
    <path
      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
      fill='#34A853'
    />
    <path
      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
      fill='#FBBC05'
    />
    <path
      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
      fill='#EA4335'
    />
  </svg>
);

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [role, setRole] = React.useState<string | null>(null);
  const [isClient, setIsClient] = React.useState(false);

  // State for the reCAPTCHA component
  const [recaptchaToken, setRecaptchaToken] = React.useState<string | null>(null);
  const [isCaptchaVerified, setIsCaptchaVerified] = React.useState<boolean>(false);
  const recaptchaRef = React.useRef<ReCaptchaComponentRef>(null); // Ref for reCAPTCHA component

  const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  function handleCaptchaChange(token: string | null) {
    console.log('reCAPTCHA token:', token);
    setRecaptchaToken(token);
    setIsCaptchaVerified(!!token); // true if token exists, false otherwise
  }

  function handleCaptchaExpired() {
    console.warn('reCAPTCHA token expired. Please re-verify.');
    setRecaptchaToken(null);
    setIsCaptchaVerified(false);
    recaptchaRef.current?.reset(); // Reset the reCAPTCHA widget
  }

  // Hydration-safe way to get the role parameter
  React.useEffect(() => {
    setIsClient(true);
    const roleParam = searchParams.get('role');
    setRole(roleParam);

    // If no role is in the URL, redirect back to the homepage to force a selection.
    // This is a security measure to ensure no one lands on this page directly.
    if (!roleParam) router.push('/');
  }, [searchParams, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    toast.info('Creating your account...');
    try {
      const formData = new FormData(e.currentTarget);
      formData.append('recaptchaToken', recaptchaToken as string | Blob);

      await signup(formData);

      // ✅ Handle success case - show success message and redirect to login
      toast.success('Account created! Please check your email to confirm your account.');
      // Reset reCAPTCHA and form after successful submission
      setRecaptchaToken(null);
      setIsCaptchaVerified(false);
      recaptchaRef.current?.reset();
      // Clear form fields if desired
      setPassword(''); // Clear password field, other fields are handled by form
      e.currentTarget.reset(); // Resets all form fields

      setTimeout(() => router.push('/login'), 2000);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('SUCCESS:')) {
        // ✅ Handle success case - show success message and redirect to login
        toast.success('Account created! Please check your email to confirm your account.');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : 'An unknown error occurred during signup.'
        );
        // In case of failure, reset reCAPTCHA and form
        setRecaptchaToken(null);
        setIsCaptchaVerified(false);
        recaptchaRef.current?.reset();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    toast.info('Redirecting to Google...');
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to sign in with Google'
      );
      setGoogleLoading(false);
    }
  }

  // Show loading state during hydration or when role is not determined
  if (!isClient || !role)
    return (
      <div className='flex items-center justify-center text-white'>
        <Loader2 className='h-8 w-8 animate-spin' />
        <p className='ml-4'>Loading...</p>
      </div>
    );

  return (
    <Card className='w-full max-w-md bg-white shadow-md rounded-lg border'>
      <CardHeader className='text-center p-4'>
        <Link href='/' className='inline-block mx-auto'>
          <Image
            src='/logo.svg'
            alt='Eventli Logo'
            width={32}
            height={32}
            className='h-8 w-auto'
          />
        </Link>
        <CardTitle className='text-xl font-bold text-gray-900 pt-3'>
          Create your {role} account
        </CardTitle>
        <CardDescription className='pt-1 text-sm text-gray-600'>
          Join the premier marketplace for event services.
        </CardDescription>
      </CardHeader>

      <CardContent className='p-6 pt-0'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Hidden input to pass the role to the server action */}
          <input type='hidden' name='role' value={role} />

          <div className='grid grid-cols-1 gap-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='fullName'>Full Name</Label>
              <Input
                id='fullName'
                name='fullName'
                placeholder='Enter your full name'
                required
                disabled={loading}
                className='h-10 text-sm'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='email'>Email Address</Label>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='you@example.com'
                required
                disabled={loading}
                className='h-10 text-sm'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='password'>Password</Label>
              <div className='relative'>
                <Input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Create a strong password'
                  required
                  disabled={loading}
                  onChange={e => setPassword(e.target.value)}
                  className='h-10 text-sm pr-10 [&::-ms-reveal]:hidden [&::-webkit-password-reveal-button]:hidden'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600'
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>
            </div>
          </div>

          <PasswordStrength password={password} />

          {/* reCAPTCHA component */}
          {RECAPTCHA_SITE_KEY ? (
            <ReCaptchaComponent
              // 'my-auto mx-10' is the tailwind CSS equivalent of `margin: auto 2.5rem`
              className='inline-block my-auto mx-10 mb-2'
              id='recaptcha'
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={handleCaptchaChange}
              onExpired={handleCaptchaExpired}
            />
          ) : (
            <p className='text-sm text-red-500'>
              reCAPTCHA site key is missing. Please set NEXT_PUBLIC_RECAPTCHA_SITE_KEY.
            </p>
          )}

          <Button
            type='submit'
            className={cn(
              'w-full h-10 bg-teal-600 hover:bg-teal-700 text-white font-semibold',
              'shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]'
            )}
            disabled={loading || !isCaptchaVerified}
          >
            {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Create Account
          </Button>
        </form>

        <div className='relative my-4'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-white px-2 text-muted-foreground'>or</span>
          </div>
        </div>

        <Button
          variant='outline'
          className='w-full'
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
        >
          {googleLoading ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <GoogleIcon />
          )}
          Sign Up with Google
        </Button>

        <p className='text-center text-sm text-gray-600 mt-6'>
          Already have an account?{' '}
          <Link
            href='/login'
            className='font-semibold text-teal-600 hover:text-teal-700 transition'
          >
            Sign In
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

// cspell:words sonner Eventli
