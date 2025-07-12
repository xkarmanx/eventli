import { LoginForm } from '@/features/auth/components/LoginForm'
import { Suspense } from 'react'

export default function LoginPage() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-teal-900 p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}