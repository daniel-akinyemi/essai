"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Calendar, Award, TrendingUp, BadgeCheck, Frown, ArrowRightLeft, Search, Sparkles } from "lucide-react";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function scoreLabel(score: number) {
  if (score >= 85) return <span className="text-green-600 font-semibold">🟢 Good</span>;
  if (score >= 70) return <span className="text-yellow-600 font-semibold">🟡 Average</span>;
  return <span className="text-red-600 font-semibold">🔴 Poor</span>;
}

export default function EssayHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [essays, setEssays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'date' | 'score'>('date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const take = 10;

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/essays?sort=${sort}&order=${order}&take=${take}&skip=${(page-1)*take}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch essays");
        const data = await res.json();
        setEssays(data.essays);
        setHasMore(data.essays.length === take);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session, status, sort, order, page, router]);

  if (status === "loading" || loading) {
  return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
        <span className="ml-3 text-indigo-700 font-medium">Loading essays...</span>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gradient bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 animate-fade-in-up">Essay History</h1>
          <p className="text-gray-500 text-lg">All your generated, scored, and rewritten essays in one place.</p>
                </div>
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium mr-1">Sort by:</label>
          <select value={sort} onChange={e => { setSort(e.target.value as any); setPage(1); }} className="border rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500">
            <option value="date">Date</option>
            <option value="score">Score</option>
          </select>
          <button onClick={() => { setOrder(o => o === 'asc' ? 'desc' : 'asc'); setPage(1); }} className="ml-2 text-indigo-600 underline text-sm">
            {order === 'desc' ? '↓ Newest/Highest' : '↑ Oldest/Lowest'}
          </button>
              </div>
            </div>
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      {essays.length === 0 ? (
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl shadow-lg border border-gray-100 p-12 text-center animate-fade-in-up">
          <Frown className="mx-auto text-indigo-300 w-16 h-16 mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-gray-800">No Essays Yet</h2>
          <p className="text-gray-500 mb-4">📝 You haven’t submitted any essays yet. Start by using the Essay Generator or Essay Scoring tool.</p>
              </div>
      ) : (
        <div className="overflow-x-auto animate-fade-in-up">
          <table className="min-w-full bg-white rounded-xl shadow border border-gray-100">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Topic</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Score</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Feedback</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {essays.map((essay, idx) => (
                <tr key={essay.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-indigo-50/30'}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {essay.type === 'Rewritten' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-700"><ArrowRightLeft className="w-4 h-4" /> Rewritten</span>
                    ) : essay.type === 'Scored' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700"><BadgeCheck className="w-4 h-4" /> Scored</span>
                    ) : essay.type === 'Paragraph Analysis' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"><Search className="w-4 h-4" /> Analyzed</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700"><Sparkles className="w-4 h-4" /> Generated</span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate font-medium text-gray-900">{essay.topic}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(essay.submittedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{essay.score}/100</span>
                      {scoreLabel(essay.score)}
            </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                    {essay.feedback.length > 80 ? essay.feedback.slice(0, 80) + '…' : essay.feedback}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/student/essay-history/feedback/${essay.id}`)} className="hover:bg-indigo-100 mr-2">Feedback</Button>
                    <Button variant="secondary" size="sm" onClick={() => router.push(`/dashboard/student/essay-history/rewrite?id=${essay.id}`)} className="hover:bg-pink-100">Rewrite</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
                  </div>
      )}
      {essays.length > 0 && (
        <div className="flex justify-center mt-8 gap-4 animate-fade-in-up">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
          <Button variant="outline" disabled={!hasMore && essays.length < take} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
} 