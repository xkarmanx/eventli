'use client';

import { ShoppingBag, User, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/core/Button';
import { cn } from '@/shared/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'signup';
  onSwitchMode?: (newType: 'login' | 'signup') => void;
}

export default function AuthModal({ isOpen, onClose, type, onSwitchMode }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      // Add keyboard event listener for ESC key
      function handleEscKey(e: KeyboardEvent) {
        if (e.key === 'Escape')
          onClose();
      }

      document.addEventListener('keydown', handleEscKey);

      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    } else
      document.body.style.overflow = 'unset';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen)
    return null;

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget)
      onClose();
  }

  const title = type === 'login' ? 'Welcome Back!' : 'Join Eventli';
  const part = type === 'login' ? 'to sign in' : 'to get started';
  const subtitle = 'Choose how you want ' + part;

  return (
    <div
      className={cn(
        'fixed inset-0 bg-gray-100/80 backdrop-blur-sm z-50 flex items-center',
        `justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`
      )}
      onClick={handleBackdropClick}
      role='dialog'
      aria-modal='true'
      aria-labelledby='auth-modal-title'
      aria-describedby='auth-modal-description'
    >
      <div
        className={cn(
          'bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative transform transition-all',
          `duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`
        )}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10'
          aria-label='Close modal'
        >
          <X className='w-5 h-5 text-gray-500' />
        </button>

        {/* Modal Content */}
        <div className='p-8 pt-12'>
          <div className='text-center mb-8'>
            <h2
              id='auth-modal-title'
              className='text-2xl font-bold text-gray-900 mb-2'
            >
              {title}
            </h2>
            <p id='auth-modal-description' className='text-gray-600'>
              {subtitle}
            </p>
          </div>

          {type === 'login' ? (
            // Login Options
            <div className='space-y-4'>
              <Link href='/login' onClick={onClose} className='block'>
                <div
                  className={cn(
                    'group border-2 border-gray-200 rounded-xl p-6 hover:border-teal-500 hover:bg-teal-50',
                    'hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.02]'
                  )}
                >
                  <div className='flex items-center space-x-4'>
                    <div className='bg-teal-100 group-hover:bg-teal-200 p-3 rounded-full transition-colors'>
                      <User className='w-6 h-6 text-teal-600' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-gray-900 mb-1 group-hover:text-teal-700 transition-colors'>
                        Log in to your account
                      </h3>
                      <p className='text-sm text-gray-600 group-hover:text-gray-700 transition-colors'>
                        Continue to your dashboard and manage your account
                      </p>
                    </div>
                    <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                      <div className='w-2 h-2 bg-teal-500 rounded-full'></div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ) : (
            // Signup Options
            <div className='space-y-4'>
              {/* Customer/Buyer Option */}
              <Link
                href='/signup?role=customer'
                onClick={onClose}
                className='block'
              >
                <div className='group border-2 border-gray-200 rounded-xl p-6 hover:border-teal-500 hover:bg-teal-50 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.02]'>
                  <div className='flex items-center space-x-4'>
                    <div className='bg-teal-100 group-hover:bg-teal-200 p-3 rounded-full transition-colors'>
                      <User className='w-6 h-6 text-teal-600' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-gray-900 mb-1 group-hover:text-teal-700 transition-colors'>
                        Sign up as Customer
                      </h3>
                      <p className='text-sm text-gray-600 group-hover:text-gray-700 transition-colors'>
                        Find and book amazing services for your events
                      </p>
                    </div>
                    <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                      <div className='w-2 h-2 bg-teal-500 rounded-full'></div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Seller Option */}
              <Link
                href='/signup?role=seller'
                onClick={onClose}
                className='block'
              >
                <div
                  className={cn(
                    'group border-2 border-gray-200 rounded-xl p-6 hover:border-purple-500 hover:bg-purple-50',
                    'hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.02]'
                  )}
                >
                  <div className='flex items-center space-x-4'>
                    <div className='bg-purple-100 group-hover:bg-purple-200 p-3 rounded-full transition-colors'>
                      <ShoppingBag className='w-6 h-6 text-purple-600' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors'>
                        Sign up as Service Provider
                      </h3>
                      <p className='text-sm text-gray-600 group-hover:text-gray-700 transition-colors'>
                        Offer your services and grow your business
                      </p>
                    </div>
                    <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                      <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Footer with mode switch */}
          <div className='mt-8 pt-6 border-t border-gray-200 text-center'>
            {type === 'login' ? (
              <p className='text-sm text-gray-600'>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => onSwitchMode?.('signup')}
                  className='text-teal-600 hover:text-teal-700 font-medium'
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className='text-sm text-gray-600'>
                Already have an account?{' '}
                <button
                  onClick={() => onSwitchMode?.('login')}
                  className='text-teal-600 hover:text-teal-700 font-medium'
                >
                  Log in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
