import { Link } from "react-router-dom";
import { NavbarV2 } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";
import { INVESTOR_ROLES } from "@/data/startupBoardRoles";
import { ChevronRight, Briefcase, TrendingUp, Building2, DollarSign } from "lucide-react";

const WHY_INVESTOR = [
  { icon: <TrendingUp className="h-5 w-5 text-emerald-600" />, title: "Carried Interest", body: "Earn 20% of fund profits on top of base salary — the most lucrative compensation structure in finance." },
  { icon: <Building2 className="h-5 w-5 text-emerald-600" />, title: "Portfolio Impact", body: "Work with dozens of companies at once, shaping strategy across multiple industries." },
  { icon: <DollarSign className="h-5 w-5 text-emerald-600" />, title: "Top-Tier Pay", body: "Managing and General Partners at top-tier funds earn $500K–$2M+ in compensation." },
  { icon: <Briefcase className="h-5 w-5 text-emerald-600" />, title: "Network Access", body: "Build a world-class network of founders, executives, and co-investors." },
];

const ROLE_CATEGORIES = [
  {
    label: "Fund Leadership",
    slugs: ["managing-partner", "general-partner", "venture-partner"],
  },
  {
    label: "Private Equity",
    slugs: ["operating-partner", "private-equity-principal", "growth-equity-partner"],
  },
  {
    label: "Portfolio Roles",
    slugs: ["portfolio-ceo", "portfolio-cfo"],
  },
];

export default function InvestorHub() {
  return (
    <>
      <title>Investor & PE Jobs — VC, Private Equity & Portfolio Company Roles | Hizorex</title>
      <NavbarV2 />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 to-teal-900 text-white py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-200 mb-5">
            <TrendingUp className="h-3 w-3" /> Investor & PE Roles
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Venture Capital &amp; Private Equity Jobs
          </h1>
          <p className="text-lg text-emerald-100 max-w-2xl mx-auto mb-8">
            Find Managing Partner, General Partner, Operating Partner, and Portfolio Company leadership roles at leading VC and PE firms.
          </p>
          <Link
            to="/find-jobs?q=venture+capital"
            className="inline-flex items-center gap-2 bg-white text-emerald-800 font-bold px-8 py-3 rounded-full hover:bg-emerald-50 transition-colors"
          >
            <Briefcase className="h-4 w-4" /> Browse Investor Jobs
          </Link>
        </div>
      </section>

      {/* Why investor roles */}
      <section className="py-12 px-4 bg-emerald-50 border-b border-emerald-100">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8 text-center">Why VC &amp; PE Roles?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_INVESTOR.map(w => (
              <div key={w.title} className="bg-white rounded-2xl border border-emerald-100 p-5">
                <div className="mb-3">{w.icon}</div>
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
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Browse Investor Roles</h2>
          <p className="text-gray-500 text-sm mb-10">Click any role to see live openings, compensation details, and what the job involves.</p>

          <div className="space-y-10">
            {ROLE_CATEGORIES.map(({ label, slugs }) => {
              const roles = slugs.map(s => INVESTOR_ROLES.find(r => r.slug === s)).filter(Boolean) as typeof INVESTOR_ROLES;
              return (
                <div key={label}>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-700 mb-4">{label}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.map(role => (
                      <Link
                        key={role.slug}
                        to={`/investors/${role.slug}`}
                        className="group flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 hover:border-emerald-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900">{role.title}</h4>
                          <ChevronRight className="h-4 w-4 text-emerald-400 group-hover:text-emerald-700 transition-colors" />
                        </div>
                        <p className="text-xs text-gray-500 leading-snug line-clamp-2">{role.description}</p>
                        <p className="text-xs font-bold text-emerald-700">{role.salary}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEO text */}
      <section className="py-12 px-4 bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Find VC &amp; PE Roles with Hizorex</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Hizorex aggregates investment roles at venture capital, private equity, growth equity, and family office firms worldwide.
            Whether you're a seasoned GP looking for a new fund, or an operator ready to join a PE firm as Operating Partner,
            our Apex™ AI finds and applies to matching opportunities on your behalf.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {["Managing Partner Jobs", "General Partner Jobs", "Operating Partner Jobs", "Portfolio CEO Jobs", "Private Equity Jobs"].map(label => (
              <Link
                key={label}
                to={`/find-jobs?q=${encodeURIComponent(label.replace(" Jobs", ""))}`}
                className="text-xs font-semibold bg-white border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full hover:bg-emerald-50 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FooterV2 />
    </>
  );
}
