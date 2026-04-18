import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";
import { BriefcaseBusiness, Building2, Clock, ExternalLink, FileText, LineChart as LineChartIcon, Sparkles, TrendingUp, UserRoundCheck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeed } from "@/components/employer/ActivityFeed";
import { AnalyticsChart } from "@/components/employer/AnalyticsChart";
import { EmptyState } from "@/components/employer/EmptyState";
import { LoadingState } from "@/components/employer/LoadingState";
import { MetricCard } from "@/components/employer/MetricCard";
import { PageHeader } from "@/components/employer/PageHeader";
import { useEmployerAuth } from "@/context/EmployerAuthContext";
import { getEmployerOverview, getEmployerAnalytics } from "@/services/employerService";
import { EmployerActivity, EmployerAnalyticsSummary, EmployerBrandingSnapshot } from "@/types/employer";

const PIE_COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444", "#ec4899"];
const FUNNEL_COLORS = ["#3b82f6", "#60a5fa", "#38bdf8", "#22d3ee", "#10b981", "#f97316", "#ef4444"];

export default function EmployerOverview() {
  const { profile, user, isEmployer, bootstrap } = useEmployerAuth();
  const [permissions, setPermissions] = useState<{
    workspace_role?: string;
    can_manage_team?: boolean;
  } | null>(
    bootstrap?.permissions
      ? {
          workspace_role: bootstrap.permissions.workspace_role,
          can_manage_team: bootstrap.permissions.can_manage_team,
        }
      : null,
  );

  // Use bootstrap summary for instant metrics if available
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
  const [branding, setBranding] = useState<EmployerBrandingSnapshot | null>(bootstrap?.profile ? {
    company_name: bootstrap.company.name || "",
    website: bootstrap.profile.website || "",
    brand_tagline: bootstrap.profile.brand_tagline || "",
    brand_summary: bootstrap.profile.brand_summary || "",
    linkedin_url: bootstrap.profile.linkedin_url || "",
    integrations: bootstrap.profile.integrations || { linkedin_sync_enabled: false, external_posting_enabled: false }
  } : null);

  const [loading, setLoading] = useState(true);
  const [advancedAnalytics, setAdvancedAnalytics] = useState<EmployerAnalyticsSummary | null>(null);

  useEffect(() => {
    if (!user || !isEmployer) {
      return;
    }

    const load = async () => {
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
        setPermissions(response.permissions ?? null);
      } catch (err) {
        console.error("Overview load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isEmployer, user]);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${profile?.full_name?.split(" ")[0] || "Employer"}`}
        description="Track open roles, candidate progress, and recent hiring activity from your Django employer APIs."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Jobs" value={stats.total_jobs} helper="active role inventory" icon={<BriefcaseBusiness className="h-5 w-5" />} />
        <MetricCard title="Applications" value={stats.total_applications} helper="candidates in pipeline" icon={<FileText className="h-5 w-5" />} />
        <MetricCard title="Shortlisted" value={stats.shortlisted_candidates} helper="ready for next round" icon={<UserRoundCheck className="h-5 w-5" />} />
        <MetricCard title="Hired" value={stats.hired_candidates} helper="offers accepted" icon={<Sparkles className="h-5 w-5" />} />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Interview Rate" value={`${stats.interview_rate}%`} helper="applications to interview" icon={<LineChartIcon className="h-5 w-5" />} />
        <MetricCard title="Offer Rate" value={`${stats.offer_rate}%`} helper="applications to offer" icon={<Sparkles className="h-5 w-5" />} />
        <MetricCard title="Hire Rate" value={`${stats.hire_rate}%`} helper="applications to hire" icon={<UserRoundCheck className="h-5 w-5" />} />
        <MetricCard
          title="Avg Time to Hire"
          value={advancedAnalytics?.avg_time_to_hire_days ? `${advancedAnalytics.avg_time_to_hire_days}d` : `${stats.avg_applications_per_job} apps/job`}
          helper={advancedAnalytics?.avg_time_to_hire_days ? "average days to hire" : "average role demand"}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-3xl border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Daily Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {advancedAnalytics?.daily_applications?.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={advancedAnalytics.daily_applications}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : analytics.length ? (
              <AnalyticsChart data={analytics} />
            ) : (
              <EmptyState
                icon={<TrendingUp className="h-6 w-6" />}
                title="No data yet"
                description="Daily application trends will appear once candidates start applying."
              />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              Source of Applicants
            </CardTitle>
          </CardHeader>
          <CardContent>
            {advancedAnalytics?.source_breakdown?.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={advancedAnalytics.source_breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="source"
                  >
                    {advancedAnalytics.source_breakdown.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend formatter={(value) => <span className="text-sm capitalize">{value}</span>} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    formatter={(value: number, name: string) => [`${value} (${advancedAnalytics.source_breakdown.find((s) => s.source === name)?.percentage || 0}%)`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={<Users className="h-6 w-6" />}
                title="No source data"
                description="Applicant source breakdown will appear as candidates apply through different channels."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pipeline funnel + Top jobs */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-3xl border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Pipeline Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {advancedAnalytics?.pipeline_funnel?.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={advancedAnalytics.pipeline_funnel} layout="vertical" barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={90} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {advancedAnalytics.pipeline_funnel.map((_, index) => (
                      <Cell key={index} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={<FileText className="h-6 w-6" />}
                title="No funnel data"
                description="Pipeline funnel shows how candidates move through your hiring stages."
              />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BriefcaseBusiness className="h-5 w-5 text-accent" />
              Top Performing Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {advancedAnalytics?.top_performing_jobs?.length ? (
              <div className="space-y-3">
                {advancedAnalytics.top_performing_jobs.slice(0, 5).map((job, index) => (
                  <div key={job.job_id} className="flex items-center justify-between gap-4 rounded-2xl bg-secondary/50 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-sm font-bold text-accent">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{job.job_title}</p>
                        <p className="text-xs text-muted-foreground">{job.applications} applications</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      {job.hire_rate}% hire rate
                    </span>
                  </div>
                ))}
              </div>
            ) : analytics.length ? (
              <AnalyticsChart data={analytics} />
            ) : (
              <EmptyState
                icon={<BriefcaseBusiness className="h-6 w-6" />}
                title="No jobs yet"
                description="Publish a role to populate your analytics chart and employer overview."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Existing sections */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-3xl border-border/70">
          <CardHeader>
            <CardTitle>Applications per job</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.length ? (
              <AnalyticsChart data={analytics} />
            ) : (
              <EmptyState
                icon={<BriefcaseBusiness className="h-6 w-6" />}
                title="No jobs yet"
                description="Publish a role to populate your analytics chart and employer overview."
              />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/70">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length ? (
              <ActivityFeed items={activity} />
            ) : (
              <EmptyState
                icon={<Sparkles className="h-6 w-6" />}
                title="Activity will appear here"
                description="When you create jobs or update applicants, the latest actions will be captured in this feed."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-3xl border-border/70">
          <CardHeader>
            <CardTitle>Employer brand snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-secondary/60 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-background p-3">
                  <Building2 className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{branding?.company_name || profile?.company_name || "Hiring workspace"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {branding?.brand_tagline || "Add a sharp employer tagline from settings to strengthen your hiring brand."}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {branding?.brand_summary || "Your employer summary will appear here once you add one in workspace settings."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Website</p>
                {branding?.website ? (
                  <a href={branding.website} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
                    Open company site
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">Not added yet</p>
                )}
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">LinkedIn sync</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {branding?.integrations.linkedin_sync_enabled ? "Enabled and ready for future posting workflows." : "Disabled right now."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/70">
          <CardHeader>
            <CardTitle>Integration groundwork</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-secondary/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">LinkedIn posting</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {branding?.integrations.linkedin_sync_enabled ? "Enabled in your workspace preferences. The next step is wiring a real publisher or export adapter." : "Turn this on in settings to mark your workspace ready for LinkedIn distribution."}
              </p>
            </div>
            <div className="rounded-2xl bg-secondary/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">External posting</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {branding?.integrations.external_posting_enabled ? "Your workspace is marked ready for external board integrations and bulk posting." : "Keep this off until you want to prepare for job-board exports and integration hooks."}
              </p>
            </div>
            <div className="rounded-2xl bg-secondary/60 p-4 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">What these metrics tell you</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Interview, offer, and hire rates give you a quick funnel read. When applications are high but interview rate stays low, focus on role clarity, requirements, or sourcing quality.
              </p>
            </div>
            <div className="rounded-2xl bg-secondary/60 p-4 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Workspace permissions</p>
              <p className="mt-2 text-sm text-muted-foreground">
                You are signed in as <span className="font-medium text-foreground">{permissions?.workspace_role || profile?.workspace_role || "admin"}</span>.
                {permissions?.can_manage_team ? " You can manage team members and workspace settings." : " Team management is limited to employer admins."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
