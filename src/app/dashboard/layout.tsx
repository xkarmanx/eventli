import { SellerSidebar } from "@/shared/components/layout/SellerSidebar";
import { createClient } from "@/shared/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // You could potentially fetch the profile here and redirect if not a seller,
  // but for now, we'll let individual pages handle their content.

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <SellerSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}