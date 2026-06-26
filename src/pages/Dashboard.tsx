import { motion, AnimatePresence } from "framer-motion";
import { NavbarV2 as Navbar } from "@/components/landing2/NavbarV2";
import {
  FileText,
  Briefcase,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  MapPin,
  Zap,
  Target,
  Search,
  Bot,
  CalendarDays,
  Bell,
  Mail,
  Building2,
  ExternalLink,
  Repeat2,
} from "lucide-react";

import { autoApplyService, ApplicationHistoryItem } from "@/services/autoApplyService";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useResume } from "@/hooks/useResume";
import { useAuth } from "@/context/AuthContext";
import { ActivityDetailsDialog } from "@/components/dashboard/ActivityDetailsDialog";
import { AutoApplySettingsSheet } from "@/components/dashboard/AutoApplySettingsSheet";
import { DailyGoalModal } from "@/components/dashboard/DailyGoalModal";
import { OnboardingModal } from "@/components/dashboard/OnboardingModal";
import { activityService } from "@/services/activityService";
import { careerService } from "@/services/careerService";
import { prefetchJobsPage } from "@/services/jobsPreloadCache";
import { notificationService } from "@/services/notificationService";
import { useSubscription } from "@/context/SubscriptionContext";
import { useJobReadiness } from "@/hooks/useJobReadiness";
import { buildDailyMissionTasks, readDailyMissionManualTaskIds } from "@/components/dashboard/dailyMission";
import { cn } from "@/lib/utils";

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const BAR_DAYS = 7;

interface DashCache {
  stats: typeof _DEFAULT_STATS;
  recommendedJobs: unknown[];
  chartData: number[];
  ts: number;
}
const _DEFAULT_STATS = {
  resume_score: 0, jobs_applied: 0, interviews: 0,
  response_rate: '0%', daily_applied_count: 0,
  daily_goal_target: 5, daily_goal_met: false,
};
let _dashCache: DashCache | null = null;

const StatCard = ({ label, value, subtext, icon: Icon, accent }: {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  accent?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 group",
      accent
        ? "bg-gray-900 border-gray-900 text-white"
        : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
    )}
  >
    <div className="flex items-center justify-between mb-5">
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-[0.2em]",
        accent ? "text-white/60" : "text-gray-500"
      )}>
        {label}
      </span>
      <div className={cn(
        "h-8 w-8 flex items-center justify-center rounded-xl",
        accent ? "bg-white/[0.12]" : "bg-gray-100"
      )}>
        <Icon className={cn("h-4 w-4", accent ? "text-white/60" : "text-gray-400")} />
      </div>
    </div>
    <div className="flex items-baseline gap-2">
      <span className={cn("text-3xl font-extrabold tracking-tight", accent ? "text-white" : "text-gray-900")}>
        {value}
      </span>
      {subtext && (
        <span className={cn("text-xs font-semibold", accent ? "text-white/50" : "text-gray-400")}>
          {subtext}
        </span>
      )}
    </div>
  </motion.div>
);

const StatCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse shadow-sm">
    <div className="flex items-center justify-between mb-5">
      <div className="h-2.5 w-24 bg-gray-100 rounded" />
      <div className="h-8 w-8 bg-gray-100 rounded-xl" />
    </div>
    <div className="h-8 w-20 bg-gray-100 rounded" />
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { userEmail } = useAuth();
  const { activeResume } = useResume();
  const { checkReady } = useJobReadiness();
  const [showActivityDetails, setShowActivityDetails] = useState(false);
  const [showAutoApply, setShowAutoApply] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(!_dashCache?.stats);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>(_dashCache?.recommendedJobs ?? []);
  const { summary: subscriptionSummary, hasFeature, loadingSummary, refreshSummary } = useSubscription();
  const [manualDailyTaskIds, setManualDailyTaskIds] = useState<number[]>([]);
  const [dashboardStats, setDashboardStats] = useState(_dashCache?.stats ?? _DEFAULT_STATS);
  const [chartData, setChartData] = useState<number[]>(_dashCache?.chartData ?? []);
  const [applications, setApplications] = useState<ApplicationHistoryItem[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [dailyPref, setDailyPref] = useState<{
    enabled: boolean;
    daily_limit: number;
    daily_applied_count: number;
    target_roles: string[];
  } | null>(null);
  const [dailyPrefLoading, setDailyPrefLoading] = useState(true);
  const [dailyToggling, setDailyToggling] = useState(false);

  const daysSince = (app: ApplicationHistoryItem) => {
    const date = app.sent_at || app.created_at;
    if (!date) return 0;
    return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  };

  const loadApplications = useCallback(async () => {
    try {
      const [emailResult, botResult] = await Promise.allSettled([
        autoApplyService.getHistory(),
        autoApplyService.getBotHistory(),
      ]);
      const all: ApplicationHistoryItem[] = [];
      if (emailResult.status === "fulfilled") all.push(...(emailResult.value?.applications ?? []));
      if (botResult.status === "fulfilled") all.push(...(botResult.value?.applications ?? []));
      all.sort((a, b) =>
        new Date(b.sent_at || b.created_at || 0).getTime() -
        new Date(a.sent_at || a.created_at || 0).getTime()
      );
      setApplications(all);
    } catch {
      // non-fatal
    } finally {
      setAppsLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    const hasCachedData = !!(_dashCache?.stats);
    if (!hasCachedData) setLoading(true);
    try {
      const [summary, profile] = await Promise.all([
        activityService.getDashboardSummary(),
        careerService.getProfile(),
      ]);
      const newStats = summary?.stats ? {
        resume_score: summary.stats.resume_score ?? 0,
        jobs_applied: summary.stats.jobs_applied ?? 0,
        interviews: summary.stats.interviews ?? 0,
        response_rate: summary.stats.response_rate ?? '0%',
        daily_applied_count: summary.stats.daily_applied_count ?? 0,
        daily_goal_target: summary.stats.daily_goal_target ?? 5,
        daily_goal_met: summary.stats.daily_goal_met ?? false,
      } : _dashCache?.stats ?? _DEFAULT_STATS;
      const newRecommended = summary?.recommended_jobs ?? _dashCache?.recommendedJobs ?? [];
      const newChart = summary?.chart_data ?? _dashCache?.chartData ?? [];
      setDashboardStats(newStats);
      setRecommendedJobs(newRecommended);
      setChartData(newChart);
      _dashCache = { stats: newStats, recommendedJobs: newRecommended, chartData: newChart, ts: Date.now() };
      const onboardingEverShown = localStorage.getItem("onboarding_shown");
      if (!onboardingEverShown && (!profile?.target_roles?.length || profile.target_roles[0] === "")) {
        setShowOnboarding(true);
      }
      const role = notificationService.getPrefs().targetRole || profile?.target_roles?.[0];
      if (role) prefetchJobsPage(role);
    } catch (err) {
      console.error("Failed to load dashboard summary:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const navigateToJobs = useCallback(() => {
    if (checkReady()) navigate("/jobs");
  }, [checkReady, navigate]);

  const loadDailyPref = useCallback(async () => {
    try {
      const pref = await autoApplyService.getDailyAutoApplyPref();
      setDailyPref(pref);
    } catch {
      // non-fatal
    } finally {
      setDailyPrefLoading(false);
    }
  }, []);

  const toggleDailyAutoApply = useCallback(async () => {
    if (!dailyPref || dailyToggling) return;
    setDailyToggling(true);
    try {
      const updated = await autoApplyService.setDailyAutoApplyPref(!dailyPref.enabled);
      setDailyPref(prev => prev ? { ...prev, enabled: updated.enabled } : prev);
    } catch {
      // non-fatal
    } finally {
      setDailyToggling(false);
    }
  }, [dailyPref, dailyToggling]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { loadApplications(); }, [loadApplications]);
  useEffect(() => { loadDailyPref(); }, [loadDailyPref]);
  useEffect(() => { refreshSummary(); }, [refreshSummary]);

  useEffect(() => {
    const role = activeResume?.targetJobRole || notificationService.getPrefs().targetRole;
    if (role) prefetchJobsPage(role);
  }, [activeResume?.targetJobRole]);

  useEffect(() => {
    setManualDailyTaskIds(readDailyMissionManualTaskIds());
  }, []);

  const dailyMissionTasks = buildDailyMissionTasks(
    dashboardStats.daily_applied_count,
    dashboardStats.daily_goal_target,
    manualDailyTaskIds,
  );

  const progressPct = dashboardStats.daily_goal_target > 0
    ? Math.min((dashboardStats.daily_applied_count / dashboardStats.daily_goal_target) * 100, 100)
    : 0;

  // Last 7 days bar chart data
  const rawBars = chartData.length > 0 ? chartData.slice(-BAR_DAYS) : Array(BAR_DAYS).fill(0);
  const barMax = Math.max(...rawBars, 1);
  const today = new Date();
  const getBarLabel = (offsetFromEnd: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (BAR_DAYS - 1 - offsetFromEnd));
    return d.toLocaleDateString(undefined, { weekday: "short" });
  };

  const firstName = userEmail ? userEmail.split("@")[0].split(".")[0] : null;
  const greeting = firstName
    ? `${firstName.charAt(0).toUpperCase() + firstName.slice(1)}`
    : "Dashboard";

  const featureLabels: Record<string, string> = {
    job_detail_access: "Job Detail Access",
    job_apply_access: "Job Apply Access",
    job_save_access: "Job Save Access",
    dashboard_access: "Dashboard Access",
    resume_builder_access: "Resume Builder",
    ats_optimizer_access: "Resume Audits",
    career_insights_access: "Executive Profile Review",
    gap_analysis_access: "Skill Gap Analyses",
    text_interview_access: "AI Interview Simulations",
    video_interview_access: "Live Mock Interviews",
    salary_negotiation_access: "Salary Negotiation Simulations",
    live_salary_negotiation_call: "Live Salary Negotiation Call",
    career_strategy_access: "Career Strategy Access",
    auto_apply_access: "Executive Role Applications",
    job_fairs_access: "C-Suite Networking Events",
    career_roadmap: "Executive Career Roadmaps",
    salary_range_research: "Salary Benchmark",
    success_manager: "Dedicated Executive Recruiter",
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1320px]">

          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-1.5">
              Career Intelligence
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Good morning, {greeting}
            </h1>
          </motion.div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {loading ? (
              <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
            ) : (
              <>
                <StatCard
                  label="Resume Strength"
                  value={`${dashboardStats.resume_score}%`}
                  icon={Target}
                  accent
                />
                <StatCard
                  label="Total Applied"
                  value={dashboardStats.jobs_applied}
                  subtext="jobs"
                  icon={Briefcase}
                />
                <StatCard
                  label="Today's Goal"
                  value={`${dashboardStats.daily_applied_count}/${dashboardStats.daily_goal_target}`}
                  subtext="applied"
                  icon={CalendarDays}
                />
              </>
            )}
          </div>

          {/* Main grid */}
          <div className="grid lg:grid-cols-12 gap-6">

            {/* Left column — 8 */}
            <div className="lg:col-span-8 space-y-6">

              {/* Application History */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 tracking-tight">Application History</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-medium">All jobs you've applied to</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/applications")}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
                  >
                    View All
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>

                {appsLoading ? (
                  <div className="space-y-3 animate-pulse">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <div className="h-10 w-10 rounded-xl bg-gray-200 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-40 bg-gray-200 rounded" />
                          <div className="h-2.5 w-24 bg-gray-200 rounded" />
                        </div>
                        <div className="h-5 w-14 bg-gray-200 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : applications.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-gray-200 rounded-xl">
                    <Briefcase className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-500 mb-1">No applications yet</p>
                    <p className="text-xs text-gray-400 mb-4">Start applying to jobs and your history will show here.</p>
                    <button type="button" onClick={() => navigate("/jobs")}
                      className="text-[11px] font-bold text-gray-900 hover:text-gray-600 uppercase tracking-widest underline underline-offset-4 transition-colors">
                      Browse Jobs
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {applications.slice(0, 8).map((app) => {
                      const days = daysSince(app);
                      const dateLabel = days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days}d ago`;
                      const isBot = app.delivery_method === "bot";
                      const isFailed = app.status === "failed" || app.status === "cancelled";
                      const isJobClosed = isFailed && (
                        app.response_message === "job_closed" ||
                        /job.?closed|no longer (available|open)|posting.*expired|position.*closed|job.*expired/i.test(app.response_message ?? "")
                      );

                      // Derive display label — pipeline stage takes priority for progressed apps
                      const pipelineStage = app.pipeline_status && app.pipeline_status !== "applied"
                        ? app.pipeline_status : null;
                      const statusLabel = pipelineStage
                        ? pipelineStage.charAt(0).toUpperCase() + pipelineStage.slice(1)
                        : app.status === "sent" || app.status === "submitted" ? "Applied"
                        : app.status === "queued" ? "Queued"
                        : app.status === "applying" ? "Applying…"
                        : isJobClosed ? "Job Closed"
                        : app.status === "failed" ? "Failed"
                        : app.status === "cancelled" ? "Cancelled"
                        : "Applied";

                      const statusColor = pipelineStage
                        ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                        : app.status === "sent" || app.status === "submitted"
                        ? "text-teal-400 bg-teal-500/10 border-teal-500/20"
                        : app.status === "queued" || app.status === "applying"
                        ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                        : isJobClosed
                        ? "text-orange-400 bg-orange-500/10 border-orange-500/20"
                        : isFailed
                        ? "text-red-400 bg-red-500/10 border-red-500/20"
                        : "text-teal-400 bg-teal-500/10 border-teal-500/20";

                      // Show error reason for real failures, suppress for job_closed (badge is enough)
                      const failReason = isFailed && !isJobClosed && app.response_message
                        ? app.response_message.length > 60
                          ? app.response_message.slice(0, 57) + "…"
                          : app.response_message
                        : null;

                      return (
                        <motion.div key={app.id} whileHover={{ x: 2 }}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border transition-all group",
                            isJobClosed
                              ? "bg-orange-500/[0.04] border-orange-500/15 hover:border-orange-500/30"
                              : isFailed
                              ? "bg-red-500/[0.04] border-red-500/15 hover:border-red-500/30"
                              : "bg-gray-50 border-gray-200 hover:border-gray-300"
                          )}>
                          <div className={cn(
                            "h-10 w-10 rounded-xl border flex items-center justify-center shrink-0",
                            isJobClosed ? "bg-orange-500/10 border-orange-500/20"
                            : isFailed ? "bg-red-500/10 border-red-500/20"
                            : "bg-gray-100 border-gray-200"
                          )}>
                            <Building2 className={cn("h-5 w-5", isJobClosed ? "text-orange-400/60" : isFailed ? "text-red-400/60" : "text-gray-400")} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate leading-snug">{app.job_title || "Unknown Role"}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[11px] text-gray-500 font-medium truncate">{app.company || "Unknown Company"}</p>
                              {isBot && (
                                <span className="text-[9px] font-black uppercase tracking-wider text-violet-400 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded-full">Apex™</span>
                              )}
                            </div>
                            {failReason && (
                              <p className="text-[10px] text-red-400/70 mt-1 leading-snug truncate">{failReason}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border", statusColor)}>
                              {statusLabel}
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold">{dateLabel}</span>
                          </div>
                          {app.job_url && (
                            <a href={app.job_url} target="_blank" rel="noopener noreferrer"
                              title="View job posting"
                              onClick={e => e.stopPropagation()}
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                              <ExternalLink className="h-3.5 w-3.5 text-gray-400 hover:text-gray-900 transition-colors" />
                            </a>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Application Activity — 7-day bar chart */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="flex items-center justify-between px-7 pt-6 pb-5">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 tracking-tight">Application Activity</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Last 7 days</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowActivityDetails(true)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
                  >
                    View History
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="px-7 pb-7">
                  {/* Bars */}
                  <div className="flex items-end justify-between gap-2 h-28">
                    {rawBars.map((count, i) => {
                      const heightPct = barMax > 0 ? (count / barMax) * 100 : 0;
                      const isToday = i === rawBars.length - 1;
                      return (
                        <div key={i} className="relative group flex-1 flex flex-col items-center gap-2">
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 px-2.5 py-1.5 bg-gray-900 border border-gray-800 text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none text-white">
                            {count} application{count !== 1 ? 's' : ''}
                          </div>
                          {/* Bar */}
                          <div className="w-full h-full flex items-end">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max(heightPct, count > 0 ? 8 : 4)}%` }}
                              transition={{ delay: i * 0.06, duration: 0.45, ease: "easeOut" }}
                              className={cn(
                                "w-full rounded-t-lg",
                                isToday
                                  ? "bg-gray-900"
                                  : count > 0
                                  ? "bg-gray-400 group-hover:bg-gray-600 transition-colors"
                                  : "bg-gray-100 group-hover:bg-gray-200 transition-colors"
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Day labels */}
                  <div className="flex justify-between gap-2 mt-3">
                    {rawBars.map((_, i) => {
                      const isToday = i === rawBars.length - 1;
                      return (
                        <div key={i} className="flex-1 text-center">
                          <span className={cn(
                            "text-[10px] font-bold uppercase",
                            isToday ? "text-gray-900" : "text-gray-400"
                          )}>
                            {isToday ? "Today" : getBarLabel(i)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total this week */}
                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-medium">Total this week</span>
                    <span className="text-sm font-extrabold text-gray-900">
                      {rawBars.reduce((a, b) => a + b, 0)} applications
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Daily Mission + AI Insights */}
              <div className="grid md:grid-cols-2 gap-6">

                {/* Daily Mission */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 tracking-tight">Daily Mission</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Today's goals</p>
                    </div>
                    <div className="relative h-11 w-11">
                      <svg className="h-11 w-11 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="15" fill="none" stroke="#111827" strokeWidth="3"
                          strokeDasharray={`${progressPct * 0.942} 94.2`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-gray-900">
                        {Math.round(progressPct)}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {dailyMissionTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        whileHover={{ x: 2 }}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-3 border transition-all",
                          task.completed
                            ? "bg-gray-50 border-gray-200 opacity-60"
                            : "bg-gray-50 border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className={cn(
                          "h-5 w-5 rounded-md flex items-center justify-center flex-shrink-0",
                          task.completed ? "bg-gray-900" : "bg-white border border-gray-300"
                        )}>
                          <CheckCircle2 className={cn("h-3 w-3", task.completed ? "text-white" : "text-gray-400")} />
                        </div>
                        <span className={cn(
                          "text-[13px] font-semibold flex-1",
                          task.completed ? "text-gray-400 line-through" : "text-gray-700"
                        )}>
                          {task.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* AI Insights */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col shadow-sm"
                >
                  <div className="mb-6">
                    <h3 className="text-base font-bold text-gray-900 tracking-tight">AI Insights</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Tips to improve your search</p>
                  </div>

                  <div className="space-y-3 flex-1">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <p className="text-[9px] font-black text-gray-900 uppercase tracking-[0.2em] mb-1.5">Resume Tip</p>
                      <p className="text-[13px] text-gray-500 leading-relaxed">Keep your resume updated with your latest skills to improve match scores.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1.5">Search Tip</p>
                      <p className="text-[13px] text-gray-500 leading-relaxed">Candidates who apply daily get 3x more responses than those who apply in bursts.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/ai-mentor")}
                    className="mt-4 w-full h-10 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    Open AI Mentor
                  </button>
                </motion.div>
              </div>

              {/* Recommended Jobs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 tracking-tight">Recommended Roles</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Matched to your profile</p>
                  </div>
                  <button
                    type="button"
                    onClick={navigateToJobs}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
                  >
                    Browse All
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>

                {loading ? (
                  <div className="grid sm:grid-cols-2 gap-3 animate-pulse">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2.5">
                        <div className="h-3 w-32 bg-gray-200 rounded" />
                        <div className="h-2.5 w-20 bg-gray-200 rounded" />
                        <div className="h-2.5 w-16 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                ) : recommendedJobs.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {recommendedJobs.slice(0, 6).map((job, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ borderColor: "rgba(255,255,255,0.18)" }}
                        className="p-4 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer group transition-all hover:border-gray-300"
                        onClick={navigateToJobs}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-sm font-bold text-gray-900 group-hover:text-gray-700 leading-snug transition-colors">
                            {job.title}
                          </p>
                          <span className="shrink-0 text-[10px] font-black text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-lg">
                            {job.match}%
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium mb-2.5">{job.company}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {job.location}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center border border-dashed border-gray-200 rounded-xl">
                    <Briefcase className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-500 mb-1">No recommendations yet</p>
                    <p className="text-xs text-gray-400 mb-4">Complete your profile to get personalized job matches.</p>
                    <button
                      type="button"
                      onClick={navigateToJobs}
                      className="text-[11px] font-bold text-gray-900 hover:text-gray-600 uppercase tracking-widest underline underline-offset-4 transition-colors"
                    >
                      Browse Jobs
                    </button>
                  </div>
                )}
              </motion.div>

            </div>

            {/* Right column — 4 */}
            <div className="lg:col-span-4 space-y-6">

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="mb-6">
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">Quick Actions</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Get things done fast</p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => hasFeature("auto_apply_access") ? setShowAutoApply(true) : navigate("/plans")}
                    className="w-full flex items-center gap-3 h-12 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm transition-all group"
                  >
                    <Bot className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">Launch Apex™</span>
                    <Zap className="h-3.5 w-3.5 text-white/40 group-hover:text-white/70 transition-colors" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/resume")}
                    className="w-full flex items-center gap-3 h-12 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 font-bold text-sm transition-all"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="flex-1 text-left">View Resume</span>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                  </button>

                  <button
                    type="button"
                    onClick={navigateToJobs}
                    className="w-full flex items-center gap-3 h-12 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 font-bold text-sm transition-all"
                  >
                    <Search className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="flex-1 text-left">Find Jobs</span>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/ai-mentor")}
                    className="w-full flex items-center gap-3 h-12 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 font-bold text-sm transition-all"
                  >
                    <Sparkles className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="flex-1 text-left">AI Mentor</span>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                </div>
              </motion.div>

              {/* Daily Auto-Apply */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Repeat2 className="h-4 w-4 text-teal-500" />
                    <div>
                      <h3 className="text-base font-bold text-gray-900 tracking-tight">Daily Auto-Apply</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Bot applies 5 jobs for you every day</p>
                    </div>
                  </div>
                  {/* Toggle */}
                  <button
                    type="button"
                    disabled={dailyPrefLoading || dailyToggling}
                    onClick={toggleDailyAutoApply}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50",
                      dailyPref?.enabled ? "bg-teal-500" : "bg-gray-200"
                    )}
                    aria-label="Toggle daily auto-apply"
                  >
                    <span className={cn(
                      "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200",
                      dailyPref?.enabled ? "translate-x-5" : "translate-x-0"
                    )} />
                  </button>
                </div>

                {dailyPrefLoading ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-3 w-3/4 bg-gray-100 rounded" />
                    <div className="h-2.5 w-1/2 bg-gray-100 rounded" />
                  </div>
                ) : (
                  <>
                    {/* Target roles */}
                    {(dailyPref?.target_roles?.length ?? 0) > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {dailyPref!.target_roles.slice(0, 3).map(role => (
                          <span key={role} className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full truncate max-w-[140px]">
                            {role}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-amber-600 font-semibold mb-4 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                        Set a target role in your profile to enable daily apply.
                      </p>
                    )}

                    {/* Today's progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-gray-500">Today's applications</span>
                        <span className="text-gray-900">
                          {dailyPref?.daily_applied_count ?? 0} / {dailyPref?.daily_limit ?? 5}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(
                              ((dailyPref?.daily_applied_count ?? 0) / (dailyPref?.daily_limit ?? 5)) * 100,
                              100
                            )}%`
                          }}
                          transition={{ duration: 0.5 }}
                          className="h-full rounded-full bg-teal-500"
                        />
                      </div>
                    </div>

                    {dailyPref?.enabled ? (
                      <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                        Apex™ will automatically apply to {dailyPref.daily_limit} matching jobs every morning at 8 AM.
                      </p>
                    ) : (
                      <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                        Toggle on to let Apex™ apply to new jobs every morning — completely hands-free.
                      </p>
                    )}
                  </>
                )}
              </motion.div>

              {/* Active Plan */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => navigate("/plans")}
                className="bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-6 cursor-pointer group transition-all shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Active Plan</p>
                  <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-900 transition-colors" />
                </div>
                <p className="text-xl font-extrabold text-gray-900 tracking-tight">
                  {subscriptionSummary?.plan?.name ?? "Free Tier"}
                </p>
                <p className="text-[11px] text-gray-400 mt-1 font-medium">Upgrade to unlock more features</p>
              </motion.div>

              {/* Feature Usage */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="mb-5">
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">Feature Usage</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Current billing period</p>
                </div>

                {loadingSummary ? (
                  <div className="space-y-5 animate-pulse">
                    {[1,2,3].map(i => (
                      <div key={i}>
                        <div className="flex justify-between mb-2">
                          <div className="h-2.5 w-24 bg-gray-100 rounded" />
                          <div className="h-2.5 w-10 bg-gray-100 rounded" />
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1">
                    {(subscriptionSummary?.current_usage ?? []).map(item => {
                      const label = featureLabels[item.feature_key] ?? item.feature_key.replace(/_access$/, '').replace(/_/g, ' ');
                      const pct = item.is_unlimited ? 100 : (item.used_count / item.limit) * 100;
                      const isHigh = !item.is_unlimited && pct > 80;
                      return (
                        <div key={item.feature_key}>
                          <div className="flex justify-between text-[11px] font-semibold mb-2">
                            <span className="text-gray-500 capitalize">{label}</span>
                            <span className={isHigh ? "text-gray-900" : "text-gray-400"}>
                              {item.is_unlimited ? '∞' : `${item.used_count}/${item.limit}`}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(pct, 100)}%` }}
                              transition={{ delay: 0.3, duration: 0.6 }}
                              className={cn(
                                "h-full rounded-full",
                                isHigh ? "bg-gray-900" : "bg-gray-300"
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {!subscriptionSummary?.current_usage?.length && (
                      <p className="text-xs text-gray-400 font-semibold">No usage data available</p>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Follow-up Reminders */}
              {(() => {
                const advancedStages = new Set(["interview", "offer", "hired", "rejected"]);
                const reminders = applications
                  .filter(a => {
                    if (a.status === "failed" || a.status === "cancelled") return false;
                    if (advancedStages.has(a.pipeline_status ?? "")) return false;
                    return daysSince(a) >= 3;
                  })
                  .slice(0, 5)
                  .map(a => {
                    const days = daysSince(a);
                    const type = days >= 21 ? "linkedin" : days >= 7 ? "week" : "email";
                    return { ...a, days, type };
                  });

                if (reminders.length === 0) return null;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-5">
                      <Bell className="h-4 w-4 text-amber-400" />
                      <div>
                        <h3 className="text-base font-bold text-gray-900 tracking-tight">Follow-up Reminders</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Time to check in</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {reminders.map(r => {
                        const isLinkedIn = r.type === "linkedin";
                        const isWeek = r.type === "week";
                        const accent = isLinkedIn
                          ? "border-violet-500/20 bg-violet-500/[0.06]"
                          : isWeek
                          ? "border-amber-500/20 bg-amber-500/[0.06]"
                          : "border-blue-500/20 bg-blue-500/[0.06]";
                        const iconBg = isLinkedIn
                          ? "bg-violet-500/20 text-violet-400"
                          : isWeek
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-blue-500/20 text-blue-400";
                        const badgeColor = isLinkedIn
                          ? "text-violet-400"
                          : isWeek
                          ? "text-amber-400"
                          : "text-blue-400";
                        const action = isLinkedIn
                          ? "Connect on LinkedIn"
                          : isWeek
                          ? "Send a follow-up"
                          : "Check your email";
                        const Icon = isLinkedIn ? LinkedInIcon : isWeek ? Bell : Mail;
                        return (
                          <div key={r.id} className={cn("rounded-xl border p-3.5 transition-all", accent)}>
                            <div className="flex items-start gap-3">
                              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", iconBg)}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="text-[12px] font-bold text-gray-900 truncate">{r.job_title || "Role"}</p>
                                  <span className={cn("text-[9px] font-black uppercase tracking-wider shrink-0", badgeColor)}>
                                    Day {r.days}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-500 truncate mb-2">{r.company}</p>
                                <p className="text-[11px] font-semibold text-gray-700">{action}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })()}

              {/* Apex™ banner */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-900 rounded-2xl p-6"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white tracking-tight">Apex™ is ready</h4>
                    <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">Your personal executive application delegate.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => hasFeature("auto_apply_access") ? setShowAutoApply(true) : navigate("/plans")}
                  className="w-full h-10 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Start Applying
                </button>
              </motion.div>

            </div>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <AnimatePresence>
        {showActivityDetails && <ActivityDetailsDialog open={showActivityDetails} onOpenChange={setShowActivityDetails} />}
      </AnimatePresence>
      <AutoApplySettingsSheet open={showAutoApply} onOpenChange={setShowAutoApply} />
      <DailyGoalModal
        currentCount={dashboardStats.daily_applied_count}
        targetCount={dashboardStats.daily_goal_target}
        onTasksChange={setManualDailyTaskIds}
      />
      <OnboardingModal
        open={showOnboarding}
        onOpenChange={(open) => {
          setShowOnboarding(open);
          if (!open) localStorage.setItem("onboarding_shown", "1");
        }}
        onComplete={() => { loadData(); }}
      />
    </div>
  );
}
