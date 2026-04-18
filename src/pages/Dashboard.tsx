import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import {
  FileText,
  Briefcase,
  Send,
  CheckCircle2,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Sparkles,
  ShieldCheck,
  Eye,
  Settings,
  FileDown,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useResume } from "@/hooks/useResume";
import { ActivityDetailsDialog } from "@/components/dashboard/ActivityDetailsDialog";
import { AutoApplySettingsSheet } from "@/components/dashboard/AutoApplySettingsSheet";
import { AtsOptimizerDialog } from "@/components/dashboard/AtsOptimizerDialog";
import { DailyGoalModal } from "@/components/dashboard/DailyGoalModal";
import { activityService, ActivityLog } from "@/services/activityService";
import { autoApplyService } from "@/services/autoApplyService";
import type { ApplicationHistoryItem } from "@/services/autoApplyService";
import { useEffect } from "react";
import { useSubscription } from "@/context/SubscriptionContext";
import { buildDailyMissionTasks, readDailyMissionManualTaskIds } from "@/components/dashboard/dailyMission";

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeResume, resumes } = useResume();
  const [showActivityDetails, setShowActivityDetails] = useState(false);
  const [showAutoApply, setShowAutoApply] = useState(false);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [history, setHistory] = useState<ActivityLog[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<ApplicationHistoryItem[]>([]);
  const { summary: subscriptionSummary } = useSubscription();
  const [manualDailyTaskIds, setManualDailyTaskIds] = useState<number[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    resume_score: 0,
    jobs_applied: 0,
    interviews: 0,
    response_rate: '0%',
    daily_applied_count: 0,
    daily_goal_target: 5,
    daily_goal_met: false
  });
  const [chartData, setChartData] = useState<number[]>([]);

  useEffect(() => {
    const loadData = async () => {
       try {
         const summary = await activityService.getDashboardSummary();
         const historyResponse = await autoApplyService.getHistory();
         
         if (summary?.stats) {
           setDashboardStats(prev => ({
             ...prev,
             ...summary.stats
           }));
         }
         
         if (summary?.recent_activity) setHistory(summary.recent_activity);
         if (summary?.recommended_jobs) setRecommendedJobs(summary.recommended_jobs);
         if (summary?.chart_data) setChartData(summary.chart_data);
         
         setRecentApplications(Array.isArray(historyResponse?.applications) ? historyResponse.applications : []);
       } catch (err) {
         console.error("Failed to load dashboard summary:", err);
       }
    };
    loadData();
  }, []);

  useEffect(() => {
    setManualDailyTaskIds(readDailyMissionManualTaskIds());
  }, []);

  const { hasFeature } = useSubscription();

  const maxCount = Math.max(...chartData, 5);
  const dailyMissionTasks = buildDailyMissionTasks(
    dashboardStats.daily_applied_count,
    dashboardStats.daily_goal_target,
    manualDailyTaskIds,
  );

  const progressPct = (dashboardStats.daily_applied_count / dashboardStats.daily_goal_target) * 100;

  return (
    <div className="min-h-screen" style={{ background: "#f9f9f8" }}>
      <Navbar />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">

          {/* ── Page Header ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-12 text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Overview
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-3">
              Career Dashboard
            </h1>
            <p className="text-base text-gray-400 max-w-md mx-auto">
              Your job search progress at a glance.
            </p>
          </motion.div>


          {/* ── Main Grid ────────────────────────────────────── */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Activity Chart – 2 col */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.4 }}
              className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Application Activity</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Last 30 days</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setShowActivityDetails(true)}
                >
                  <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                  History
                </Button>
              </div>

              <div className="h-40 flex items-end gap-1">
                {chartData.length > 0 ? chartData.map((count, i) => {
                  const height = (count / maxCount) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t-md transition-all duration-300 cursor-pointer hover:opacity-70 min-h-[3px]"
                      style={{ height: `${Math.max(height, 4)}%`, backgroundColor: "#d1d5db" }}
                      title={`${count} activities`}
                    />
                  );
                }) : (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-xs text-gray-400">No activity data yet</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-3 text-[11px] text-gray-400 font-medium">
                <span>30 days ago</span>
                <span>Today</span>
              </div>
            </motion.div>

            {/* Quick Actions – 1 col */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
            >
              <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  {
                    icon: FileText,
                    label: "Update Resume",
                    locked: !hasFeature("resume_builder_access"),
                    href: hasFeature("resume_builder_access") ? "/resume" : "/plans"
                  },
                  {
                    icon: Briefcase,
                    label: "Browse Jobs",
                    locked: false,
                    href: "/jobs"
                  },
                  {
                    icon: Send,
                    label: "Auto-Apply",
                    locked: !hasFeature("auto_apply_access"),
                    onClick: () => hasFeature("auto_apply_access") ? setShowAutoApply(true) : navigate("/plans")
                  },
                  {
                    icon: Sparkles,
                    label: "Strategy Insights",
                    locked: !hasFeature("career_insights_access"),
                    href: hasFeature("career_insights_access") ? "/ai-mentor" : "/plans"
                  },
                ].map((action, i) => {
                  const inner = (
                    <button
                      key={i}
                      onClick={action.onClick}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                        ${action.locked
                          ? "text-gray-400 bg-gray-50/60 cursor-pointer"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0
                        ${action.locked ? "bg-gray-100" : "bg-gray-100"}`}>
                        <action.icon className={`h-3.5 w-3.5 ${action.locked ? "text-gray-300" : "text-gray-500"}`} />
                      </div>
                      <span className="flex-1">{action.label}</span>
                      {action.locked
                        ? <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">Pro</span>
                        : <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                      }
                    </button>
                  );
                  return action.href ? (
                    <Link to={action.href} key={i}>{inner}</Link>
                  ) : inner;
                })}
              </div>
            </motion.div>

            {/* Daily Progress – 2 col */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.4 }}
              className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Daily Progress</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {dashboardStats.daily_applied_count} of {dashboardStats.daily_goal_target} applications today
                  </p>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {dashboardStats.daily_applied_count}
                  <span className="text-sm text-gray-400 font-medium ml-1">/ {dashboardStats.daily_goal_target}</span>
                </span>
              </div>

              <Progress
                value={progressPct}
                className="h-2 bg-gray-100 [&>div]:bg-gray-800 mb-6 rounded-full"
              />

              <div className="grid sm:grid-cols-2 gap-3">
                {dailyMissionTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-all
                      ${task.completed
                        ? "bg-gray-50 border-gray-100"
                        : "bg-white border-gray-100"
                      }`}
                  >
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0
                      ${task.completed ? "bg-gray-800" : "bg-gray-100"}`}>
                      <CheckCircle2 className={`h-3 w-3 ${task.completed ? "text-white" : "text-gray-300"}`} />
                    </div>
                    <span className={`text-xs font-medium ${task.completed ? "text-gray-500 line-through" : "text-gray-700"}`}>
                      {task.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Active Plan / Tier – 1 col */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, duration: 0.4 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Your Plan</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Usage summary</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-gray-500" />
                </div>
              </div>

              {subscriptionSummary?.plan ? (
                <div className="space-y-3">
                  <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{subscriptionSummary.plan.name}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5 capitalize">{subscriptionSummary.status}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {subscriptionSummary.plan.price_display || "Active"}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {subscriptionSummary.current_usage.slice(0, 4).map((item) => (
                      <div key={item.feature_key} className="flex items-center justify-between py-1.5">
                        <p className="text-xs text-gray-500 capitalize">{item.feature_key.replace(/_/g, " ")}</p>
                        <p className="text-xs font-semibold text-gray-800">
                          {item.is_unlimited ? "Unlimited" : `${item.used_count} / ${item.limit}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">
                  <p className="text-xs text-gray-400 mb-3">No active subscription</p>
                  <Link to="/plans">
                    <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs font-medium border-gray-200 text-gray-600 hover:bg-gray-50">
                      See Plans
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Recent Activity – 2 col */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Your last few actions</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setShowActivityDetails(true)}
                >
                  View All
                </Button>
              </div>

              <div className="space-y-1">
                {history.length > 0 ? history.slice(0, 5).map((activity, index) => {
                  const Icon = activity.activity_type === 'CAREER_ADVICE' ? Sparkles
                             : activity.activity_type === 'INTERVIEW' ? Calendar
                             : activity.activity_type === 'CAREER_INSIGHT' ? BarChart3
                             : activity.activity_type === 'PAGE_VIEW' ? Eye
                             : activity.activity_type === 'SETTINGS' ? Settings
                             : activity.activity_type === 'RESUME_EDIT' ? FileText
                             : Send;

                  return (
                    <div key={index} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all group cursor-default">
                      <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 leading-none mb-0.5">
                          {activity.activity_type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{activity.description}</p>
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                        {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                      </p>
                    </div>
                  );
                }) : (
                  <div className="py-10 text-center">
                    <p className="text-sm text-gray-400">No activity yet. Start by applying to a job.</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recommended Jobs – 1 col */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34, duration: 0.4 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Recommended</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Matched for you</p>
                </div>
                <Link to="/jobs">
                  <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50">
                    See All
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {recommendedJobs.length > 0 ? recommendedJobs.slice(0, 3).map((job, index) => (
                  <div key={index} className="rounded-xl border border-gray-100 px-4 py-3 hover:bg-gray-50 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate leading-snug group-hover:text-gray-700">{job.title}</p>
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg ml-2 flex-shrink-0">{job.match}%</span>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">{job.company}</p>
                    <p className="text-[11px] text-gray-300 mt-1">{job.location}</p>
                  </div>
                )) : (
                  <div className="py-8 text-center">
                    <p className="text-xs text-gray-400">Recommendations load after your first application.</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Applications – full width */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.4 }}
              className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Recent Applications</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Your applied positions</p>
                </div>
                <Link to="/applications">
                  <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 gap-1">
                    View All
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {recentApplications.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {recentApplications.slice(0, 5).map((application) => (
                    <div key={application.id} className="flex items-center gap-4 py-3 group">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{application.job_title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{application.company}</p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {application.pipeline_status && (
                          <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                            ATS: {application.pipeline_status}
                          </span>
                        )}
                        {typeof application.match_score === "number" && (
                          <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                            {application.match_score}% match
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg capitalize">
                          {application.status}
                        </span>
                      </div>

                      <div className="text-right text-[11px] text-gray-400 min-w-[80px]">
                        <p>{application.created_at ? new Date(application.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently"}</p>
                        {application.selected_resume_link && (
                          <a
                            href={application.selected_resume_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-800 mt-0.5"
                          >
                            <FileDown className="h-3 w-3" />
                            Resume
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 px-6 py-8 text-center">
                  <p className="text-sm text-gray-400">Your applied jobs will appear here.</p>
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </main>

      <ActivityDetailsDialog open={showActivityDetails} onOpenChange={setShowActivityDetails} />
      <AutoApplySettingsSheet open={showAutoApply} onOpenChange={setShowAutoApply} />
      <AtsOptimizerDialog open={showOptimizer} onOpenChange={setShowOptimizer} />
      <DailyGoalModal
        currentCount={dashboardStats.daily_applied_count}
        targetCount={dashboardStats.daily_goal_target}
        onTasksChange={setManualDailyTaskIds}
      />
    </div>
  );
}
