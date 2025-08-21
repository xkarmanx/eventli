// Forgot Password Form Component
// This component renders a form allowing the user to request a password reset
// email.  It uses Supabase via a server action to send the reset link.
'use client';

import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import ReCaptchaComponent, { ReCaptchaComponentRef } from '@/shared/components/ReCaptchaInstance';
import { requestPasswordReset } from '@/features/auth/actions';

export default function ForgotPasswordForm() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const recaptchaRef = React.useRef<ReCaptchaComponentRef>(null);
  const [isCaptchaVerified, setIsCaptchaVerified] = React.useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isCaptchaVerified) {
      toast.error('Please complete the captcha verification.');
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append('email', email);
    const { status, message } = await requestPasswordReset(fd);
    if (status === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fp-email">Email</Label>
        <Input
          id="fp-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
      </div>
      {/* CAPTCHA to prevent bots */}
      <ReCaptchaComponent
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
        onChange={(token) => setIsCaptchaVerified(!!token)}
        ref={recaptchaRef}
      />
      <Button type="submit" disabled={loading || !isCaptchaVerified}>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </Button>
    </form>
  );
}
