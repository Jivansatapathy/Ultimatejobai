import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import {
  TrendingUp,
  FileText,
  Briefcase,
  Send,
  Target,
  CheckCircle2,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useResume } from "@/hooks/useResume";
import { ActivityDetailsDialog } from "@/components/dashboard/ActivityDetailsDialog";
import { AutoApplySettingsSheet } from "@/components/dashboard/AutoApplySettingsSheet";
import { AtsOptimizerDialog } from "@/components/dashboard/AtsOptimizerDialog";
import { activityService, ActivityLog } from "@/services/activityService";
import { useEffect } from "react";

const stats = [
  {
    label: "Resume Score",
    value: "94",
    change: "+12%",
    icon: Target,
    color: "text-success",
  },
  {
    label: "Jobs Applied",
    value: "127",
    change: "+23 this week",
    icon: Briefcase,
    color: "text-foreground",
  },
  {
    label: "Interviews",
    value: "23",
    change: "+5 pending",
    icon: Calendar,
    color: "text-foreground",
  },
  {
    label: "Response Rate",
    value: "32%",
    change: "+8% vs avg",
    icon: TrendingUp,
    color: "text-accent",
  },
];

// Mock data for initial refernce - will be replaced by API calls
const mockRecentActivity = [
  { type: "applied", company: "TechCorp", role: "Senior Developer", time: "2 hours ago", status: "pending" },
  { type: "interview", company: "StartupXYZ", role: "Lead Engineer", time: "Yesterday", status: "scheduled" },
  { type: "applied", company: "BigTech Inc", role: "Staff Engineer", time: "2 days ago", status: "viewed" },
  { type: "offer", company: "InnovateCo", role: "Principal Dev", time: "3 days ago", status: "received" },
];

const recommendedJobs = [
  { title: "Senior Full-Stack Engineer", company: "Meta", location: "Remote", match: 94 },
  { title: "Staff Software Engineer", company: "Stripe", location: "San Francisco, CA", match: 91 },
  { title: "Principal Engineer", company: "Vercel", location: "Remote", match: 89 },
  { title: "Senior React Developer", company: "Airbnb", location: "Remote", match: 88 },
  { title: "Frontend Lead", company: "Netflix", location: "Los Gatos, CA", match: 85 },
];


export default function Dashboard() {
  const { activeResume } = useResume();
  const [showActivityDetails, setShowActivityDetails] = useState(false);
  const [showAutoApply, setShowAutoApply] = useState(false);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [history, setHistory] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
       try {
         const data = await activityService.getUserHistory();
         setHistory(data);
       } catch (err) {
         console.error("Failed to load history:", err);
       }
    };
    loadHistory();
  }, []);

  const score = activeResume?.score || 94; // fallback to 94 if none exists

  const stats = [
    {
      label: "Resume Score",
      value: score.toString(),
      change: score > 90 ? "Excellent" : "+12%",
      icon: Target,
      color: "text-success",
    },
    {
      label: "Jobs Applied",
      value: "127",
      change: "+23 this week",
      icon: Briefcase,
      color: "text-foreground",
    },
    {
      label: "Interviews",
      value: "23",
      change: "+5 pending",
      icon: Calendar,
      color: "text-foreground",
    },
    {
      label: "Response Rate",
      value: "32%",
      change: "+8% vs avg",
      icon: TrendingUp,
      color: "text-accent",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Career Command Center</h1>
            <p className="text-muted-foreground">Track your progress and optimize your job search</p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="stat-card group">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <stat.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="text-xs text-success">
                    {stat.change}
                  </span>
                </div>
                <p className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 glass-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Application Activity</h2>
                  <p className="text-sm text-muted-foreground">Last 30 days</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowActivityDetails(true)}
                >
                  <BarChart3 className="h-4 w-4" />
                  View Details
                </Button>
              </div>

              <div className="h-48 flex items-end gap-1">
                {Array.from({ length: 30 }).map((_, i) => {
                  const height = Math.random() * 80 + 20;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-primary rounded-t transition-all duration-300 hover:bg-accent cursor-pointer"
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>

              <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                <span>30 days ago</span>
                <span>Today</span>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/resume">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <FileText className="h-4 w-4" />
                    Update Resume
                  </Button>
                </Link>
                <Link to="/jobs">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <Briefcase className="h-4 w-4" />
                    Browse Jobs
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => setShowAutoApply(true)}
                >
                  <Send className="h-4 w-4" />
                  Auto-Apply Settings
                </Button>
                <Link to="/insights">
                  <Button variant="outline" className="w-full justify-start gap-3 bg-accent/5 border-accent/20">
                    <Sparkles className="h-4 w-4 text-accent" />
                    Career Insights
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => setShowOptimizer(true)}
                >
                  <Target className="h-4 w-4" />
                  ATS Optimizer
                </Button>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Recent Activity</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActivityDetails(true)}
                >
                  View All
                </Button>
              </div>

              <div className="space-y-4">
                {history.length > 0 ? history.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-colors">
                    <div className={`p-2 rounded-lg bg-secondary`}>
                      {activity.activity_type === 'CAREER_ADVICE' ? (
                        <Sparkles className="h-4 w-4 text-accent" />
                      ) : activity.activity_type === 'INTERVIEW' ? (
                        <Calendar className="h-4 w-4 text-foreground" />
                      ) : activity.activity_type === 'CAREER_INSIGHT' ? (
                        <BarChart3 className="h-4 w-4 text-success" />
                      ) : (
                        <Send className="h-4 w-4 text-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.activity_type.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{activity.description}</p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                       <p className="text-[10px] text-muted-foreground">
                         {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : 'Just now'}
                       </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No recent activity found.
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recommended Jobs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Top Matches</h2>
                <Link to="/jobs">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {recommendedJobs.map((job, index) => (
                  <div key={index} className="p-3 rounded-lg border border-border hover:border-accent/30 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{job.title}</p>
                        <p className="text-xs text-muted-foreground">{job.company}</p>
                      </div>
                      <span className="text-xs font-medium text-success">{job.match}% match</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{job.location}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <ActivityDetailsDialog
        open={showActivityDetails}
        onOpenChange={setShowActivityDetails}
      />
      <AutoApplySettingsSheet
        open={showAutoApply}
        onOpenChange={setShowAutoApply}
      />
      <AtsOptimizerDialog
        open={showOptimizer}
        onOpenChange={setShowOptimizer}
      />
    </div>
  );
}

