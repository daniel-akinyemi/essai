'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function Navigation() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (session) {
    return null;
  }

  return (
    <nav className={`fixed top-0 w-full z-50 backdrop-blur-lg bg-white/60 border-b border-gray-200 transition-all duration-300 ${
      scrolled ? "shadow-md" : ""
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">Essai</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/pricing" className="text-gray-700 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-gray-900">
              Contact
            </Link>
            <Link href="/key" className="text-gray-700 hover:text-gray-900">
              API Key
            </Link>
            <>
              <Link href="/auth/signin" className="btn-secondary">
                Sign In
              </Link>
              <Link href="/auth/signup" className="btn-primary">
                Sign Up
              </Link>
            </>
          </div>
        </div>
      </div>
    </nav>
  );
} 