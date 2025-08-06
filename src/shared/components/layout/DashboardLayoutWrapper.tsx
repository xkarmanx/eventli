'use client';

import { createContext, useContext, useState } from 'react';
import SellerSidebar from './SellerSidebar';
import DashboardHeader from './DashboardHeader';

// Context to share sidebar state
const SidebarContext = createContext<{
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}>({
  collapsed: false,
  setCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
}

export default function DashboardLayoutWrapper({ children }: DashboardLayoutWrapperProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      <div className="flex min-h-screen bg-gray-50/50">
        {/* Mobile backdrop overlay - only render when mobile menu is open */}
        {mobileOpen && (
          <div 
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <SellerSidebar />
        
        {/* Main content area - responsive to sidebar state */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed 
            ? 'lg:ml-16 xl:ml-20' 
            : 'lg:ml-64 xl:ml-72'
        }`}>
          {/* Dashboard Header */}
          <DashboardHeader 
            userType="seller"
            title="Dashboard"
            subtitle="Welcome back! Manage your listings and profile."
          />
          
          {/* Page Content */}
          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
