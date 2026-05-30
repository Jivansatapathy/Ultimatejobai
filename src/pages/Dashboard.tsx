import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import {
  FileText,
  Briefcase,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Zap,
  Target,
  Users,
  BarChart2,
  Search,
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
import { prefetchJobs } from "@/services/jobsPreloadCache";
import { notificationService } from "@/services/notificationService";
import { useSubscription } from "@/context/SubscriptionContext";
import { useJobReadiness } from "@/hooks/useJobReadiness";
import { buildDailyMissionTasks, readDailyMissionManualTaskIds } from "@/components/dashboard/dailyMission";
import { cn } from "@/lib/utils";

const HEATMAP_DAYS = 31;

const StatCard = ({ label, value, subtext, icon: Icon, className }: {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[24px] p-6 transition-all hover:border-white/[0.15] group",
      className
    )}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="h-10 w-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center transition-colors group-hover:bg-teal-500/10 group-hover:border-teal-500/20">
        <Icon className="h-5 w-5 text-slate-400 group-hover:text-teal-400 transition-colors" />
      </div>
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-black text-white tracking-tighter">{value}</h3>
        {subtext && <span className="text-xs text-slate-500 font-bold tracking-tight">{subtext}</span>}
      </div>
    </div>
  </motion.div>
);

const StatCardSkeleton = () => (
  <div className="bg-white/[0.03] border border-white/[0.08] rounded-[24px] p-6 animate-pulse">
    <div className="h-10 w-10 rounded-xl bg-white/[0.06] mb-4" />
    <div className="h-3 w-20 bg-white/[0.06] rounded mb-2" />
    <div className="h-7 w-16 bg-white/[0.08] rounded" />
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
  const [loading, setLoading] = useState(true);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const { summary: subscriptionSummary, hasFeature, loadingSummary } = useSubscription();
  const [manualDailyTaskIds, setManualDailyTaskIds] = useState<number[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    resume_score: 0,
    jobs_applied: 0,
    interviews: 0,
    response_rate: '0%',
    daily_applied_count: 0,
    daily_goal_target: 5,
    daily_goal_met: false,
  });
  const [chartData, setChartData] = useState<number[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [summary, profile] = await Promise.all([
        activityService.getDashboardSummary(),
        careerService.getProfile(),
      ]);

      if (summary?.stats) {
        setDashboardStats({
          resume_score: summary.stats.resume_score ?? 0,
          jobs_applied: summary.stats.jobs_applied ?? 0,
          interviews: summary.stats.interviews ?? 0,
          response_rate: summary.stats.response_rate ?? '0%',
          daily_applied_count: summary.stats.daily_applied_count ?? 0,
          daily_goal_target: summary.stats.daily_goal_target ?? 5,
          daily_goal_met: summary.stats.daily_goal_met ?? false,
        });
      }

      if (!profile?.target_roles?.length || profile.target_roles[0] === "") {
        setShowOnboarding(true);
      }

      // Silently prefetch jobs in background so /jobs loads instantly.
      // Must use notificationService (localStorage) — same source Jobs uses for its query.
      const role = notificationService.getPrefs().targetRole || profile?.target_roles?.[0];
      if (role) prefetchJobs(role);

      if (summary?.recommended_jobs) setRecommendedJobs(summary.recommended_jobs);
      if (summary?.chart_data) setChartData(summary.chart_data);
    } catch (err) {
      console.error("Failed to load dashboard summary:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const navigateToJobs = useCallback(() => {
    if (checkReady()) navigate("/jobs");
  }, [checkReady, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fallback: if activeResume loads after the profile fetch, ensure prefetch still fires
  useEffect(() => {
    const role = activeResume?.targetJobRole || notificationService.getPrefs().targetRole;
    if (role) prefetchJobs(role);
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

  // Build heatmap days: index 0 = HEATMAP_DAYS-1 days ago, last index = today
  const heatmapCells = chartData.length > 0
    ? chartData
    : Array(HEATMAP_DAYS).fill(0);

  const today = new Date();
  const getDateLabel = (index: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (heatmapCells.length - 1 - index));
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#050811] text-white selection:bg-teal-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[1000px] h-[600px] rounded-full bg-violet-600/5 blur-[160px] animate-pulse" />
        <div className="absolute bottom-1/4 right-0 w-[800px] h-[800px] rounded-full bg-teal-500/5 blur-[160px] animate-pulse [animation-delay:2s]" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-[1400px]">

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 px-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-teal-500/50" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-400">
                  Career Intelligence Center
                </span>
              </div>
              <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.9] mb-4 bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
                Command Center
              </h1>
              <p className="text-lg font-medium text-slate-400 max-w-sm leading-relaxed">
                Your job search progress and activity at a glance.
              </p>
            </motion.div>

            {userEmail && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 bg-white/[0.03] backdrop-blur-md border border-white/[0.08] p-2 rounded-[22px]"
              >
                <div className="h-10 w-10 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center ml-2">
                  <ShieldCheck className="h-5 w-5 text-teal-400" />
                </div>
                <div className="pr-4 border-l border-white/10 pl-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Signed in as</p>
                  <p className="text-sm font-bold text-white truncate max-w-[180px]">{userEmail}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {loading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard
                  label="Resume Strength"
                  value={`${dashboardStats.resume_score}%`}
                  icon={Target}
                />
                <StatCard
                  label="Interviews"
                  value={dashboardStats.interviews}
                  subtext="scheduled"
                  icon={Users}
                />
                <StatCard
                  label="Total Applied"
                  value={dashboardStats.jobs_applied}
                  subtext="jobs"
                  icon={Briefcase}
                />
                <StatCard
                  label="Response Rate"
                  value={dashboardStats.response_rate}
                  icon={BarChart2}
                  className="bg-indigo-500/5 border-indigo-500/20"
                />
              </>
            )}
          </div>

          {/* Main Content Layout */}
          <div className="grid lg:grid-cols-12 gap-8">

            {/* Left: Activity & Applications (8 cols) */}
            <div className="lg:col-span-8 space-y-8">

              {/* Activity Heatmap */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[32px] overflow-hidden"
              >
                <div className="p-8 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                      <Zap className="h-5 w-5 text-teal-400" />
                      Application Activity
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Your activity over the last 30 days</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="h-10 rounded-xl px-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white border border-white/5"
                    onClick={() => setShowActivityDetails(true)}
                  >
                    View History
                  </Button>
                </div>

                <div className="px-8 pb-8">
                  <div className="flex flex-wrap gap-2 mt-8">
                    {heatmapCells.map((count, i) => {
                      const intensity = Math.min(count / 2, 1);
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.01 }}
                          className={cn(
                            "h-8 w-8 rounded-lg transition-all duration-500 relative group cursor-pointer border border-white/[0.05]",
                            count > 0
                              ? "bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                              : "bg-white/[0.03] hover:bg-white/[0.06]"
                          )}
                          style={{
                            opacity: count > 0 ? 0.3 + intensity * 0.7 : 1,
                          }}
                        >
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white text-[#050811] text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                            {getDateLabel(i)}: {count} application{count !== 1 ? 's' : ''}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-6 text-[11px] font-black uppercase tracking-widest text-slate-600">
                    <span>30 Days Ago</span>
                    <span>Today</span>
                  </div>
                </div>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Daily Mission */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[32px] p-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                      <Target className="h-5 w-5 text-orange-400" />
                      Daily Mission
                    </h3>
                    <div className="h-10 w-10 rounded-full border-2 border-teal-500/20 flex items-center justify-center">
                      <span className="text-xs font-black text-teal-400 leading-none">
                        {Math.round(progressPct)}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {dailyMissionTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        whileHover={{ scale: 1.02 }}
                        className={cn(
                          "flex items-center gap-4 rounded-2xl px-5 py-4 border transition-all cursor-default",
                          task.completed
                            ? "bg-teal-500/5 border-teal-500/10 opacity-60"
                            : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                        )}
                      >
                        <div className={cn(
                          "h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0",
                          task.completed
                            ? "bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                            : "bg-white/[0.06] border border-white/10"
                        )}>
                          <CheckCircle2 className={cn("h-3.5 w-3.5", task.completed ? "text-[#050811]" : "text-slate-600")} />
                        </div>
                        <span className={cn(
                          "text-[13px] font-bold tracking-tight",
                          task.completed ? "text-slate-500 line-through" : "text-white"
                        )}>
                          {task.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* AI Insights */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[32px] p-8 overflow-hidden relative group"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                    <Sparkles className="h-32 w-32 text-teal-500" />
                  </div>

                  <h3 className="text-xl font-black tracking-tight text-white mb-2 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-teal-400" />
                    AI Insights
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-8">Tips to improve your job search</p>

                  <div className="space-y-4 relative z-10">
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                      <p className="text-xs font-black text-teal-500 uppercase mb-2">Resume Tip</p>
                      <p className="text-sm font-bold text-slate-200">Keep your resume updated with your latest skills and experience to improve match scores.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                      <p className="text-xs font-black text-orange-400 uppercase mb-2">Search Tip</p>
                      <p className="text-sm font-bold text-slate-200">Apply consistently — candidates who apply daily get 3x more responses than those who apply in bursts.</p>
                    </div>
                    <Button
                      className="w-full h-12 rounded-xl bg-teal-500 text-[#050811] font-black uppercase text-xs tracking-widest hover:bg-teal-400 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                      onClick={() => navigate("/ai-mentor")}
                    >
                      Open AI Mentor
                    </Button>
                  </div>
                </motion.div>
              </div>

              {/* Recommended Jobs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[32px] p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                      <Search className="h-5 w-5 text-teal-400" />
                      Recommended Jobs
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">Matched to your profile and target roles</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="h-10 rounded-xl px-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white gap-2 border border-white/5"
                    onClick={() => navigateToJobs()}
                  >
                    Browse All
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {loading ? (
                  <div className="grid sm:grid-cols-2 gap-4 animate-pulse">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
                        <div className="flex justify-between mb-3">
                          <div className="h-4 w-32 bg-white/[0.08] rounded" />
                          <div className="h-5 w-12 bg-teal-500/10 rounded-lg" />
                        </div>
                        <div className="h-3 w-24 bg-white/[0.06] rounded mb-3" />
                        <div className="h-3 w-20 bg-white/[0.04] rounded" />
                      </div>
                    ))}
                  </div>
                ) : recommendedJobs.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {recommendedJobs.slice(0, 6).map((job, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.02, borderColor: "rgba(20,184,166,0.3)" }}
                        className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 cursor-pointer group transition-all"
                        onClick={() => navigateToJobs()}
                      >
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <p className="text-sm font-black text-white uppercase group-hover:text-teal-400 transition-colors leading-tight">{job.title}</p>
                          <span className="shrink-0 text-[10px] font-black text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-lg">
                            {job.match}%
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter opacity-70 mb-3">{job.company}</p>
                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-3xl">
                    <Briefcase className="h-10 w-10 text-slate-800 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-500 mb-1">No recommendations yet</p>
                    <p className="text-xs text-slate-600 mb-4">Complete your profile to get personalized job matches.</p>
                    <Button onClick={() => navigateToJobs()} variant="link" className="text-teal-500 font-black uppercase text-[11px] tracking-widest">Browse Jobs</Button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right: Actions & Status (4 cols) */}
            <div className="lg:col-span-4 space-y-8">

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-[32px] p-8 shadow-[0_20px_50px_rgba(20,184,166,0.2)] text-[#050811] relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/20 rounded-full blur-3xl" />

                <h3 className="text-2xl font-black tracking-tighter uppercase mb-2 relative z-10">Quick Actions</h3>
                <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-8 relative z-10">Get things done fast</p>

                <div className="space-y-3 relative z-10">
                  <Button
                    className="w-full h-14 rounded-2xl bg-[#050811] text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-[#0a0f1e] group"
                    onClick={() => hasFeature("auto_apply_access") ? setShowAutoApply(true) : navigate("/plans")}
                  >
                    <Zap className="h-4 w-4 mr-3 text-teal-400 group-hover:animate-pulse" />
                    Launch Auto-Apply
                  </Button>
                  <Button
                    className="w-full h-14 rounded-2xl bg-white/20 hover:bg-white/30 text-[#050811] font-black uppercase text-xs tracking-[0.2em] border-transparent"
                    onClick={() => navigate("/resume")}
                  >
                    <FileText className="h-4 w-4 mr-3" />
                    View Resume
                  </Button>
                </div>
              </motion.div>

              {/* Status Board */}
              <motion.div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[32px] p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black tracking-tighter uppercase text-white">Status Board</h3>
                  <ShieldCheck className="h-5 w-5 text-teal-400" />
                </div>

                <div className="space-y-4">
                  <div
                    className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between group cursor-pointer hover:bg-white/[0.06] transition-all"
                    onClick={() => navigate("/plans")}
                  >
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Active Plan</p>
                      <p className="text-sm font-black text-white">{subscriptionSummary?.plan?.name ?? "Free Tier"}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-white transition-all" />
                  </div>

                  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-4">Feature Usage</p>
                    {loadingSummary ? (
                      <div className="space-y-4 animate-pulse">
                        {[1, 2, 3].map(i => (
                          <div key={i}>
                            <div className="flex justify-between mb-1.5">
                              <div className="h-3 w-24 bg-white/[0.06] rounded" />
                              <div className="h-3 w-10 bg-white/[0.06] rounded" />
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {subscriptionSummary?.current_usage?.slice(0, 3).map(item => {
                          const featureLabels: Record<string, string> = {
                            auto_apply_access: "Auto Apply",
                            ats_optimizer_access: "ATS Optimizer",
                            text_interview_access: "Interview Practice",
                            video_interview_access: "Video Interview",
                            resume_builder_access: "Resume Builder",
                            career_insights_access: "Career Insights",
                          };
                          const label = featureLabels[item.feature_key] ?? item.feature_key.replace(/_access$/, '').replace(/_/g, ' ');
                          const pct = item.is_unlimited ? 100 : (item.used_count / item.limit) * 100;
                          return (
                            <div key={item.feature_key}>
                              <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1.5 uppercase">
                                <span>{label}</span>
                                <span>{item.is_unlimited ? '∞' : `${item.used_count}/${item.limit}`}</span>
                              </div>
                              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  className="h-full bg-white/20 rounded-full"
                                />
                              </div>
                            </div>
                          );
                        }) ?? (
                          <p className="text-xs text-slate-600 font-bold">No usage data</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
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
        onOpenChange={setShowOnboarding}
        onComplete={() => {
          loadData();
        }}
      />
    </div>
  );
}
