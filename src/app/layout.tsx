import './globals.css'
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "sonner"

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
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster position='top-right'/>
      </body>
    </html>
  )
}