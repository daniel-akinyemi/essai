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
    <nav className={`fixed top-0 w-full z-50 backdrop-blur-lg bg-white/95 border-b border-gray-200 transition-all duration-300 ${
      scrolled ? "shadow-md" : ""
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold flex-shrink-0 text-gray-900 hover:text-blue-600 transition-colors">
            Essai
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
              Pricing
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
              Contact
            </Link>
            <Link href="/key" className="text-gray-700 hover:text-blue-600 transition-colors">
              API Key
            </Link>
            {!session ? (
              <div className="flex items-center space-x-4 ml-4">
                <Link 
                  href="/auth/signin" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="ml-4 text-sm text-gray-700">
                Welcome, {session.user?.name || 'User'}
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center">
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-700 hover:text-blue-600 focus:outline-none transition-colors"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
              
              {isMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}>
                  <div className="fixed inset-0 bg-black/25" aria-hidden="true" />
                  <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl z-50 overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <Link href="/" className="text-lg font-bold text-gray-900" onClick={() => setIsMenuOpen(false)}>
                          Essai
                        </Link>
                        <button 
                          onClick={() => setIsMenuOpen(false)}
                          className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          aria-label="Close menu"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <nav className="flex flex-col py-2">
                      <Link
                        href="/pricing"
                        className="px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 flex items-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Pricing
                      </Link>
                      <Link
                        href="/contact"
                        className="px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 flex items-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Contact
                      </Link>
                      <Link
                        href="/key"
                        className="px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 flex items-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        API Key
                      </Link>
                      {!session ? (
                        <>
                          <div className="border-t border-gray-200 my-2"></div>
                          <Link
                            href="/auth/signin"
                            className="px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 flex items-center"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Sign In
                          </Link>
                          <Link
                            href="/auth/signup"
                            className="mx-4 my-2 px-4 py-2 text-center text-base font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Sign Up
                          </Link>
                        </>
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 border-t border-gray-200 mt-2">
                          Signed in as {session.user?.email || 'User'}
                        </div>
                      )}
                    </nav>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 