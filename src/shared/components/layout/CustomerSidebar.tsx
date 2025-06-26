'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, Calendar, LifeBuoy, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Profile", href: "/dashboard/customer/profile", icon: User },
  { name: "Bookings", href: "/dashboard/customer/bookings", icon: Calendar },
  { name: "Support", href: "/dashboard/customer/support", icon: LifeBuoy },
];

export default function CustomerSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    // Sidebar container (collapsible)
    <aside
      className={`bg-white flex flex-col py-6 px-4 border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header Section */}
      <div className="flex-1">
        {/* Logo/Brand Area with Collapse Button */}
        <div className={`mb-6 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <Link href="/" className="flex-1">
              <Image
                src="/logo.svg"
                alt="Eventli Logo"
                width={200}
                height={32}
                className="h-10"
              />
            </Link>
          )}
          
          {/* Collapse Button */}
          <button
            className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 ease-in-out group flex-shrink-0"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            type="button"
          >
            {collapsed ? (
              <ChevronRight size={25} className="text-gray-600 group-hover:text-teal-700 transition-colors" />
            ) : (
              <ChevronLeft size={25} className="text-gray-600 group-hover:text-teal-700 transition-colors" />
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
                className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out
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
        <a
          href="/api/auth/signout"
          className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out text-gray-700 hover:bg-red-50 hover:text-red-600 cursor-pointer
            ${collapsed ? "justify-center px-2" : ""}
          `}
          title={collapsed ? "Logout" : undefined}
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
        </a>
      </div>
    </aside>
  );
}