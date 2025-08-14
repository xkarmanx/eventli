import './globals.css';
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Suspense } from 'react'; // Import Suspense
import MobileBottomNav from "@/shared/components/layout/MobileBottomNav";
import { Footer } from '@/shared/components/layout/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Eventli - Plan Your Perfect Event',
  description: 'Connect with the best event service providers.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased pb-16 sm:pb-0">
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />

        {/* Wrap the component using client-side hooks in Suspense */}
        <Suspense fallback={null}>
          <MobileBottomNav />
        </Suspense>

        <Toaster position='top-right' />
      </body>
    </html>
  );
}