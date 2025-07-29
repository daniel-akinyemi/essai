"use client";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RewritePage() {
  return (
    <Suspense>
      <RewritePageContent />
    </Suspense>
  );
}

function RewritePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const essayId = searchParams.get("id");
  const [essay, setEssay] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!essayId) return;
    setLoading(true);
    fetch(`/api/essays?id=${essayId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch essay");
        const data = await res.json();
        setEssay(data.essays?.[0] || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [essayId]);

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="animate-spin w-8 h-8 text-indigo-500" /></div>;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;
  if (!essay) return <div className="text-gray-500 text-center mt-8">Essay not found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
      <div className="bg-white rounded-xl shadow-xl p-6">
        <h1 className="text-2xl font-bold mb-4">Rewrite Essay</h1>
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">Topic:</div>
          <div className="font-semibold text-gray-900 mb-2">{essay.topic}</div>
          <div className="text-sm text-gray-500 mb-1">Original Essay:</div>
          <div className="bg-gray-50 rounded-lg p-4 mb-2 whitespace-pre-wrap text-gray-800">{essay.content}</div>
        </div>
        <Button variant="secondary" onClick={() => router.push(`/dashboard/essay-rewriter?content=${encodeURIComponent(essay.content)}&topic=${encodeURIComponent(essay.topic)}`)}>
          Rewrite with AI
        </Button>
      </div>
    </div>
  );
} 