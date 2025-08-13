// src/app/(auth)/auth/callback/callback-client.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/client";
import { updateProfileComplete } from "@/features/services/profile_crud";

export default function EmailVerificationCallbackClient() {
  const [status, setStatus] = useState("Verifying your email...");
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const verifyEmail = async () => {
      try {
        const url = window.location.href;

        // Handle hash token (mobile / deep link flows)
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

        // Get pending_email to decide if fully verified
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("pending_email")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Failed to fetch profile:", profileError.message);
          setStatus("Email verified, but unable to check verification status.");
          return;
        }

        const pendingEmail = profileData?.pending_email;
        const isFullyVerified = !pendingEmail || pendingEmail === user.email;

        if (isFullyVerified) {
          // Clear pending fields
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              pending_email: null,
              pending_email_requested_at: null,
            })
            .eq("id", user.id);

          await updateProfileComplete(user.id);

          if (updateError) {
            console.error("Failed to update profile:", updateError.message);
            setStatus("Email verified, but cleanup failed.");
            return;
          }

          // Fetch role for redirect
          const { data: roleData, error: roleErr } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (roleErr) {
            console.error("Role fetch failed:", roleErr.message);
          }

          const role = roleData?.role === "seller" ? "seller" : "customer";

          setStatus("Your email was successfully updated!");
          setShouldRedirect(true);

          // Refresh session (best effort)
          await supabase.auth.getSession();

          setTimeout(() => {
            router.push(`/dashboard/${role}/profile`);
          }, 2500);
        } else {
          setStatus(
            "✅ 1/2 confirmations done. Please check your other inbox and use the link to complete your verification."
          );
        }
      } catch (err) {
        console.error("Unhandled error:", err);
        setStatus("An unexpected error occurred.");
      }
    };

    verifyEmail();
  }, [router]);

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center p-8 bg-white shadow-lg rounded-xl">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Email Verification</h1>

        <div className="mb-4 text-gray-700">
          {status.includes("successfully updated") && <p>Your email has been successfully updated! 🎉</p>}
          {status.includes("1/2 confirmations") && <p className="text-yellow-600">{status}</p>}
          {status.includes("Verification failed") && <p className="text-red-600">{status}</p>}
          {status.includes("logged in") && <p className="text-orange-600">{status}</p>}
          {!status.includes("successfully") &&
            !status.includes("1/2") &&
            !status.includes("failed") &&
            !status.includes("logged in") && <p>{status}</p>}
        </div>

        {shouldRedirect && (
          <div className="text-sm text-gray-500 mt-2">Redirecting to your dashboard...</div>
        )}

        {!shouldRedirect && status.includes("1/2") && (
          <div className="text-sm text-gray-500 mt-2">
            You will be redirected after completing the second confirmation.
          </div>
        )}

        {!status.includes("successfully") && !status.includes("1/2") && (
          <div className="mt-6">
            <div className="w-8 h-8 mx-auto border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}