export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <h1 className="text-2xl font-medium">Update Password</h1>
      <p className="text-sm text-foreground">
        Enter your new password below.
      </p>
      {/* TODO: Add ResetPasswordForm component. */}
      <div className="p-4 bg-muted rounded-md text-center">
        Reset Password Form - Coming Soon
      </div>
    </div>
  )
}
