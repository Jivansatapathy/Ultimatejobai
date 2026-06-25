import { useEffect, useState } from "react";
import {
  BriefcaseBusiness, Building2, ExternalLink, FileText,
  Sparkles, UserRoundCheck, ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ActivityFeed } from "@/components/employer/ActivityFeed";
import { EmptyState } from "@/components/employer/EmptyState";
import { LoadingState } from "@/components/employer/LoadingState";
import { MetricCard } from "@/components/employer/MetricCard";
import { PageHeader } from "@/components/employer/PageHeader";
import { useEmployerAuth } from "@/context/EmployerAuthContext";
import { getEmployerOverview, getEmployerAnalytics } from "@/services/employerService";
import { EmployerActivity, EmployerAnalyticsSummary, EmployerBrandingSnapshot } from "@/types/employer";


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


      {/* Top Performing Jobs */}
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
        ) : (
          <EmptyState icon={<BriefcaseBusiness className="h-6 w-6" />} title="No jobs yet" description="Post a role to see performance analytics." />
        )}
      </SectionCard>

      {/* Activity + Brand */}
      <div className="grid gap-5 xl:grid-cols-[1fr_360px] items-start">
        <SectionCard title="Recent Activity">
          {activity.length ? (
            <ActivityFeed items={activity.slice(0, 4)} />
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

      {/* Role-Based Access Control */}
      <SectionCard title="Role-Based Access Control">
        <div className="space-y-4">
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
            <p className="text-sm text-gray-500">
              Your role: <span className="font-bold text-gray-900 capitalize">{(profile?.workspace_role || "admin").replace("_", " ")}</span>
            </p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-3 text-left font-semibold text-gray-600">Permission</th>
                  <th className="p-3 text-center font-semibold text-gray-600">Admin</th>
                  <th className="p-3 text-center font-semibold text-gray-600">Recruiter</th>
                  <th className="p-3 text-center font-semibold text-gray-600">Hiring Mgr</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { label: "Manage jobs",         admin: true,  recruiter: true,  manager: false },
                  { label: "Manage candidates",   admin: true,  recruiter: true,  manager: true  },
                  { label: "Manage team",         admin: true,  recruiter: false, manager: false },
                  { label: "Manage integrations", admin: true,  recruiter: false, manager: false },
                  { label: "View analytics",      admin: true,  recruiter: true,  manager: true  },
                  { label: "Send offers",         admin: true,  recruiter: true,  manager: false },
                  { label: "Talent pool",         admin: true,  recruiter: true,  manager: true  },
                ].map((row) => (
                  <tr key={row.label} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-700">{row.label}</td>
                    <td className="p-3 text-center">{row.admin     ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-gray-300">—</span>}</td>
                    <td className="p-3 text-center">{row.recruiter ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-gray-300">—</span>}</td>
                    <td className="p-3 text-center">{row.manager   ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-gray-300">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
