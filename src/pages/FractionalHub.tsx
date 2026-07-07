import { Link } from "react-router-dom";
import { NavbarV2 } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";
import { EXEC_ROLES } from "@/data/executiveRoles";
import { Clock, ChevronRight, Briefcase } from "lucide-react";

const FRACTIONAL_SLUGS = ["cfo", "ceo", "coo", "cto", "cmo", "cio", "cro", "chro", "cpo", "clo"];

const FRACTIONAL_ROLES = EXEC_ROLES.filter(r => FRACTIONAL_SLUGS.includes(r.slug)).map(r => ({
  slug: r.slug,
  title: `Fractional ${r.abbr || r.title}`,
  full: r.title,
  dept: r.dept,
  salary: r.salary,
  description: `Part-time / interim ${r.dept} leadership without a full-time hire.`,
}));

const WHY_FRACTIONAL = [
  { title: "Cost-Effective", body: "Get C-suite expertise at 20–40% of the cost of a full-time hire." },
  { title: "Immediate Impact", body: "Fractional executives start in days, not months. No lengthy onboarding." },
  { title: "Flexible Commitment", body: "Scale hours up or down based on business needs and budget." },
  { title: "Proven Leadership", body: "All fractional executives have 10–25+ years of relevant experience." },
];

export default function FractionalHub() {
  return (
    <>
      <title>Fractional Executive Jobs — Fractional CFO, CTO, CMO & More | Hizorex</title>
      <NavbarV2 />

      {/* Hero */}
      <section className="bg-gradient-to-br from-violet-700 to-indigo-900 text-white py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-violet-200 mb-5">
            <Clock className="h-3 w-3" /> Fractional Executive Roles
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Fractional Executive Jobs
          </h1>
          <p className="text-lg text-violet-200 max-w-2xl mx-auto mb-8">
            Find part-time CFO, CTO, CMO, COO, and other C-suite opportunities. Work with multiple companies simultaneously
            and earn executive-level compensation on your schedule.
          </p>
          <Link
            to="/fractional-jobs"
            className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-8 py-3 rounded-full hover:bg-violet-50 transition-colors"
          >
            <Briefcase className="h-4 w-4" /> Browse Fractional Roles
          </Link>
        </div>
      </section>

      {/* Why fractional */}
      <section className="py-12 px-4 bg-gray-50 border-b border-gray-100">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8 text-center">Why Fractional?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_FRACTIONAL.map(w => (
              <div key={w.title} className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-2">{w.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role grid */}
      <section className="py-14 px-4 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Browse Fractional Roles</h2>
          <p className="text-gray-500 text-sm mb-8">Click any role to see open positions and role details.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FRACTIONAL_ROLES.map(role => (
              <Link
                key={role.slug}
                to={`/fractional/${role.slug}`}
                className="group flex flex-col gap-3 rounded-2xl border border-violet-100 bg-violet-50 p-5 hover:border-violet-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">{role.title}</h3>
                  <ChevronRight className="h-4 w-4 text-violet-400 group-hover:text-violet-700 transition-colors" />
                </div>
                <p className="text-xs text-gray-500 leading-snug">{role.description}</p>
                <p className="text-xs font-bold text-violet-700">{role.dept}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SEO text */}
      <section className="py-12 px-4 bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-3">The World's Leading Platform for Fractional Executives</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Hizorex connects experienced executives with companies that need fractional leadership. Whether you're a Fractional CFO
            supporting three startups, or a Fractional CTO advising a PE portfolio company, Hizorex surfaces the right opportunities —
            and our Apex™ AI applies on your behalf so you can focus on the work.
          </p>
        </div>
      </section>

      <FooterV2 />
    </>
  );
}
