import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  BriefcaseBusiness, Building2, Clock, ExternalLink, FileText,
  Sparkles, TrendingUp, UserRoundCheck, Users, ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ActivityFeed } from "@/components/employer/ActivityFeed";
import { AnalyticsChart } from "@/components/employer/AnalyticsChart";
import { EmptyState } from "@/components/employer/EmptyState";
import { LoadingState } from "@/components/employer/LoadingState";
import { MetricCard } from "@/components/employer/MetricCard";
import { PageHeader } from "@/components/employer/PageHeader";
import { useEmployerAuth } from "@/context/EmployerAuthContext";
import { getEmployerOverview, getEmployerAnalytics } from "@/services/employerService";
import { EmployerActivity, EmployerAnalyticsSummary, EmployerBrandingSnapshot } from "@/types/employer";

const PIE_COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#10b981", "#8b5cf6", "#f59e0b"];
const FUNNEL_COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#38bdf8", "#10b981", "#f59e0b", "#ef4444"];

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function EmployerOverview() {
  const { profile, user, isEmployer, bootstrap } = useEmployerAuth();

  const [stats, setStats] = useState({
    total_jobs: 0,
    total_applications: bootstrap?.summary?.total_applications || 0,
    shortlisted_candidates: 0,
    hired_candidates: bootstrap?.summary?.hired_count || 0,
    interview_rate: 0,
    offer_rate: 0,
    hire_rate: 0,
    avg_applications_per_job: 0,
  });

  const [analytics, setAnalytics] = useState<Array<{ name: string; applications: number }>>([]);
  const [activity, setActivity] = useState<EmployerActivity[]>([]);
  const [branding, setBranding] = useState<EmployerBrandingSnapshot | null>(
    bootstrap?.profile ? {
      company_name: bootstrap.company.name || "",
      website: bootstrap.profile.website || "",
      brand_tagline: bootstrap.profile.brand_tagline || "",
      brand_summary: bootstrap.profile.brand_summary || "",
      linkedin_url: bootstrap.profile.linkedin_url || "",
      integrations: bootstrap.profile.integrations || { linkedin_sync_enabled: false, external_posting_enabled: false },
    } : null
  );
  const [loading, setLoading] = useState(true);
  const [advancedAnalytics, setAdvancedAnalytics] = useState<EmployerAnalyticsSummary | null>(null);

  useEffect(() => {
    if (!user || !isEmployer) return;
    (async () => {
      try {
        const [response, advAnalytics] = await Promise.all([
          getEmployerOverview(),
          getEmployerAnalytics().catch(() => null),
        ]);
        setStats(response.stats);
        setAnalytics(response.analytics);
        setActivity(response.recent_activity);
        setBranding(response.branding);
        setAdvancedAnalytics(advAnalytics);
      } catch (err) {
        console.error("Overview load failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [isEmployer, user]);

  if (loading) return <LoadingState />;

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title={`Good to see you, ${firstName}`}
        description="Your hiring pipeline at a glance — jobs, applications, and candidate progress."
        actions={
          <Link
            to="/employer/jobs"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 transition-colors shadow-sm"
          >
            <BriefcaseBusiness className="h-4 w-4" />
            Post a job
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      {/* Top metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Active Jobs"       value={stats.total_jobs}            helper="open positions"          icon={<BriefcaseBusiness className="h-5 w-5" />} />
        <MetricCard title="Total Applications" value={stats.total_applications}   helper="candidates in pipeline"  icon={<FileText className="h-5 w-5" />} />
        <MetricCard title="Shortlisted"        value={stats.shortlisted_candidates} helper="ready for next round"  icon={<UserRoundCheck className="h-5 w-5" />} />
        <MetricCard title="Hired"              value={stats.hired_candidates}     helper="offers accepted"         icon={<Sparkles className="h-5 w-5" />} />
      </div>

      {/* Rate metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Interview Rate" value={`${stats.interview_rate}%`}  helper="applied → interviewed"  icon={<Users className="h-5 w-5" />} />
        <MetricCard title="Offer Rate"     value={`${stats.offer_rate}%`}      helper="interviewed → offered"  icon={<Sparkles className="h-5 w-5" />} />
        <MetricCard title="Hire Rate"      value={`${stats.hire_rate}%`}       helper="applied → hired"        icon={<UserRoundCheck className="h-5 w-5" />} />
        <MetricCard
          title="Avg Time to Hire"
          value={advancedAnalytics?.avg_time_to_hire_days ? `${advancedAnalytics.avg_time_to_hire_days}d` : `${stats.avg_applications_per_job}`}
          helper={advancedAnalytics?.avg_time_to_hire_days ? "days avg to hire" : "avg apps per job"}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard
          title="Daily Applications"
          action={<TrendingUp className="h-4 w-4 text-gray-400" />}
        >
          {advancedAnalytics?.daily_applications?.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={advancedAnalytics.daily_applications}>
                <defs>
                  <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", fontSize: 12 }}
                  labelStyle={{ fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#appGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : analytics.length ? (
            <AnalyticsChart data={analytics} />
          ) : (
            <EmptyState icon={<TrendingUp className="h-6 w-6" />} title="No data yet" description="Application trends will appear as candidates apply." />
          )}
        </SectionCard>

        <SectionCard
          title="Applicant Sources"
          action={<Users className="h-4 w-4 text-gray-400" />}
        >
          {advancedAnalytics?.source_breakdown?.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={advancedAnalytics.source_breakdown}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={90}
                  paddingAngle={4}
                  dataKey="count" nameKey="source"
                >
                  {advancedAnalytics.source_breakdown.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend formatter={v => <span className="text-xs capitalize text-gray-600">{v}</span>} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", fontSize: 12 }}
                  formatter={(v: number, name: string) => [
                    `${v} (${advancedAnalytics.source_breakdown.find(s => s.source === name)?.percentage || 0}%)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={<Users className="h-6 w-6" />} title="No source data" description="Applicant channels will appear as candidates apply." />
          )}
        </SectionCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard title="Pipeline Funnel">
          {advancedAnalytics?.pipeline_funnel?.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={advancedAnalytics.pipeline_funnel} layout="vertical" barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={88} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {advancedAnalytics.pipeline_funnel.map((_, i) => (
                    <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={<FileText className="h-6 w-6" />} title="No funnel data" description="Stage breakdown appears as candidates progress through hiring." />
          )}
        </SectionCard>

        <SectionCard
          title="Top Performing Jobs"
          action={
            <Link to="/employer/jobs" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              All jobs <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          {advancedAnalytics?.top_performing_jobs?.length ? (
            <div className="space-y-2">
              {advancedAnalytics.top_performing_jobs.slice(0, 5).map((job, i) => (
                <div key={job.job_id} className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-black text-blue-600">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{job.job_title}</p>
                      <p className="text-xs text-gray-500">{job.applications} applications</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    {job.hire_rate}% hired
                  </span>
                </div>
              ))}
            </div>
          ) : analytics.length ? (
            <AnalyticsChart data={analytics} />
          ) : (
            <EmptyState icon={<BriefcaseBusiness className="h-6 w-6" />} title="No jobs yet" description="Post a role to see performance analytics." />
          )}
        </SectionCard>
      </div>

      {/* Activity + Brand */}
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <SectionCard title="Recent Activity">
          {activity.length ? (
            <ActivityFeed items={activity} />
          ) : (
            <EmptyState icon={<Sparkles className="h-6 w-6" />} title="No activity yet" description="Actions like posting jobs or updating candidates will appear here." />
          )}
        </SectionCard>

        <SectionCard
          title="Company Profile"
          action={
            <Link to="/employer/settings" className="text-xs font-bold text-blue-600 hover:underline">Edit</Link>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{branding?.company_name || profile?.company_name || "Your Company"}</p>
                <p className="text-xs text-gray-500 mt-0.5">{branding?.brand_tagline || "Add a tagline in settings"}</p>
              </div>
            </div>

            {branding?.brand_summary && (
              <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                {branding.brand_summary}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Website</p>
                {branding?.website ? (
                  <a href={branding.website} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                    Visit site <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-xs text-gray-400">Not set</p>
                )}
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">LinkedIn sync</p>
                <span className={`text-xs font-bold ${branding?.integrations.linkedin_sync_enabled ? "text-emerald-600" : "text-gray-400"}`}>
                  {branding?.integrations.linkedin_sync_enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
