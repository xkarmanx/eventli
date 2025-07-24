'use client';

import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import { login, signInWithGoogle } from '@/features/auth/actions';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';
import ReCaptchaComponent, { ReCaptchaComponentRef } from '@/shared/components/ReCaptchaInstance';
import AuthModal from '@/shared/components/ui/AuthModal';

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

export function LoginForm() {
  // Navigation and URL parameter hooks
  const router = useRouter();
  const searchParams = useSearchParams();

  // Loading states for different authentication methods
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  
  // UI state management
  const [showPassword, setShowPassword] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

  // reCAPTCHA state management
  const [recaptchaToken, setRecaptchaToken] = React.useState<string | null>(null);
  const [isCaptchaVerified, setIsCaptchaVerified] = React.useState<boolean>(false);
  const recaptchaRef = React.useRef<ReCaptchaComponentRef>(null);

  // Form validation state
  const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = React.useState({
    email: '',
    password: ''
  });
  
  const [touched, setTouched] = React.useState({
    email: false,
    password: false
  });

  const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  /* ========== VALIDATION FUNCTIONS ========== */
  
  /**
   * Validates email address according to industry standards
   * - Must be a valid email format
   * - Maximum length of 254 characters (RFC 5321)
   * - Basic sanitization against common attacks
   */
  const validateEmail = (email: string): string => {
    if (!email.trim()) {
      return 'Email address is required';
    }
    
    if (email.length > 254) {
      return 'Email address is too long';
    }
    
    // Industry standard email regex (RFC 5322 compliant)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    
    // Check for suspicious patterns
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      return 'Please enter a valid email address';
    }
    
    return '';
  };

  /**
   * Validates password according to security best practices
   * - Minimum 8 characters
   * - Maximum 128 characters (prevent DoS attacks)
   * - Must contain at least one number, one letter
   * - No leading/trailing whitespace
   */
  const validatePassword = (password: string): string => {
    if (!password) {
      return 'Password is required';
    }
    
    if (password !== password.trim()) {
      return 'Password cannot start or end with spaces';
    }
    
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    
    if (password.length > 128) {
      return 'Password is too long (maximum 128 characters)';
    }
    
    // Check for at least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasLetter) {
      return 'Password must contain at least one letter';
    }
    
    if (!hasNumber) {
      return 'Password must contain at least one number';
    }
    
    return '';
  };

  /**
   * Validates the entire form and returns true if valid
   */
  const validateForm = (): boolean => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    
    setErrors({
      email: emailError,
      password: passwordError
    });
    
    return !emailError && !passwordError;
  };

  /* ========== EVENT HANDLERS ========== */

  /**
   * Handles input changes with real-time validation and security sanitization
   */
  const handleInputChange = (field: 'email' | 'password', value: string) => {
    // Security: Prevent potential XSS and injection attacks
    let sanitizedValue = value;
    
    if (field === 'email') {
      // For email, remove potentially dangerous characters but keep valid email chars
      sanitizedValue = value.replace(/[<>'"]/g, '').slice(0, 254);
    } else {
      // For password, limit length but preserve all characters for security
      sanitizedValue = value.slice(0, 128);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));
    
    // Real-time validation only after field has been touched to avoid annoying users
    if (touched[field]) {
      const error = field === 'email' 
        ? validateEmail(sanitizedValue) 
        : validatePassword(sanitizedValue);
      
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  /**
   * Handles field blur events to mark fields as touched and trigger validation
   */
  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    // Validate on blur to provide immediate feedback
    const error = field === 'email' 
      ? validateEmail(formData[field]) 
      : validatePassword(formData[field]);
    
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  /**
   * Resets form validation state (useful for retry scenarios)
   */
  const resetValidation = () => {
    setErrors({ email: '', password: '' });
    setTouched({ email: false, password: false });
  };

  /* ========== reCAPTCHA HANDLERS ========== */
  
  /**
   * Handles reCAPTCHA token changes
   */
  function handleCaptchaChange(token: string | null) {
    console.log('reCAPTCHA token:', token);
    setRecaptchaToken(token);
    setIsCaptchaVerified(!!token); // true if token exists, false otherwise
  }

  /**
   * Handles reCAPTCHA token expiration
   */
  function handleCaptchaExpired() {
    console.warn('reCAPTCHA token expired. Please re-verify.');
    toast.error('reCAPTCHA has expired. Please verify again.');
    setRecaptchaToken(null);
    setIsCaptchaVerified(false);
    recaptchaRef.current?.reset(); // Reset the reCAPTCHA widget
  }

  /* ========== EFFECTS ========== */
  
  // Check for URL error parameters on component mount
  React.useEffect(() => {
    const error = searchParams.get('error');
    if (error) toast.error(decodeURIComponent(error));
  }, [searchParams]);

  /* ========== FORM SUBMISSION HANDLERS ========== */
  
  /**
   * Handles form submission with comprehensive validation and security measures
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // Security: Prevent double submission
    if (loading) return;
    
    // Mark all fields as touched to show validation errors
    setTouched({
      email: true,
      password: true
    });
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    // Check reCAPTCHA verification
    if (!isCaptchaVerified) {
      toast.error('Please complete the reCAPTCHA verification');
      return;
    }
    
    setLoading(true);
    toast.info('Signing you in...');
    
    try {
      // Security: Create FormData with sanitized and validated inputs
      const submitData = new FormData();
      submitData.append('email', formData.email.trim().toLowerCase()); // Normalize email
      submitData.append('password', formData.password);
      submitData.append('recaptchaToken', recaptchaToken as string);

      await login(submitData);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('SUCCESS:')) {
        // ✅ Handle success case - show success message and redirect
        toast.success('Login successful!');
        // Clear sensitive form data on success
        setFormData({ email: '', password: '' });
        resetValidation();
        setTimeout(() => router.push('/dashboard'), 1000);
      } else {
        // Handle authentication errors
        const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
        toast.error(errorMessage);
        
        // Security: Reset reCAPTCHA on failed attempts to prevent brute force
        setRecaptchaToken(null);
        setIsCaptchaVerified(false);
        recaptchaRef.current?.reset();
        
        // Clear password on failed login for security
        setFormData(prev => ({ ...prev, password: '' }));
        
        // Reset validation for retry
        resetValidation();
      }
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handles Google Sign-In
   */
  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    toast.info('Redirecting to Google...');
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to sign in with Google'
      );
      setGoogleLoading(false);
    }
  }

  return (
    <>
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
          Welcome back
        </CardTitle>
        <CardDescription className='pt-1 text-sm text-gray-600'>
          Sign in to continue to Eventli.
        </CardDescription>
      </CardHeader>

      <CardContent className='p-6 pt-0'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Email Input Field with Validation */}
          <div className='space-y-1.5'>
            <Label htmlFor='email'>Email Address</Label>
            <Input
              id='email'
              name='email'
              type='email'
              placeholder='you@example.com'
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              required
              disabled={loading}
              className={cn(
                'h-10 text-sm transition-colors',
                errors.email && touched.email
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-teal-500 focus:ring-teal-500'
              )}
              aria-invalid={errors.email && touched.email ? 'true' : 'false'}
              aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
            />
            {/* Email Error Message */}
            {errors.email && touched.email && (
              <p 
                id="email-error" 
                className="text-sm text-red-600 flex items-center mt-1"
                role="alert"
              >
                <span className="text-red-500 mr-1">⚠</span>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Input Field with Validation */}
          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='password'>Password</Label>
              <Link
                href='/forgot-password'
                className='text-sm font-medium text-teal-600 hover:text-teal-700 transition'
              >
                Forgot password?
              </Link>
            </div>

            <div className='relative'>
              <Input
                id='password'
                name='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='••••••••'
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                required
                disabled={loading}
                className={cn(
                  'h-10 text-sm pr-10 transition-colors',
                  '[&::-ms-reveal]:hidden [&::-webkit-password-reveal-button]:hidden',
                  errors.password && touched.password
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                )}
                aria-invalid={errors.password && touched.password ? 'true' : 'false'}
                aria-describedby={errors.password && touched.password ? 'password-error' : undefined}
              />

              {/* Password Visibility Toggle Button */}
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className='h-5 w-5' />
                ) : (
                  <Eye className='h-5 w-5' />
                )}
              </button>
            </div>
            
            {/* Password Error Message */}
            {errors.password && touched.password && (
              <p 
                id="password-error" 
                className="text-sm text-red-600 flex items-center mt-1"
                role="alert"
              >
                <span className="text-red-500 mr-1">⚠</span>
                {errors.password}
              </p>
            )}
          </div>

          {/* reCAPTCHA Component */}
          {RECAPTCHA_SITE_KEY ? (
            <ReCaptchaComponent
              className='inline-block my-auto mx-11 mb-2'
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

          {/* Submit Button with Enhanced Validation */}
          <Button
            type='submit'
            className={cn(
              'w-full h-10 bg-teal-600 hover:bg-teal-700 text-white font-semibold',
              'shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
            )}
            disabled={
              loading || 
              !isCaptchaVerified || 
              !formData.email.trim() || 
              !formData.password ||
              (touched.email && errors.email !== '') ||
              (touched.password && errors.password !== '')
            }
          >
            {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Sign In
          </Button>
          
          {/* Form Status Messages */}
          {!isCaptchaVerified && RECAPTCHA_SITE_KEY && (
            <p className="text-sm text-amber-600 text-center">
              Please complete the reCAPTCHA verification to continue
            </p>
          )}
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
          Sign In with Google
        </Button>

        <p className='text-center text-sm text-gray-600 mt-6'>
          {"Don't have an account?"}{' '}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className='font-semibold text-teal-600 hover:text-teal-700 transition cursor-pointer'
          >
            Sign Up
          </button>
        </p>
      </CardContent>
    </Card>

      {/* Auth Modal for signup role selection */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        type="signup"
        onSwitchMode={() => {}}
      />
    </>
  );
}