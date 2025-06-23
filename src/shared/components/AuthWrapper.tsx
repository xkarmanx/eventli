'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/client'

interface AuthWrapperProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function AuthWrapper({ children, redirectTo = "/login" }: AuthWrapperProps) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(redirectTo)
      }
    }
    
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push(redirectTo)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, redirectTo, supabase])

  return <>{children}</>
}