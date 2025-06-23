import './globals.css'
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "sonner"
import { Header } from '@/shared/components/layout/Header'
import { Footer } from '@/shared/components/layout/Footer'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata = {
  title: 'Eventli - Plan Your Perfect Event',
  description: 'Connect with the best event service providers.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  )
}