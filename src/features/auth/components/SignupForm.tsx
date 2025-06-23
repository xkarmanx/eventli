'use client'

import React from 'react'
import { signup, signInWithGoogle } from '../actions'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'
import { toast } from "sonner"
import Image from 'next/image'
import { PasswordStrength } from './PasswordStrength'
import { User, Briefcase, Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import Link from 'next/link'

// Google Icon Component for consistent styling
const GoogleIcon = () => (
    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);


export function SignupForm() {
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<'customer' | 'seller'>('customer');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    toast.info("Creating your account...");
    try {
      const formData = new FormData(e.currentTarget);
      formData.append('role', role); // Manually append the selected role
      await signup(formData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred during signup.");
    } finally {
      setLoading(false);
    }
  }
  
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    toast.info("Redirecting to Google...");
    try {
      await signInWithGoogle();
    } catch (error) {
       toast.error(error instanceof Error ? error.message : "Failed to sign in with Google");
       setGoogleLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-lg shadow-2xl rounded-2xl bg-white/95 backdrop-blur-xl border-white/20">
        <CardHeader className="text-center p-8 pb-4">
            <Link href="/" className="inline-block mx-auto">
                <Image src="/logo.svg" alt="Eventli Logo" width={48} height={48} className="h-12 w-auto" />
            </Link>
            <CardTitle className="text-3xl font-bold text-gray-800 pt-4">Create your account</CardTitle>
            <CardDescription className="pt-1 text-base">Join the premier marketplace for event services.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-2">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" name="fullName" placeholder="Enter your full name" required disabled={loading} className="py-3 px-4 text-base" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" type="email" placeholder="you@example.com" required disabled={loading} className="py-3 px-4 text-base"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                          id="password" 
                          name="password" 
                          type="password" 
                          placeholder="Create a strong password" 
                          required 
                          disabled={loading}
                          onChange={(e) => setPassword(e.target.value)}
                          className="py-3 px-4 text-base"
                        />
                    </div>
                </div>
                
                <PasswordStrength password={password} />
                
                <div className="space-y-3">
                  <Label>How will you be using Eventli?</Label>
                  {/* Using custom state instead of RadioGroup for more flexible styling */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button type="button" onClick={() => setRole('customer')}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-lg border-2 p-4 text-center cursor-pointer transition-all duration-200",
                           role === 'customer' ? 'border-primary bg-primary/5' : 'border-muted hover:bg-accent'
                        )}>
                          <User className="h-6 w-6 mb-2 text-primary" />
                          <span className="font-semibold text-sm">I'm a Customer</span>
                          <span className="text-xs text-muted-foreground">Booking services</span>
                      </button>
                      <button type="button" onClick={() => setRole('seller')}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-lg border-2 p-4 text-center cursor-pointer transition-all duration-200",
                           role === 'seller' ? 'border-primary bg-primary/5' : 'border-muted hover:bg-accent'
                        )}>
                          <Briefcase className="h-6 w-6 mb-2 text-primary" />
                           <span className="font-semibold text-sm">I'm a Provider</span>
                           <span className="text-xs text-muted-foreground">Offering services</span>
                      </button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full bg-[var(--action-blue)] hover:bg-[var(--action-blue)]/90 font-semibold py-3 text-base h-auto" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
            </form>
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">OR</span>
                </div>
            </div>
            <Button variant="outline" className="w-full h-auto py-3 text-base" onClick={handleGoogleSignIn} disabled={loading || googleLoading}>
                {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                Sign Up with Google
            </Button>
        </CardContent>
    </Card>
  )
}

// cspell:words sonner Eventli
