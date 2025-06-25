import { SignupForm } from '@/features/auth/components/SignupForm'
import Link from 'next/link'
import { Suspense } from 'react'

// Wrap with Suspense because useSearchParams() is a Client Component hook
function SignupPageContent() {
    return <SignupForm />
}

export default function SignupPage() {
    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-teal-900 p-4">
            <Suspense fallback={<div>Loading...</div>}>
                <SignupPageContent />
            </Suspense>
            <p className="text-center text-sm text-white mt-6">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-white underline hover:text-gray-200">
                    Sign In
                </Link>
            </p>
        </div>
    )
}