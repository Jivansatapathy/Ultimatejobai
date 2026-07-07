import { Link } from "react-router-dom";
import { NavbarV2 } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";
import { STARTUP_ROLES } from "@/data/startupBoardRoles";
import { ChevronRight, Rocket, Briefcase, Users, DollarSign } from "lucide-react";

const WHY_STARTUP = [
  { icon: <Rocket className="h-5 w-5 text-orange-500" />, title: "Equity Upside", body: "Join early and own a meaningful stake. Startup executives typically receive 0.5–5% equity." },
  { icon: <Users className="h-5 w-5 text-orange-500" />, title: "Build From Scratch", body: "Shape the culture, product, and team from day one. No legacy, no politics." },
  { icon: <DollarSign className="h-5 w-5 text-orange-500" />, title: "Accelerated Career", body: "2 years at a startup can unlock more growth than 10 years in a corporation." },
  { icon: <Briefcase className="h-5 w-5 text-orange-500" />, title: "Mission-Driven", body: "Work on problems you care about with founders who want to change the world." },
];

const ROLE_CATEGORIES = [
  {
    label: "Founding Team",
    slugs: ["ceo", "cto", "co-founder"],
  },
  {
    label: "Growth & Revenue",
    slugs: ["cmo", "cro"],
  },
  {
    label: "Operations & Finance",
    slugs: ["coo", "cfo"],
  },
  {
    label: "Technical & Advisory",
    slugs: ["founding-engineer", "startup-advisor"],
  },
];

export default function StartupHub() {
  return (
    <>
      <title>Startup Jobs — Startup CEO, CTO, Founding Engineer & More | Hizorex</title>
      <NavbarV2 />

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-600 to-rose-700 text-white py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-200 mb-5">
            <Rocket className="h-3 w-3" /> Startup & Founding Roles
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Startup Executive &amp; Founding Jobs
          </h1>
          <p className="text-lg text-orange-100 max-w-2xl mx-auto mb-8">
            Find CEO, CTO, CFO, Co-Founder, Founding Engineer, and other early-stage leadership roles at high-growth startups.
          </p>
          <Link
            to="/find-jobs?q=startup"
            className="inline-flex items-center gap-2 bg-white text-orange-700 font-bold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors"
          >
            <Briefcase className="h-4 w-4" /> Browse Startup Jobs
          </Link>
        </div>
      </section>

      {/* Why startup */}
      <section className="py-12 px-4 bg-orange-50 border-b border-orange-100">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8 text-center">Why Join a Startup?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_STARTUP.map(w => (
              <div key={w.title} className="bg-white rounded-2xl border border-orange-100 p-5">
                <div className="mb-3">{w.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{w.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role grid by category */}
      <section className="py-14 px-4 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Browse Startup Roles</h2>
          <p className="text-gray-500 text-sm mb-10">Click any role to see live openings, salary ranges, and what the job involves.</p>

          <div className="space-y-10">
            {ROLE_CATEGORIES.map(({ label, slugs }) => {
              const roles = slugs.map(s => STARTUP_ROLES.find(r => r.slug === s)).filter(Boolean) as typeof STARTUP_ROLES;
              return (
                <div key={label}>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-orange-600 mb-4">{label}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.map(role => (
                      <Link
                        key={role.slug}
                        to={`/startup/${role.slug}`}
                        className="group flex flex-col gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-5 hover:border-orange-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900">{role.title}</h4>
                          <ChevronRight className="h-4 w-4 text-orange-400 group-hover:text-orange-700 transition-colors" />
                        </div>
                        <p className="text-xs text-gray-500 leading-snug line-clamp-2">{role.description}</p>
                        <p className="text-xs font-bold text-orange-700">{role.salary}</p>
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
          <h2 className="text-xl font-bold text-gray-900 mb-3">The Best Platform for Startup Executive Jobs</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Hizorex aggregates executive and founding roles at early-stage and high-growth startups worldwide. Whether you're
            a first-time founder looking for a co-founder, or a seasoned CTO ready for your next founding role, Hizorex's
            Apex™ AI finds and applies to matching opportunities automatically.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {["Startup CEO Jobs", "Startup CTO Jobs", "Co-Founder Jobs", "Founding Engineer Jobs", "Startup CFO Jobs"].map(label => (
              <Link
                key={label}
                to={`/find-jobs?q=${encodeURIComponent(label.replace(" Jobs", ""))}`}
                className="text-xs font-semibold bg-white border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full hover:bg-orange-50 transition-colors"
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
