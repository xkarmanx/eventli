import { SignupForm } from '@/features/auth/components/SignupForm'
import Link from 'next/link'

export default function SignupPage() {
    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-teal-900 p-4">
            <SignupForm />
            
        </div>
    )
}