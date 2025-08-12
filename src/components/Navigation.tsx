'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navigation() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Always show navigation on landing page, regardless of authentication status

  return (
    <nav className={`fixed top-0 w-full z-50 backdrop-blur-lg bg-white/60 border-b border-gray-200 transition-all duration-300 ${
      scrolled ? "shadow-md" : ""
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold flex-shrink-0">
            Essai
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/pricing" className="text-gray-700 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-gray-900">
              Contact
            </Link>
            <Link href="/key" className="text-gray-700 hover:text-gray-900">
              API Key
            </Link>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/signin" 
                className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Link 
                href="/auth/signin" 
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup" 
                className="px-3 py-1.5 text-sm bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                Sign Up
              </Link>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
              >
                <span className="sr-only">Open menu</span>
                <Menu className="h-5 w-5" />
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <Link
                    href="/pricing"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/contact"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact
                  </Link>
                  <Link
                    href="/key"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    API Key
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <Link
                    href="/auth/signup"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 