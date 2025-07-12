export default function ForgotPasswordPage() {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <h1 className="text-2xl font-medium">Reset Password</h1>
      <p className="text-sm text-foreground">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>
      {/* TODO: Add ForgotPasswordForm component */}
      <div className="p-4 bg-muted rounded-md text-center">
        Forgot Password Form - Coming Soon
      </div>
    </div>
  )
}
