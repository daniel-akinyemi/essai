"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase/client";
import { Users, Key, Plus, CheckCircle, Loader2, User, BookOpen } from "lucide-react";

export default function JoinClassPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinMsg, setJoinMsg] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinedClasses, setJoinedClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Route protection
  useEffect(() => {
    console.log('JoinClassPage session:', session, 'status:', status); // Debug session/status
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
      return;
    }
    if (status === "authenticated" && session && session.user && (session.user as any).role !== "student") {
      router.replace("/dashboard");
      return;
    }
  }, [session, status, router]);

  // Fetch joined classes
  useEffect(() => {
    const fetchJoined = async () => {
      if (status !== "authenticated" || !session?.user) return;
      setLoadingClasses(true);
      const { data, error } = await supabase
        .from("classroom_members")
        .select("id, classroom_id, classrooms(name, subject, teacher_id, invite_code), classrooms:classroom_id(assignments(id)), classrooms:classroom_id(teacher:teacher_id(full_name))")
        .eq("user_id", (session.user as any).id);
      if (error) {
        console.error('JoinClass fetch error:', error); // Log join class fetch errors
        setJoinedClasses([]);
      } else {
        setJoinedClasses(data || []);
      }
      setLoadingClasses(false);
    };
    fetchJoined();
  }, [session, status, joinMsg]);

  // Join class handler
  const handleJoin = async (e: any) => {
    e.preventDefault();
    setJoinMsg(null);
    setJoinError(null);
    setJoining(true);
    try {
      if (!input.trim()) throw new Error("Please enter a class code or teacher email.");
      // 1. Find class by code or teacher email
      let classroom = null;
      if (input.includes("@")) {
        // By teacher email
        const { data: teachers, error: teacherErr } = await supabase
          .from("users")
          .select("id")
          .eq("email", input.trim());
        if (teacherErr || !teachers || teachers.length === 0) throw new Error("No teacher found with that email.");
        const teacherId = teachers[0].id;
        const { data: classes, error: classErr } = await supabase
          .from("classrooms")
          .select("*")
          .eq("teacher_id", teacherId);
        if (classErr || !classes || classes.length === 0) throw new Error("No class found for that teacher.");
        classroom = classes[0];
      } else {
        // By class code
        const { data: classes, error: classErr } = await supabase
          .from("classrooms")
          .select("*")
          .eq("invite_code", input.trim());
        if (classErr || !classes || classes.length === 0) throw new Error("No class found with that code.");
        classroom = classes[0];
      }
      // 2. Check if already joined
      const { data: existing } = await supabase
        .from("classroom_members")
        .select("*")
        .eq("user_id", (session.user as any).id)
        .eq("classroom_id", classroom.id);
      if (existing && existing.length > 0) {
        setJoinMsg("Already joined this class.");
        setJoining(false);
        return;
      }
      // 3. Add to classroom_members
      const { error: joinErr } = await supabase
        .from("classroom_members")
        .insert({ classroom_id: classroom.id, user_id: (session.user as any).id, role: "student" });
      if (joinErr) throw joinErr;
      setJoinMsg("Successfully joined class!");
      setInput("");
    } catch (err: any) {
      console.error('JoinClass join error:', err); // Log join class errors
      setJoinError(err.message || "Failed to join class.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Class</h1>
        <p className="text-gray-600">Join your teacher's class using a class code or teacher email to access assignments and feedback.</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <form onSubmit={handleJoin} className="flex flex-col md:flex-row gap-4 items-center justify-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter class code or teacher email"
            className="px-4 py-2 border rounded-lg w-full md:w-80"
          />
          <button
            type="submit"
            disabled={joining}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {joining ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            <span>Join Class</span>
          </button>
        </form>
        {joinMsg && <div className="mt-4 text-green-700 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> {joinMsg}</div>}
        {joinError && <div className="mt-4 text-red-600">{joinError}</div>}
          </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Users className="h-6 w-6 text-green-600" /> My Joined Classes</h2>
        {loadingClasses ? (
          <div className="flex items-center gap-2 text-gray-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading classes...</div>
        ) : joinedClasses.length === 0 ? (
          <div className="text-gray-500 flex items-center gap-2"><BookOpen className="h-5 w-5" /> You have not joined any classes yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {joinedClasses.map((m) => (
              <div key={m.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-gray-900 text-lg">{m.classrooms?.name || "Class"}</span>
                </div>
                <div className="text-sm text-gray-700 mb-1">Subject: {m.classrooms?.subject || "-"}</div>
                <div className="text-xs text-gray-500 mb-1">Teacher: {m.classrooms?.teacher?.full_name || "-"}</div>
                <div className="text-xs text-gray-500 mb-1">Assignments: {m.classrooms?.assignments?.length || 0}</div>
                <button
                  className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  onClick={() => router.push("/dashboard/student/assignments")}
                >
                  View Assignments
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 