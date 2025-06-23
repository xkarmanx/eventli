import './globals.css'

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
    <html lang="en">
      <body>
        <main className="min-h-screen flex flex-col items-center">
          {children}
        </main>
      </body>
    </html>
  )
}