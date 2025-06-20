'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // kvs: Client-side validation with specific error messages
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        // kvs: Display the exact error message from the API instead of generic message
        return setError(data.error || 'Login failed. Please try again.');
      }

      // kvs: Fetch user and profile to determine where to redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not found after login');
        return;
      }

      // kvs: Check if user has completed profile setup
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, company_name')
        .eq('id', user.id)
        .single();

      // kvs: If no profile exists or incomplete setup, redirect to setup
      if (!profile || !profile.company_name) {
        router.push('/auth/setup-organization');
      } else if (profile?.role === 'SELLER') {
        router.push('/main/seller-dashboard');
      } else {
        router.push('/main/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      // kvs: Show network/connection error message
      setError('Network error. Please check your connection and try again.');
    }
  };  // kvs: Handle Google OAuth login with proper error handling
  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/main/seller-dashboard`
        }
      });
      
      if (error) {
        // kvs: Display specific Google OAuth error messages
        setError(error.message || 'Failed to sign in with Google. Please try again.');
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      // kvs: Show specific error for Google OAuth failures
      setError('Failed to connect to Google. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-teal-900">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <Image
          src="/logo.svg"
          alt="Eventli Logo"
          width={100}
          height={100}
          className="h-10 mb-6 mx-auto"
        />
        <h1 className="text-2xl text-black font-bold mb-6 text-center">Seller Login</h1>

        <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-black"
        />

        <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-left mb-1 mt-4">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-black pr-10"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
          >
            {showPassword ? <FaEyeSlash className="h-5 w-5 text-gray-500" /> : <FaEye className="h-5 w-5 text-gray-500" />}
          </button>
        </div>
        <div className="flex items-center justify-end mt-2">
          <a href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot Password?
          </a>
        </div>
        {/* kvs: Enhanced error display with better styling and visibility */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mt-2">
            {error}
          </div>
        )}
        <button className="bg-blue-600 text-white py-2 rounded w-full font-semibold mt-6">
          Login
        </button>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="mt-4 w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google sign-in"
            width={20}
            height={20}
            className="mr-2"
          />
          Sign in with Google
        </button>        <p className="text-center text-black text-sm mt-4">
          Don&apos;t have an account?{" "}
          <a href="/auth/signup" className="text-blue-600 font-medium">
            Sign-up
          </a>
        </p>
      </form>
    </div>
  );
}