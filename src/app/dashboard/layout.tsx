import { createClient } from "@/shared/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayoutWrapper from "@/shared/components/layout/DashboardLayoutWrapper";


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

  // Fetch user profile to verify seller role
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== "seller") {
    redirect('/login'); // Only sellers can access dashboard
  }

  return (
    <DashboardLayoutWrapper>
      {children}
    </DashboardLayoutWrapper>
  );
}