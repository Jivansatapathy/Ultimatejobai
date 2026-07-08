import { Link } from "react-router-dom";
import { NavbarV2 } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";
import { EXEC_ROLES } from "@/data/executiveRoles";
import { Timer, ChevronRight, Briefcase, Zap, TrendingUp, Shield } from "lucide-react";

const INTERIM_SLUGS = ["cfo", "ceo", "coo", "cto", "cmo", "cio", "cro", "chro", "cpo", "clo", "ciso"];

const INTERIM_ROLES = EXEC_ROLES.filter(r => INTERIM_SLUGS.includes(r.slug)).map(r => ({
  slug: r.slug,
  title: `Interim ${r.abbr || r.title}`,
  full: r.title,
  dept: r.dept,
  salary: r.salary,
  description: `Short-term ${r.dept} leadership to bridge gaps, lead transformations, or cover transitions.`,
}));

const WHY_INTERIM = [
  {
    icon: <Zap className="h-5 w-5 text-teal-600" />,
    title: "Immediate Start",
    body: "Interim executives deploy in days, not months. No recruitment process, no notice period.",
  },
  {
    icon: <TrendingUp className="h-5 w-5 text-teal-600" />,
    title: "Crisis & Transformation",
    body: "Specialist leaders for M&A, restructuring, turnarounds, and rapid growth phases.",
  },
  {
    icon: <Shield className="h-5 w-5 text-teal-600" />,
    title: "Bridge the Gap",
    body: "Cover departures, maternity leave, or the time needed to find the perfect permanent hire.",
  },
  {
    icon: <Briefcase className="h-5 w-5 text-teal-600" />,
    title: "Senior Expertise",
    body: "Access 20+ year veterans who have run the function before — on a contract basis.",
  },
];

export default function InterimHub() {
  return (
    <>
      <title>Interim Executive Jobs — Interim CFO, CTO, CMO & More | Hizorex</title>
      <NavbarV2 />

      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-700 to-cyan-900 text-white py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-teal-200 mb-5">
            <Timer className="h-3 w-3" /> Interim Executive Roles
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Interim Executive Jobs
          </h1>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto mb-8">
            Find interim CFO, CTO, CMO, COO, and other C-suite contract roles. Step in immediately, lead through change,
            and deliver results on a fixed-term engagement.
          </p>
          <Link
            to="/find-jobs?q=interim"
            className="inline-flex items-center gap-2 bg-white text-teal-800 font-bold px-8 py-3 rounded-full hover:bg-teal-50 transition-colors"
          >
            <Briefcase className="h-4 w-4" /> Browse Interim Roles
          </Link>
        </div>
      </section>

      {/* Why interim */}
      <section className="py-12 px-4 bg-teal-50 border-b border-teal-100">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8 text-center">Why Interim?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_INTERIM.map(w => (
              <div key={w.title} className="bg-white rounded-2xl border border-teal-100 p-5">
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
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Browse Interim Roles</h2>
          <p className="text-gray-500 text-sm mb-10">Click any role to see live contract openings and what the engagement involves.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTERIM_ROLES.map(role => (
              <Link
                key={role.slug}
                to={`/interim/${role.slug}`}
                className="group flex flex-col gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-5 hover:border-teal-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">{role.title}</h3>
                  <ChevronRight className="h-4 w-4 text-teal-400 group-hover:text-teal-700 transition-colors" />
                </div>
                <p className="text-xs text-gray-500 leading-snug">{role.description}</p>
                <p className="text-xs font-bold text-teal-700">{role.dept}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-12 px-4 bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">When Companies Hire Interim Executives</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Leadership Departure", body: "A sudden resignation or termination leaves a critical gap. An interim steps in within days to maintain continuity." },
              { title: "M&A Transactions", body: "Post-merger integration requires specialist leadership that the acquired or acquiring company may not have." },
              { title: "Turnaround Situations", body: "Companies in financial distress or operational trouble need experienced executives with a track record of fixing problems fast." },
              { title: "Rapid Growth", body: "A high-growth startup or scale-up needs C-suite horsepower before they're ready to commit to a permanent hire." },
              { title: "Transformation Projects", body: "Digital transformation, ERP implementation, or market expansion requires a specialist leader for a defined period." },
              { title: "Extended Leave", body: "Maternity leave, medical leave, or sabbatical creates a planned gap that needs experienced interim cover." },
            ].map(u => (
              <div key={u.title} className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{u.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{u.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO blurb */}
      <section className="py-12 px-4 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Find Interim Executive Roles with Hizorex</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Hizorex aggregates interim and contract C-suite roles from across the web. Whether you're an interim CFO
            who specialises in distressed situations, or a serial interim CTO who builds engineering teams, Apex™
            finds and applies to matching engagements on your behalf every day.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {["Interim CFO Jobs", "Interim CTO Jobs", "Interim CMO Jobs", "Interim COO Jobs", "Interim CHRO Jobs"].map(label => (
              <Link
                key={label}
                to={`/find-jobs?q=${encodeURIComponent(label.replace(" Jobs", ""))}`}
                className="text-xs font-semibold bg-teal-50 border border-teal-200 text-teal-700 px-3 py-1.5 rounded-full hover:bg-teal-100 transition-colors"
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
