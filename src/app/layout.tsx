import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalNavigation from "@/components/ConditionalNavigation";
import Providers from "@/components/Providers";
import ThemeLoader from "@/components/ThemeLoader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Essai - Smart Essay Evaluation Platform",
  description: "Transform your writing with AI-powered essay evaluation, scoring, and feedback. Perfect for students, professionals, and anyone looking to improve their writing skills.",
  icons: {
    icon: '/favicon.ico',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-200`}>
        <Providers>
          <ThemeLoader />
          <ConditionalNavigation />
          <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white dark:bg-gray-900">
            <div className="min-h-[calc(100vh-8rem)]">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
