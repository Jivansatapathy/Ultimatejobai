import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { NavbarV2 } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";
import { getBoardRoleBySlug, BOARD_ROLES } from "@/data/startupBoardRoles";
import { searchSeniorJobs } from "@/services/seniorJobService";
import { Briefcase, MapPin, Building2, ChevronRight, DollarSign, Shield, ExternalLink, ArrowRight } from "lucide-react";

type Job = {
  id: string | number;
  title: string;
  company_name: string;
  location: string;
  apply_url?: string;
  job_url?: string;
  is_remote?: boolean;
};

export default function BoardRolePage() {
  const { role: slug = "" } = useParams<{ role: string }>();
  const role = getBoardRoleBySlug(slug);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  if (!role) return <Navigate to="/board" replace />;

  useEffect(() => {
    setLoading(true);
    searchSeniorJobs({ text: role.searchQ, page: 1, page_size: 6 })
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
          { "@type": "ListItem", "position": 2, "name": "Board Roles", "item": "https://ultimatejobai.vercel.app/board" },
          { "@type": "ListItem", "position": 3, "name": role.title, "item": `https://ultimatejobai.vercel.app/board/${slug}` },
        ],
      },
      {
        "@type": "CollectionPage",
        "name": `${role.title} Jobs`,
        "description": role.description,
        "url": `https://ultimatejobai.vercel.app/board/${slug}`,
      },
    ],
  };

  const relatedRoles = role.related.map(s => BOARD_ROLES.find(r => r.slug === s)).filter(Boolean) as typeof BOARD_ROLES;

  return (
    <>
      <title>{role.title} Jobs — Board & Director Roles | Hizorex</title>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NavbarV2 />

      {/* Breadcrumb */}
      <nav className="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <div className="mx-auto max-w-6xl flex items-center gap-1.5 text-xs text-gray-500">
          <Link to="/" className="hover:text-slate-700 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/board" className="hover:text-slate-700 transition-colors">Board Roles</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 font-semibold">{role.title}</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-12 px-4 border-b bg-slate-50 border-slate-200">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-slate-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Board / Director Role</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">{role.title} Jobs</h1>
          <p className="text-gray-600 text-base max-w-2xl leading-relaxed mb-6">{role.description}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/find-jobs?q=${encodeURIComponent(role.searchQ)}`}
              className="inline-flex items-center gap-2 bg-slate-800 text-white font-bold px-6 py-2.5 rounded-full hover:bg-slate-700 transition-colors"
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
              <p className="text-gray-400 text-sm">No live postings right now — check back daily or search all board roles.</p>
            ) : (
              <div className="space-y-3">
                {jobs.map((job, i) => (
                  <a
                    key={i}
                    href={job.apply_url || job.job_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 hover:border-slate-400 hover:shadow-sm transition-all group"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-slate-700 transition-colors">{job.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{job.company_name}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                        {job.is_remote && <span className="bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded-full">Remote</span>}
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-gray-300 group-hover:text-slate-500 shrink-0 mt-0.5" />
                  </a>
                ))}
              </div>
            )}
            {(jobCount ?? 0) > 6 && (
              <Link to={`/find-jobs?q=${encodeURIComponent(role.searchQ)}`} className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors">
                See all {role.title} roles <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {/* Responsibilities */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Responsibilities</h2>
            <ul className="space-y-2.5">
              {role.responsibilities.map(r => (
                <li key={r} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <Shield className="h-4 w-4 shrink-0 mt-0.5 text-slate-500" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* About the role */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">What Is a {role.title}?</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{role.description}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-slate-600" />
              <h3 className="font-bold text-gray-900 text-sm">Typical Compensation</h3>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{role.salary.split("–")[0].trim()}</p>
            <p className="text-xs text-gray-400 mt-1">Range: {role.salary}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Key Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {role.skills.map(s => (
                <span key={s} className="text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700">{s}</span>
              ))}
            </div>
          </div>

          {relatedRoles.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Related Roles</h3>
              <div className="space-y-2">
                {relatedRoles.map(r => (
                  <Link
                    key={r.slug}
                    to={`/board/${r.slug}`}
                    className="flex items-center justify-between text-sm text-gray-700 hover:text-slate-900 transition-colors group"
                  >
                    {r.title}
                    <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-slate-500" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-slate-800 text-white p-5">
            <h3 className="font-bold text-base mb-2">Find Your Next Board Seat</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Apex™ automatically surfaces {role.title} opportunities matching your governance background.
            </p>
            <Link
              to="/auth?mode=signup"
              className="block text-center bg-white text-slate-800 font-bold px-4 py-2 rounded-full text-sm hover:bg-slate-100 transition-colors"
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
