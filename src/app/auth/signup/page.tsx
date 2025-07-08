import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100 animate-fade-in">
      <Card className="w-full max-w-md shadow-xl glass-card animate-fade-in-up">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-2">Create your Essai account</CardTitle>
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-indigo-600 hover:text-indigo-500 font-medium underline">
              Sign in
            </Link>
          </p>
        </CardHeader>
        <CardContent>
          <AuthForm mode="signup" />
        </CardContent>
        <CardFooter className="flex flex-col items-center mt-2">
          <span className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Essai</span>
        </CardFooter>
      </Card>
    </div>
  );
} 