'use client'

import DashboardLayoutWrapper from "@/shared/components/layout/DashboardLayoutWrapper";
import { ReactNode } from 'react'

interface SellerLayoutProps {
  children: ReactNode
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  return (
    <DashboardLayoutWrapper>
      {children}
    </DashboardLayoutWrapper>
  )
}
