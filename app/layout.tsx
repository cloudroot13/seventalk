import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cypher Chat | Secure & Private',
  description: 'End-to-end encrypted messaging with auto-delete',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} bg-gray-950 text-gray-100 antialiased overflow-hidden`}>
        {children}
      </body>
    </html>
  )
}