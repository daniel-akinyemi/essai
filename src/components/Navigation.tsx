'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 animate-fade-in ${
        scrolled 
          ? 'bg-white/70 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400">
                Essai
              </span>
            </Link>
          </div>
          
          {/* Center Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {[
              { href: '/pricing', label: 'Pricing' },
              { href: '/contact', label: 'Contact' },
              { href: '/apis/key', label: 'API' }
            ].map((item) => (
              <div
                key={item.href}
                className="relative group transition-transform duration-300 hover:scale-105"
              >
                <Link 
                  href={item.href} 
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  {item.label}
                </Link>
                <div
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"
                />
              </div>
            ))}
          </div>
          
          {/* Right Side - Sign Up */}
          <div className="flex items-center transition-transform duration-300 hover:scale-105">
            <Link 
              href="/signup"
              className="relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden text-white rounded-lg group bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 transition-all duration-300"
            >
              <span className="relative">Sign up</span>
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 