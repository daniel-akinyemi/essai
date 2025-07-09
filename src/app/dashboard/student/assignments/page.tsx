"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
// If 'sonner' is not installed, fallback to alert
let showToast = (msg: string) => alert(msg);
try { require.resolve('sonner'); showToast = require('sonner').toast; } catch {}

export default function AssignmentsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState<boolean>(true);
  const [role, setRole] = useState<string>("");
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<Record<string, string>>({});
  // For modal/drawer
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);
  const [essay, setEssay] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

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

  // Fetch assignments, submissions, and teachers
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    const fetchAssignments = async () => {
      setLoading(true);
      // Get classroom memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from("classroom_members")
        .select("classroom_id")
        .eq("user_id", (session.user as any).id);
      if (membershipsError) {
        showToast("Failed to fetch classroom memberships");
        setLoading(false);
        return;
      }
      const classroomIds = memberships?.map((m: any) => m.classroom_id) || [];
      if (classroomIds.length === 0) {
        setAssignments([]);
        setSubmissions([]);
        setTeachers({});
        setLoading(false);
        return;
      }
      // Fetch assignments for these classrooms
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("assignments")
        .select("id, title, instructions, assigned_by, due_date, allow_resubmission")
        .in("classroom_id", classroomIds)
        .order("due_date", { ascending: true });
      if (assignmentsError) {
        showToast("Failed to fetch assignments");
        setLoading(false);
        return;
      }
      setAssignments(assignmentsData || []);
      // Fetch submissions for these assignments
      const assignmentIds = (assignmentsData || []).map((a: any) => a.id);
      let submissionsData = [];
      if (assignmentIds.length > 0) {
        const { data: submissionsRes, error: submissionsError } = await supabase
          .from("submissions")
          .select("assignment_id, submitted_at, status, essay, id")
          .eq("student_id", (session.user as any).id)
          .in("assignment_id", assignmentIds);
        if (!submissionsError) submissionsData = submissionsRes || [];
      }
      setSubmissions(submissionsData);
      // Fetch teacher names
      const teacherIds = Array.from(new Set((assignmentsData || []).map((a: any) => a.assigned_by)));
      let teacherMap: Record<string, string> = {};
      if (teacherIds.length > 0) {
        const { data: teachersRes, error: teachersError } = await supabase
          .from("users")
          .select("id, full_name");
        if (!teachersError && teachersRes) {
          teacherMap = Object.fromEntries(
            teachersRes.map((t: any) => [t.id, t.full_name || "Teacher"])
          );
        }
      }
      setTeachers(teacherMap);
      setLoading(false);
    };
    fetchAssignments();
  }, [session, status, supabase]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading assignments...</div>;
  }

  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-2xl mb-2">No assignments found</div>
        <div>Join a class to see assignments here.</div>
      </div>
    );
  }

  // Open modal and prefill essay if editing
  const openModal = (assignment: any, submission: any) => {
    setSelectedAssignment(assignment);
    setExistingSubmission(submission);
    setEssay(submission?.essay || "");
    setModalOpen(true);
  };

  // Handle essay submit
  const handleEssaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!essay.trim()) {
      showToast("Essay cannot be empty");
      return;
    }
    setSubmitting(true);
    try {
      if (existingSubmission) {
        // Update existing submission
        const { error } = await supabase
          .from("submissions")
          .update({ essay, status: "submitted", resubmitted: true })
          .eq("id", existingSubmission.id);
        if (error) throw error;
        showToast("Submission updated!");
      } else {
        // New submission
        const { error } = await supabase
          .from("submissions")
          .insert({
            assignment_id: selectedAssignment.id,
            student_id: session?.user?.id,
            essay,
            status: "submitted",
            resubmitted: false,
          });
        if (error) throw error;
        showToast("Essay submitted!");
      }
      setModalOpen(false);
      setEssay("");
      setExistingSubmission(null);
      setSelectedAssignment(null);
      // Refresh assignments and submissions
      setLoading(true);
      // (Reuse fetchAssignments logic)
      const { data: memberships } = await supabase
        .from("classroom_members")
        .select("classroom_id")
        .eq("user_id", session?.user?.id);
      const classroomIds = memberships?.map((m: any) => m.classroom_id) || [];
      const { data: assignmentsData } = await supabase
        .from("assignments")
        .select("id, title, instructions, assigned_by, due_date, allow_resubmission")
        .in("classroom_id", classroomIds)
        .order("due_date", { ascending: true });
      setAssignments(assignmentsData || []);
      const assignmentIds = (assignmentsData || []).map((a: any) => a.id);
      let submissionsData = [];
      if (assignmentIds.length > 0) {
        const { data: submissionsRes } = await supabase
          .from("submissions")
          .select("assignment_id, submitted_at, status, essay, id")
          .eq("student_id", session?.user?.id);
        submissionsData = submissionsRes || [];
      }
      setSubmissions(submissionsData);
      setLoading(false);
    } catch (err: any) {
      showToast(err.message || "Failed to submit essay");
      setSubmitting(false);
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Assignments</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map((assignment) => {
          const submission = submissions.find((s) => s.assignment_id === assignment.id);
          const isLate = dayjs().isAfter(dayjs(assignment.due_date));
          return (
            <div
              key={assignment.id}
              className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-lg">{assignment.title}</div>
                <div className="text-sm text-gray-500">
                  Due: {dayjs(assignment.due_date).format("MMM D, YYYY h:mm A")}
                </div>
              </div>
              <div className="text-gray-700 mb-2">{assignment.instructions}</div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Teacher:</span>
                <span className="font-medium">{teachers[assignment.assigned_by] || "Teacher"}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {submission ? (
                  <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">
                    Submitted
                  </span>
                ) : isLate ? (
                  <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold">
                    Late
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">
                    Not Submitted
                  </span>
                )}
                <button
                  className="ml-auto bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs"
                  onClick={() => openModal(assignment, submission)}
                >
                  {submission ? "Edit Submission" : "Submit Essay"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {/* Modal for submitting/editing essay */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setModalOpen(false)}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">
              {existingSubmission ? "Edit Submission" : "Submit Essay"}
            </h2>
            <form onSubmit={handleEssaySubmit} className="flex flex-col gap-4">
              <textarea
                className="w-full border rounded px-3 py-2 min-h-[120px]"
                value={essay}
                onChange={e => setEssay(e.target.value)}
                placeholder="Paste or write your essay here..."
                disabled={submitting}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : existingSubmission ? "Update Submission" : "Submit Essay"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 