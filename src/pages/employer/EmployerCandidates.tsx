import { useDeferredValue, useEffect, useMemo, useState, startTransition, useCallback, DragEvent } from "react";
import { motion } from "framer-motion";
import { Bookmark, BookmarkCheck, CalendarDays, CheckCheck, ChevronDown, ChevronUp, FileText, Filter, LayoutGrid, List, Mail, MessageSquare, Search, Sparkles, Star, UserRoundSearch, XCircle } from "lucide-react";
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
import { addCandidateNote, bookmarkCandidate, bulkUpdateCandidateStatus, deleteSavedSearch, getEmployerCandidates, getEmployerJobs, getSavedSearches, getTopCandidates, logCandidateCommunication, removeBookmark, saveSearchQuery, scheduleCandidateInterview, updateCandidateRating, updateCandidateStatus } from "@/services/employerService";
import { createEmployerConversation, subscribeEmployerConversations } from "@/services/chatService";
import { FirestoreConversation } from "@/types/chat";
import { ApplicationStatus, CandidateApplication, JobPosting } from "@/types/employer";

const PIPELINE_STATUSES: ApplicationStatus[] = ["applied", "screening", "shortlisted", "interview", "offer", "hired", "rejected"];
const PIPELINE_COLORS: Record<string, string> = {
  applied: "border-t-blue-500",
  screening: "border-t-purple-500",
  shortlisted: "border-t-amber-500",
  interview: "border-t-cyan-500",
  offer: "border-t-emerald-500",
  hired: "border-t-green-600",
  rejected: "border-t-red-500",
};

function getActionErrorMessage(error: any, fallback: string) {
  const data = error?.response?.data;
  if (typeof data?.detail === "string" && data.detail.trim()) {
    return data.detail;
  }
  if (typeof data === "object" && data) {
    const firstValue = Object.values(data)[0];
    if (Array.isArray(firstValue) && firstValue[0]) {
      return String(firstValue[0]);
    }
    if (typeof firstValue === "string" && firstValue.trim()) {
      return firstValue;
    }
  }
  return error?.message || fallback;
}

export default function EmployerCandidates() {
  const { profile, user, isEmployer } = useEmployerAuth();
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([]);
  const [interviewDrafts, setInterviewDrafts] = useState<Record<string, { title: string; mode: "virtual" | "phone" | "onsite"; starts_at: string; meeting_link: string }>>({});
  const [communicationDrafts, setCommunicationDrafts] = useState<Record<string, { communication_type: "email" | "chat" | "note"; subject: string; message: string }>>({});
  const [chatStarterDrafts, setChatStarterDrafts] = useState<Record<string, string>>({});
  const [conversations, setConversations] = useState<Record<string, FirestoreConversation>>({});
  const [startingChatFor, setStartingChatFor] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [topCandidates, setTopCandidates] = useState<CandidateApplication[]>([]);
  const [expandedCard, setExpandedCard] = useState<string>("");
  const [draggedCandidate, setDraggedCandidate] = useState<string>("");
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [isSavingSearch, setIsSavingSearch] = useState(false);
  const [newSearchName, setNewSearchName] = useState("");
  const canManageCandidates = !!profile?.permissions?.can_manage_candidates;

  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    if (!user || !isEmployer) {
      return;
    }
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
      } catch (err) {
        console.error("Failed to load candidates:", err);
        setApplications([]);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [deferredSearch, isEmployer, jobFilter, statusFilter, user]);

  // Load top AI candidates
  useEffect(() => {
    if (!user || !isEmployer) return;
    getTopCandidates(jobFilter === "all" ? undefined : jobFilter)
      .then(setTopCandidates)
      .catch(() => setTopCandidates([]));
  }, [isEmployer, user, jobFilter]);

  useEffect(() => {
    if (!user || !isEmployer) return;
    const loadSearches = async () => {
      try {
        const items = await getSavedSearches();
        setSavedSearches(items);
      } catch (err) {
        console.error("Failed to load saved searches", err);
      }
    };
    loadSearches();
  }, [user, isEmployer]);

  useEffect(() => {
    const employerEmail = (user?.email || profile?.contact_email || "").toLowerCase();
    if (!employerEmail) {
      return;
    }

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
    return applications.filter((application) => {
      const matchesSearch =
        !query ||
        [application.name, application.email, application.job_title, (application.skills || []).join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesJob = jobFilter === "all" || application.job === jobFilter;
      const matchesStatus = statusFilter === "all" || application.status === statusFilter;
      return matchesSearch && matchesJob && matchesStatus;
    });
  }, [applications, deferredSearch, jobFilter, statusFilter]);

  const pipelineCounts = useMemo(
    () =>
      PIPELINE_STATUSES.reduce(
        (accumulator, status) => {
          accumulator[status] = filteredApplications.filter((application) => application.status === status).length;
          return accumulator;
        },
        {} as Record<ApplicationStatus, number>,
      ),
    [filteredApplications],
  );

  const allVisibleSelected = filteredApplications.length > 0 && filteredApplications.every((application) => selectedApplicationIds.includes(application.id));

  const handleStatusChange = async (application: CandidateApplication, status: ApplicationStatus) => {
    try {
      const updated = await updateCandidateStatus(application.id, status);
      setApplications((current) =>
        current.map((item) => (item.id === application.id ? updated : item)),
      );
      toast.success(`${application.name} marked as ${status}.`);
    } catch (error) {
      console.error(error);
      toast.error("Unable to update candidate status.");
    }
  };

  const handleNoteSave = async (application: CandidateApplication) => {
    const note = (draftNotes[application.id] || "").trim();
    if (!note) {
      toast.error("Write a note before saving.");
      return;
    }

    try {
      const updated = await addCandidateNote(application.id, note);
      setApplications((current) =>
        current.map((item) => (item.id === application.id ? updated : item)),
      );
      setDraftNotes((current) => ({ ...current, [application.id]: "" }));
      toast.success("ATS note saved.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to save ATS note.");
    }
  };

  const handleInterviewSchedule = async (application: CandidateApplication) => {
    const draft = interviewDrafts[application.id];
    if (!draft?.title?.trim() || !draft?.starts_at) {
      toast.error("Add an interview title and start time.");
      return;
    }

    try {
      const updated = await scheduleCandidateInterview(application.id, {
        title: draft.title.trim(),
        mode: draft.mode,
        starts_at: draft.starts_at,
        meeting_link: draft.meeting_link.trim(),
      });
      setApplications((current) => current.map((item) => (item.id === application.id ? updated : item)));
      setInterviewDrafts((current) => ({
        ...current,
        [application.id]: { title: "", mode: "virtual", starts_at: "", meeting_link: "" },
      }));
      toast.success("Interview scheduled.");
    } catch (error) {
      console.error(error);
      toast.error(getActionErrorMessage(error, "Unable to schedule interview."));
    }
  };

  const handleCommunicationLog = async (application: CandidateApplication) => {
    const draft = communicationDrafts[application.id];
    if (!draft?.message?.trim()) {
      toast.error("Write a message before logging communication.");
      return;
    }

    try {
      const updated = await logCandidateCommunication(application.id, {
        communication_type: draft.communication_type,
        direction: "outbound",
        subject: draft.subject.trim(),
        message: draft.message.trim(),
      });
      setApplications((current) => current.map((item) => (item.id === application.id ? updated : item)));
      setCommunicationDrafts((current) => ({
        ...current,
        [application.id]: { communication_type: "email", subject: "", message: "" },
      }));
      toast.success("Communication logged.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to log communication.");
    }
  };

  const handleBulkStatus = async (status: ApplicationStatus) => {
    if (!selectedApplicationIds.length) {
      toast.error("Select candidates first.");
      return;
    }

    try {
      const updated = await bulkUpdateCandidateStatus(selectedApplicationIds, status);
      const updatedMap = new Map(updated.map((item) => [item.id, item]));
      setApplications((current) => current.map((item) => updatedMap.get(item.id) || item));
      setSelectedApplicationIds([]);
      toast.success(`${updated.length} candidates moved to ${status}.`);
    } catch (error) {
      console.error(error);
      toast.error("Unable to run the bulk update.");
    }
  };

  const handleStartConversation = async (application: CandidateApplication) => {
    const initialMessage = (chatStarterDrafts[application.id] || "").trim();
    if (!initialMessage) {
      toast.error("Write the first employer message before starting the conversation.");
      return;
    }

    const employerEmail = user?.email || profile?.contact_email || "";
    if (!employerEmail) {
      toast.error("Employer account email is missing.");
      return;
    }

    setStartingChatFor(application.id);
    try {
      await createEmployerConversation({
        applicationId: application.id,
        jobId: application.job,
        jobTitle: application.job_title,
        employerEmail,
        employerName: profile?.full_name || profile?.contact_name || employerEmail,
        employerCompany: profile?.company_name || "Employer",
        candidateEmail: application.email,
        candidateName: application.name,
        initialMessage,
      });
      setChatStarterDrafts((current) => ({ ...current, [application.id]: "" }));
      toast.success("Conversation started.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to start the conversation.");
    } finally {
      setStartingChatFor("");
    }
  };

  // Star rating handler
  const handleRating = async (application: CandidateApplication, rating: number) => {
    try {
      const updated = await updateCandidateRating(application.id, rating);
      setApplications((current) =>
        current.map((item) => (item.id === application.id ? { ...item, rating: updated.rating } : item)),
      );
      toast.success(`Rated ${application.name}: ${rating} stars`);
    } catch {
      toast.error("Unable to update rating.");
    }
  };

  // Bookmark handler
  const handleBookmark = async (application: CandidateApplication) => {
    try {
      if (application.is_bookmarked) {
        await removeBookmark(application.id);
        setApplications((current) =>
          current.map((item) => (item.id === application.id ? { ...item, is_bookmarked: false } : item)),
        );
        toast.success("Removed from talent pool.");
      } else {
        await bookmarkCandidate(application.id);
        setApplications((current) =>
          current.map((item) => (item.id === application.id ? { ...item, is_bookmarked: true } : item)),
        );
        toast.success("Saved to talent pool.");
      }
    } catch {
      toast.error("Unable to update bookmark.");
    }
  };

  // Kanban drag handlers
  const handleDragStart = useCallback((e: DragEvent<HTMLDivElement>, applicationId: string) => {
    e.dataTransfer.setData("text/plain", applicationId);
    setDraggedCandidate(applicationId);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(async (e: DragEvent<HTMLDivElement>, targetStatus: ApplicationStatus) => {
    e.preventDefault();
    const applicationId = e.dataTransfer.getData("text/plain");
    setDraggedCandidate("");
    if (!applicationId) return;
    const application = applications.find((a) => a.id === applicationId);
    if (!application || application.status === targetStatus) return;
    await handleStatusChange(application, targetStatus);
  }, [applications]);

      // Search Handlers
  const handleSaveSearch = async () => {
    if (!newSearchName.trim()) {
      toast.error("Please enter a name for your saved search.");
      return;
    }
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
    toast.success(`Applied search: ${saved.name}`);
  };

  const handleDeleteSavedSearch = async (id: string, name: string) => {
    try {
      await deleteSavedSearch(id);
      setSavedSearches((prev) => prev.filter((s) => s.id !== id));
      toast.success(`Deleted search: ${name}`);
    } catch {
      toast.error("Failed to delete saved search.");
    }
  };

  if (loading) {
    return <LoadingState label="Loading applicants..." />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Candidates"
        title="Candidate Management"
        description="Review applicants by role, open resumes, and update pipeline decisions in realtime."
        actions={(
          <div className="flex gap-2">
            <button
              type="button"
              className={`inline-flex items-center gap-2 rounded-2xl text-sm font-semibold px-4 py-2 transition-colors ${viewMode === "list" ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
              List
            </button>
            <button
              type="button"
              className={`inline-flex items-center gap-2 rounded-2xl text-sm font-semibold px-4 py-2 transition-colors ${viewMode === "kanban" ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="h-4 w-4" />
              Board
            </button>
          </div>
        )}
      />

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search candidates, jobs, or skills"
              value={search}
              onChange={(event) => startTransition(() => setSearch(event.target.value))}
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>
          <select
            aria-label="Filter by job"
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          >
            <option value="all">All jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "all")}
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 capitalize focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          >
            <option value="all">All statuses</option>
            {PIPELINE_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
          <input
            type="text"
            placeholder="Name current filters to save..."
            value={newSearchName}
            onChange={(e) => setNewSearchName(e.target.value)}
            className="h-9 w-52 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
          <button
            type="button"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50 transition-colors"
            onClick={handleSaveSearch}
            disabled={isSavingSearch}
          >
            {isSavingSearch ? "Saving..." : <><Bookmark className="h-3 w-3" /> Save filters</>}
          </button>
          {savedSearches.map((s) => (
            <div key={s.id} className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 pl-3 pr-1 h-9">
              <button
                type="button"
                className="text-xs font-medium text-gray-600 hover:text-gray-900"
                onClick={() => handleApplySavedSearch(s)}
              >
                {s.name}
              </button>
              <button
                type="button"
                aria-label="Delete saved search"
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                onClick={() => handleDeleteSavedSearch(s.id, s.name)}
              >
                <XCircle className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-wrap items-center gap-3 px-5 py-3">
        <Checkbox
          checked={allVisibleSelected}
          onCheckedChange={(checked) => {
            setSelectedApplicationIds((current) => {
              if (checked) {
                return [...new Set([...current, ...filteredApplications.map((application) => application.id)])];
              }
              return current.filter((id) => !filteredApplications.some((application) => application.id === id));
            });
          }}
        />
        <span className="text-sm font-medium text-gray-600 mr-1">
          {selectedApplicationIds.length > 0 ? `${selectedApplicationIds.length} selected` : "Select all"}
        </span>
        <div className="h-4 w-px bg-gray-200" />
        <button type="button" className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 disabled:opacity-40 transition-colors" disabled={!selectedApplicationIds.length || !canManageCandidates} onClick={() => handleBulkStatus("screening")}>
          <CheckCheck className="h-3.5 w-3.5" />
          Move to screening
        </button>
        <button type="button" className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 disabled:opacity-40 transition-colors" disabled={!selectedApplicationIds.length || !canManageCandidates} onClick={() => handleBulkStatus("shortlisted")}>
          <CheckCheck className="h-3.5 w-3.5" />
          Shortlist
        </button>
        <button type="button" className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-white hover:bg-red-50 text-red-600 text-xs font-semibold px-3 py-2 disabled:opacity-40 transition-colors" disabled={!selectedApplicationIds.length || !canManageCandidates} onClick={() => handleBulkStatus("rejected")}>
          <XCircle className="h-3.5 w-3.5" />
          Reject
        </button>
        {!canManageCandidates && (
          <p className="ml-auto text-xs text-gray-400">View-only access — pipeline changes require recruiter role.</p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
        {PIPELINE_STATUSES.map((status) => (
          <div key={status} className={`rounded-2xl border-t-[3px] ${PIPELINE_COLORS[status]} border border-gray-200 bg-white shadow-sm p-4`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{status}</p>
            <p className="mt-1.5 text-3xl font-bold text-gray-900">{pipelineCounts[status] || 0}</p>
          </div>
        ))}
      </div>

      {/* AI Top Candidates */}
      {topCandidates.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm border-l-4 border-l-teal-600 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50">
                <Sparkles className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <p className="font-semibold">🤖 Top Recommended Candidates</p>
                <p className="text-xs text-gray-500">AI-ranked by skill match, experience relevance, and keyword matching</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {topCandidates.slice(0, 10).map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl border border-gray-200 bg-white p-3 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-xs font-bold text-teal-600">#{i + 1}</span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">{c.match_score}%</span>
                  </div>
                  <p className="mt-2 font-medium text-sm truncate">{c.name}</p>
                  <p className="text-xs text-gray-500 truncate">{c.job_title}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.matched_skills?.slice(0, 3).map((s) => (
                      <span key={s} className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">{s}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
        </div>
      )}

      {/* Board View */}
      {viewMode === "kanban" ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {PIPELINE_STATUSES.map((status) => {
            const columnApps = filteredApplications.filter((a) => a.status === status);
            return (
              <div
                key={status}
                className={`min-w-[220px] flex-shrink-0 rounded-2xl border-t-[3px] ${PIPELINE_COLORS[status]} border border-gray-200 bg-gray-50/70 p-3`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{status}</p>
                  <span className="rounded-full bg-white border border-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-700">{columnApps.length}</span>
                </div>
                <div className="space-y-2">
                  {columnApps.map((application) => (
                    <div
                      key={application.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, application.id)}
                      className={`cursor-grab rounded-xl border border-gray-200 bg-white p-3 transition-all hover:shadow-md active:cursor-grabbing ${
                        draggedCandidate === application.id ? "opacity-50 scale-95" : ""
                      }`}
                      onClick={() => setExpandedCard(expandedCard === application.id ? "" : application.id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate">{application.name}</p>
                        <button
                          type="button"
                          aria-label={application.is_bookmarked ? "Remove bookmark" : "Bookmark candidate"}
                          className="shrink-0"
                          onClick={(e) => { e.stopPropagation(); handleBookmark(application); }}
                        >
                          {application.is_bookmarked
                            ? <BookmarkCheck className="h-4 w-4 text-teal-600" />
                            : <Bookmark className="h-4 w-4 text-gray-500 hover:text-teal-600" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{application.job_title}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-600">
                          {application.match_score}% match
                        </span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
                              onClick={(e) => { e.stopPropagation(); handleRating(application, s); }}
                              className="p-0"
                            >
                              <Star
                                className={`h-3 w-3 ${s <= (application.rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      {expandedCard === application.id ? (
                        <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                          <div className="flex flex-wrap gap-1">
                            {(application.skills || []).slice(0, 4).map((skill) => (
                              <span key={skill} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px]">{skill}</span>
                            ))}
                          </div>
                          <a href={application.resume_link} target="_blank" rel="noreferrer" className="text-xs text-teal-600 hover:underline block">View resume →</a>
                        </div>
                      ) : null}
                    </div>
                  ))}
                  {columnApps.length === 0 && (
                    <p className="text-center text-xs text-gray-500 py-6">Drop candidates here</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* List View */}
      {viewMode === "list" && filteredApplications.length ? (
        <div className="grid gap-4">
          {filteredApplications.map((application) => (
            <div key={application.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Checkbox
                    checked={selectedApplicationIds.includes(application.id)}
                    onCheckedChange={(checked) => {
                      setSelectedApplicationIds((current) =>
                        checked ? [...new Set([...current, application.id])] : current.filter((id) => id !== application.id),
                      );
                    }}
                  />
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 flex-wrap items-center gap-3 text-left"
                    onClick={() => setExpandedCard(expandedCard === application.id ? "" : application.id)}
                  >
                    <Checkbox
                      checked={selectedApplicationIds.includes(application.id)}
                      className="hidden"
                    />
                    <h3 className="text-xl font-semibold">{application.name}</h3>
                    <CandidateStatusBadge status={application.status} />
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-600">
                      Match {application.match_score}%
                    </span>
                    {/* Star rating */}
                    <div className="ml-auto flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`} onClick={(e) => { e.stopPropagation(); handleRating(application, s); }} className="p-0.5">
                          <Star className={`h-4 w-4 ${s <= (application.rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                        </button>
                      ))}
                    </div>
                  </button>
                  <button type="button" aria-label={application.is_bookmarked ? "Remove bookmark" : "Bookmark candidate"} onClick={() => handleBookmark(application)} className="p-1">
                      {application.is_bookmarked
                        ? <BookmarkCheck className="h-5 w-5 text-teal-600" />
                        : <Bookmark className="h-5 w-5 text-gray-500 hover:text-teal-600" />}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    onClick={() => setExpandedCard(expandedCard === application.id ? "" : application.id)}
                  >
                    {expandedCard === application.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {expandedCard === application.id ? "Hide details" : "View details"}
                  </button>
                </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {application.email}
                    </span>
                    <span>{application.job_title}</span>
                  </div>
                  {expandedCard === application.id ? (
                    <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                      <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(application.skills || []).map((skill) => (
                      <span key={skill} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="rounded-2xl bg-emerald-500/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">Matched skills</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {application.matched_skills?.length ? application.matched_skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-white px-3 py-1 text-xs font-medium">
                            {skill}
                          </span>
                        )) : <span className="text-sm text-gray-500">No direct matches yet.</span>}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-amber-500/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">Missing skills</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {application.missing_skills?.length ? application.missing_skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-white px-3 py-1 text-xs font-medium">
                            {skill}
                          </span>
                        )) : <span className="text-sm text-gray-500">Strong fit on listed job skills.</span>}
                      </div>
                    </div>
                  </div>
                  <a
                    href={application.resume_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-sm font-medium text-teal-600 hover:underline"
                  >
                    View resume
                  </a>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>Applied {application.created_at ? new Date(application.created_at).toLocaleDateString() : "recently"}</span>
                    <span>Stage updated {application.stage_changed_at ? new Date(application.stage_changed_at).toLocaleDateString() : "recently"}</span>
                  </div>
                  {application.notes ? (
                    <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500 whitespace-pre-wrap">
                      {application.notes}
                    </div>
                  ) : null}
                  {application.application_answers && Object.keys(application.application_answers).length ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Quick apply details</p>
                      <div className="mt-3 space-y-3">
                        {Object.entries(application.application_answers).map(([question, answer]) => (
                          <div key={question}>
                            <p className="text-sm font-medium">{question}</p>
                            <p className="mt-1 text-sm text-gray-500 whitespace-pre-wrap">{answer || "No answer provided."}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                      </div>

                      <div className="space-y-4 rounded-3xl bg-gray-100 p-4">
                  <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">
                      <Sparkles className="h-3.5 w-3.5" />
                      Match recommendation
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      {application.recommendation === "shortlist" && "High-signal match. Recommend moving this candidate to shortlist."}
                      {application.recommendation === "screening" && "Promising overlap. Recommend recruiter screening next."}
                      {application.recommendation === "review" && "Needs manual review. Resume shows partial skill alignment."}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">ATS stage</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <Select value={application.status} onValueChange={(value) => handleStatusChange(application, value as ApplicationStatus)} disabled={!canManageCandidates}>
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PIPELINE_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 transition-colors"
                        onClick={() => window.open(application.resume_link, "_blank")}
                      >
                        Resume
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">ATS note</p>
                    <Textarea
                      className="mt-3 min-h-28 rounded-2xl"
                      placeholder="Add recruiter notes, interview outcomes, or follow-up context."
                      value={draftNotes[application.id] ?? ""}
                      onChange={(event) =>
                        setDraftNotes((current) => ({ ...current, [application.id]: event.target.value }))
                      }
                    />
                    <button type="button" className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 disabled:opacity-50 transition-colors shadow-sm" onClick={() => handleNoteSave(application)} disabled={!canManageCandidates}>
                      Save note
                    </button>
                  </div>

                  <div>
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                      <FileText className="h-3.5 w-3.5" />
                      Recent timeline
                    </p>
                    <div className="mt-3 space-y-3">
                      {application.history?.length ? application.history.slice(0, 4).map((item) => (
                        <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-3">
                          <p className="text-sm font-medium">
                            {(item.from_status || "new")} to {item.to_status}
                          </p>
                          {item.note ? <p className="mt-1 text-sm text-gray-500">{item.note}</p> : null}
                          <p className="mt-1 text-xs text-gray-500">
                            {item.created_at ? new Date(item.created_at).toLocaleString() : "recently"}
                          </p>
                        </div>
                      )) : (
                        <p className="text-sm text-gray-500">No ATS events yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Interview scheduling
                    </p>
                    <div className="mt-3 grid gap-3">
                      <input
                        type="text"
                        placeholder="Interview title"
                        value={interviewDrafts[application.id]?.title ?? ""}
                        className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        onChange={(event) =>
                          setInterviewDrafts((current) => {
                            const existing = current[application.id] ?? { title: "", mode: "virtual" as const, starts_at: "", meeting_link: "" };
                            return {
                              ...current,
                              [application.id]: { ...existing, title: event.target.value },
                            };
                          })
                        }
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Select
                          value={interviewDrafts[application.id]?.mode ?? "virtual"}
                          onValueChange={(value) =>
                            setInterviewDrafts((current) => {
                              const existing = current[application.id] ?? { title: "", mode: "virtual" as const, starts_at: "", meeting_link: "" };
                              return {
                                ...current,
                                [application.id]: { ...existing, mode: value as "virtual" | "phone" | "onsite" },
                              };
                            })
                          }
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="virtual">Virtual</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="onsite">On-site</SelectItem>
                          </SelectContent>
                        </Select>
                        <input
                          type="datetime-local"
                          aria-label="Interview date and time"
                          value={interviewDrafts[application.id]?.starts_at ?? ""}
                          className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                          onChange={(event) =>
                            setInterviewDrafts((current) => {
                              const existing = current[application.id] ?? { title: "", mode: "virtual" as const, starts_at: "", meeting_link: "" };
                              return {
                                ...current,
                                [application.id]: { ...existing, starts_at: event.target.value },
                              };
                            })
                          }
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Meeting link (e.g. Zoom URL)"
                        value={interviewDrafts[application.id]?.meeting_link ?? ""}
                        className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        onChange={(event) =>
                          setInterviewDrafts((current) => {
                            const existing = current[application.id] ?? { title: "", mode: "virtual" as const, starts_at: "", meeting_link: "" };
                            return {
                              ...current,
                              [application.id]: { ...existing, meeting_link: event.target.value },
                            };
                          })
                        }
                      />
                      <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 disabled:opacity-50 transition-colors" onClick={() => handleInterviewSchedule(application)} disabled={!canManageCandidates}>
                        Schedule interview
                      </button>
                      {application.interviews?.length ? (
                        <div className="space-y-2">
                          {application.interviews.slice(0, 2).map((item) => (
                            <div key={item.id} className="rounded-2xl border border-gray-200 p-3 text-sm">
                              <p className="font-medium">{item.title}</p>
                              <p className="text-gray-500">{new Date(item.starts_at).toLocaleString()} | {item.mode}</p>
                              <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                                <span>Invite {item.invite_sent_at ? `sent ${new Date(item.invite_sent_at).toLocaleString()}` : "pending"}</span>
                                {item.meeting_link ? <a href={item.meeting_link} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">Open link</a> : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                      <Mail className="h-3.5 w-3.5" />
                      Candidate communication
                    </p>
                    <div className="mt-3 grid gap-3">
                      <Select
                        value={communicationDrafts[application.id]?.communication_type ?? "email"}
                        onValueChange={(value) =>
                          setCommunicationDrafts((current) => {
                            const existing = current[application.id] ?? { communication_type: "email" as const, subject: "", message: "" };
                            return {
                              ...current,
                              [application.id]: { ...existing, communication_type: value as "email" | "chat" | "note" },
                            };
                          })
                        }
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="chat">Chat</SelectItem>
                          <SelectItem value="note">Note</SelectItem>
                        </SelectContent>
                      </Select>
                      <input
                        type="text"
                        placeholder="Subject"
                        value={communicationDrafts[application.id]?.subject ?? ""}
                        className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        onChange={(event) =>
                          setCommunicationDrafts((current) => {
                            const existing = current[application.id] ?? { communication_type: "email" as const, subject: "", message: "" };
                            return {
                              ...current,
                              [application.id]: { ...existing, subject: event.target.value },
                            };
                          })
                        }
                      />
                      <Textarea
                        className="min-h-24 rounded-2xl"
                        placeholder="Log the message you sent or received."
                        value={communicationDrafts[application.id]?.message ?? ""}
                        onChange={(event) =>
                          setCommunicationDrafts((current) => {
                            const existing = current[application.id] ?? { communication_type: "email" as const, subject: "", message: "" };
                            return {
                              ...current,
                              [application.id]: { ...existing, message: event.target.value },
                            };
                          })
                        }
                      />
                      <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 disabled:opacity-50 transition-colors" onClick={() => handleCommunicationLog(application)} disabled={!canManageCandidates}>
                        Save communication
                      </button>
                      {application.communications?.length ? (
                        <div className="space-y-2">
                          {application.communications.slice(0, 2).map((item) => (
                            <div key={item.id} className="rounded-2xl border border-gray-200 p-3 text-sm">
                              <p className="font-medium">{item.subject || item.communication_type}</p>
                              <p className="mt-1 text-gray-500">{item.message}</p>
                              <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                                <span className="capitalize">Type: {item.communication_type}</span>
                                <span className="capitalize">Direction: {item.direction}</span>
                                {item.delivery_status ? <span className="capitalize">Delivery: {item.delivery_status}</span> : null}
                              </div>
                              {item.delivery_error ? <p className="mt-1 text-xs text-destructive">{item.delivery_error}</p> : null}
                              <p className="mt-1 text-xs text-gray-500">{item.created_at ? new Date(item.created_at).toLocaleString() : "recently"}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Firestore chat
                    </p>
                    <div className="mt-3">
                      {conversations[application.id] ? (
                        <ConversationPanel
                          conversation={conversations[application.id]}
                          currentUser={{
                            email: (user?.email || profile?.contact_email || application.email),
                            name: profile?.full_name || profile?.contact_name || "Employer",
                            role: "employer",
                          }}
                          emptyLabel="No messages yet in this conversation."
                        />
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-500">
                            Only employers can initiate chat. Send the first message here to open the conversation with this aspirant.
                          </p>
                          <Textarea
                            className="min-h-24 rounded-2xl"
                            placeholder="Write the first employer message..."
                            value={chatStarterDrafts[application.id] ?? ""}
                            onChange={(event) =>
                              setChatStarterDrafts((current) => ({ ...current, [application.id]: event.target.value }))
                            }
                          />
                          <div className="flex justify-end">
                            <button type="button" className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 disabled:opacity-50 transition-colors shadow-sm" onClick={() => handleStartConversation(application)} disabled={startingChatFor === application.id}>
                              {startingChatFor === application.id ? "Starting..." : "Start conversation"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                      </div>
                    </div>
                  ) : null}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<UserRoundSearch className="h-6 w-6" />}
          title="No applicants found"
          description="Try a different filter or publish more jobs so candidates start appearing here."
        />
      )}
    </div>
  );
}
