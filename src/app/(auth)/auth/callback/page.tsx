"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/client";
import { updateProfileComplete } from "@/features/services/profile_crud";

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

          await updateProfileComplete(user.id);

        if (updateError) {
          console.error("Failed to update profile:", updateError.message);
          setStatus("Email verified, but cleanup failed.");
        } else {
          setStatus("Your email was successfully updated!");
        }

        // Force refresh the user session to get updated email
        const { data: sessionData, error: refreshError } = await supabase.auth.getSession();

        if (refreshError) {
        console.error("Failed to refresh session:", refreshError.message);
        } else {
        console.log("Session refreshed:", sessionData.session);
        }


        setTimeout(() => {
          router.push("/dashboard/seller/profile");
        }, 2500);
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
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Email Verification
        </h1>

        <div className="mb-4 text-gray-700">
            {status.includes("successfully") && (
            <p>Your email has been successfully updated! 🎉</p>
            )}

            {status.includes("Verification failed") && (
            <p className="text-red-600">{status}</p>
            )}

            {status.includes("You must be logged in") && (
            <p className="text-orange-600">{status}</p>
            )}

            {!status.includes("successfully") &&
            !status.includes("failed") &&
            !status.includes("logged in") && (
                <p>{status}</p>
            )}
        </div>

        {status.includes("successfully") && (
            <div className="text-sm text-gray-500 mt-2">
            Redirecting to your dashboard...
            </div>
        )}

        {!status.includes("successfully") && (
            <div className="mt-6">
            <div className="w-8 h-8 mx-auto border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )}
        </div>
    </div>
);
}
