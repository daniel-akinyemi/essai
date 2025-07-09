import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Providers from "@/components/Providers";
import ThemeLoader from "@/components/ThemeLoader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Essai - Smart Essay Evaluation Platform",
  description: "Transform your writing with AI-powered essay evaluation, scoring, and feedback. Perfect for students, teachers, and schools.",
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
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
