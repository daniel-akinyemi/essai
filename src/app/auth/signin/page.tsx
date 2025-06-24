import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-gray-600">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </div>
        <AuthForm mode="signin" />
      </div>
    </div>
  );
} 