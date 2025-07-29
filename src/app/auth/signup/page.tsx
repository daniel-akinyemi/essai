import { Suspense } from "react";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { Sparkles, BookOpen, Target, Shield, Zap } from "lucide-react";
import { AuthSkeleton } from "@/components/ui/auth-skeleton";

function SignUpContent() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Features */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse delay-500"></div>
        
        <div className="relative z-10 flex items-center justify-center w-full p-8">
          <div className="max-w-lg text-white text-center space-y-8">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold">Unlock Your Potential</h2>
              <p className="text-xl text-purple-100 leading-relaxed">
                Create your account and discover the power of AI-enhanced writing tools designed to elevate your essays.
              </p>
            </div>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 gap-6 mt-12">
              {[
                { icon: <BookOpen className="h-6 w-6 text-white" />, title: "Essay Generator", description: "Create high-quality essays with AI assistance" },
                { icon: <Target className="h-6 w-6 text-white" />, title: "Smart Analysis", description: "Get detailed feedback and scoring" },
                { icon: <Shield className="h-6 w-6 text-white" />, title: "Secure & Private", description: "Your data is protected and confidential" }
              ].map((feature, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-lg">{feature.title}</h3>
                      <p className="text-purple-100 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { value: "10K+", label: "Active Users" },
                { value: "50K+", label: "Essays Analyzed" },
                { value: "4.9★", label: "User Rating" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-purple-100 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Join Essai
            </h1>
            <p className="mt-3 text-gray-600 text-lg">
              Start your writing journey today
            </p>
            <p className="mt-2 text-gray-500">
              Already have an account?{" "}
              <Link 
                href="/auth/signin" 
                className="text-purple-600 hover:text-purple-500 font-semibold transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
          
          {/* Auth Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
            <AuthForm mode="signup" />
          </div>
          
          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-purple-600 hover:text-purple-500">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-purple-600 hover:text-purple-500">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <AuthSkeleton />
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}