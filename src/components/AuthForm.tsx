'use client';

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react";

interface AuthFormProps {
  mode: "signin" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, firstName, lastName }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Something went wrong");
        }
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (signInResult?.error) {
        setError("Invalid credentials");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
          {mode === "signup" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4" />
                  First Name
                </label>
              <div className="relative">
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  placeholder="John"
                  autoComplete="given-name"
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4" />
                  Last Name
                </label>
              <div className="relative">
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  placeholder="Doe"
                  autoComplete="family-name"
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              </div>
            </div>
          )}
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Address
            </label>
          <div className="relative">
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="john@example.com"
              autoComplete="email"
              className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Lock className="h-4 w-4" />
              Password
            </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Enter your password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
          {mode === "signup" && (
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock className="h-4 w-4" />
                Confirm Password
              </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Confirm your password"
                autoComplete="new-password"
                className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            </div>
          )}
        
          {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              {error}
            </div>
          </div>
        )}
        
          <Button
            type="submit"
            disabled={loading}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              {mode === "signin" ? "Signing in..." : "Creating account..."}
              </div>
            ) : (
            mode === "signin" ? "Sign In" : "Create Account"
            )}
          </Button>
        </form>
      
      <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        
          <div className="mt-6">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              type="button"
            >
              <svg
              className="w-5 h-5 mr-3"
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_17_40)">
                  <path d="M23.766 12.276c0-.818-.074-1.604-.213-2.356H12.24v4.463h6.48a5.548 5.548 0 01-2.404 3.642v3.017h3.89c2.28-2.1 3.56-5.197 3.56-8.766z" fill="#4285F4"/>
                  <path d="M12.24 24c3.24 0 5.963-1.07 7.95-2.91l-3.89-3.017c-1.08.726-2.46 1.16-4.06 1.16-3.12 0-5.76-2.104-6.7-4.932H1.54v3.09A11.997 11.997 0 0012.24 24z" fill="#34A853"/>
                  <path d="M5.54 14.3a7.19 7.19 0 010-4.6V6.61H1.54a12.002 12.002 0 000 10.78l4-3.09z" fill="#FBBC05"/>
                  <path d="M12.24 4.77c1.76 0 3.34.6 4.58 1.78l3.42-3.42C18.2 1.07 15.48 0 12.24 0A11.997 11.997 0 001.54 6.61l4 3.09c.94-2.828 3.58-4.93 6.7-4.93z" fill="#EA4335"/>
                </g>
              </svg>
            Continue with Google
            </button>
        </div>
      </div>
    </div>
  );
} 