import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Create Account</h1>
          <p className="mt-2 text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
        <AuthForm mode="signup" />
      </div>
    </div>
  );
} 