import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import PublicHeader from '@/components/PublicHeader'
import { AuthProvider } from '@/lib/auth/hooks'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Commercial Lending Platform',
  description: 'Transparent and easy commercial lending platform connecting borrowers with investors',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <PublicHeader />
            <main>{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}