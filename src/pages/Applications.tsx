import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  FileDown,
  FolderClock,
  Mail,
  MessageSquare,
  Search,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { ConversationPanel } from "@/components/chat/ConversationPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { autoApplyService, type ApplicationHistoryItem } from "@/services/autoApplyService";
import { subscribeCandidateConversations } from "@/services/chatService";
import { useAuth } from "@/context/AuthContext";
import { FirestoreConversation } from "@/types/chat";

const statusTone: Record<string, string> = {
  queued: "bg-secondary text-muted-foreground",
  sent: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
  applied: "bg-secondary text-muted-foreground",
  screening: "bg-accent/10 text-accent",
  shortlisted: "bg-success/10 text-success",
  interview: "bg-primary/10 text-primary",
  offer: "bg-amber-100 text-amber-700",
  hired: "bg-emerald-100 text-emerald-700",
  rejected: "bg-destructive/10 text-destructive",
};

const formatStatus = (value?: string | null) =>
  (value || "unknown").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

export default function Applications() {
  const { userEmail } = useAuth();
  const [applications, setApplications] = useState<ApplicationHistoryItem[]>([]);
  const [conversations, setConversations] = useState<Record<string, FirestoreConversation>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [pipelineFilter, setPipelineFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const response = await autoApplyService.getHistory();
        setApplications(Array.isArray(response?.applications) ? response.applications : []);
      } catch (error) {
        console.error("Failed to load applications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  useEffect(() => {
    if (!userEmail) {
      return;
    }

    const unsubscribe = subscribeCandidateConversations(userEmail, (items) => {
      setConversations(
        items.reduce<Record<string, FirestoreConversation>>((acc, item) => {
          acc[item.applicationId] = item;
          return acc;
        }, {}),
      );
    });

    return unsubscribe;
  }, [userEmail]);

  const filteredApplications = applications.filter((application) => {
    const matchesQuery =
      !query ||
      application.job_title.toLowerCase().includes(query.toLowerCase()) ||
      application.company.toLowerCase().includes(query.toLowerCase()) ||
      (application.selected_resume_name || "").toLowerCase().includes(query.toLowerCase());

    const matchesDelivery =
      deliveryFilter === "all" || application.delivery_method === deliveryFilter;

    const matchesPipeline =
      pipelineFilter === "all" ||
      (pipelineFilter === "none" && !application.pipeline_status) ||
      application.pipeline_status === pipelineFilter;

    return matchesQuery && matchesDelivery && matchesPipeline;
  });

  const employerManagedCount = applications.filter(
    (application) => application.delivery_method === "employer_portal",
  ).length;
  const activePipelineCount = applications.filter(
    (application) => application.pipeline_status && application.pipeline_status !== "rejected" && application.pipeline_status !== "hired",
  ).length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.08),_transparent_26%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_22%,#ffffff_100%)]">
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 rounded-[28px] border border-border/70 bg-background/85 p-6 shadow-sm backdrop-blur"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Application Center</p>
                <h1 className="mt-2 text-3xl font-bold text-foreground">Track every job you’ve applied to</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Follow delivery status, employer ATS progress, and the exact resume used for each application.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/jobs">
                  <Button className="gap-2">
                    <Briefcase className="h-4 w-4" />
                    Browse Jobs
                  </Button>
                </Link>
                <Link to="/resume">
                  <Button variant="outline" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Update Resume
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total Applications</p>
                <p className="mt-3 text-3xl font-bold text-foreground">{applications.length}</p>
                <p className="mt-2 text-sm text-muted-foreground">All recorded sends and employer portal submissions.</p>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Employer Managed</p>
                <p className="mt-3 text-3xl font-bold text-foreground">{employerManagedCount}</p>
                <p className="mt-2 text-sm text-muted-foreground">Applications that continue inside an employer ATS pipeline.</p>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Active Pipeline</p>
                <p className="mt-3 text-3xl font-bold text-foreground">{activePipelineCount}</p>
                <p className="mt-2 text-sm text-muted-foreground">Still moving through screening, shortlist, interview, or offer stages.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-[28px] border border-border/70 bg-background/85 p-6 shadow-sm backdrop-blur"
          >
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by job title, company, or resume name"
                  className="pl-9"
                />
              </div>

              <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
                <SelectTrigger className="w-full lg:w-[220px]">
                  <SelectValue placeholder="Delivery method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All methods</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="employer_portal">Employer portal</SelectItem>
                </SelectContent>
              </Select>

              <Select value={pipelineFilter} onValueChange={setPipelineFilter}>
                <SelectTrigger className="w-full lg:w-[220px]">
                  <SelectValue placeholder="Pipeline stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ATS stages</SelectItem>
                  <SelectItem value="none">No ATS yet</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          <div className="space-y-4">
            {loading ? (
              <div className="rounded-[24px] border border-border bg-background/85 p-10 text-center text-sm text-muted-foreground">
                Loading your application history...
              </div>
            ) : filteredApplications.length > 0 ? (
              filteredApplications.map((application, index) => {
                const isExpanded = expandedId === application.id;
                const hasChat = !!conversations[application.id];
                const hasInterview = !!application.next_interview;
                const hasNotifications = hasChat || hasInterview;

                return (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.2) }}
                  className={`rounded-[24px] border transition-all shadow-sm ${isExpanded ? "border-accent/40 bg-background/95" : "border-border bg-background/90 hover:border-accent/20"}`}
                >
                  <div 
                    className="p-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : application.id)}
                  >
                    <div className="space-y-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-semibold text-foreground">{application.job_title}</h2>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${statusTone[application.status] || statusTone.queued}`}>
                            {formatStatus(application.status)}
                          </span>
                          {application.pipeline_status ? (
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${statusTone[application.pipeline_status] || statusTone.applied}`}>
                              ATS {formatStatus(application.pipeline_status)}
                            </span>
                          ) : null}
                          {!isExpanded && hasNotifications && (
                            <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent"></span>
                              </span>
                              Updates
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{application.company}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full bg-secondary px-3 py-1">
                          {application.delivery_method === "employer_portal" ? "Employer portal" : "Email delivery"}
                        </span>
                        <span className="rounded-full bg-secondary px-3 py-1">
                          Source: {formatStatus(application.job_source || "unknown")}
                        </span>
                        {typeof application.match_score === "number" ? (
                          <span className="rounded-full bg-success/10 px-3 py-1 text-success">
                            Match score {application.match_score}%
                          </span>
                        ) : null}
                        {application.recommendation ? (
                          <span className="rounded-full bg-accent/10 px-3 py-1 text-accent">
                            Suggested action: {formatStatus(application.recommendation)}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid gap-3 text-sm text-muted-foreground lg:min-w-[260px]">
                      <div className="rounded-2xl border border-border bg-secondary/20 p-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Application Date</p>
                        <p className="mt-1 font-medium text-foreground">
                          {application.created_at ? new Date(application.created_at).toLocaleString() : "Recently"}
                        </p>
                      </div>
                      {application.pipeline_stage_changed_at ? (
                        <div className="rounded-2xl border border-border bg-secondary/20 p-3">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Latest ATS Update</p>
                          <p className="mt-1 font-medium text-foreground">
                            {new Date(application.pipeline_stage_changed_at).toLocaleString()}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border/50 bg-secondary/5 p-5">
                      <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
                        <div className="rounded-2xl border border-border bg-secondary/10 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <FolderClock className="h-4 w-4 text-accent" />
                        Application Timeline
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                        <p>
                          Submission status: <span className="font-medium text-foreground">{formatStatus(application.status)}</span>
                        </p>
                        <p>
                          Employer pipeline: <span className="font-medium text-foreground">{formatStatus(application.pipeline_status || "not started")}</span>
                        </p>
                        <p>
                          Delivery method: <span className="font-medium text-foreground">{application.delivery_method === "employer_portal" ? "Employer portal" : "Email"}</span>
                        </p>
                        {application.response_message ? (
                          <p>
                            Latest response: <span className="font-medium text-foreground">{application.response_message}</span>
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-secondary/10 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Mail className="h-4 w-4 text-accent" />
                        Resume Used
                      </div>
                      <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">
                          {application.selected_resume_name || "Resume attached during apply flow"}
                        </p>
                        {application.selected_resume_link ? (
                          <a
                            href={application.selected_resume_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-accent transition-colors hover:text-accent/80"
                          >
                            <FileDown className="h-4 w-4" />
                            Download selected resume
                          </a>
                        ) : (
                          <p>No resume link is attached to this application yet.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {application.next_interview ? (
                    <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        Upcoming interview
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">{application.next_interview.title}</p>
                        <p>
                          {new Date(application.next_interview.starts_at).toLocaleString()} • {formatStatus(application.next_interview.mode)}
                        </p>
                        {application.next_interview.meeting_link ? (
                          <a
                            href={application.next_interview.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-accent transition-colors hover:text-accent/80"
                          >
                            Join interview link
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 rounded-2xl border border-border bg-secondary/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <MessageSquare className="h-4 w-4 text-accent" />
                      Employer chat
                    </div>
                    <div className="mt-3">
                      {conversations[application.id] ? (
                        <ConversationPanel
                          conversation={conversations[application.id]}
                          currentUser={{
                            email: userEmail || "",
                            name: userEmail || "Candidate",
                            role: "candidate",
                          }}
                          emptyLabel="No messages yet from the employer."
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No chat has been started for this application yet. Only the employer can initiate the conversation.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })
            ) : (
              <div className="rounded-[24px] border border-dashed border-border bg-background/85 p-10 text-center">
                <p className="text-lg font-semibold text-foreground">No applications match this view yet.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try a different filter or head back to jobs to send your next application.
                </p>
                <Link to="/jobs" className="mt-5 inline-flex">
                  <Button className="gap-2">
                    Explore jobs
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
