'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, List, LifeBuoy, ChevronLeft, ChevronRight, LogOut, Menu, X, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { signOut } from '@/features/auth/actions'

// JC: Added TrendingUp icon for boosting feature 
const navItems = [
  { name: "Dashboard", href: "/dashboard/seller", icon: LayoutDashboard },
  { name: "Listings", href: "/dashboard/seller/listings", icon: List },
  { name: "Boosting", href: "/dashboard/seller/boosting", icon: TrendingUp },
  { name: "Profile", href: "/dashboard/seller/profile", icon: User },
  { name: "Support", href: "/dashboard/seller/support", icon: LifeBuoy },
];

export default function SellerSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Handle mobile menu backdrop click and body scroll
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          id="sidebar-backdrop"
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          bg-white flex flex-col py-4 sm:py-6 px-3 sm:px-4 border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out
          ${collapsed ? "w-16 sm:w-20" : "w-64 sm:w-72"}
          
          /* Mobile styles */
          fixed lg:sticky top-0 left-0 h-screen z-40
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          
          /* Desktop styles */
          lg:block lg:h-screen lg:overflow-y-auto
        `}
      >
        {/* Header Section */}
        <div className="flex-1">
          {/* Logo/Brand Area with Collapse Button */}
          <div className={`mb-4 sm:mb-6 flex items-center ${collapsed ? "justify-center" : "justify-between"} mt-12 lg:mt-0`}>
            {!collapsed && (
              <Link href="/" className="flex-1">
                <Image
                  src="/logo.svg"
                  alt="Eventli Logo"
                  width={200}
                  height={32}
                  className="h-8 sm:h-10"
                />
              </Link>
            )}
            
            {/* Collapse Button - Hidden on mobile */}
            <button
              className="hidden lg:block cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 ease-in-out group flex-shrink-0"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              type="button"
            >
              {collapsed ? (
              <ChevronRight size={18} className="text-gray-600 group-hover:text-teal-700 transition-colors" />
            ) : (
              <ChevronLeft size={18} className="text-gray-600 group-hover:text-teal-700 transition-colors" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            // Check if the nav item is active
            const isActive = pathname == item.href;

            const Icon = item.icon;

            // Render each navigation link with icon and label
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 px-3 sm:px-4 py-3 rounded-lg transition-all duration-200 ease-in-out text-sm sm:text-base
                  ${
                    isActive
                      ? "bg-teal-600 text-white font-semibold shadow-md"
                      : "text-gray-700 hover:bg-teal-100 hover:text-teal-700"
                  }
                  ${collapsed ? "justify-center px-2" : ""}
                `}
                title={collapsed ? item.name : undefined}
              >
                <Icon 
                  size={20} 
                  className={`shrink-0 transition-colors duration-200 ${
                    isActive ? "text-white" : "text-gray-600 group-hover:text-teal-700"
                  }`} 
                />
                {!collapsed && (
                  <span className="font-medium transition-all duration-200">
                    {item.name}
                  </span>
                )}
                {/* Active indicator */}
                {isActive && !collapsed && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Section - Logout Button */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full group flex items-center gap-3 px-3 sm:px-4 py-3 rounded-lg transition-all duration-200 ease-in-out text-gray-700 hover:bg-red-50 hover:text-red-600 cursor-pointer text-sm sm:text-base"
          >
            <LogOut 
              size={20} 
              className="shrink-0 text-gray-600 group-hover:text-red-600 transition-colors duration-200" 
            />
            {!collapsed && (
              <span className="font-medium transition-all duration-200">
                Logout
              </span>
            )}
          </button>
        </form>
      </div>
    </aside>
    </>
  );
}