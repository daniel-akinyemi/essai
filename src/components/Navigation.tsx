'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    // Close mobile menu when route changes
    const handleRouteChange = () => {
      setIsOpen(false);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("routeChangeStart", handleRouteChange);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("routeChangeStart", handleRouteChange);
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.mobile-menu-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('click', handleClickOutside);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (session) {
    return null;
  }

  const navLinks = [
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
    { href: "/key", label: "API Key" },
  ];

  return (
    <nav 
      className={`fixed top-0 w-full z-50 backdrop-blur-lg bg-white/60 border-b border-gray-200 transition-all duration-300 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Essai
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link 
              href="/auth/signin" 
              className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
            >
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn-primary">
              Sign Up
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center">
            <button 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="mobile-menu-container absolute top-16 left-0 w-full bg-white shadow-md p-4">
              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link 
                  href="/auth/signin" 
                  className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 