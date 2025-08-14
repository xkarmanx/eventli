"use client";

import { ReactNode } from "react";
import CustomerSidebar from "@/shared/components/layout/CustomerSidebar";
import DashboardHeader from "@/shared/components/layout/DashboardHeader";

interface CustomerLayoutProps {
  children: ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader userType="customer" />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
