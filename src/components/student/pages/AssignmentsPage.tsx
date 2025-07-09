"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase/client";
import { BookOpen, Calendar, CheckCircle, Clock, FileText, Loader2, User } from "lucide-react";
import dayjs from "dayjs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";

interface Assignment {
  id: string;
  title: string;
  instructions: string;
  assigned_by: string;
  due_date: string;
  status: "Not Submitted" | "Submitted" | "Late";
  teacher_name?: string;
  student_id?: string; // Added for upsert
}

export default function AssignmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);

  const handleOpenModal = (assignment: any, submission: any) => {
    setSelectedAssignment(assignment);
    setExistingSubmission(submission);
    setModalOpen(true);
  };
  const handleCloseModal = () => setModalOpen(false);
  const handleSubmitted = () => {
    // Refresh assignments after submission
    // (You may want to refetch assignments here)
  };

  useEffect(() => {
    console.log('AssignmentsPage session:', session, 'status:', status); // Debug session/status
    if (status === "loading") return; // Don't redirect while loading
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
      return;
    }
    if (status === "authenticated" && session && session.user && (session.user as any).role !== "student") {
      router.replace("/dashboard");
      return;
    }
    // Fetch assignments only if authenticated and student
    if (status === "authenticated" && session && session.user && (session.user as any).role === "student") {
      const fetchAssignments = async () => {
        setLoading(true);
        setError("");
        try {
          console.log('Fetching classroom memberships...');
          const { data: memberships, error: membershipsError } = await supabase
            .from("classroom_members")
            .select("classroom_id")
            .eq("user_id", (session.user as any).id);
          console.log('Memberships response:', memberships, membershipsError);
          if (membershipsError) throw membershipsError;
          const classroomIds = memberships?.map((m: any) => m.classroom_id) || [];
          if (classroomIds.length === 0) {
            setAssignments([]);
            setLoading(false);
            return;
          }
          console.log('Fetching assignments for classrooms:', classroomIds);
          const { data: assignmentsData, error: assignmentsError } = await supabase
            .from("assignments")
            .select("id, title, instructions, assigned_by, due_date")
            .in("classroom_id", classroomIds)
            .order("due_date", { ascending: true });
          console.log('Assignments response:', assignmentsData, assignmentsError);
          if (assignmentsError) throw assignmentsError;
          console.log('Fetching submissions for user:', (session.user as any).id);
          const { data: submissions, error: submissionsError } = await supabase
            .from("submissions")
            .select("assignment_id, submitted_at, status, essay")
            .eq("student_id", (session.user as any).id);
          console.log('Submissions response:', submissions, submissionsError);
          if (submissionsError) throw submissionsError;
          const teacherIds = Array.from(new Set(assignmentsData.map((a: any) => a.assigned_by)));
          let teacherMap: Record<string, string> = {};
          if (teacherIds.length > 0) {
            console.log('Fetching teacher names for:', teacherIds);
            const { data: teachers, error: teachersError } = await supabase
              .from("users")
              .select("id, full_name");
            console.log('Teachers response:', teachers, teachersError);
            if (teachers) {
              teacherMap = Object.fromEntries(
                teachers.map((t: any) => [t.id, t.full_name || "Teacher"])
              );
            }
          }
          const now = dayjs();
          const assignmentsList: Assignment[] = assignmentsData.map((a: any) => {
            const submission = submissions.find((s: any) => s.assignment_id === a.id);
            let status: Assignment["status"] = "Not Submitted";
            if (submission) {
              status = submission.status === "late" ? "Late" : "Submitted";
            } else if (dayjs(a.due_date).isBefore(now)) {
              status = "Late";
            }
            return {
              id: a.id,
              title: a.title,
              instructions: a.instructions,
              assigned_by: a.assigned_by,
              due_date: a.due_date,
              status,
              teacher_name: teacherMap[a.assigned_by] || "Teacher",
              student_id: (session.user as any).id,
            };
          });
          setAssignments(assignmentsList);
        } catch (err: any) {
          console.error('Assignments fetch error:', err, err?.message, err?.stack);
          setError(err.message || "Failed to load assignments.");
        } finally {
          setLoading(false);
          console.log('Finished fetching assignments.');
        }
      };
      fetchAssignments();
    }
  }, [session, status, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
        <p className="text-gray-600">Loading assignments...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }
  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <BookOpen className="h-12 w-12 text-purple-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Assignments Found</h2>
        <p className="text-gray-600">You have no assignments yet. Join a class or check back later.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignments</h1>
        <p className="text-gray-600">View and submit assignments from your teachers with AI-powered feedback.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((a) => (
          <div
            key={a.id}
            className={`bg-white rounded-lg shadow-sm border p-6 flex flex-col justify-between relative ${a.status === "Late" ? "border-red-400" : "border-gray-200"}`}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">{a.title}</h2>
              </div>
              <div className="text-sm text-gray-700 mb-2 line-clamp-3">
                {a.instructions}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <User className="h-4 w-4" />
                <span>Assigned by: {a.teacher_name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <Calendar className="h-4 w-4" />
                <span>Due: {dayjs(a.due_date).format("MMM D, YYYY h:mm A")}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {a.status === "Not Submitted" && (
                <button onClick={() => handleOpenModal(a, null)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">Submit</button>
              )}
              {a.status === "Submitted" && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">Submitted</span>
              )}
              {a.status === "Late" && (
                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full">Late</span>
              )}
              {a.status === "Late" && (
                <button onClick={() => handleOpenModal(a, null)} className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">Submit</button>
              )}
              {a.status === "Submitted" && (
                <button onClick={() => handleOpenModal(a, { essay: existingSubmission?.essay || "", ...a })} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">Edit Submission</button>
              )}
            </div>
          </div>
        ))}
      </div>
      <EssaySubmissionModal
        open={modalOpen}
        onClose={handleCloseModal}
        assignment={selectedAssignment}
        onSubmitted={handleSubmitted}
        existingSubmission={existingSubmission}
        student_id={(session?.user as any)?.id}
      />
    </div>
  );
}

function EssaySubmissionModal({ open, onClose, assignment, onSubmitted, existingSubmission, student_id }: any) {
  const [essay, setEssay] = useState(existingSubmission?.essay || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data, error: subError } = await supabase
        .from("submissions")
        .upsert([
          {
            assignment_id: assignment.id,
            student_id: student_id,
            essay,
            status: new Date(assignment.due_date) < new Date() ? "late" : "submitted",
            resubmitted: !!existingSubmission,
          },
        ], { onConflict: "assignment_id,student_id" }); // Fix: onConflict should be a string
      if (subError) throw subError;
      setSuccess(true);
      onSubmitted();
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      setError(err.message || "Failed to submit essay.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="max-w-lg w-full">
        <SheetHeader>
          <SheetTitle>Submit Essay</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignment</label>
            <input type="text" value={assignment.title} readOnly className="w-full px-3 py-2 border rounded bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Essay</label>
            <textarea
              value={essay}
              onChange={e => setEssay(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded min-h-[120px]"
              placeholder="Write or paste your essay here..."
            />
          </div>
          {/* Optional: Sidebar with tips/AI helper */}
          {/* <div className="bg-purple-50 p-3 rounded text-xs text-purple-700 mb-2">Writing tips or AI helper here</div> */}
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <SheetFooter>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-700">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
              {loading ? "Submitting..." : existingSubmission ? "Update Submission" : "Submit Essay"}
            </button>
          </SheetFooter>
        </form>
        {success && <div className="text-green-600 text-sm mt-2">Essay submitted!</div>}
      </SheetContent>
    </Sheet>
  );
} 