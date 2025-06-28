import SellerSidebar from "@/shared/components/layout/SellerSidebar";
import { createClient } from "@/shared/lib/supabase/server";
import { redirect } from "next/navigation";
import CustomerSidebar from "@/shared/components/layout/CustomerSidebar";


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
    //redirect('/login');
  }

  // Fetch user profile to determine role -Joshua :)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  if (!profile) {
    //redirect('/login'); // fallback
  }
  // You could potentially fetch the profile here and redirect if not a seller,
  // but for now, we'll let individual pages handle their content.


  //I added this so it renders the appropriate sidebar according to which user role the person is logged in -Joshua 
  const isCustomer = profile?.role === "customer";

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Mobile backdrop overlay */}
      <div className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity" id="sidebar-backdrop"></div>
      
      {/* Sidebar - responsive behavior */}
      <div className="relative z-50">
        {isCustomer ? <CustomerSidebar /> : <SellerSidebar />}
      </div>
      
      {/* Main content area */}
      <main className="flex-1 w-full min-w-0 p-3 sm:p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}