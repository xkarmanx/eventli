import { SignupForm } from '@/features/auth/components/SignupForm'
import Link from 'next/link'

export default function SignupPage() {
    return (
        <div className="flex flex-col items-center justify-center w-full">
            <SignupForm />
            <p className="text-center text-sm text-white mt-4">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold hover:underline">
                    Sign In
                </Link>
            </p>
        </div>
    )
}