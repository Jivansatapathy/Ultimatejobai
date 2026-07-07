import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { NavbarV2 } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";
import { getRoleBySlug, DEPT_COLORS } from "@/data/executiveRoles";
import { searchSeniorJobs } from "@/services/seniorJobService";
import { Briefcase, MapPin, Building2, ChevronRight, DollarSign, Clock, ExternalLink, ArrowRight } from "lucide-react";

type Job = {
  id: string | number;
  title: string;
  company_name: string;
  location: string;
  apply_url?: string;
  job_url?: string;
  is_remote?: boolean;
};

const FRACTIONAL_SLUGS = ["cfo", "ceo", "coo", "cto", "cmo", "cio", "cro", "chro", "cpo", "clo"];

export default function FractionalRolePage() {
  const { role: slug = "" } = useParams<{ role: string }>();
  const baseRole = getRoleBySlug(slug);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  if (!baseRole || !FRACTIONAL_SLUGS.includes(slug)) return <Navigate to="/fractional" replace />;

  const role = {
    ...baseRole,
    title: `Fractional ${baseRole.abbr || baseRole.title}`,
    searchQ: `Fractional ${baseRole.abbr || baseRole.title}`,
  };
  const colors = DEPT_COLORS[baseRole.dept];

  useEffect(() => {
    setLoading(true);
    searchSeniorJobs({ text: role.searchQ, page: 1, page_size: 6 })
      .then(res => { setJobs(res.results as Job[]); setJobCount(res.count); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [role.searchQ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ultimatejobai.vercel.app/" },
          { "@type": "ListItem", "position": 2, "name": "Fractional Roles", "item": "https://ultimatejobai.vercel.app/fractional" },
          { "@type": "ListItem", "position": 3, "name": role.title, "item": `https://ultimatejobai.vercel.app/fractional/${slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <title>{role.title} Jobs — Part-Time {baseRole.abbr} Roles | Hizorex</title>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NavbarV2 />

      {/* Breadcrumb */}
      <nav className="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <div className="mx-auto max-w-6xl flex items-center gap-1.5 text-xs text-gray-500">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/fractional" className="hover:text-blue-600 transition-colors">Fractional Roles</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 font-semibold">{baseRole.abbr || baseRole.title}</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-12 px-4 border-b bg-violet-50 border-violet-100">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-violet-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-violet-600">Fractional / Part-Time</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">{role.title} Jobs</h1>
          <p className="text-gray-600 text-base max-w-2xl leading-relaxed mb-6">
            Find fractional, interim, and part-time {baseRole.title} roles. Work with multiple companies simultaneously
            and provide senior {baseRole.dept} leadership on a flexible schedule.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/fractional-jobs`}
              className="inline-flex items-center gap-2 bg-violet-600 text-white font-bold px-6 py-2.5 rounded-full hover:bg-violet-700 transition-colors"
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
          {/* Jobs */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Latest {role.title} Openings</h2>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse rounded-xl border border-gray-100 bg-gray-50 h-20" />)}</div>
            ) : jobs.length === 0 ? (
              <p className="text-gray-400 text-sm">No live postings right now — check back daily or search all fractional roles.</p>
            ) : (
              <div className="space-y-3">
                {jobs.map((job, i) => (
                  <a
                    key={i}
                    href={job.apply_url || job.job_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 hover:border-violet-300 hover:shadow-sm transition-all group"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-violet-700 transition-colors">{job.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{job.company_name}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                        {job.is_remote && <span className="bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded-full">Remote</span>}
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-gray-300 group-hover:text-violet-500 shrink-0 mt-0.5" />
                  </a>
                ))}
              </div>
            )}
            {(jobCount ?? 0) > 6 && (
              <Link to="/fractional-jobs" className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-violet-600 hover:text-violet-800 transition-colors">
                See all fractional roles <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {/* What a fractional [role] does */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">What Does a {role.title} Do?</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              A {role.title} provides senior {baseRole.dept} leadership on a part-time or interim basis — typically working
              10–20 hours per week across one or more client companies. They bring the same expertise and strategic value
              as a full-time {baseRole.title}, at a fraction of the cost.
            </p>
          </div>

          {/* Responsibilities */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Typical Responsibilities</h2>
            <ul className="space-y-2.5">
              {baseRole.responsibilities.map(r => (
                <li key={r} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <Clock className="h-4 w-4 shrink-0 mt-0.5 text-violet-500" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-violet-600" />
              <h3 className="font-bold text-gray-900 text-sm">Part-Time Earnings</h3>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{baseRole.salary.split("–")[0].trim()}+</p>
            <p className="text-xs text-gray-400 mt-1">Equivalent annual (part-time rate)</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Key Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {baseRole.skills.map(s => (
                <span key={s} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>{s}</span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-violet-600 text-white p-5">
            <h3 className="font-bold text-base mb-2">Land Your Next Fractional Role</h3>
            <p className="text-xs text-violet-200 leading-relaxed mb-4">
              Apex™ automatically applies to fractional {baseRole.abbr} openings on your behalf.
            </p>
            <Link
              to="/auth?mode=signup"
              className="block text-center bg-white text-violet-700 font-bold px-4 py-2 rounded-full text-sm hover:bg-violet-50 transition-colors"
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
