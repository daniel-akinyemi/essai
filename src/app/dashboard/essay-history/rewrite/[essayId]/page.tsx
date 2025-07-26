"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from 'jspdf';

// In Next.js 15.4.4 App Router, we don't need to type the page props
// as they are handled by the framework. We can use the useParams hook instead.
// This is a workaround for the type error we're seeing.

export default function RewritePage() {
  const router = useRouter();
  const params = useParams<{ essayId: string }>();
  const essayId = params.essayId;
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

  const handleDownloadPDF = () => {
    if (!essay?.content) return;
    const doc = new jsPDF();
    doc.setFont('times', 'normal');
    doc.setFontSize(16); // Title font size
    const title = essay.topic || 'Essay Title';
    const titleLines = doc.splitTextToSize(title, 180);
    doc.text(titleLines, 10, 20);
    doc.setFontSize(12); // Content font size
    const contentY = 20 + titleLines.length * 10;
    const lines = doc.splitTextToSize(essay.content, 180);
    doc.text(lines, 10, contentY);
    doc.save('rewritten-essay.pdf');
  };

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
        <Button onClick={handleDownloadPDF} className="ml-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-teal-700 flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg">
          Download PDF
        </Button>
      </div>
    </div>
  );
} 