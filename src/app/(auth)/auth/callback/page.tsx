// src/app/(auth)/auth/callback/page.tsx
import { Suspense } from "react";
import EmailVerificationCallbackClient from "./callback-client";

export const dynamic = "force-dynamic"; // make sure this never tries to pre-render
export const revalidate = 0;

export default function EmailVerificationCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen min-w-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center p-8 bg-white shadow-lg rounded-xl">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              Email Verification
            </h1>
            <div className="mt-6">
              <div className="w-8 h-8 mx-auto border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Verifying your email…
            </p>
          </div>
        </div>
      }
    >
      <EmailVerificationCallbackClient />
    </Suspense>
  );
}
