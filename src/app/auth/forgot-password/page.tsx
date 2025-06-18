'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ForgotPasswordPage() {
  const [form, setForm] = useState({ email: '', newPassword: '', confirmNewPassword: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  const togglePasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmNewPassword(!showConfirmNewPassword);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.email || !form.newPassword || !form.confirmNewPassword) {
      setError('Please fill in all fields.');
      return;
    }
    
    if (form.newPassword !== form.confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }

    // Since no backend is needed, we'll just simulate a success
    console.log('Password reset form submitted:', form);
    setMessage('If an account with this email exists, a password reset link has been sent (simulated).');
    setForm({ email: '', newPassword: '', confirmNewPassword: '' });
    // Optionally, redirect or show a more persistent success message
    router.push('/auth/login');
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-teal-900'>
      <form onSubmit={handleSubmit} className='bg-white p-8 rounded-2xl shadow-lg w-full max-w-md'>
        <Image src="/logo.svg" alt='Eventli Logo' className='h-10 mb-6 mx-auto' width={101} height={37} />
        <h1 className='text-2xl text-black font-bold mb-6 text-center'>Reset Your Password</h1>

        <label htmlFor='email' className='block text-sm font-medium text-gray-700 text-left mb-1'>Email</label>

        <input
          id='email'
          name='email'
          type='email'
          placeholder='Enter your email'
          value={form.email}
          onChange={handleChange}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-black'
        />

        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 text-left mb-1 mt-4">
          New Password
        </label>
        <div className="relative">
          <input
            id="newPassword"
            name="newPassword"
            type={showNewPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-black pr-10"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
          >
            {showNewPassword ? <FaEyeSlash className="h-5 w-5 text-gray-500" /> : <FaEye className="h-5 w-5 text-gray-500" />}
          </button>
        </div>

        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 text-left mb-1 mt-4">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            id="confirmNewPassword"
            name="confirmNewPassword"
            type={showConfirmNewPassword ? 'text' : 'password'}
            placeholder="Re-enter new password"
            value={form.confirmNewPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-black pr-10"
          />
          <button
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
          >
            {showConfirmNewPassword ? <FaEyeSlash className="h-5 w-5 text-gray-500" /> : <FaEye className="h-5 w-5 text-gray-500" />}
          </button>
        </div>

        {error && <p className='text-red-600 text-sm mt-2 mb-2'>{error}</p>}
        {message && <p className='text-green-600 text-sm mt-2 mb-2'>{message}</p>}

        <button type='submit' className='bg-blue-600 text-white py-2 rounded w-full font-semibold mt-6'>
          Reset Password
        </button>

        <p className='text-center text-black text-sm mt-4'>
          Remembered your password? <a href='/auth/login' className='text-blue-600 font-medium'>Login</a>
        </p>
      </form>
    </div>
  );
}
