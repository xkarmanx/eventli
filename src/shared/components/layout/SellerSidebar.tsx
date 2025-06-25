'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { LayoutDashboard, List, Calendar, LifeBuoy, LogOut } from 'lucide-react';
import Image from 'next/image';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Listing', href: '/dashboard/listing', icon: List },
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { name: 'Support', href: '/dashboard/support', icon: LifeBuoy },
];

export function SellerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-gradient-to-br from-green-900 to-teal-900 text-white flex flex-col">
      <div className="h-20 flex items-center justify-center px-4 border-b border-white/10">
        <Link href="/" className="flex items-center">
            <Image src="/logo.svg" alt="Eventli Logo" width={40} height={40} />
        </Link>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-white/10 hover:translate-x-1 text-white/90 hover:text-white',
              pathname === item.href ? 'bg-white/20 text-white font-semibold' : ''
            )}
          >
            <item.icon className="h-5 w-5 mr-3" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 mt-auto border-t border-white/10">
         <a
            href="/api/auth/signout"
            className="flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ease-in-out hover:bg-red-500/20 hover:translate-x-1 text-white/90 hover:text-red-200"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Logout</span>
          </a>
      </div>
    </aside>
  );
}