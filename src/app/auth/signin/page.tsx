"use client";

import AuthForm from "@/components/AuthForm";
import Link from "next/link";
import { Sparkles, BookOpen, Target, TrendingUp } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const signupSuccess = searchParams.get("signup") === "success";
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Features (was right) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse delay-500"></div>
        <div className="relative z-10 flex items-center justify-center w-full">
          <div className="max-w-lg text-white text-center space-y-8">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold">Transform Your Writing</h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Join thousands of writers who are already improving their essays with AI-powered feedback and analysis.
              </p>
            </div>
            {/* Feature Cards */}
            <div className="grid grid-cols-1 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Smart Scoring</h3>
                    <p className="text-blue-100 text-sm">Get instant, accurate feedback on your essays</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Track Progress</h3>
                    <p className="text-blue-100 text-sm">Monitor your improvement over time</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Writing Tools</h3>
                    <p className="text-blue-100 text-sm">Access powerful AI-powered writing assistance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Right Side - Form (was left) */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="mt-3 text-gray-600 text-lg">
              Sign in to continue your writing journey
            </p>
            <p className="mt-2 text-gray-500">
              Don't have an account?{" "}
              <Link 
                href="/auth/signup" 
                className="text-blue-600 hover:text-blue-500 font-semibold transition-colors duration-200"
              >
                Create one now
              </Link>
            </p>
          </div>
          {/* Success message after signup */}
          {signupSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm text-center animate-fade-in">
              Account created! Please sign in to continue.
            </div>
          )}
          {/* Auth Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
            <AuthForm mode="signin" />
          </div>
          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 