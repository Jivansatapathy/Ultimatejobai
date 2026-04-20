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
  queued: "bg-white/[0.05] border border-white/10 text-slate-400",
  sent: "bg-teal-500/10 border border-teal-500/20 text-teal-400",
  failed: "bg-red-500/10 border border-red-500/20 text-red-400",
  applied: "bg-white/[0.05] border border-white/10 text-slate-400",
  screening: "bg-violet-500/10 border border-violet-500/20 text-violet-400",
  shortlisted: "bg-teal-500/10 border border-teal-500/20 text-teal-400",
  interview: "bg-blue-500/10 border border-blue-500/20 text-blue-400",
  offer: "bg-amber-500/10 border border-amber-500/20 text-amber-400",
  hired: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400",
  rejected: "bg-red-500/10 border border-red-500/20 text-red-400",
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
    <div className="min-h-screen bg-[#0a0f1e] relative overflow-hidden text-white">
      {/* Atmospheric glows */}
      <div className="pointer-events-none absolute top-0 left-1/4 w-[800px] h-[500px] rounded-full bg-violet-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-0 w-[600px] h-[600px] rounded-full bg-teal-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/2 left-0 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[150px]" />
      <Navbar />


      <main className="pt-24 pb-12 px-4 relative z-10">
        <div className="container mx-auto max-w-7xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6 rounded-[28px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-8 hover:border-white/[0.15] transition-all"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-teal-400 mb-2">Portfolio Control</p>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">Application Central</h1>
                <p className="mt-4 max-w-2xl text-base font-medium text-slate-400 leading-relaxed">
                  Real-time synchronization with employer ATS pipelines and multimodal interview tracking.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link to="/jobs">
                  <Button className="gap-2 h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] bg-teal-500 hover:bg-teal-400 border-none shadow-lg shadow-teal-500/20">
                    <Briefcase className="h-4 w-4" />
                    Browse Talent
                  </Button>
                </Link>
                <Link to="/resume">
                  <Button variant="outline" className="gap-2 h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] border-white/10 bg-white/[0.05] hover:bg-white/10 transition-all">
                    <Sparkles className="h-4 w-4 text-teal-400" />
                    Update Profile
                  </Button>
                </Link>
              </div>
            </div>


            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-6 hover:border-teal-500/30 transition-all group">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 group-hover:text-teal-400 transition-colors">Manifested</p>
                <p className="text-4xl font-black text-white tracking-tighter">{applications.length}</p>
                <p className="mt-3 text-xs font-medium text-slate-400 leading-relaxed group-hover:text-slate-300">Total institutional record sends and portal submissions.</p>
              </div>
              <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-6 hover:border-teal-500/30 transition-all group">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 group-hover:text-teal-400 transition-colors">Managed</p>
                <p className="text-4xl font-black text-white tracking-tighter">{employerManagedCount}</p>
                <p className="mt-3 text-xs font-medium text-slate-400 leading-relaxed group-hover:text-slate-300">Live applications synchronized with active employer ATS environments.</p>
              </div>
              <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-6 hover:border-teal-500/30 transition-all group">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 group-hover:text-teal-400 transition-colors">In-Flight</p>
                <p className="text-4xl font-black text-white tracking-tighter">{activePipelineCount}</p>
                <p className="mt-3 text-xs font-medium text-slate-400 leading-relaxed group-hover:text-slate-300">High-velocity movement through screening and interview stages.</p>
              </div>
            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-8"
          >
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1 group">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filter by title, organization, or profile used..."
                  className="pl-12 h-14 bg-white/[0.05] border-white/10 text-white placeholder:text-slate-500 focus:ring-teal-500/20 focus:bg-white/10 rounded-2xl font-bold outline-none ring-0 border-white/10"
                />
              </div>

              <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
                <SelectTrigger className="w-full lg:w-[240px] h-14 bg-white/[0.05] border-white/10 text-slate-300 rounded-2xl px-6 font-bold">
                  <SelectValue placeholder="Delivery method" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0f1e] border-white/10 text-white rounded-2xl overflow-hidden p-1">
                  <SelectItem value="all" className="rounded-xl py-3 focus:bg-teal-500/10 font-bold">All methods</SelectItem>
                  <SelectItem value="email" className="rounded-xl py-3 focus:bg-teal-500/10 font-bold">Email</SelectItem>
                  <SelectItem value="employer_portal" className="rounded-xl py-3 focus:bg-teal-500/10 font-bold">Employer portal</SelectItem>
                </SelectContent>
              </Select>

              <Select value={pipelineFilter} onValueChange={setPipelineFilter}>
                <SelectTrigger className="w-full lg:w-[240px] h-14 bg-white/[0.05] border-white/10 text-slate-300 rounded-2xl px-6 font-bold">
                  <SelectValue placeholder="Pipeline stage" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0f1e] border-white/10 text-white rounded-2xl overflow-hidden p-1">
                  <SelectItem value="all" className="rounded-xl py-3 focus:bg-teal-500/10 font-bold">All ATS stages</SelectItem>
                  <SelectItem value="none" className="rounded-xl py-3 focus:bg-teal-500/10 font-bold">No ATS yet</SelectItem>
                  <SelectItem value="applied" className="rounded-xl py-3 focus:bg-teal-500/10 font-bold">Applied</SelectItem>
                  <SelectItem value="screening" className="rounded-xl py-3 focus:bg-teal-500/10 font-bold">Screening</SelectItem>
                  <SelectItem value="shortlisted" className="rounded-xl py-3 focus:bg-teal-500/10 font-bold">Shortlisted</SelectItem>
                  <SelectItem value="interview" className="rounded-xl py-3 focus:bg-teal-500/10 font-bold">Interview</SelectItem>
                  <SelectItem value="offer" className="rounded-xl py-3 focus:bg-teal-500/10 font-bold">Offer</SelectItem>
                  <SelectItem value="hired" className="rounded-xl py-3 focus:bg-teal-500/10 font-bold">Hired</SelectItem>
                  <SelectItem value="rejected" className="rounded-xl py-3 focus:bg-teal-500/10 font-bold">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>


          <div className="space-y-4">
            {loading ? (
              <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-10 text-center text-sm text-slate-400">
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
                  className={`rounded-[24px] border transition-all ${isExpanded ? "border-teal-500/30 bg-white/[0.05]" : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.14]"}`}
                >
                    <div 
                      className="p-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : application.id)}
                    >
                      <div className="space-y-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-xl font-black text-white tracking-tight uppercase">{application.job_title}</h2>
                            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border ${statusTone[application.status] || statusTone.queued} transition-all`}>
                              {formatStatus(application.status)}
                            </span>
                            {application.pipeline_status ? (
                              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border ${statusTone[application.pipeline_status] || statusTone.applied} transition-all`}>
                                ATS: {formatStatus(application.pipeline_status)}
                              </span>
                            ) : null}
                            {!isExpanded && hasNotifications && (
                              <span className="flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-teal-400 border border-teal-500/20">
                                <span className="relative flex h-2 w-2">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75"></span>
                                  <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400"></span>
                                </span>
                                New Intelligence
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-base font-bold text-slate-500 tracking-tight">{application.company}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <span className="rounded-full bg-white/[0.05] border border-white/10 px-4 py-1.5 hover:border-white/20 transition-all">
                            {application.delivery_method === "employer_portal" ? "Institutional Portal" : "Direct Delivery"}
                          </span>
                          <span className="rounded-full bg-white/[0.05] border border-white/10 px-4 py-1.5 hover:border-white/20 transition-all uppercase">
                            SR: {formatStatus(application.job_source || "unknown")}
                          </span>
                          {typeof application.match_score === "number" ? (
                            <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-4 py-1.5 text-teal-400 hover:bg-teal-500/20 transition-all">
                              Match: {application.match_score}%
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="grid gap-3 text-sm text-slate-400 lg:min-w-[280px]">
                        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 hover:border-white/[0.15] transition-all">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Send Date</p>
                          <p className="font-black text-white tracking-tight">
                            {application.created_at ? new Date(application.created_at).toLocaleString() : "Sync Pending"}
                          </p>
                        </div>
                      </div>
                    </div>

                  {isExpanded && (
                    <div className="border-t border-white/[0.06] bg-white/[0.02] p-5">
                      <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
                        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-white">
                        <FolderClock className="h-4 w-4 text-teal-400" />
                        Application Timeline
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-slate-400">
                        <p>
                          Submission status: <span className="font-medium text-white">{formatStatus(application.status)}</span>
                        </p>
                        <p>
                          Employer pipeline: <span className="font-medium text-white">{formatStatus(application.pipeline_status || "not started")}</span>
                        </p>
                        <p>
                          Delivery method: <span className="font-medium text-white">{application.delivery_method === "employer_portal" ? "Employer portal" : "Email"}</span>
                        </p>
                        {application.response_message ? (
                          <p>
                            Latest response: <span className="font-medium text-white">{application.response_message}</span>
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-white">
                        <Mail className="h-4 w-4 text-teal-400" />
                        Resume Used
                      </div>
                      <div className="mt-3 space-y-3 text-sm text-slate-400">
                        <p className="font-medium text-white">
                          {application.selected_resume_name || "Resume attached during apply flow"}
                        </p>
                        {application.selected_resume_link ? (
                          <a
                            href={application.selected_resume_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-teal-400 transition-colors hover:text-teal-300"
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
                    <div className="mt-4 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-white">
                        <CalendarDays className="h-4 w-4 text-violet-400" />
                        Upcoming interview
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-slate-400">
                        <p className="font-medium text-white">{application.next_interview.title}</p>
                        <p>
                          {new Date(application.next_interview.starts_at).toLocaleString()} • {formatStatus(application.next_interview.mode)}
                        </p>
                        {application.next_interview.meeting_link ? (
                          <a
                            href={application.next_interview.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-teal-400 transition-colors hover:text-teal-300"
                          >
                            Join interview link
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <MessageSquare className="h-4 w-4 text-teal-400" />
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
                        <p className="text-sm text-slate-400">
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
              <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
                <p className="text-lg font-semibold text-white">No applications match this view yet.</p>
                <p className="mt-2 text-sm text-slate-400">
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
