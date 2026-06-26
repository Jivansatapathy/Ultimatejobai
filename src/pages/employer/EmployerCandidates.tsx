import { useDeferredValue, useEffect, useMemo, useState, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark, BookmarkCheck, CheckCheck, ChevronRight,
  Mail, MessageSquare, Search, Sparkles, Star, UserRoundSearch, X, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CandidateStatusBadge } from "@/components/employer/CandidateStatusBadge";
import { EmptyState } from "@/components/employer/EmptyState";
import { LoadingState } from "@/components/employer/LoadingState";
import { PageHeader } from "@/components/employer/PageHeader";
import { ConversationPanel } from "@/components/chat/ConversationPanel";
import { useEmployerAuth } from "@/context/EmployerAuthContext";
import {
  addCandidateNote, bookmarkCandidate, bulkUpdateCandidateStatus,
  deleteSavedSearch, getEmployerCandidates, getEmployerJobs, getSavedSearches,
  getTopCandidates, logCandidateCommunication, removeBookmark, saveSearchQuery,
  scheduleCandidateInterview, updateCandidateRating, updateCandidateStatus,
} from "@/services/employerService";
import { createEmployerConversation, sendConversationMessage, subscribeEmployerConversations } from "@/services/chatService";
import { FirestoreConversation } from "@/types/chat";
import { ApplicationStatus, CandidateApplication, JobPosting } from "@/types/employer";

const PIPELINE_STATUSES: ApplicationStatus[] = ["applied", "screening", "shortlisted", "interview", "offer", "hired", "rejected"];

const STAGE_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  applied:    { dot: "bg-blue-500",    bg: "bg-blue-50",    text: "text-blue-700" },
  screening:  { dot: "bg-purple-500",  bg: "bg-purple-50",  text: "text-purple-700" },
  shortlisted:{ dot: "bg-amber-500",   bg: "bg-amber-50",   text: "text-amber-700" },
  interview:  { dot: "bg-cyan-500",    bg: "bg-cyan-50",    text: "text-cyan-700" },
  offer:      { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  hired:      { dot: "bg-green-600",   bg: "bg-green-50",   text: "text-green-700" },
  rejected:   { dot: "bg-red-500",     bg: "bg-red-50",     text: "text-red-700" },
};

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}


function getActionErrorMessage(error: any, fallback: string) {
  const data = error?.response?.data;
  if (typeof data?.detail === "string" && data.detail.trim()) return data.detail;
  if (typeof data === "object" && data) {
    const firstValue = Object.values(data)[0];
    if (Array.isArray(firstValue) && firstValue[0]) return String(firstValue[0]);
    if (typeof firstValue === "string" && firstValue.trim()) return firstValue;
  }
  return error?.message || fallback;
}

// ── Contextual next-step panel ─────────────────────────────────────────────

type InterviewDraft = { title: string; mode: "virtual" | "phone" | "onsite"; starts_at: string; meeting_link: string; phone_number: string };

function NextStepPanel({
  application,
  interviewDraft,
  onDraftChange,
  onStatusChange,
  onScheduleInterview,
  onScheduleAndAdvance,
}: {
  application: CandidateApplication;
  interviewDraft: InterviewDraft;
  onDraftChange: (patch: Partial<InterviewDraft>) => void;
  onStatusChange: (status: ApplicationStatus) => void;
  onScheduleInterview: () => void;
  onScheduleAndAdvance: () => void;
}) {
  const status = application.status;

  // Applied → screen or reject
  if (status === "applied") {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
        <p className="text-xs font-bold text-blue-800">Next step: Initial Review</p>
        <p className="text-xs text-blue-600">Review the application and decide whether to proceed with screening.</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => onStatusChange("screening")}
            className="flex-1 rounded-xl bg-blue-600 text-white text-xs font-bold py-2 hover:bg-blue-700 transition-colors">
            Move to Screening
          </button>
          <button type="button" onClick={() => onStatusChange("rejected")}
            className="rounded-xl border border-red-200 bg-white text-red-600 text-xs font-bold px-4 py-2 hover:bg-red-50 transition-colors">
            Reject
          </button>
        </div>
      </div>
    );
  }

  // Screening → shortlist or reject
  if (status === "screening") {
    return (
      <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 space-y-3">
        <p className="text-xs font-bold text-purple-800">Next step: Screening Decision</p>
        <p className="text-xs text-purple-600">Call or email the candidate to screen them. Then mark the outcome below.</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => onStatusChange("shortlisted")}
            className="flex-1 rounded-xl bg-amber-500 text-white text-xs font-bold py-2 hover:bg-amber-600 transition-colors">
            ✓ Shortlist
          </button>
          <button type="button" onClick={() => onStatusChange("rejected")}
            className="rounded-xl border border-red-200 bg-white text-red-600 text-xs font-bold px-4 py-2 hover:bg-red-50 transition-colors">
            Reject
          </button>
        </div>
      </div>
    );
  }

  // Shortlisted → prepare interview
  if (status === "shortlisted") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-4">
        <div>
          <p className="text-xs font-bold text-amber-800">Next step: Prepare the Interview</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Fill in the interview details below. You can save them as a draft and come back later —
            or schedule and move this candidate to the Interview stage right away.
          </p>
        </div>

        {/* Existing scheduled interviews */}
        {application.interviews?.length ? (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Scheduled</p>
            {application.interviews.map((item) => (
              <div key={item.id} className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs">
                <p className="font-semibold text-gray-800">{item.title}</p>
                <p className="text-gray-500">{new Date(item.starts_at).toLocaleString()} · {item.mode}</p>
                {item.meeting_link && (
                  <a href={item.meeting_link} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">Open link →</a>
                )}
              </div>
            ))}
            <button type="button" onClick={() => onStatusChange("interview")}
              className="w-full rounded-xl bg-cyan-600 text-white text-xs font-bold py-2 hover:bg-cyan-700 transition-colors">
              ✓ Interview is done — Move to Interview stage
            </button>
          </div>
        ) : null}

        {/* Interview form */}
        <div className="space-y-2">
          <input type="text" placeholder="Interview title (e.g. Technical Round 1)"
            value={interviewDraft.title}
            className="h-9 w-full rounded-xl border border-amber-200 bg-white px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-colors"
            onChange={(e) => onDraftChange({ title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              aria-label="Interview mode"
              value={interviewDraft.mode}
              onChange={(e) => onDraftChange({ mode: e.target.value as "virtual" | "phone" | "onsite" })}
              className="h-9 rounded-xl border border-amber-200 bg-white px-3 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-colors"
            >
              <option value="virtual">Virtual</option>
              <option value="phone">Phone</option>
              <option value="onsite">On-site</option>
            </select>
            <input type="datetime-local" aria-label="Interview date and time"
              value={interviewDraft.starts_at}
              className="h-9 rounded-xl border border-amber-200 bg-white px-3 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-colors"
              onChange={(e) => onDraftChange({ starts_at: e.target.value })}
            />
          </div>
          <input type="text" placeholder="Meeting link (Zoom, Google Meet…)"
            value={interviewDraft.meeting_link}
            className="h-9 w-full rounded-xl border border-amber-200 bg-white px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-colors"
            onChange={(e) => onDraftChange({ meeting_link: e.target.value })}
          />
          <input type="tel" placeholder="Your phone number (optional — for emergencies)"
            value={interviewDraft.phone_number}
            className="h-9 w-full rounded-xl border border-amber-200 bg-white px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-colors"
            onChange={(e) => onDraftChange({ phone_number: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <button type="button" onClick={onScheduleAndAdvance}
            className="w-full rounded-xl bg-cyan-600 text-white text-xs font-bold py-2.5 hover:bg-cyan-700 transition-colors shadow-sm">
            📅 Schedule & Move to Interview
          </button>
          <button type="button" onClick={onScheduleInterview}
            className="w-full rounded-xl border border-amber-300 bg-white text-amber-700 text-xs font-semibold py-2 hover:bg-amber-50 transition-colors">
            Save as draft (stay in Shortlisted)
          </button>
          <button type="button" onClick={() => onStatusChange("rejected")}
            className="w-full rounded-xl border border-red-200 bg-white text-red-500 text-xs font-semibold py-2 hover:bg-red-50 transition-colors">
            Not a fit — Reject
          </button>
        </div>
      </div>
    );
  }

  // Interview → offer or reject
  if (status === "interview") {
    return (
      <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 space-y-3">
        <p className="text-xs font-bold text-cyan-800">Next step: Post-Interview Decision</p>
        <p className="text-xs text-cyan-600">Interview complete? Record your decision below.</p>
        {application.interviews?.length ? (
          <div className="space-y-1.5">
            {application.interviews.map((item) => (
              <div key={item.id} className="rounded-xl border border-cyan-200 bg-white px-3 py-2 text-xs">
                <p className="font-semibold text-gray-800">{item.title}</p>
                <p className="text-gray-500">{new Date(item.starts_at).toLocaleString()} · {item.mode}</p>
                {item.meeting_link && <a href={item.meeting_link} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">Open link →</a>}
              </div>
            ))}
          </div>
        ) : null}
        <div className="flex gap-2">
          <button type="button" onClick={() => onStatusChange("offer")}
            className="flex-1 rounded-xl bg-emerald-600 text-white text-xs font-bold py-2 hover:bg-emerald-700 transition-colors">
            🎉 Proceed to Offer
          </button>
          <button type="button" onClick={() => onStatusChange("shortlisted")}
            className="rounded-xl border border-gray-200 bg-white text-gray-600 text-xs font-semibold px-3 py-2 hover:bg-gray-50 transition-colors">
            ← Back to Shortlisted
          </button>
          <button type="button" onClick={() => onStatusChange("rejected")}
            className="rounded-xl border border-red-200 bg-white text-red-600 text-xs font-bold px-3 py-2 hover:bg-red-50 transition-colors">
            Reject
          </button>
        </div>
      </div>
    );
  }

  // Offer → hired or reject
  if (status === "offer") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
        <p className="text-xs font-bold text-emerald-800">Next step: Offer Decision</p>
        <p className="text-xs text-emerald-600">Has the candidate accepted the offer?</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => onStatusChange("hired")}
            className="flex-1 rounded-xl bg-green-600 text-white text-xs font-bold py-2 hover:bg-green-700 transition-colors">
            ✓ Mark as Hired
          </button>
          <button type="button" onClick={() => onStatusChange("rejected")}
            className="rounded-xl border border-red-200 bg-white text-red-600 text-xs font-bold px-4 py-2 hover:bg-red-50 transition-colors">
            Declined / Reject
          </button>
        </div>
      </div>
    );
  }

  // Hired
  if (status === "hired") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 flex items-center gap-3">
        <span className="text-xl">🎉</span>
        <div>
          <p className="text-xs font-bold text-green-800">Hired!</p>
          <p className="text-xs text-green-600">This candidate has been successfully hired.</p>
        </div>
      </div>
    );
  }

  // Rejected → option to reconsider
  if (status === "rejected") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
        <p className="text-xs font-bold text-red-700">Status: Rejected</p>
        <button type="button" onClick={() => onStatusChange("applied")}
          className="rounded-xl border border-gray-200 bg-white text-gray-600 text-xs font-semibold px-4 py-2 hover:bg-gray-50 transition-colors">
          Reconsider — Move back to Applied
        </button>
      </div>
    );
  }

  return null;
}

export default function EmployerCandidates() {
  const { profile, user, isEmployer } = useEmployerAuth();
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([]);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [interviewDrafts, setInterviewDrafts] = useState<Record<string, { title: string; mode: "virtual" | "phone" | "onsite"; starts_at: string; meeting_link: string }>>({});
  const [communicationDrafts, setCommunicationDrafts] = useState<Record<string, { communication_type: "email" | "chat" | "note"; subject: string; message: string }>>({});
  const [chatStarterDrafts, setChatStarterDrafts] = useState<Record<string, string>>({});
  const [conversations, setConversations] = useState<Record<string, FirestoreConversation>>({});
  const [startingChatFor, setStartingChatFor] = useState<string>("");
  const [topCandidates, setTopCandidates] = useState<CandidateApplication[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [isSavingSearch, setIsSavingSearch] = useState(false);
  const [newSearchName, setNewSearchName] = useState("");
  const canManageCandidates = !!profile?.permissions?.can_manage_candidates;

  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    if (!user || !isEmployer) return;
    const load = async () => {
      try {
        setLoading(true);
        const [applicationItems, jobItems] = await Promise.all([
          getEmployerCandidates({
            search: deferredSearch || undefined,
            job: jobFilter === "all" ? undefined : jobFilter,
            status: statusFilter === "all" ? undefined : statusFilter,
          }),
          getEmployerJobs(),
        ]);
        setApplications(Array.isArray(applicationItems) ? applicationItems : []);
        setJobs(Array.isArray(jobItems) ? jobItems : []);
      } catch {
        setApplications([]);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [deferredSearch, isEmployer, jobFilter, statusFilter, user]);

  useEffect(() => {
    if (!user || !isEmployer) return;
    getTopCandidates(jobFilter === "all" ? undefined : jobFilter)
      .then(setTopCandidates)
      .catch(() => setTopCandidates([]));
  }, [isEmployer, user, jobFilter]);

  useEffect(() => {
    if (!user || !isEmployer) return;
    getSavedSearches().then(setSavedSearches).catch(() => {});
  }, [user, isEmployer]);

  useEffect(() => {
    const employerEmail = (user?.email || profile?.contact_email || "").toLowerCase();
    if (!employerEmail) return;
    const unsubscribe = subscribeEmployerConversations(employerEmail, (items) => {
      setConversations(
        items.reduce<Record<string, FirestoreConversation>>((acc, item) => {
          acc[item.applicationId] = item;
          return acc;
        }, {}),
      );
    });
    return unsubscribe;
  }, [profile?.contact_email, user?.email]);

  const filteredApplications = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return applications.filter((app) => {
      const matchesSearch = !query ||
        [app.name, app.email, app.job_title, (app.skills || []).join(" ")].join(" ").toLowerCase().includes(query);
      const matchesJob = jobFilter === "all" || app.job === jobFilter;
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesJob && matchesStatus;
    });
  }, [applications, deferredSearch, jobFilter, statusFilter]);

  const pipelineCounts = useMemo(
    () => PIPELINE_STATUSES.reduce((acc, s) => {
      acc[s] = applications.filter((a) => a.status === s).length;
      return acc;
    }, {} as Record<ApplicationStatus, number>),
    [applications],
  );

  const selectedCandidate = filteredApplications.find((a) => a.id === selectedId) ?? null;
  const allVisibleSelected = filteredApplications.length > 0 && filteredApplications.every((a) => selectedApplicationIds.includes(a.id));

  const handleStatusChange = async (application: CandidateApplication, status: ApplicationStatus) => {
    try {
      const updated = await updateCandidateStatus(application.id, status);
      setApplications((cur) => cur.map((item) => (item.id === application.id ? updated : item)));
      toast.success(`${application.name} moved to ${status}.`);
    } catch {
      toast.error("Unable to update candidate status.");
    }
  };

  const handleNoteSave = async (application: CandidateApplication) => {
    const note = (draftNotes[application.id] || "").trim();
    if (!note) { toast.error("Write a note before saving."); return; }
    try {
      const updated = await addCandidateNote(application.id, note);
      setApplications((cur) => cur.map((item) => (item.id === application.id ? updated : item)));
      setDraftNotes((cur) => ({ ...cur, [application.id]: "" }));
      toast.success("Note saved.");
    } catch {
      toast.error("Unable to save note.");
    }
  };

  const handleInterviewSchedule = async (application: CandidateApplication) => {
    const draft = interviewDrafts[application.id];
    if (!draft?.title?.trim() || !draft?.starts_at) { toast.error("Add interview title and start time."); return; }
    try {
      const updated = await scheduleCandidateInterview(application.id, {
        title: draft.title.trim(), mode: draft.mode,
        starts_at: draft.starts_at, meeting_link: draft.meeting_link.trim(),
      });
      setApplications((cur) => cur.map((item) => (item.id === application.id ? updated : item)));
      setInterviewDrafts((cur) => ({ ...cur, [application.id]: { title: "", mode: "virtual", starts_at: "", meeting_link: "", phone_number: "" } }));
      toast.success("Interview scheduled.");
    } catch (error) {
      toast.error(getActionErrorMessage(error, "Unable to schedule interview."));
    }
  };

  const handleScheduleAndSendChatInvite = async (application: CandidateApplication) => {
    const draft = interviewDrafts[application.id];
    if (!draft?.title?.trim() || !draft?.starts_at) { toast.error("Add interview title and start time."); return; }
    try {
      const updated = await scheduleCandidateInterview(application.id, {
        title: draft.title.trim(), mode: draft.mode,
        starts_at: draft.starts_at, meeting_link: draft.meeting_link.trim(),
      });
      setApplications((cur) => cur.map((item) => (item.id === application.id ? updated : item)));

      const modeLabel = ({ virtual: "Virtual (Video Call)", phone: "Phone Call", onsite: "On-site" } as Record<string, string>)[draft.mode] ?? draft.mode;
      const when = new Date(draft.starts_at).toLocaleString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
      const companyName = profile?.company_name || "Our Team";
      const lines = [
        `📅 Interview Invitation — ${draft.title.trim()}`,
        ``,
        `Hi ${application.name.split(" ")[0]}, congratulations! ${companyName} would like to invite you for an interview.`,
        ``,
        `━━━━━━━━━━━━━━━━━━━━━`,
        `📋  Interview: ${draft.title.trim()}`,
        `📆  When: ${when}`,
        `💻  Format: ${modeLabel}`,
        draft.meeting_link.trim() ? `🔗  Join: ${draft.meeting_link.trim()}` : `🔗  Meeting link will be shared shortly`,
        ...(draft.phone_number.trim() ? [`📞  Contact: ${draft.phone_number.trim()} (emergency only)`] : []),
        `━━━━━━━━━━━━━━━━━━━━━`,
        ``,
        `Please be ready a few minutes before the scheduled time. We look forward to speaking with you! 🎯`,
      ];
      const inviteMessage = lines.join("\n");

      const employerEmail = user?.email || profile?.contact_email || "";
      const employerName = profile?.full_name || profile?.contact_name || "Employer";
      const existingConversation = conversations[application.id];
      if (existingConversation) {
        await sendConversationMessage({
          conversationId: application.id,
          text: inviteMessage,
          senderEmail: employerEmail,
          senderName: employerName,
          senderRole: "employer",
        });
      } else {
        await createEmployerConversation({
          applicationId: application.id,
          jobId: application.job,
          jobTitle: application.job_title,
          employerEmail,
          employerName,
          employerCompany: companyName,
          candidateEmail: application.email,
          candidateName: application.name,
          initialMessage: inviteMessage,
        });
      }

      await handleStatusChange(application, "interview");
      setInterviewDrafts((cur) => ({ ...cur, [application.id]: { title: "", mode: "virtual", starts_at: "", meeting_link: "", phone_number: "" } }));
      toast.success("Interview scheduled & invite sent to candidate's inbox.");
    } catch (error) {
      toast.error(getActionErrorMessage(error, "Unable to schedule interview."));
    }
  };

  const handleCommunicationLog = async (application: CandidateApplication) => {
    const draft = communicationDrafts[application.id];
    if (!draft?.message?.trim()) { toast.error("Write a message first."); return; }
    try {
      const updated = await logCandidateCommunication(application.id, {
        communication_type: draft.communication_type, direction: "outbound",
        subject: draft.subject.trim(), message: draft.message.trim(),
      });
      setApplications((cur) => cur.map((item) => (item.id === application.id ? updated : item)));
      setCommunicationDrafts((cur) => ({ ...cur, [application.id]: { communication_type: "email", subject: "", message: "" } }));
      toast.success("Communication logged.");
    } catch {
      toast.error("Unable to log communication.");
    }
  };

  const handleBulkStatus = async (status: ApplicationStatus) => {
    if (!selectedApplicationIds.length) { toast.error("Select candidates first."); return; }
    try {
      const updated = await bulkUpdateCandidateStatus(selectedApplicationIds, status);
      const updatedMap = new Map(updated.map((item) => [item.id, item]));
      setApplications((cur) => cur.map((item) => updatedMap.get(item.id) || item));
      setSelectedApplicationIds([]);
      toast.success(`${updated.length} candidates moved to ${status}.`);
    } catch {
      toast.error("Unable to run bulk update.");
    }
  };

  const handleStartConversation = async (application: CandidateApplication) => {
    const initialMessage = (chatStarterDrafts[application.id] || "").trim();
    if (!initialMessage) { toast.error("Write the first message before starting."); return; }
    const employerEmail = user?.email || profile?.contact_email || "";
    if (!employerEmail) { toast.error("Employer email missing."); return; }
    setStartingChatFor(application.id);
    try {
      await createEmployerConversation({
        applicationId: application.id, jobId: application.job,
        jobTitle: application.job_title, employerEmail,
        employerName: profile?.full_name || profile?.contact_name || employerEmail,
        employerCompany: profile?.company_name || "Employer",
        candidateEmail: application.email, candidateName: application.name, initialMessage,
      });
      setChatStarterDrafts((cur) => ({ ...cur, [application.id]: "" }));
      toast.success("Conversation started.");
    } catch {
      toast.error("Unable to start the conversation.");
    } finally {
      setStartingChatFor("");
    }
  };

  const handleRating = async (application: CandidateApplication, rating: number) => {
    try {
      const updated = await updateCandidateRating(application.id, rating);
      setApplications((cur) => cur.map((item) => (item.id === application.id ? { ...item, rating: updated.rating } : item)));
    } catch {
      toast.error("Unable to update rating.");
    }
  };

  const handleBookmark = async (application: CandidateApplication) => {
    try {
      if (application.is_bookmarked) {
        await removeBookmark(application.id);
        setApplications((cur) => cur.map((item) => (item.id === application.id ? { ...item, is_bookmarked: false } : item)));
        toast.success("Removed from talent pool.");
      } else {
        await bookmarkCandidate(application.id);
        setApplications((cur) => cur.map((item) => (item.id === application.id ? { ...item, is_bookmarked: true } : item)));
        toast.success("Saved to talent pool.");
      }
    } catch {
      toast.error("Unable to update bookmark.");
    }
  };

  const handleSaveSearch = async () => {
    if (!newSearchName.trim()) { toast.error("Enter a name for this search."); return; }
    try {
      setIsSavingSearch(true);
      const saved = await saveSearchQuery({
        name: newSearchName.trim(),
        filters: {
          search: search.trim() || undefined,
          job: jobFilter === "all" ? undefined : jobFilter,
          status: statusFilter === "all" ? undefined : statusFilter,
        },
      });
      setSavedSearches((prev) => [saved, ...prev]);
      setNewSearchName("");
      toast.success(`Search "${saved.name}" saved.`);
    } catch {
      toast.error("Failed to save search.");
    } finally {
      setIsSavingSearch(false);
    }
  };

  const handleApplySavedSearch = (saved: any) => {
    setSearch(saved.filters.search || "");
    setJobFilter(saved.filters.job || "all");
    setStatusFilter(saved.filters.status || "all");
    toast.success(`Applied: ${saved.name}`);
  };

  const handleDeleteSavedSearch = async (id: string, name: string) => {
    try {
      await deleteSavedSearch(id);
      setSavedSearches((prev) => prev.filter((s) => s.id !== id));
      toast.success(`Deleted: ${name}`);
    } catch {
      toast.error("Failed to delete saved search.");
    }
  };

  if (loading) return <LoadingState label="Loading candidates..." />;

  return (
    <div className="flex flex-col gap-0 h-full">
      <PageHeader
        eyebrow="Candidates"
        title="Candidate Management"
        description="Review applicants, manage pipeline stages, and shortlist the best talent."
      />

      {/* ── Filters bar ── */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 mb-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name, email, skills…"
              value={search}
              onChange={(e) => startTransition(() => setSearch(e.target.value))}
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>
          <select
            aria-label="Filter by job"
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="h-10 min-w-[160px] rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          >
            <option value="all">All jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </div>

        {/* Stage tab pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === "all"
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${statusFilter === "all" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"}`}>
              {applications.length}
            </span>
          </button>
          {PIPELINE_STATUSES.map((s) => {
            const colors = STAGE_COLORS[s];
            const active = statusFilter === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                  active ? `${colors.bg} ${colors.text} shadow-sm` : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${active ? colors.dot : "bg-gray-400"}`} />
                {s}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-white/60" : "bg-gray-200 text-gray-500"}`}>
                  {pipelineCounts[s] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Saved searches */}
        {savedSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-gray-400 font-medium">Saved:</span>
            {savedSearches.map((s) => (
              <div key={s.id} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 pl-2.5 pr-1 h-7">
                <button type="button" className="text-xs font-medium text-gray-600 hover:text-gray-900" onClick={() => handleApplySavedSearch(s)}>
                  {s.name}
                </button>
                <button type="button" aria-label={`Delete saved search ${s.name}`} className="p-0.5 text-gray-400 hover:text-red-500 transition-colors" onClick={() => handleDeleteSavedSearch(s.id, s.name)}>
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bulk actions bar (only when items selected) ── */}
      <AnimatePresence>
        {selectedApplicationIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 mb-4 flex flex-wrap items-center gap-3"
          >
            <span className="text-sm font-semibold text-blue-700">{selectedApplicationIds.length} selected</span>
            <div className="h-4 w-px bg-blue-200" />
            <button type="button" disabled={!canManageCandidates} onClick={() => handleBulkStatus("screening")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40 transition-colors">
              <CheckCheck className="h-3.5 w-3.5" /> Move to Screening
            </button>
            <button type="button" disabled={!canManageCandidates} onClick={() => handleBulkStatus("shortlisted")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 hover:bg-amber-600 disabled:opacity-40 transition-colors">
              <CheckCheck className="h-3.5 w-3.5" /> Shortlist
            </button>
            <button type="button" disabled={!canManageCandidates} onClick={() => handleBulkStatus("rejected")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-3 py-1.5 hover:bg-red-100 disabled:opacity-40 transition-colors">
              <XCircle className="h-3.5 w-3.5" /> Reject
            </button>
            <button type="button" onClick={() => setSelectedApplicationIds([])} className="ml-auto text-xs text-gray-400 hover:text-gray-700 transition-colors">
              Clear selection
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AI top candidates (compact) ── */}
      {topCandidates.length > 0 && (
        <div className="mb-4 rounded-2xl border border-teal-200 bg-teal-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-teal-600" />
            <p className="text-sm font-bold text-teal-800">Top AI Matches</p>
            <p className="text-xs text-teal-600">Ranked by skill match & relevance</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {topCandidates.slice(0, 6).map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-white px-3 py-2 text-xs font-medium hover:border-teal-400 hover:shadow-sm transition-all"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-700">#{i + 1}</span>
                <span className="text-gray-800">{c.name}</span>
                <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">{c.match_score}%</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Candidate list ── */}
      <div className="flex flex-col min-w-0">
          {/* Select all row */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-t-2xl border border-b-0 border-gray-200 bg-gray-50">
            <Checkbox
              checked={allVisibleSelected}
              onCheckedChange={(checked) => {
                setSelectedApplicationIds((cur) => {
                  if (checked) return [...new Set([...cur, ...filteredApplications.map((a) => a.id)])];
                  return cur.filter((id) => !filteredApplications.some((a) => a.id === id));
                });
              }}
            />
            <span className="text-xs font-medium text-gray-500">
              {filteredApplications.length} candidate{filteredApplications.length !== 1 ? "s" : ""}
            </span>
            {search || jobFilter !== "all" || statusFilter !== "all" ? (
              <button
                type="button"
                onClick={() => { setSearch(""); setJobFilter("all"); setStatusFilter("all"); }}
                className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="h-3 w-3" /> Clear filters
              </button>
            ) : null}
          </div>

          {filteredApplications.length === 0 ? (
            <div className="rounded-b-2xl border border-gray-200 bg-white">
              <EmptyState
                icon={<UserRoundSearch className="h-6 w-6" />}
                title="No candidates found"
                description="Try adjusting your filters or publish more jobs."
              />
            </div>
          ) : (
            <div className="rounded-b-2xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
              {filteredApplications.map((app) => {
                const colors = STAGE_COLORS[app.status] ?? STAGE_COLORS.applied;
                const isSelected = selectedId === app.id;
                return (
                  <div
                    key={app.id}
                    className={`group flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${
                      isSelected ? "bg-blue-50 border-l-2 border-l-blue-500" : "hover:bg-gray-50 border-l-2 border-l-transparent"
                    }`}
                    onClick={() => setSelectedId(isSelected ? "" : app.id)}
                  >
                    {/* Checkbox */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedApplicationIds.includes(app.id)}
                        onCheckedChange={(checked) => {
                          setSelectedApplicationIds((cur) =>
                            checked ? [...new Set([...cur, app.id])] : cur.filter((id) => id !== app.id),
                          );
                        }}
                      />
                    </div>

                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
                      {getInitials(app.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-gray-900 truncate">{app.name}</span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${colors.bg} ${colors.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                          {app.status}
                        </span>
                        {app.match_score > 0 && (
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            {app.match_score}% match
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{app.email} · {app.job_title}</p>
                      {/* Star rating inline */}
                      <div className="flex gap-0.5 mt-1" onClick={(e) => e.stopPropagation()}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} type="button" aria-label={`Rate ${s}`} onClick={() => handleRating(app, s)} className="p-0">
                            <Star className={`h-3 w-3 ${s <= (app.rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button type="button" aria-label="Bookmark" onClick={() => handleBookmark(app)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        {app.is_bookmarked
                          ? <BookmarkCheck className="h-4 w-4 text-teal-600" />
                          : <Bookmark className="h-4 w-4 text-gray-400 hover:text-teal-600 transition-colors" />}
                      </button>
                      {canManageCandidates && (
                        <div className="hidden group-hover:flex items-center gap-1">
                          {app.status === "applied" && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleStatusChange(app, "screening"); }}
                              className="rounded-lg bg-blue-600 text-white text-[10px] font-bold px-2 py-1 hover:bg-blue-700 transition-colors">
                              Screen →
                            </button>
                          )}
                          {app.status === "screening" && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleStatusChange(app, "shortlisted"); }}
                              className="rounded-lg bg-amber-500 text-white text-[10px] font-bold px-2 py-1 hover:bg-amber-600 transition-colors">
                              Shortlist ✓
                            </button>
                          )}
                          {app.status === "shortlisted" && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedId(app.id); }}
                              className="rounded-lg bg-cyan-600 text-white text-[10px] font-bold px-2 py-1 hover:bg-cyan-700 transition-colors">
                              Prepare Interview →
                            </button>
                          )}
                          {app.status === "interview" && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleStatusChange(app, "offer"); }}
                              className="rounded-lg bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 hover:bg-emerald-700 transition-colors">
                              Send Offer →
                            </button>
                          )}
                          {app.status === "offer" && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleStatusChange(app, "hired"); }}
                              className="rounded-lg bg-green-600 text-white text-[10px] font-bold px-2 py-1 hover:bg-green-700 transition-colors">
                              Mark Hired ✓
                            </button>
                          )}
                          {!["hired", "rejected"].includes(app.status) && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleStatusChange(app, "rejected"); }}
                              className="rounded-lg bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold px-2 py-1 hover:bg-red-100 transition-colors">
                              Reject
                            </button>
                          )}
                          {app.status === "rejected" && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleStatusChange(app, "applied"); }}
                              className="rounded-lg border border-gray-200 bg-white text-gray-600 text-[10px] font-bold px-2 py-1 hover:bg-gray-50 transition-colors">
                              Reconsider
                            </button>
                          )}
                        </div>
                      )}
                      <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      {/* ── Candidate detail popup ── */}
      <AnimatePresence>
        {selectedCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedId("")}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-base font-bold text-white shadow-md">
                    {getInitials(selectedCandidate.name)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-gray-900 text-base truncate">{selectedCandidate.name}</h2>
                    <p className="text-xs text-gray-500 truncate">{selectedCandidate.email}</p>
                    <p className="text-xs text-gray-400 truncate">{selectedCandidate.job_title}</p>
                  </div>
                </div>
                <button type="button" aria-label="Close candidate panel" onClick={() => setSelectedId("")} className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              <div className="p-5 space-y-5">

                {/* ── 1. STATUS + RATING strip ── */}
                <div className="flex flex-wrap items-center gap-2">
                  <CandidateStatusBadge status={selectedCandidate.status} />
                  {selectedCandidate.match_score > 0 && (
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      {selectedCandidate.match_score}% match
                    </span>
                  )}
                  <div className="flex gap-0.5 ml-auto">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button" aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`} onClick={() => handleRating(selectedCandidate, s)} className="p-0.5">
                        <Star className={`h-4 w-4 ${s <= (selectedCandidate.rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── 2. RESUME (prominent) ── */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Candidate Profile</p>
                  <div className="flex flex-wrap items-center gap-3">
                    {selectedCandidate.resume_link ? (
                      <a href={selectedCandidate.resume_link} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 transition-colors shadow-sm">
                        View Resume
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No resume uploaded</span>
                    )}
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <p className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-gray-400" />{selectedCandidate.email}</p>
                      <p className="text-gray-400">Applied {selectedCandidate.created_at ? new Date(selectedCandidate.created_at).toLocaleDateString() : "recently"}</p>
                    </div>
                  </div>
                </div>

                {/* ── 3. SKILL MATCH breakdown ── */}
                {(selectedCandidate.matched_skills?.length || selectedCandidate.missing_skills?.length) ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-2">Matched</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedCandidate.matched_skills?.length
                          ? selectedCandidate.matched_skills.slice(0, 6).map((s) => (
                              <span key={s} className="rounded-full bg-white border border-emerald-200 px-2 py-0.5 text-[10px] font-medium text-emerald-700">{s}</span>
                            ))
                          : <span className="text-[11px] text-gray-400">—</span>}
                      </div>
                    </div>
                    <div className="rounded-xl bg-red-50 border border-red-100 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-2">Missing</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedCandidate.missing_skills?.length
                          ? selectedCandidate.missing_skills.slice(0, 6).map((s) => (
                              <span key={s} className="rounded-full bg-white border border-red-200 px-2 py-0.5 text-[10px] font-medium text-red-600">{s}</span>
                            ))
                          : <span className="text-[11px] text-gray-400">Strong fit</span>}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* ── 5. APPLICATION ANSWERS ── */}
                {selectedCandidate.application_answers && Object.keys(selectedCandidate.application_answers).length > 0 && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Application Answers</p>
                    <div className="space-y-3">
                      {Object.entries(selectedCandidate.application_answers).map(([q, a]) => (
                        <div key={q}>
                          <p className="text-xs font-semibold text-gray-700">{q}</p>
                          <p className="mt-0.5 text-xs text-gray-500 whitespace-pre-wrap">{a || "No answer."}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── 6. AI RECOMMENDATION ── */}
                {selectedCandidate.recommendation && (
                  <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3">
                    <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">
                      <Sparkles className="h-3 w-3" /> AI Recommendation
                    </p>
                    <p className="text-xs text-gray-600">
                      {selectedCandidate.recommendation === "shortlist" && "Strong match — recommend shortlisting."}
                      {selectedCandidate.recommendation === "screening" && "Promising fit — recommend recruiter screening."}
                      {selectedCandidate.recommendation === "review" && "Partial alignment — needs manual review."}
                    </p>
                  </div>
                )}

                {/* ── DIVIDER ── */}
                <div className="border-t border-gray-100" />

                {/* ── 7. CONTEXTUAL NEXT STEP ── */}
                {canManageCandidates && (
                  <NextStepPanel
                    application={selectedCandidate}
                    interviewDraft={interviewDrafts[selectedCandidate.id] ?? { title: "", mode: "virtual", starts_at: "", meeting_link: "", phone_number: "" }}
                    onDraftChange={(patch) =>
                      setInterviewDrafts((cur) => ({
                        ...cur,
                        [selectedCandidate.id]: { ...(cur[selectedCandidate.id] ?? { title: "", mode: "virtual" as const, starts_at: "", meeting_link: "" }), ...patch },
                      }))
                    }
                    onStatusChange={(status) => handleStatusChange(selectedCandidate, status)}
                    onScheduleInterview={() => handleInterviewSchedule(selectedCandidate)}
                    onScheduleAndAdvance={() => handleScheduleAndSendChatInvite(selectedCandidate)}
                  />
                )}

                {/* ── 8. OVERRIDE STAGE ── */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Override Stage</p>
                  <Select value={selectedCandidate.status} onValueChange={(v) => handleStatusChange(selectedCandidate, v as ApplicationStatus)} disabled={!canManageCandidates}>
                    <SelectTrigger className="rounded-xl text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PIPELINE_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* ATS Note */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Recruiter Note</p>
                  {selectedCandidate.notes && (
                    <div className="mb-2 rounded-xl bg-gray-50 border border-gray-100 p-3 text-xs text-gray-600 whitespace-pre-wrap">
                      {selectedCandidate.notes}
                    </div>
                  )}
                  <Textarea
                    className="min-h-20 rounded-xl text-xs"
                    placeholder="Add recruiter notes, interview outcomes, or follow-up context…"
                    value={draftNotes[selectedCandidate.id] ?? ""}
                    onChange={(e) => setDraftNotes((cur) => ({ ...cur, [selectedCandidate.id]: e.target.value }))}
                  />
                  <button type="button" disabled={!canManageCandidates} onClick={() => handleNoteSave(selectedCandidate)}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 disabled:opacity-50 transition-colors shadow-sm">
                    Save Note
                  </button>
                </div>

                {/* ── DIRECT MESSAGE ── */}
                <div className="rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 border-b border-blue-100">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 shadow-sm">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Message {selectedCandidate.name.split(" ")[0]}</p>
                      <p className="text-[10px] text-gray-400">Direct chat · candidate sees this in their Hizorex inbox</p>
                    </div>
                  </div>
                  <div className="p-4">
                    {conversations[selectedCandidate.id] ? (
                      <ConversationPanel
                        conversation={conversations[selectedCandidate.id]}
                        currentUser={{
                          email: user?.email || profile?.contact_email || selectedCandidate.email,
                          name: profile?.full_name || profile?.contact_name || "Employer",
                          role: "employer",
                        }}
                        emptyLabel="No messages yet. Say hello!"
                      />
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-500">
                          Send a direct message to <span className="font-semibold text-gray-700">{selectedCandidate.name}</span> — they'll receive it instantly in their Hizorex account.
                        </p>
                        <Textarea
                          className="min-h-[100px] rounded-xl text-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 resize-none"
                          placeholder={`Hi ${selectedCandidate.name.split(" ")[0]}, we've reviewed your application and would love to connect…`}
                          value={chatStarterDrafts[selectedCandidate.id] ?? ""}
                          onChange={(e) => setChatStarterDrafts((cur) => ({ ...cur, [selectedCandidate.id]: e.target.value }))}
                        />
                        <button
                          type="button"
                          disabled={startingChatFor === selectedCandidate.id}
                          onClick={() => handleStartConversation(selectedCandidate)}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 disabled:opacity-50 transition-colors shadow-sm"
                        >
                          <MessageSquare className="h-4 w-4" />
                          {startingChatFor === selectedCandidate.id ? "Sending…" : "Send Message"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bookmark */}
                <div className="pb-2">
                  <button type="button" onClick={() => handleBookmark(selectedCandidate)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-colors ${
                      selectedCandidate.is_bookmarked
                        ? "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}>
                    {selectedCandidate.is_bookmarked
                      ? <><BookmarkCheck className="h-3.5 w-3.5" /> Saved to Talent Pool</>
                      : <><Bookmark className="h-3.5 w-3.5" /> Save to Talent Pool</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
