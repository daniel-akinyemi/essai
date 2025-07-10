"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FeedbackPage() {
  const router = useRouter();
  const { essayId } = useParams();
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
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-2">{essay.topic}</CardTitle>
          <div className="text-sm text-gray-500 mb-2">{new Date(essay.submittedAt).toLocaleString()}</div>
          <div className="flex gap-4 text-sm text-gray-600 mb-2">
            <span>Type: <span className="font-semibold">{essay.type}</span></span>
            <span>Score: <span className="font-semibold">{essay.score}/100</span></span>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold text-lg mb-2">Essay Content</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4 whitespace-pre-wrap text-gray-800">{essay.content}</div>
          <h3 className="font-semibold text-lg mb-2">Feedback</h3>
          <div className="bg-blue-50 rounded-lg p-4 text-blue-900 whitespace-pre-wrap">{essay.feedback}</div>
        </CardContent>
      </Card>
    </div>
  );
} 