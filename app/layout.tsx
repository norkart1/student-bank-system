import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from 'next-themes'
import './globals.css'

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins"
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4a6670',
  colorScheme: 'light dark',
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://jdsa-students-bank.vercel.app'),
  title: 'JDSA Students Bank - Educational Banking System',
  description: 'Banking Made Simple for Students. A comprehensive, secure banking system designed specifically for educational institutions. Manage student accounts, deposits, withdrawals, and transactions with ease.',
  keywords: ['student banking', 'educational banking', 'account management', 'student accounts', 'banking system'],
  authors: [{ name: 'JDSA' }],
  creator: 'JDSA',
  publisher: 'JDSA Students Bank',
  
  // Open Graph / Social Media
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://jdsa-students-bank.vercel.app',
    siteName: 'JDSA Students Bank',
    title: 'JDSA Students Bank',
    description: 'Banking Made Simple for Students - A comprehensive banking system for educational institutions',
    images: [
      {
        url: '/placeholder-logo.png',
        width: 1200,
        height: 630,
        alt: 'JDSA Students Bank',
      },
    ],
  },
  
  // Twitter/X Card
  twitter: {
    card: 'summary_large_image',
    title: 'JDSA Students Bank',
    description: 'Banking Made Simple for Students',
    images: ['/placeholder-logo.png'],
  },
  
  // Favicon and Icons
  icons: {
    icon: [
      {
        url: `/favicon.png?v=2`,
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: `/apple-icon.png?v=2`,
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcut: [`/favicon.png?v=2`],
  },
  
  // Robots and Canonical
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="JDSA Bank" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
