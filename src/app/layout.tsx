import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalNavigation from "@/components/ConditionalNavigation";
import Providers from "@/components/Providers";
import ThemeLoader from "@/components/ThemeLoader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Essai - Smart Essay Evaluation Platform",
  description: "Transform your writing with AI-powered essay evaluation, scoring, and feedback. Perfect for students, professionals, and anyone looking to improve their writing skills.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <ThemeLoader />
          <ConditionalNavigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
