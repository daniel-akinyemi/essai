'use client';

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AuthFormProps {
  mode: "signin" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="w-full max-w-md mx-auto p-6">
      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          {mode === "signin" ? "Sign In" : "Create Account"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up">
          {mode === "signup" && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                  First Name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  placeholder="Enter your first name"
                  autoComplete="given-name"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  placeholder="Enter your last name"
                  autoComplete="family-name"
                />
              </div>
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </div>
          {mode === "signup" && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </div>
          )}
          {error && (
            <div className="text-red-500 text-sm text-center animate-fade-in">{error}</div>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white border-t-2"></span>
                Signing up...
              </div>
            ) : (
              mode === "signin" ? "Sign In" : "Sign Up"
            )}
          </Button>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              type="button"
            >
              <svg
                className="w-5 h-5 mr-2"
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
                <defs>
                  <clipPath id="clip0_17_40">
                    <rect width="24" height="24" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 