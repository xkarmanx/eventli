'use client'

import { Button } from './ui/button'
import { createClient } from '@/shared/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <Button onClick={handleLogout} variant="destructive">
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  )
}