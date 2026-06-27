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
import { NavbarV2 as Navbar } from "@/components/landing2/NavbarV2";
import { ConversationPanel } from "@/components/chat/ConversationPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { autoApplyService, type ApplicationHistoryItem } from "@/services/autoApplyService";
import { subscribeCandidateConversations } from "@/services/chatService";
import { useAuth } from "@/context/AuthContext";
import { FirestoreConversation } from "@/types/chat";

const statusTone: Record<string, string> = {
  queued: "bg-gray-100 border border-gray-300 text-gray-500",
  sent: "bg-teal-50 border border-teal-200 text-teal-700",
  failed: "bg-red-50 border border-red-200 text-red-600",
  applied: "bg-gray-100 border border-gray-300 text-gray-500",
  screening: "bg-violet-50 border border-violet-200 text-violet-700",
  shortlisted: "bg-teal-50 border border-teal-200 text-teal-700",
  interview: "bg-blue-50 border border-blue-200 text-blue-700",
  offer: "bg-amber-50 border border-amber-200 text-amber-700",
  hired: "bg-emerald-50 border border-emerald-200 text-emerald-700",
  rejected: "bg-red-50 border border-red-200 text-red-600",
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
        const [emailRes, botRes] = await Promise.allSettled([
          autoApplyService.getHistory(),
          autoApplyService.getBotHistory(),
        ]);
        const emailApps = emailRes.status === "fulfilled" && Array.isArray(emailRes.value?.applications)
          ? emailRes.value.applications
          : [];
        const botApps = botRes.status === "fulfilled" && Array.isArray(botRes.value?.applications)
          ? botRes.value.applications
          : [];
        setApplications([...emailApps, ...botApps]);
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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />


      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6 rounded-[28px] border border-gray-200 bg-white p-4 sm:p-6 md:p-8 shadow-sm transition-all"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-teal-400 mb-2">Job Applications</p>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase">My Applications</h1>
                <p className="mt-4 max-w-2xl text-base font-medium text-gray-500 leading-relaxed">
                  Track all your job applications and follow up with employers in one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link to="/jobs">
                  <Button className="gap-2 h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] bg-teal-500 hover:bg-teal-400 border-none shadow-lg shadow-teal-500/20">
                    <Briefcase className="h-4 w-4" />
                    Browse Jobs
                  </Button>
                </Link>
                <Link to="/resume">
                  <Button variant="outline" className="gap-2 h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-900 transition-all">
                    <Sparkles className="h-4 w-4 text-teal-400" />
                    Update Profile
                  </Button>
                </Link>
              </div>
            </div>


            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
              <div className="rounded-[24px] border border-gray-200 bg-gray-50 p-4 sm:p-6 hover:border-teal-400 transition-all group">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3 group-hover:text-teal-600 transition-colors">Total Applied</p>
                <p className="text-4xl font-black text-gray-900 tracking-tighter">{applications.length}</p>
                <p className="mt-3 text-xs font-medium text-gray-400 leading-relaxed">Total applications submitted via email or employer portal.</p>
              </div>
              <div className="rounded-[24px] border border-gray-200 bg-gray-50 p-4 sm:p-6 hover:border-teal-400 transition-all group">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3 group-hover:text-teal-600 transition-colors">Employer Portal</p>
                <p className="text-4xl font-black text-gray-900 tracking-tighter">{employerManagedCount}</p>
                <p className="mt-3 text-xs font-medium text-gray-400 leading-relaxed">Applications sent through employer portals or ATS systems.</p>
              </div>
              <div className="rounded-[24px] border border-gray-200 bg-gray-50 p-4 sm:p-6 hover:border-teal-400 transition-all group">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3 group-hover:text-teal-600 transition-colors">Active Pipeline</p>
                <p className="text-4xl font-black text-gray-900 tracking-tighter">{activePipelineCount}</p>
                <p className="mt-3 text-xs font-medium text-gray-400 leading-relaxed">Applications currently in screening, interview, or offer stage.</p>
              </div>
            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-[28px] border border-gray-200 bg-white p-4 sm:p-6 md:p-8 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1 group">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filter by title, organization, or profile used..."
                  className="pl-12 h-14 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-teal-500/20 focus:bg-white rounded-2xl font-bold outline-none ring-0"
                />
              </div>

              <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
                <SelectTrigger className="w-full lg:w-[240px] h-14 bg-gray-50 border-gray-200 text-gray-700 rounded-2xl px-6 font-bold">
                  <SelectValue placeholder="Delivery method" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-gray-900 rounded-2xl overflow-hidden p-1">
                  <SelectItem value="all" className="rounded-xl py-3 focus:bg-teal-50 font-bold">All methods</SelectItem>
                  <SelectItem value="email" className="rounded-xl py-3 focus:bg-teal-50 font-bold">Email</SelectItem>
                  <SelectItem value="employer_portal" className="rounded-xl py-3 focus:bg-teal-50 font-bold">Employer portal</SelectItem>
                  <SelectItem value="bot" className="rounded-xl py-3 focus:bg-teal-50 font-bold">Bot Apply</SelectItem>
                </SelectContent>
              </Select>

              <Select value={pipelineFilter} onValueChange={setPipelineFilter}>
                <SelectTrigger className="w-full lg:w-[240px] h-14 bg-gray-50 border-gray-200 text-gray-700 rounded-2xl px-6 font-bold">
                  <SelectValue placeholder="Pipeline stage" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-gray-900 rounded-2xl overflow-hidden p-1">
                  <SelectItem value="all" className="rounded-xl py-3 focus:bg-teal-50 font-bold">All pipeline stages</SelectItem>
                  <SelectItem value="none" className="rounded-xl py-3 focus:bg-teal-50 font-bold">Not in pipeline yet</SelectItem>
                  <SelectItem value="applied" className="rounded-xl py-3 focus:bg-teal-50 font-bold">Applied</SelectItem>
                  <SelectItem value="screening" className="rounded-xl py-3 focus:bg-teal-50 font-bold">Screening</SelectItem>
                  <SelectItem value="shortlisted" className="rounded-xl py-3 focus:bg-teal-50 font-bold">Shortlisted</SelectItem>
                  <SelectItem value="interview" className="rounded-xl py-3 focus:bg-teal-50 font-bold">Interview</SelectItem>
                  <SelectItem value="offer" className="rounded-xl py-3 focus:bg-teal-50 font-bold">Offer</SelectItem>
                  <SelectItem value="hired" className="rounded-xl py-3 focus:bg-teal-50 font-bold">Hired</SelectItem>
                  <SelectItem value="rejected" className="rounded-xl py-3 focus:bg-teal-50 font-bold">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>


          <div className="space-y-4">
            {loading ? (
              <div className="rounded-[24px] border border-gray-200 bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
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
                  className={`rounded-[24px] border transition-all shadow-sm ${isExpanded ? "border-teal-400 bg-teal-50/20" : "border-gray-200 bg-white hover:border-gray-300"}`}
                >
                    <div 
                      className="p-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : application.id)}
                    >
                      <div className="space-y-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">{application.job_title}</h2>
                            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border ${statusTone[application.status] || statusTone.queued} transition-all`}>
                              {formatStatus(application.status)}
                            </span>
                            {application.pipeline_status ? (
                              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border ${statusTone[application.pipeline_status] || statusTone.applied} transition-all`}>
                                ATS: {formatStatus(application.pipeline_status)}
                              </span>
                            ) : null}
                            {!isExpanded && hasNotifications && (
                              <span className="flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-teal-700 border border-teal-200">
                                <span className="relative flex h-2 w-2">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75"></span>
                                  <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400"></span>
                                </span>
                                New Update
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-base font-bold text-gray-500 tracking-tight">{application.company}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                          <span className="rounded-full bg-gray-100 border border-gray-200 px-4 py-1.5 hover:border-gray-300 transition-all">
                            {application.delivery_method === "employer_portal" ? "Employer Portal"
                              : application.delivery_method === "bot" ? "Bot Apply"
                              : "Email"}
                          </span>
                          <span className="rounded-full bg-gray-100 border border-gray-200 px-4 py-1.5 hover:border-gray-300 transition-all uppercase">
                            Source: {formatStatus(application.job_source || "unknown")}
                          </span>
                          {typeof application.match_score === "number" ? (
                            <span className="rounded-full bg-teal-50 border border-teal-200 px-4 py-1.5 text-teal-700 hover:bg-teal-100 transition-all">
                              Match: {application.match_score}%
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="grid gap-3 text-sm text-gray-500 lg:min-w-[280px]">
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 hover:border-gray-300 transition-all">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Send Date</p>
                          <p className="font-black text-gray-900 tracking-tight">
                            {application.created_at ? new Date(application.created_at).toLocaleString() : "Sync Pending"}
                          </p>
                        </div>
                      </div>
                    </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 p-5">
                      <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
                        <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <FolderClock className="h-4 w-4 text-teal-400" />
                        Application Timeline
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-gray-500">
                        <p>
                          Submission status: <span className="font-medium text-gray-900">{formatStatus(application.status)}</span>
                        </p>
                        <p>
                          Employer pipeline: <span className="font-medium text-gray-900">{formatStatus(application.pipeline_status || "not started")}</span>
                        </p>
                        <p>
                          Delivery method: <span className="font-medium text-gray-900">
                            {application.delivery_method === "employer_portal" ? "Employer portal"
                              : application.delivery_method === "bot" ? "Bot Apply"
                              : "Email"}
                          </span>
                        </p>
                        {application.job_url ? (
                          <p>
                            Applied URL:{" "}
                            <a href={application.job_url} target="_blank" rel="noopener noreferrer"
                              className="font-medium text-teal-400 underline underline-offset-2 break-all">
                              {application.job_url}
                            </a>
                          </p>
                        ) : null}
                        {application.response_message ? (
                          <p>
                            Latest response: <span className="font-medium text-gray-900">{application.response_message}</span>
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Mail className="h-4 w-4 text-teal-500" />
                        Resume Used
                      </div>
                      <div className="mt-3 space-y-3 text-sm text-gray-500">
                        <p className="font-medium text-gray-900">
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
                    <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <CalendarDays className="h-4 w-4 text-violet-400" />
                        Upcoming interview
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-gray-500">
                        <p className="font-medium text-gray-900">{application.next_interview.title}</p>
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

                  <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <MessageSquare className="h-4 w-4 text-teal-500" />
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
                        <p className="text-sm text-gray-400">
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
              <div className="rounded-[24px] border border-dashed border-gray-200 bg-white p-10 text-center shadow-sm">
                <p className="text-lg font-semibold text-gray-900">No applications match this view yet.</p>
                <p className="mt-2 text-sm text-gray-400">
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
