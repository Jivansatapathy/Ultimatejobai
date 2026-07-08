import { useParams, Link, Navigate } from "react-router-dom";
import { NavbarV2 } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";
import { getSalaryRoleBySlug, SALARY_ROLES } from "@/data/salaryData";
import { DollarSign, MapPin, TrendingUp, ChevronRight, Award, Briefcase } from "lucide-react";

export default function SalaryRolePage() {
  const { role: slug = "" } = useParams<{ role: string }>();
  const role = getSalaryRoleBySlug(slug);

  if (!role) return <Navigate to="/salary" replace />;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ultimatejobai.vercel.app/" },
          { "@type": "ListItem", "position": 2, "name": "Salary Guides", "item": "https://ultimatejobai.vercel.app/salary" },
          { "@type": "ListItem", "position": 3, "name": `${role.abbr || role.title} Salary`, "item": `https://ultimatejobai.vercel.app/salary/${slug}` },
        ],
      },
    ],
  };

  const relatedRoles = role.related
    .map(s => SALARY_ROLES.find(r => r.slug === s))
    .filter(Boolean) as typeof SALARY_ROLES;

  return (
    <>
      <title>{role.abbr || role.title} Salary 2025 — {role.title} Compensation Guide | Hizorex</title>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NavbarV2 />

      {/* Breadcrumb */}
      <nav className="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <div className="mx-auto max-w-6xl flex items-center gap-1.5 text-xs text-gray-500">
          <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/salary" className="hover:text-gray-700 transition-colors">Salary Guides</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 font-semibold">{role.abbr || role.title} Salary</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-12 px-4 border-b bg-gray-900 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-4 w-4 text-green-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-green-400">2025 Salary Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            {role.abbr || role.title} Salary Guide 2025
          </h1>
          <p className="text-gray-300 text-base max-w-2xl leading-relaxed mb-6">{role.description}</p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 rounded-xl px-5 py-3">
              <p className="text-xs text-gray-400 mb-0.5">Base Salary</p>
              <p className="text-lg font-extrabold text-white">{role.baseRange}</p>
            </div>
            <div className="bg-white/10 rounded-xl px-5 py-3">
              <p className="text-xs text-gray-400 mb-0.5">Total Compensation</p>
              <p className="text-lg font-extrabold text-green-400">{role.totalRange}</p>
            </div>
            <div className="bg-white/10 rounded-xl px-5 py-3">
              <p className="text-xs text-gray-400 mb-0.5">Bonus</p>
              <p className="text-lg font-extrabold text-white">{role.bonus}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">

          {/* By experience level */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Salary by Experience Level</h2>
            <div className="space-y-3">
              {role.levels.map((lvl, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-bold text-gray-900 text-sm">{lvl.label}</h3>
                    <span className="shrink-0 text-base font-extrabold text-gray-900">{lvl.range}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{lvl.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* By location */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" /> Salary by Location
            </h2>
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="grid grid-cols-2 text-xs font-bold text-gray-500 uppercase tracking-widest px-5 py-3 border-b border-gray-100 bg-gray-50">
                <span>City</span>
                <span className="text-right">Premium vs. National Median</span>
              </div>
              {role.topLocations.map((loc, i) => (
                <div key={i} className={`grid grid-cols-2 px-5 py-3.5 ${i < role.topLocations.length - 1 ? "border-b border-gray-100" : ""}`}>
                  <span className="text-sm font-medium text-gray-900">{loc.city}</span>
                  <span className={`text-right text-sm font-bold ${loc.premium.startsWith("+") ? "text-green-600" : "text-gray-500"}`}>
                    {loc.premium}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* What affects salary */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" /> What Affects {role.abbr || role.title} Salary?
            </h2>
            <ul className="space-y-2.5">
              {role.factors.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Negotiation tips */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-violet-600" /> {role.abbr || role.title} Salary Negotiation Tips
            </h2>
            <ul className="space-y-3">
              {role.negotiationTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700 bg-violet-50 rounded-xl px-4 py-3 border border-violet-100">
                  <span className="text-violet-600 font-black text-xs shrink-0 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Full Package Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Base Salary</span>
                <span className="font-bold text-gray-900">{role.baseRange}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Annual Bonus</span>
                <span className="font-bold text-gray-900">{role.bonus}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Equity</span>
                <span className="font-bold text-gray-900">{role.equity}</span>
              </div>
              <div className="h-px bg-gray-100 my-1" />
              <div className="flex justify-between text-sm">
                <span className="font-bold text-gray-900">Total Comp</span>
                <span className="font-extrabold text-green-600">{role.totalRange}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Top Paying Companies</h3>
            <ul className="space-y-2">
              {role.topCompanies.map(c => (
                <li key={c} className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {relatedRoles.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Related Salary Guides</h3>
              <div className="space-y-2">
                {relatedRoles.map(r => (
                  <Link
                    key={r.slug}
                    to={`/salary/${r.slug}`}
                    className="flex items-center justify-between text-sm text-gray-700 hover:text-gray-900 transition-colors group"
                  >
                    {r.abbr || r.title} Salary <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Explore {role.abbr || role.title} Jobs</h3>
            <div className="space-y-2">
              <Link to={`/executive-roles/${slug}`} className="flex items-center justify-between text-sm text-blue-700 hover:text-blue-900 group">
                Permanent {role.abbr} Jobs <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              <Link to={`/fractional/${slug}`} className="flex items-center justify-between text-sm text-violet-700 hover:text-violet-900 group">
                Fractional {role.abbr} Jobs <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              <Link to={`/interim/${slug}`} className="flex items-center justify-between text-sm text-teal-700 hover:text-teal-900 group">
                Interim {role.abbr} Jobs <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-gray-900 text-white p-5">
            <h3 className="font-bold text-base mb-2">Find {role.abbr} Roles Now</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Apex™ applies to matching {role.abbr} jobs on your behalf every day.
            </p>
            <Link
              to={`/find-jobs?q=${encodeURIComponent(role.searchQ)}`}
              className="flex items-center justify-center gap-2 bg-white text-gray-900 font-bold px-4 py-2 rounded-full text-sm hover:bg-gray-100 transition-colors mb-2"
            >
              <Briefcase className="h-3.5 w-3.5" /> Browse Jobs
            </Link>
            <Link
              to="/auth?mode=signup"
              className="block text-center border border-white/20 text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-white/10 transition-colors"
            >
              Start Free with Apex™
            </Link>
          </div>
        </div>
      </div>

      <FooterV2 />
    </>
  );
}
