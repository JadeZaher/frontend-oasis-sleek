import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { OasisProvider } from '@/lib/oasis-context'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'OASIS Sleek - Avatar NFT & Blockchain Platform',
  description:
    'Advanced avatar NFT platform with blockchain connectivity and holon integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OasisProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </OasisProvider>
      </body>
    </html>
  )
}
