import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { NavbarV2 } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";
import { getRoleBySlug, EXEC_ROLES, DEPT_COLORS } from "@/data/executiveRoles";
import { searchSeniorJobs } from "@/services/seniorJobService";
import { Briefcase, MapPin, Building2, ChevronRight, DollarSign, Timer, ExternalLink, ArrowRight } from "lucide-react";

type Job = {
  id: string | number;
  title: string;
  company_name: string;
  location: string;
  apply_url?: string;
  job_url?: string;
  is_remote?: boolean;
};

const INTERIM_SLUGS = ["cfo", "ceo", "coo", "cto", "cmo", "cio", "cro", "chro", "cpo", "clo", "ciso"];

export default function InterimRolePage() {
  const { role: slug = "" } = useParams<{ role: string }>();
  const baseRole = getRoleBySlug(slug);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  if (!baseRole || !INTERIM_SLUGS.includes(slug)) return <Navigate to="/interim" replace />;

  const role = {
    ...baseRole,
    title: `Interim ${baseRole.abbr || baseRole.title}`,
    searchQ: `Interim ${baseRole.abbr || baseRole.title}`,
  };
  const colors = DEPT_COLORS[baseRole.dept];

  useEffect(() => {
    setLoading(true);
    searchSeniorJobs({ q: role.searchQ, page: 1, page_size: 6 })
      .then(res => { setJobs(res.results as Job[]); setJobCount(res.count); })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role.searchQ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ultimatejobai.vercel.app/" },
          { "@type": "ListItem", "position": 2, "name": "Interim Roles", "item": "https://ultimatejobai.vercel.app/interim" },
          { "@type": "ListItem", "position": 3, "name": role.title, "item": `https://ultimatejobai.vercel.app/interim/${slug}` },
        ],
      },
    ],
  };

  const relatedSlugs = baseRole.related.slice(0, 4);
  const relatedRoles = relatedSlugs.map(s => EXEC_ROLES.find(r => r.slug === s)).filter(Boolean) as typeof EXEC_ROLES;

  return (
    <>
      <title>{role.title} Jobs — Contract & Interim C-Suite Roles | Hizorex</title>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NavbarV2 />

      {/* Breadcrumb */}
      <nav className="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <div className="mx-auto max-w-6xl flex items-center gap-1.5 text-xs text-gray-500">
          <Link to="/" className="hover:text-teal-700 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/interim" className="hover:text-teal-700 transition-colors">Interim Roles</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 font-semibold">{baseRole.abbr || baseRole.title}</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-12 px-4 border-b bg-teal-50 border-teal-100">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2 mb-4">
            <Timer className="h-4 w-4 text-teal-700" />
            <span className="text-xs font-bold uppercase tracking-widest text-teal-700">Interim / Contract Role</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">{role.title} Jobs</h1>
          <p className="text-gray-600 text-base max-w-2xl leading-relaxed mb-6">
            Find interim and contract {baseRole.title} roles. Step into an organisation immediately, lead through change or
            transition, and deliver measurable impact on a fixed-term engagement.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/find-jobs?q=${encodeURIComponent(role.searchQ)}`}
              className="inline-flex items-center gap-2 bg-teal-700 text-white font-bold px-6 py-2.5 rounded-full hover:bg-teal-800 transition-colors"
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
        <div className="lg:col-span-2 space-y-8">
          {/* Live jobs */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Latest {role.title} Openings</h2>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse rounded-xl border border-gray-100 bg-gray-50 h-20" />)}</div>
            ) : jobs.length === 0 ? (
              <p className="text-gray-400 text-sm">No live interim postings right now — check back daily.</p>
            ) : (
              <div className="space-y-3">
                {jobs.map((job, i) => (
                  <a
                    key={i}
                    href={job.apply_url || job.job_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 hover:border-teal-300 hover:shadow-sm transition-all group"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-teal-700 transition-colors">{job.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{job.company_name}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                        {job.is_remote && <span className="bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded-full">Remote</span>}
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-gray-300 group-hover:text-teal-500 shrink-0 mt-0.5" />
                  </a>
                ))}
              </div>
            )}
            {(jobCount ?? 0) > 6 && (
              <Link to={`/find-jobs?q=${encodeURIComponent(role.searchQ)}`} className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-teal-700 hover:text-teal-900 transition-colors">
                See all {role.title} roles <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {/* What the role involves */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">What Does an {role.title} Do?</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              An {role.title} provides senior {baseRole.dept} leadership on a contract basis — typically 3–18 months.
              They parachute into an organisation, assess the situation rapidly, and deliver against a clear mandate without
              the onboarding curve of a permanent hire.
            </p>
          </div>

          {/* Responsibilities */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Typical Responsibilities</h2>
            <ul className="space-y-2.5">
              {baseRole.responsibilities.map(r => (
                <li key={r} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <Timer className="h-4 w-4 shrink-0 mt-0.5 text-teal-600" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Typical engagements */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Common Interim Engagement Types</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: "Gap Cover", desc: `Bridge a ${baseRole.title} vacancy while the permanent search runs.` },
                { title: "Turnaround", desc: `Lead a ${baseRole.dept} transformation or cost-reduction programme.` },
                { title: "M&A Integration", desc: `Manage the ${baseRole.dept} workstream through a merger or acquisition.` },
                { title: "Scale-Up Support", desc: `Help a fast-growing company build the ${baseRole.dept} function from scratch.` },
              ].map(e => (
                <div key={e.title} className="rounded-xl border border-teal-100 bg-teal-50 p-4">
                  <p className="font-bold text-gray-900 text-sm mb-1">{e.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{e.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-teal-700" />
              <h3 className="font-bold text-gray-900 text-sm">Day Rate / Annual Equiv.</h3>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{baseRole.salary.split("–")[0].trim()}+</p>
            <p className="text-xs text-gray-400 mt-1">Permanent equiv. range: {baseRole.salary}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Key Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {baseRole.skills.map(s => (
                <span key={s} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>{s}</span>
              ))}
            </div>
          </div>

          {relatedRoles.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Related Interim Roles</h3>
              <div className="space-y-2">
                {relatedRoles.map(r => (
                  <Link
                    key={r.slug}
                    to={`/interim/${r.slug}`}
                    className="flex items-center justify-between text-sm text-gray-700 hover:text-teal-700 transition-colors group"
                  >
                    Interim {r.abbr || r.title}
                    <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-teal-500" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Also See</h3>
            <div className="space-y-2">
              <Link to={`/fractional/${slug}`} className="flex items-center justify-between text-sm text-gray-700 hover:text-violet-700 transition-colors group">
                Fractional {baseRole.abbr || baseRole.title} <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
              </Link>
              <Link to={`/executive-roles/${slug}`} className="flex items-center justify-between text-sm text-gray-700 hover:text-blue-700 transition-colors group">
                Permanent {baseRole.abbr || baseRole.title} <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
              </Link>
              <Link to={`/salary/${slug}`} className="flex items-center justify-between text-sm text-gray-700 hover:text-gray-900 transition-colors group">
                {baseRole.abbr || baseRole.title} Salary Guide <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-teal-700 text-white p-5">
            <h3 className="font-bold text-base mb-2">Find Your Next Interim Role</h3>
            <p className="text-xs text-teal-200 leading-relaxed mb-4">
              Apex™ automatically applies to {role.title} openings on your behalf every day.
            </p>
            <Link
              to="/auth?mode=signup"
              className="block text-center bg-white text-teal-800 font-bold px-4 py-2 rounded-full text-sm hover:bg-teal-50 transition-colors"
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
