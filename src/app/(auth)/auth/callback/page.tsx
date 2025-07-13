"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/client";

export default function EmailVerificationCallback() {
  const [status, setStatus] = useState("Verifying your email...");
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const verifyEmail = async () => {
      try {
        const url = window.location.href;

        if (url.includes("#access_token")) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(url);
          if (exchangeError) {
            console.error("Exchange failed:", exchangeError.message);
            setStatus("Verification failed. Please try again.");
            return;
          }
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error("User not authenticated:", userError?.message);
          setStatus("You must be logged in to verify your email.");
          return;
        }

        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            pending_email: null,
            pending_email_requested_at: null,
          })
          .eq("id", user.id);

        if (updateError) {
          console.error("Failed to update profile:", updateError.message);
          setStatus("Email verified, but cleanup failed.");
        } else {
          setStatus("Your email was successfully updated!");
        }

        setTimeout(() => {
          router.push("/dashboard"); // or profile
        }, 2500);
      } catch (err) {
        console.error("Unhandled error:", err);
        setStatus("An unexpected error occurred.");
      }
    };

    verifyEmail();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-center p-4">
      <div className="text-lg text-gray-700">{status}</div>

      <div>
        {status.includes("successfully") && (
            <div className="mt-4 text-gray-700 text-sm">Redirecting to your dashboard...</div>
        )}
      </div>
    </div>
  );
}
