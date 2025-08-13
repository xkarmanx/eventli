'use client';

import { createContext, ReactNode, useContext, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import DashboardHeader from './DashboardHeader';
import SellerSidebar from './SellerSidebar';

type Context = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

// Context to share sidebar state
const SidebarContext = createContext<Context>({
  collapsed: false,
  setCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {}
});

export const useSidebar = () => useContext(SidebarContext);

type Props = {
  children: ReactNode;
}

export default function DashboardLayoutWrapper({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}
    >
      <div className='flex min-h-screen bg-gray-50/50'>
        {/* Mobile backdrop overlay - only render when mobile menu is open */}
        {mobileOpen && (
          <div
            className='lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300'
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <SellerSidebar />

        {/* Main content area - responsive to sidebar state */}
        <div
          className={cn(
            'flex-1 flex flex-col min-w-0 transition-all duration-300',
            `${collapsed ? 'lg:ml-16 xl:ml-20' : 'lg:ml-64 xl:ml-72'}`
          )}
        >
          {/* Dashboard Header */}
          <DashboardHeader
            userType='seller'
            title='Dashboard'
            subtitle='Welcome back! Manage your listings and profile.'
          />

          {/* Page Content */}
          <main className='flex-1 p-3 sm:p-4 md:p-6 lg:p-8'>{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
