'use client';

import { useSearchParams } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { Sparkles, BookOpen, Target, TrendingUp } from "lucide-react";

export default function SignInForm() {
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
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Detailed Analysis</h3>
                    <p className="text-blue-100 text-sm">Understand your strengths and areas for improvement</p>
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
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form (was left) */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:px-12 md:px-24 lg:px-12 xl:px-24">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back!</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">Sign in to your account to continue</p>
            
            {signupSuccess && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                Account created successfully! Please sign in.
              </div>
            )}
          </div>
          
          <AuthForm mode="signin" />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <a href="/auth/signup" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
