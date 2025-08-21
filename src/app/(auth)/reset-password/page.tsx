import ResetPasswordForm from '@/features/auth/components/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <h1 className="text-2xl font-medium">Update Password</h1>
      <p className="text-sm text-foreground">
        Enter your new password below.
      </p>
      <ResetPasswordForm />
    </div>
  )
}
