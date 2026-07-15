import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { NavbarV2 } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";
import { getRoleBySlug, DEPT_COLORS } from "@/data/executiveRoles";
import { searchSeniorJobs } from "@/services/seniorJobService";
import { Briefcase, MapPin, Building2, ChevronRight, DollarSign, CheckCircle2, ExternalLink, ArrowRight } from "lucide-react";

type Job = {
  id: string | number;
  title: string;
  company_name: string;
  location: string;
  apply_url?: string;
  job_url?: string;
  posted_at?: string;
  is_remote?: boolean;
  employment_type?: string;
};

export default function ExecutiveRolePage() {
  const { role: slug = "" } = useParams<{ role: string }>();
  const role = getRoleBySlug(slug);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!role) return;
    setLoading(true);
    searchSeniorJobs({ q: role.searchQ, page: 1, page_size: 6 })
      .then(res => {
        setJobs(res.results as Job[]);
        setJobCount(res.count);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [role]);

  if (!role) return <Navigate to="/executive-roles" replace />;

  const colors = DEPT_COLORS[role.dept];
  const pageTitle = `${role.title} Jobs${role.abbr ? ` — ${role.abbr}` : ""} | Hizorex`;

  // JSON-LD for the role page (BreadcrumbList + collection page schema)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ultimatejobai.vercel.app/" },
          { "@type": "ListItem", "position": 2, "name": "Executive Roles", "item": "https://ultimatejobai.vercel.app/executive-roles" },
          { "@type": "ListItem", "position": 3, "name": role.title, "item": `https://ultimatejobai.vercel.app/executive-roles/${slug}` },
        ],
      },
      {
        "@type": "CollectionPage",
        "name": `${role.title} Jobs`,
        "description": role.description,
        "url": `https://ultimatejobai.vercel.app/executive-roles/${slug}`,
      },
    ],
  };

  return (
    <>
      <title>{pageTitle}</title>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NavbarV2 />

      {/* Breadcrumb */}
      <nav className="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <div className="mx-auto max-w-6xl flex items-center gap-1.5 text-xs text-gray-500">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/executive-roles" className="hover:text-blue-600 transition-colors">Executive Roles</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 font-semibold">{role.abbr || role.title}</span>
        </div>
      </nav>

      {/* Hero */}
      <section className={`py-12 px-4 border-b ${colors.bg} ${colors.border}`}>
        <div className="mx-auto max-w-6xl">
          <span className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 ${colors.bg} ${colors.text} border ${colors.border}`}>
            {role.dept}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            {role.title} Jobs
          </h1>
          <p className="text-gray-600 text-base max-w-2xl leading-relaxed mb-6">{role.description}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/find-jobs?q=${encodeURIComponent(role.searchQ)}`}
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-2.5 rounded-full hover:bg-blue-700 transition-colors"
            >
              <Briefcase className="h-4 w-4" />
              {jobCount !== null ? `View All ${jobCount.toLocaleString()} Jobs` : "Search Jobs"}
            </Link>
            <Link
              to="/auth?mode=signup"
              className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 font-semibold px-6 py-2.5 rounded-full hover:bg-white transition-colors"
            >
              Let Apex™ Apply For You <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">

          {/* Live job listings */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Latest {role.title} Openings
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse rounded-xl border border-gray-100 bg-gray-50 h-20" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <p className="text-gray-400 text-sm">No live postings right now — check back daily.</p>
            ) : (
              <div className="space-y-3">
                {jobs.map((job, i) => (
                  <a
                    key={i}
                    href={job.apply_url || job.job_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 hover:border-blue-300 hover:shadow-sm transition-all group"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-blue-700 transition-colors">{job.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{job.company_name}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                        {job.is_remote && <span className="bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded-full">Remote</span>}
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-500 shrink-0 mt-0.5 transition-colors" />
                  </a>
                ))}
              </div>
            )}
            {(jobCount ?? 0) > 6 && (
              <Link
                to={`/find-jobs?q=${encodeURIComponent(role.searchQ)}`}
                className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                See all {jobCount?.toLocaleString()} openings <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {/* Responsibilities */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Key Responsibilities</h2>
            <ul className="space-y-2.5">
              {role.responsibilities.map(r => (
                <li key={r} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${colors.text}`} />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Salary */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className={`h-4 w-4 ${colors.text}`} />
              <h3 className="font-bold text-gray-900 text-sm">Salary Range</h3>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{role.salary}</p>
            <p className="text-xs text-gray-400 mt-1">Total annual compensation</p>
          </div>

          {/* Key skills */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Key Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {role.skills.map(s => (
                <span key={s} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Related roles */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Roles</h3>
            <ul className="space-y-2">
              {role.related.map(relSlug => {
                const rel = getRoleBySlug(relSlug);
                if (!rel) return null;
                return (
                  <li key={relSlug}>
                    <Link
                      to={`/executive-roles/${relSlug}`}
                      className="flex items-center justify-between text-sm text-gray-700 hover:text-blue-600 transition-colors group"
                    >
                      {rel.title}
                      <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* CTA */}
          <div className="rounded-2xl bg-blue-600 text-white p-5">
            <h3 className="font-bold text-base mb-2">Let AI Apply For You</h3>
            <p className="text-xs text-blue-200 leading-relaxed mb-4">
              Apex™ automatically applies to {role.title} roles on your behalf every morning.
            </p>
            <Link
              to="/auth?mode=signup"
              className="block text-center bg-white text-blue-700 font-bold px-4 py-2 rounded-full text-sm hover:bg-blue-50 transition-colors"
            >
              Start Free
            </Link>
          </div>
        </div>
      </div>

      <FooterV2 />
    </>
  );
}
