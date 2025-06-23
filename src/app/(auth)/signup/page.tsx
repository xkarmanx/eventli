import { SignupForm } from '@/features/auth/components/SignupForm'
import Image from 'next/image'
import Link from 'next/link'

export default function SignupPage() {
    return (
        <div className="w-full min-h-screen flex items-center justify-center relative p-4">
            {/* Background Image */}
            <Image
                src="/assets/hero-background.jpg" 
                alt="Beautiful event background"
                fill
                className="object-cover"
                priority
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center w-full">
                <SignupForm />
                <p className="text-center text-sm text-white mt-8">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold underline hover:text-gray-200 transition">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    )
}