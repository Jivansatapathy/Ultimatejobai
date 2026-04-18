import { useDeferredValue, useEffect, useMemo, useState, startTransition, useCallback, DragEvent } from "react";
import { motion } from "framer-motion";
import { Bookmark, BookmarkCheck, CalendarDays, CheckCheck, ChevronDown, ChevronUp, FileText, Filter, LayoutGrid, List, Mail, MessageSquare, Search, Sparkles, Star, UserRoundSearch, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
        setApplications(applicationItems);
        setJobs(jobItems);
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
        [application.name, application.email, application.job_title, application.skills.join(" ")]
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
    <div className="space-y-8">
      <PageHeader
        eyebrow="Candidates"
        title="Candidate Management"
        description="Review applicants by role, open resumes, and update pipeline decisions in realtime."
        actions={(
          <div className="flex gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              className="rounded-2xl"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
              List
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="sm"
              className="rounded-2xl"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </Button>
          </div>
        )}
      />

      <div className="grid gap-6">
        <Card className="rounded-3xl border-border/70 overflow-visible">
          <CardContent className="p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_100px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Search candidates, jobs, or skills"
                  value={search}
                  onChange={(event) => startTransition(() => setSearch(event.target.value))}
                />
              </div>
              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter by job" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All jobs</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ApplicationStatus | "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {PIPELINE_STATUSES.map(s => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2">
                <Select onValueChange={(val) => {
                  const saved = savedSearches.find(s => s.id === val);
                  if (saved) handleApplySavedSearch(saved);
                }}>
                  <SelectTrigger className="px-3" title="Saved Searches">
                    <Bookmark className="h-4 w-4" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">Saved Searches</div>
                    {savedSearches.length === 0 && <div className="px-2 py-4 text-center text-xs text-muted-foreground">No saved searches</div>}
                    {savedSearches.map((s) => (
                      <div key={s.id} className="flex items-center justify-between group">
                        <SelectItem value={s.id} className="flex-1 capitalize">{s.name}</SelectItem>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteSavedSearch(s.id, s.name); }}
                          className="opacity-0 group-hover:opacity-100 p-1 mr-2 hover:text-destructive transition-opacity"
                        >
                          <XCircle className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 pt-4 border-t border-border/50">
              <Input 
                placeholder="Name current filters to save..." 
                className="max-w-[240px] h-9 text-xs rounded-xl"
                value={newSearchName}
                onChange={(e) => setNewSearchName(e.target.value)}
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 px-4 rounded-xl text-xs gap-2"
                onClick={handleSaveSearch}
                disabled={isSavingSearch}
              >
                {isSavingSearch ? "Saving..." : <><Bookmark className="h-3 w-3" /> Save current search</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-border/70">
        <CardContent className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
            <span>{selectedApplicationIds.length} candidates selected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-2xl" disabled={!selectedApplicationIds.length || !canManageCandidates} onClick={() => handleBulkStatus("screening")}>
              <CheckCheck className="h-4 w-4" />
              Move to screening
            </Button>
            <Button variant="outline" className="rounded-2xl" disabled={!selectedApplicationIds.length || !canManageCandidates} onClick={() => handleBulkStatus("shortlisted")}>
              <CheckCheck className="h-4 w-4" />
              Shortlist selected
            </Button>
            <Button variant="outline" className="rounded-2xl" disabled={!selectedApplicationIds.length || !canManageCandidates} onClick={() => handleBulkStatus("rejected")}>
              <XCircle className="h-4 w-4" />
              Reject selected
            </Button>
          </div>
          {!canManageCandidates ? <p className="text-sm text-muted-foreground">Your current role can view candidates, but cannot change the hiring pipeline.</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {PIPELINE_STATUSES.map((status) => (
          <Card key={status} className="rounded-3xl border-border/70">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{status}</p>
              <p className="mt-2 text-2xl font-semibold">{pipelineCounts[status] || 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Top Candidates */}
      {topCandidates.length > 0 && (
        <Card className="rounded-3xl border-border/70 border-l-4 border-l-accent">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                <Sparkles className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="font-semibold">🤖 Top Recommended Candidates</p>
                <p className="text-xs text-muted-foreground">AI-ranked by skill match, experience relevance, and keyword matching</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {topCandidates.slice(0, 10).map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl border border-border/60 bg-background/80 p-3 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-xs font-bold text-accent">#{i + 1}</span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">{c.match_score}%</span>
                  </div>
                  <p className="mt-2 font-medium text-sm truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.job_title}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.matched_skills?.slice(0, 3).map((s) => (
                      <span key={s} className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">{s}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kanban View */}
      {viewMode === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STATUSES.map((status) => {
            const columnApps = filteredApplications.filter((a) => a.status === status);
            return (
              <div
                key={status}
                className={`min-w-[240px] flex-shrink-0 rounded-2xl border-t-4 ${PIPELINE_COLORS[status]} bg-secondary/30 p-3`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{status}</p>
                  <span className="rounded-full bg-background px-2 py-0.5 text-xs font-bold">{columnApps.length}</span>
                </div>
                <div className="space-y-2">
                  {columnApps.map((application) => (
                    <div
                      key={application.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, application.id)}
                      className={`cursor-grab rounded-xl border border-border/60 bg-background p-3 transition-all hover:shadow-md active:cursor-grabbing ${
                        draggedCandidate === application.id ? "opacity-50 scale-95" : ""
                      }`}
                      onClick={() => setExpandedCard(expandedCard === application.id ? "" : application.id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate">{application.name}</p>
                        <button
                          className="shrink-0"
                          onClick={(e) => { e.stopPropagation(); handleBookmark(application); }}
                        >
                          {application.is_bookmarked
                            ? <BookmarkCheck className="h-4 w-4 text-accent" />
                            : <Bookmark className="h-4 w-4 text-muted-foreground hover:text-accent" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{application.job_title}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                          {application.match_score}% match
                        </span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              onClick={(e) => { e.stopPropagation(); handleRating(application, s); }}
                              className="p-0"
                            >
                              <Star
                                className={`h-3 w-3 ${s <= (application.rating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      {expandedCard === application.id ? (
                        <div className="mt-3 space-y-2 border-t border-border/40 pt-3">
                          <div className="flex flex-wrap gap-1">
                            {application.skills.slice(0, 4).map((skill) => (
                              <span key={skill} className="rounded-full bg-secondary px-2 py-0.5 text-[10px]">{skill}</span>
                            ))}
                          </div>
                          <a href={application.resume_link} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline block">View resume →</a>
                        </div>
                      ) : null}
                    </div>
                  ))}
                  {columnApps.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-6">Drop candidates here</p>
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
            <Card key={application.id} className="rounded-3xl border-border/70">
              <CardContent className="p-6">
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
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                      Match {application.match_score}%
                    </span>
                    {/* Star rating */}
                    <div className="ml-auto flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={(e) => { e.stopPropagation(); handleRating(application, s); }} className="p-0.5">
                          <Star className={`h-4 w-4 ${s <= (application.rating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
                        </button>
                      ))}
                    </div>
                  </button>
                  <button onClick={() => handleBookmark(application)} className="p-1">
                      {application.is_bookmarked
                        ? <BookmarkCheck className="h-5 w-5 text-accent" />
                        : <Bookmark className="h-5 w-5 text-muted-foreground hover:text-accent" />}
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-2xl"
                    onClick={() => setExpandedCard(expandedCard === application.id ? "" : application.id)}
                  >
                    {expandedCard === application.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {expandedCard === application.id ? "Hide details" : "View details"}
                  </Button>
                </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                    {application.skills.map((skill) => (
                      <span key={skill} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="rounded-2xl bg-emerald-500/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">Matched skills</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {application.matched_skills?.length ? application.matched_skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-background/80 px-3 py-1 text-xs font-medium">
                            {skill}
                          </span>
                        )) : <span className="text-sm text-muted-foreground">No direct matches yet.</span>}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-amber-500/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">Missing skills</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {application.missing_skills?.length ? application.missing_skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-background/80 px-3 py-1 text-xs font-medium">
                            {skill}
                          </span>
                        )) : <span className="text-sm text-muted-foreground">Strong fit on listed job skills.</span>}
                      </div>
                    </div>
                  </div>
                  <a
                    href={application.resume_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-sm font-medium text-accent hover:underline"
                  >
                    View resume
                  </a>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>Applied {application.created_at ? new Date(application.created_at).toLocaleDateString() : "recently"}</span>
                    <span>Stage updated {application.stage_changed_at ? new Date(application.stage_changed_at).toLocaleDateString() : "recently"}</span>
                  </div>
                  {application.notes ? (
                    <div className="rounded-2xl bg-secondary/50 p-4 text-sm text-muted-foreground whitespace-pre-wrap">
                      {application.notes}
                    </div>
                  ) : null}
                  {application.application_answers && Object.keys(application.application_answers).length ? (
                    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Quick apply details</p>
                      <div className="mt-3 space-y-3">
                        {Object.entries(application.application_answers).map(([question, answer]) => (
                          <div key={question}>
                            <p className="text-sm font-medium">{question}</p>
                            <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{answer || "No answer provided."}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                      </div>

                      <div className="space-y-4 rounded-3xl bg-secondary/60 p-4">
                  <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                      <Sparkles className="h-3.5 w-3.5" />
                      Match recommendation
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {application.recommendation === "shortlist" && "High-signal match. Recommend moving this candidate to shortlist."}
                      {application.recommendation === "screening" && "Promising overlap. Recommend recruiter screening next."}
                      {application.recommendation === "review" && "Needs manual review. Resume shows partial skill alignment."}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">ATS stage</p>
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
                      <Button
                        variant="outline"
                        className="rounded-2xl"
                        onClick={() => window.open(application.resume_link, "_blank")}
                      >
                        Resume
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">ATS note</p>
                    <Textarea
                      className="mt-3 min-h-28 rounded-2xl"
                      placeholder="Add recruiter notes, interview outcomes, or follow-up context."
                      value={draftNotes[application.id] ?? ""}
                      onChange={(event) =>
                        setDraftNotes((current) => ({ ...current, [application.id]: event.target.value }))
                      }
                    />
                    <Button className="mt-3 rounded-2xl" onClick={() => handleNoteSave(application)} disabled={!canManageCandidates}>
                      Save note
                    </Button>
                  </div>

                  <div>
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      Recent timeline
                    </p>
                    <div className="mt-3 space-y-3">
                      {application.history?.length ? application.history.slice(0, 4).map((item) => (
                        <div key={item.id} className="rounded-2xl border border-border/60 bg-background/70 p-3">
                          <p className="text-sm font-medium">
                            {(item.from_status || "new")} to {item.to_status}
                          </p>
                          {item.note ? <p className="mt-1 text-sm text-muted-foreground">{item.note}</p> : null}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.created_at ? new Date(item.created_at).toLocaleString() : "recently"}
                          </p>
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground">No ATS events yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Interview scheduling
                    </p>
                    <div className="mt-3 grid gap-3">
                      <Input
                        placeholder="Interview title"
                        value={interviewDrafts[application.id]?.title ?? ""}
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
                        <Input
                          type="datetime-local"
                          value={interviewDrafts[application.id]?.starts_at ?? ""}
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
                      <Input
                        placeholder="Meeting link"
                        value={interviewDrafts[application.id]?.meeting_link ?? ""}
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
                      <Button variant="outline" className="rounded-2xl" onClick={() => handleInterviewSchedule(application)} disabled={!canManageCandidates}>
                        Schedule interview
                      </Button>
                      {application.interviews?.length ? (
                        <div className="space-y-2">
                          {application.interviews.slice(0, 2).map((item) => (
                            <div key={item.id} className="rounded-2xl border border-border/60 p-3 text-sm">
                              <p className="font-medium">{item.title}</p>
                              <p className="text-muted-foreground">{new Date(item.starts_at).toLocaleString()} | {item.mode}</p>
                              <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                <span>Invite {item.invite_sent_at ? `sent ${new Date(item.invite_sent_at).toLocaleString()}` : "pending"}</span>
                                {item.meeting_link ? <a href={item.meeting_link} target="_blank" rel="noreferrer" className="text-accent hover:underline">Open link</a> : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
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
                      <Input
                        placeholder="Subject"
                        value={communicationDrafts[application.id]?.subject ?? ""}
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
                      <Button variant="outline" className="rounded-2xl" onClick={() => handleCommunicationLog(application)} disabled={!canManageCandidates}>
                        Save communication
                      </Button>
                      {application.communications?.length ? (
                        <div className="space-y-2">
                          {application.communications.slice(0, 2).map((item) => (
                            <div key={item.id} className="rounded-2xl border border-border/60 p-3 text-sm">
                              <p className="font-medium">{item.subject || item.communication_type}</p>
                              <p className="mt-1 text-muted-foreground">{item.message}</p>
                              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                <span className="capitalize">Type: {item.communication_type}</span>
                                <span className="capitalize">Direction: {item.direction}</span>
                                {item.delivery_status ? <span className="capitalize">Delivery: {item.delivery_status}</span> : null}
                              </div>
                              {item.delivery_error ? <p className="mt-1 text-xs text-destructive">{item.delivery_error}</p> : null}
                              <p className="mt-1 text-xs text-muted-foreground">{item.created_at ? new Date(item.created_at).toLocaleString() : "recently"}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
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
                          <p className="text-sm text-muted-foreground">
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
                            <Button className="rounded-2xl" onClick={() => handleStartConversation(application)} disabled={startingChatFor === application.id}>
                              {startingChatFor === application.id ? "Starting..." : "Start conversation"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                      </div>
                    </div>
                  ) : null}
              </CardContent>
            </Card>
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
