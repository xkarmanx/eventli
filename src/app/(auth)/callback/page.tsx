// app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/client";

// CT: This page handles the email verification callback from Supabase when users click the verification link in their email.
export default function EmailVerificationCallback() {
  const [status, setStatus] = useState("Verifying...");
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    async function verifyEmail() {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        console.error("Email verification failed:", error.message);
        setStatus("Verification failed. Please try again.");
      } else {
        setStatus("Email verified! Updating your profile...");
        
        // Clear pending_email in the profiles table
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ pending_email: null, pending_email_requested_at: null })
            .eq("id", user.id);
          
          if (updateError) {
            console.error("Failed to clear pending email:", updateError.message);
            setStatus("Email verified, but cleanup failed.");
          } else {
            setStatus("Email successfully verified!");
          }
        }

        // Optional: redirect to dashboard/profile after a delay
        setTimeout(() => {
          router.push("/dashboard"); // or your profile page
        }, 2000);
      }
    }

    verifyEmail();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-center p-4">
      <div className="text-lg text-gray-700">{status}</div>
    </div>
  );
}
