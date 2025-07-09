"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { UserPlus, Users, Loader2, BookOpen } from "lucide-react";

export default function JoinClassPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [classes, setClasses] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [joining, setJoining] = useState(false);

  // Route/session protection
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
      return;
    }
    if (status === "authenticated" && session && session.user && (session.user as any).role !== "student") {
      router.replace("/dashboard");
      return;
    }
    setRole((session?.user as any)?.role || "");
  }, [session, status, router]);

  // Fetch joined classes
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    const fetchClasses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("classroom_members")
        .select("classrooms(*), assignments(count)")
        .eq("user_id", (session.user as any).id);
      if (error) {
        toast.error("Failed to fetch classes");
      } else {
        setClasses(data || []);
      }
      setLoading(false);
    };
    fetchClasses();
  }, [session, status, supabase]);

  // Handle join class
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoining(true);
    let code = joinCode.trim();
    let email = teacherEmail.trim();
    if (!code && !email) {
      toast.error("Enter a class code or teacher email");
      setJoining(false);
      return;
    }
    try {
      let classroom = null;
      if (email) {
        // By teacher email
        const { data: teachers, error: teacherErr } = await supabase
          .from("users")
          .select("id")
          .eq("email", email)
          .single();
        if (teacherErr || !teachers) throw new Error("No teacher found with that email.");
        const teacherId = teachers.id;
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
          .eq("invite_code", code);
        if (classErr || !classes || classes.length === 0) throw new Error("No class found with that code.");
        classroom = classes[0];
      }
      // Check if already joined
      const { data: existing } = await supabase
        .from("classroom_members")
        .select("*")
        .eq("user_id", (session.user as any).id)
        .eq("classroom_id", classroom.id);
      if (existing && existing.length > 0) {
        toast("Already joined this class.");
        setJoining(false);
        return;
      }
      // Add to classroom_members
      const { error: joinErr } = await supabase
        .from("classroom_members")
        .insert({ classroom_id: classroom.id, user_id: (session.user as any).id, role: "student" });
      if (joinErr) throw joinErr;
      toast.success("Successfully joined class!");
      setJoinCode("");
      setTeacherEmail("");
      // Refresh class list
      const { data, error } = await supabase
        .from("classroom_members")
        .select("classrooms(*), assignments(count)")
        .eq("user_id", (session.user as any).id);
      if (!error) setClasses(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to join class.");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading your classes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg mb-8 p-1">
        <div className="bg-white rounded-xl p-8 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            <UserPlus className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Join a Class</h1>
          </div>
          <form
            onSubmit={handleJoin}
            className="w-full max-w-md flex flex-col gap-4"
          >
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Class Code <span className='text-red-500'>*</span></label>
              <input
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                placeholder="Enter class code"
                disabled={joining}
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Teacher Email <span className='text-red-500'>*</span></label>
              <input
                type="email"
                value={teacherEmail}
                onChange={e => setTeacherEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                placeholder="Enter teacher's email"
                disabled={joining}
                required
              />
            </div>
            <button
              type="submit"
              className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-6 py-2 font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
              disabled={joining}
            >
              {joining && <Loader2 className="h-5 w-5 animate-spin" />} {joining ? "Joining..." : "Join Class"}
            </button>
          </form>
        </div>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Users className="h-6 w-6 text-purple-600" /> Your Classes
      </h2>
      <div className="space-y-4">
        {classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <BookOpen className="h-12 w-12 mb-2" />
            <div className="text-lg font-semibold">You have not joined any classes yet.</div>
            <div className="text-sm">Join a class to get started!</div>
          </div>
        ) : (
          classes.map((c: any) => (
            <div
              key={c.classrooms?.id}
              className="bg-white rounded-lg p-5 shadow flex flex-col gap-1 border border-gray-100 hover:shadow-lg transition"
            >
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="font-bold text-lg text-gray-900">{c.classrooms?.name}</span>
                {c.classrooms?.subject && (
                  <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                    {c.classrooms.subject}
                  </span>
                )}
              </div>
              {c.classrooms?.description && (
                <div className="text-gray-600 mb-1">{c.classrooms.description}</div>
              )}
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>Assignments:</span>
                <span className="font-semibold text-purple-700">{c.assignments?.length ?? 0}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 