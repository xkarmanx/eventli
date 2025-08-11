import SellerSidebar from "@/shared/components/layout/SellerSidebar";
import DashboardHeader from "@/shared/components/layout/DashboardHeader"; // JC: Reusable header component for dashboard
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
    redirect('/login');
  }

  // Fetch user profile to determine role - JC: Check user role to show correct sidebar
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login'); // fallback
  }
  // You could potentially fetch the profile here and redirect if not a seller,
  // but for now, we'll let individual pages handle their content.


  //JC: Show different sidebar based on user role - render customer or seller sidebar
  const isCustomer = profile.role === "customer";

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Mobile backdrop overlay */}
      <div className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity" id="sidebar-backdrop"></div>
      
      {/* Sidebar - responsive behavior */}
      <div className="relative z-50">
        {isCustomer ? <CustomerSidebar /> : <SellerSidebar />}
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Dashboard Header */}
        <DashboardHeader 
          userType={isCustomer ? "customer" : "seller"}
          title="Dashboard"
          subtitle={`Welcome back! Manage your ${isCustomer ? "bookings" : "listings"} and profile.`}
        />
        
        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}