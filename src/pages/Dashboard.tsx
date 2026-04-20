import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
  MapPin,
  TrendingUp,
  Zap,
  Clock,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useResume } from "@/hooks/useResume";
import { ActivityDetailsDialog } from "@/components/dashboard/ActivityDetailsDialog";
import { AutoApplySettingsSheet } from "@/components/dashboard/AutoApplySettingsSheet";
import { AtsOptimizerDialog } from "@/components/dashboard/AtsOptimizerDialog";
import { DailyGoalModal } from "@/components/dashboard/DailyGoalModal";
import { OnboardingModal } from "@/components/dashboard/OnboardingModal";
import { activityService, ActivityLog } from "@/services/activityService";
import { careerService, CareerProfile } from "@/services/careerService";
import { autoApplyService } from "@/services/autoApplyService";
import type { ApplicationHistoryItem } from "@/services/autoApplyService";
import { useSubscription } from "@/context/SubscriptionContext";
import { buildDailyMissionTasks, readDailyMissionManualTaskIds } from "@/components/dashboard/dailyMission";
import { cn } from "@/lib/utils";

const StatCard = ({ label, value, subtext, icon: Icon, trend, className }: any) => (
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
      {trend && (
        <span className="flex items-center gap-1 text-[10px] font-black text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
          <TrendingUp className="h-3 w-3" />
          {trend}
        </span>
      )}
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeResume } = useResume();
  const [showActivityDetails, setShowActivityDetails] = useState(false);
  const [showAutoApply, setShowAutoApply] = useState(false);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [history, setHistory] = useState<ActivityLog[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<ApplicationHistoryItem[]>([]);
  const { summary: subscriptionSummary, hasFeature } = useSubscription();
  const [manualDailyTaskIds, setManualDailyTaskIds] = useState<number[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    resume_score: 85,
    jobs_applied: 0,
    interviews: 0,
    response_rate: '0%',
    daily_applied_count: 0,
    daily_goal_target: 5,
    daily_goal_met: false,
    hiring_velocity: 'High',
    market_readiness: '88%',
    market_impact: '92.4'
  });
  const [chartData, setChartData] = useState<number[]>([]);

  useEffect(() => {
    const loadData = async () => {
       try {
         const summary = await activityService.getDashboardSummary();
         const historyResponse = await autoApplyService.getHistory();
         const profile = await careerService.getProfile();
         
         if (summary?.stats) {
           setDashboardStats(prev => ({
             ...prev,
             ...summary.stats
           }));
         }

         if (!profile?.target_roles?.length || profile.target_roles[0] === "") {
           setShowOnboarding(true);
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

  const maxCount = Math.max(...chartData, 5);
  const dailyMissionTasks = buildDailyMissionTasks(
    dashboardStats.daily_applied_count,
    dashboardStats.daily_goal_target,
    manualDailyTaskIds,
  );

  const progressPct = (dashboardStats.daily_applied_count / dashboardStats.daily_goal_target) * 100;

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
          
          {/* Header Briefing */}
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
                Strategic oversight of your professional trajectory and market impact.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 bg-white/[0.03] backdrop-blur-md border border-white/[0.08] p-2 rounded-[22px]"
            >
              <div className="flex -space-x-3 px-2">
                {[1,2,3].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-[#050811] bg-teal-500/10 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-teal-400" />
                  </div>
                ))}
              </div>
              <div className="pr-4 border-l border-white/10 pl-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Ready</p>
                <p className="text-sm font-bold text-white">Verified Profile</p>
              </div>
            </motion.div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <StatCard 
              label="Resume Strength" 
              value={`${dashboardStats.resume_score}%`} 
              icon={Target} 
              trend="+2% this week"
            />
            <StatCard 
              label="Market Velocity" 
              value={dashboardStats.hiring_velocity} 
              icon={Zap} 
              trend="Peak season"
            />
            <StatCard 
              label="Active Pipeline" 
              value={dashboardStats.jobs_applied} 
              subtext="Applied"
              icon={Briefcase} 
            />
            <StatCard 
              label="Market Impact" 
              value={dashboardStats.market_impact} 
              icon={TrendingUp} 
              trend="Institutional grade"
              className="bg-indigo-500/5 border-indigo-500/20"
            />
          </div>

          {/* Main Content Layout */}
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left: Performance & Activity (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Activity Pulse Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[32px] overflow-hidden"
              >
                <div className="p-8 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                      <Zap className="h-5 w-5 text-teal-400" />
                      Deployment Heatmap
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Strategic consistency over the last deployment cycle</p>
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
                    {(chartData.length > 0 ? chartData : Array(30).fill(0)).map((count, i) => {
                      const intensity = Math.min(count / 2, 1); // Normalize visibility
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
                            opacity: count > 0 ? 0.3 + (intensity * 0.7) : 1
                          }}
                        >
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white text-[#050811] text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                            Cycle {i + 1}: {count} Actions
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-6 text-[11px] font-black uppercase tracking-widest text-slate-600">
                    <span>Initiation (30d)</span>
                    <span>Current Vector</span>
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
                          task.completed ? "bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]" : "bg-white/[0.06] border border-white/10"
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

                {/* Intelligence Feed */}
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
                    Strategy Insights
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-8">AI-driven optimizations for your search</p>

                  <div className="space-y-4 relative z-10">
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                      <p className="text-xs font-black text-teal-500 uppercase mb-2">Resume Insight</p>
                      <p className="text-sm font-bold text-slate-200">System architecture keywords are missing from your technical stack. Impact: -12% SEO potential.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                      <p className="text-xs font-black text-orange-400 uppercase mb-2">Market Action</p>
                      <p className="text-sm font-bold text-slate-200">High hiring volume detected for 'Senior Architect' roles in NYC. Suggest deploying updated resume.</p>
                    </div>
                    <Button 
                      className="w-full h-12 rounded-xl bg-teal-500 text-[#050811] font-black uppercase text-xs tracking-widest hover:bg-teal-400 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                      onClick={() => navigate("/ai-mentor")}
                    >
                      Enter Strategy Room
                    </Button>
                  </div>
                </motion.div>
              </div>

              {/* Archive Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[32px] p-8"
              >
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-white">Application Pipeline</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">Real-time status tracking of all active deployments</p>
                  </div>
                  <Link to="/applications">
                    <Button variant="ghost" className="h-10 rounded-xl px-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white gap-2 border border-white/5">
                      Open Full Ledger
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-1">
                  {recentApplications.slice(0, 5).map((app) => (
                    <motion.div 
                      key={app.id} 
                      whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.04)" }}
                      className="flex items-center gap-6 p-4 rounded-2xl border border-transparent hover:border-white/10 transition-all group"
                    >
                      <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-teal-500/30 transition-all">
                        <Briefcase className="h-5 w-5 text-slate-500 group-hover:text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-black text-white hover:text-teal-400 cursor-pointer transition-colors uppercase truncate">
                            {app.job_title}
                          </p>
                          {app.match_score > 80 && (
                            <span className="h-1.5 w-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-bold tracking-tight uppercase opacity-60">{app.company}</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-2">
                        {app.match_score && (
                          <div className="text-right pr-4 border-r border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Match</p>
                            <p className="text-xs font-black text-teal-400">{app.match_score}%</p>
                          </div>
                        )}
                        <div className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10">
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">{app.status}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {recentApplications.length === 0 && (
                    <div className="py-20 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-3xl">
                      <Clock className="h-10 w-10 text-slate-800 mx-auto mb-4" />
                      <p className="text-sm font-bold text-slate-500">Awaiting your first application...</p>
                      <Button onClick={() => navigate("/jobs")} variant="link" className="text-teal-500 font-black uppercase text-[11px] tracking-widest mt-2">Browse Jobs Now</Button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right: Personalization & Meta (4 cols) */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Quick Navigation / Deployment Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-[32px] p-8 shadow-[0_20px_50px_rgba(20,184,166,0.2)] text-[#050811] relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
                
                <h3 className="text-2xl font-black tracking-tighter uppercase mb-2 relative z-10">Deployment Zone</h3>
                <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-8 relative z-10">Instant Career Operations</p>
                
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
                    Review Blueprint
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
                  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between group cursor-pointer hover:bg-white/[0.06] transition-all">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Active Plan</p>
                      <p className="text-sm font-black text-white">{subscriptionSummary?.plan?.name || "Free Tier"}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-white transition-all" />
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-4">Quota Utilization</p>
                    <div className="space-y-4">
                      {subscriptionSummary?.current_usage?.slice(0, 3).map(item => (
                        <div key={item.feature_key}>
                          <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1.5 uppercase">
                            <span>{item.feature_key.replace(/_/g, ' ')}</span>
                            <span>{item.is_unlimited ? '∞' : `${item.used_count}/${item.limit}`}</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: item.is_unlimited ? '100%' : `${(item.used_count / item.limit) * 100}%` }}
                              className="h-full bg-white/20 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recommended Vector */}
              <motion.div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[32px] p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black tracking-tighter uppercase text-white">Top Recommendations</h3>
                  <Button variant="ghost" size="icon" className="group" onClick={() => navigate("/jobs")}>
                    <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {recommendedJobs.length > 0 ? recommendedJobs.slice(0, 3).map((job, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-teal-500/30 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-black text-white uppercase truncate group-hover:text-teal-400 transition-colors">{job.title}</p>
                        <span className="text-[10px] font-black text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-lg">{job.match}%</span>
                      </div>
                      <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-tighter opacity-60">{job.company}</p>
                      <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="py-10 text-center opacity-40">
                      <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-10" />
                      <p className="text-xs font-black uppercase tracking-widest">Awaiting match vector...</p>
                    </div>
                  )}
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </main>

      {/* Overlays / Dialogs */}
      <AnimatePresence>
        {showActivityDetails && <ActivityDetailsDialog open={showActivityDetails} onOpenChange={setShowActivityDetails} />}
      </AnimatePresence>
      <AutoApplySettingsSheet open={showAutoApply} onOpenChange={setShowAutoApply} />
      <AtsOptimizerDialog open={showOptimizer} onOpenChange={setShowOptimizer} />
      <DailyGoalModal
        currentCount={dashboardStats.daily_applied_count}
        targetCount={dashboardStats.daily_goal_target}
        onTasksChange={setManualDailyTaskIds}
      />
      <OnboardingModal 
        open={showOnboarding} 
        onOpenChange={setShowOnboarding} 
        onComplete={(role) => {
          // You could trigger a refresh here if needed
          setDashboardStats(prev => ({ ...prev, hiring_velocity: 'Calibrating...' }));
        }}
      />
    </div>
  );
}
