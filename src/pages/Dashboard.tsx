import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
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
  TrendingUp,
  Bot,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

const BAR_DAYS = 7;

const DASH_TTL = 5 * 60 * 1000;
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
        ? "bg-white border-white text-black"
        : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
    )}
  >
    <div className="flex items-center justify-between mb-5">
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-[0.2em]",
        accent ? "text-black/50" : "text-zinc-500"
      )}>
        {label}
      </span>
      <div className={cn(
        "h-8 w-8 flex items-center justify-center rounded-xl",
        accent ? "bg-black/[0.07]" : "bg-zinc-800"
      )}>
        <Icon className={cn("h-4 w-4", accent ? "text-black/50" : "text-zinc-400")} />
      </div>
    </div>
    <div className="flex items-baseline gap-2">
      <span className={cn("text-3xl font-extrabold tracking-tight", accent ? "text-black" : "text-white")}>
        {value}
      </span>
      {subtext && (
        <span className={cn("text-xs font-semibold", accent ? "text-black/40" : "text-zinc-600")}>
          {subtext}
        </span>
      )}
    </div>
  </motion.div>
);

const StatCardSkeleton = () => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-pulse">
    <div className="flex items-center justify-between mb-5">
      <div className="h-2.5 w-24 bg-zinc-800 rounded" />
      <div className="h-8 w-8 bg-zinc-800 rounded-xl" />
    </div>
    <div className="h-8 w-20 bg-zinc-800 rounded" />
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
  const { summary: subscriptionSummary, hasFeature, loadingSummary } = useSubscription();
  const [manualDailyTaskIds, setManualDailyTaskIds] = useState<number[]>([]);
  const [dashboardStats, setDashboardStats] = useState(_dashCache?.stats ?? _DEFAULT_STATS);
  const [chartData, setChartData] = useState<number[]>(_dashCache?.chartData ?? []);

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

  useEffect(() => { loadData(); }, [loadData]);

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
    auto_apply_access: "Auto Apply",
    ats_optimizer_access: "ATS Optimizer",
    text_interview_access: "Interview Practice",
    video_interview_access: "Video Interview",
    resume_builder_access: "Resume Builder",
    career_insights_access: "Career Insights",
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white">
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
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 mb-1.5">
              Career Intelligence
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
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

              {/* Application Activity — 7-day bar chart */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-7 pt-6 pb-5">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">Application Activity</h3>
                    <p className="text-[11px] text-zinc-600 mt-0.5 font-medium">Last 7 days</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowActivityDetails(true)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
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
                          <div className="absolute bottom-full mb-2 px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none text-white">
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
                                  ? "bg-white"
                                  : count > 0
                                  ? "bg-zinc-500 group-hover:bg-zinc-300 transition-colors"
                                  : "bg-zinc-800 group-hover:bg-zinc-700 transition-colors"
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
                            isToday ? "text-white" : "text-zinc-600"
                          )}>
                            {isToday ? "Today" : getBarLabel(i)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total this week */}
                  <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-600 font-medium">Total this week</span>
                    <span className="text-sm font-extrabold text-white">
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
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">Daily Mission</h3>
                      <p className="text-[11px] text-zinc-600 mt-0.5 font-medium">Today's goals</p>
                    </div>
                    <div className="relative h-11 w-11">
                      <svg className="h-11 w-11 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#27272a" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="15" fill="none" stroke="white" strokeWidth="3"
                          strokeDasharray={`${progressPct * 0.942} 94.2`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">
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
                            ? "bg-white/[0.04] border-white/[0.08] opacity-60"
                            : "bg-zinc-800 border-zinc-700 hover:border-zinc-600"
                        )}
                      >
                        <div className={cn(
                          "h-5 w-5 rounded-md flex items-center justify-center flex-shrink-0",
                          task.completed ? "bg-white" : "bg-zinc-700 border border-zinc-600"
                        )}>
                          <CheckCircle2 className={cn("h-3 w-3", task.completed ? "text-black" : "text-zinc-600")} />
                        </div>
                        <span className={cn(
                          "text-[13px] font-semibold flex-1",
                          task.completed ? "text-zinc-600 line-through" : "text-zinc-300"
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
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col"
                >
                  <div className="mb-6">
                    <h3 className="text-base font-bold text-white tracking-tight">AI Insights</h3>
                    <p className="text-[11px] text-zinc-600 mt-0.5 font-medium">Tips to improve your search</p>
                  </div>

                  <div className="space-y-3 flex-1">
                    <div className="p-4 rounded-xl bg-zinc-800 border border-zinc-700">
                      <p className="text-[9px] font-black text-white uppercase tracking-[0.2em] mb-1.5">Resume Tip</p>
                      <p className="text-[13px] text-zinc-400 leading-relaxed">Keep your resume updated with your latest skills to improve match scores.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-800 border border-zinc-700">
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1.5">Search Tip</p>
                      <p className="text-[13px] text-zinc-400 leading-relaxed">Candidates who apply daily get 3x more responses than those who apply in bursts.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/ai-mentor")}
                    className="mt-4 w-full h-10 rounded-xl bg-white hover:bg-zinc-100 text-black font-bold text-xs uppercase tracking-widest transition-all"
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
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">Recommended Roles</h3>
                    <p className="text-[11px] text-zinc-600 mt-0.5 font-medium">Matched to your profile</p>
                  </div>
                  <button
                    type="button"
                    onClick={navigateToJobs}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
                  >
                    Browse All
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>

                {loading ? (
                  <div className="grid sm:grid-cols-2 gap-3 animate-pulse">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 space-y-2.5">
                        <div className="h-3 w-32 bg-zinc-700 rounded" />
                        <div className="h-2.5 w-20 bg-zinc-700 rounded" />
                        <div className="h-2.5 w-16 bg-zinc-700 rounded" />
                      </div>
                    ))}
                  </div>
                ) : recommendedJobs.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {recommendedJobs.slice(0, 6).map((job, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ borderColor: "rgba(255,255,255,0.18)" }}
                        className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 cursor-pointer group transition-all"
                        onClick={navigateToJobs}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-sm font-bold text-white group-hover:text-white/80 leading-snug transition-colors">
                            {job.title}
                          </p>
                          <span className="shrink-0 text-[10px] font-black text-white bg-white/10 border border-white/10 px-2 py-0.5 rounded-lg">
                            {job.match}%
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-medium mb-2.5">{job.company}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-semibold">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {job.location}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center border border-dashed border-zinc-800 rounded-xl">
                    <Briefcase className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-zinc-500 mb-1">No recommendations yet</p>
                    <p className="text-xs text-zinc-600 mb-4">Complete your profile to get personalized job matches.</p>
                    <button
                      type="button"
                      onClick={navigateToJobs}
                      className="text-[11px] font-bold text-white hover:text-zinc-300 uppercase tracking-widest underline underline-offset-4 transition-colors"
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
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
              >
                <div className="mb-6">
                  <h3 className="text-base font-bold text-white tracking-tight">Quick Actions</h3>
                  <p className="text-[11px] text-zinc-600 mt-0.5 font-medium">Get things done fast</p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => hasFeature("auto_apply_access") ? setShowAutoApply(true) : navigate("/plans")}
                    className="w-full flex items-center gap-3 h-12 px-4 rounded-xl bg-white hover:bg-zinc-100 text-black font-bold text-sm transition-all group"
                  >
                    <Bot className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">Launch Apex™</span>
                    <Zap className="h-3.5 w-3.5 text-black/40 group-hover:text-black/70 transition-colors" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/resume")}
                    className="w-full flex items-center gap-3 h-12 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold text-sm transition-all"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-zinc-400" />
                    <span className="flex-1 text-left">View Resume</span>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                  </button>

                  <button
                    type="button"
                    onClick={navigateToJobs}
                    className="w-full flex items-center gap-3 h-12 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold text-sm transition-all"
                  >
                    <Search className="h-4 w-4 shrink-0 text-zinc-400" />
                    <span className="flex-1 text-left">Find Jobs</span>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/ai-mentor")}
                    className="w-full flex items-center gap-3 h-12 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold text-sm transition-all"
                  >
                    <Sparkles className="h-4 w-4 shrink-0 text-zinc-400" />
                    <span className="flex-1 text-left">AI Mentor</span>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                  </button>
                </div>
              </motion.div>

              {/* Active Plan */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => navigate("/plans")}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 cursor-pointer group transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Active Plan</p>
                  <ArrowUpRight className="h-3.5 w-3.5 text-zinc-700 group-hover:text-white transition-colors" />
                </div>
                <p className="text-xl font-extrabold text-white tracking-tight">
                  {subscriptionSummary?.plan?.name ?? "Free Tier"}
                </p>
                <p className="text-[11px] text-zinc-600 mt-1 font-medium">Upgrade to unlock more features</p>
              </motion.div>

              {/* Feature Usage */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
              >
                <div className="mb-5">
                  <h3 className="text-base font-bold text-white tracking-tight">Feature Usage</h3>
                  <p className="text-[11px] text-zinc-600 mt-0.5 font-medium">Current billing period</p>
                </div>

                {loadingSummary ? (
                  <div className="space-y-5 animate-pulse">
                    {[1,2,3].map(i => (
                      <div key={i}>
                        <div className="flex justify-between mb-2">
                          <div className="h-2.5 w-24 bg-zinc-800 rounded" />
                          <div className="h-2.5 w-10 bg-zinc-800 rounded" />
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {(subscriptionSummary?.current_usage?.slice(0, 4) ?? []).map(item => {
                      const label = featureLabels[item.feature_key] ?? item.feature_key.replace(/_access$/, '').replace(/_/g, ' ');
                      const pct = item.is_unlimited ? 100 : (item.used_count / item.limit) * 100;
                      const isHigh = !item.is_unlimited && pct > 80;
                      return (
                        <div key={item.feature_key}>
                          <div className="flex justify-between text-[11px] font-semibold mb-2">
                            <span className="text-zinc-400 capitalize">{label}</span>
                            <span className={isHigh ? "text-white" : "text-zinc-600"}>
                              {item.is_unlimited ? '∞' : `${item.used_count}/${item.limit}`}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(pct, 100)}%` }}
                              transition={{ delay: 0.3, duration: 0.6 }}
                              className={cn(
                                "h-full rounded-full",
                                isHigh ? "bg-white" : "bg-zinc-600"
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {!subscriptionSummary?.current_usage?.length && (
                      <p className="text-xs text-zinc-700 font-semibold">No usage data available</p>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Apex™ banner */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-9 w-9 rounded-xl bg-black flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-black tracking-tight">Apex™ is ready</h4>
                    <p className="text-[11px] text-black/50 mt-0.5 leading-relaxed">Your personal executive application delegate.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => hasFeature("auto_apply_access") ? setShowAutoApply(true) : navigate("/plans")}
                  className="w-full h-10 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest transition-all"
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
