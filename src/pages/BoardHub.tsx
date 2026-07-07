import { Link } from "react-router-dom";
import { NavbarV2 } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";
import { BOARD_ROLES } from "@/data/startupBoardRoles";
import { ChevronRight, Briefcase, Shield, Scale, Star } from "lucide-react";

const WHY_BOARD = [
  { icon: <Scale className="h-5 w-5 text-slate-600" />, title: "Governance Leadership", body: "Board members set the strategic direction and ensure the company operates with integrity." },
  { icon: <Shield className="h-5 w-5 text-slate-600" />, title: "Fiduciary Duty", body: "Protect shareholder interests and ensure financial integrity and compliance." },
  { icon: <Star className="h-5 w-5 text-slate-600" />, title: "Portfolio Compensation", body: "Board roles typically offer a mix of retainer fees, meeting fees, and equity grants." },
  { icon: <Briefcase className="h-5 w-5 text-slate-600" />, title: "Multiple Seats", body: "Experienced directors often hold 3–5 board seats simultaneously across companies." },
];

export default function BoardHub() {
  return (
    <>
      <title>Board of Directors Jobs — Board Member, Chair & Director Roles | Hizorex</title>
      <NavbarV2 />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-300 mb-5">
            <Shield className="h-3 w-3" /> Board & Director Roles
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Board of Directors Jobs
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
            Find board member, independent director, board chair, and advisory board roles at public, private, and PE-backed companies.
          </p>
          <Link
            to="/find-jobs?q=board+member"
            className="inline-flex items-center gap-2 bg-white text-slate-800 font-bold px-8 py-3 rounded-full hover:bg-slate-100 transition-colors"
          >
            <Briefcase className="h-4 w-4" /> Browse Board Roles
          </Link>
        </div>
      </section>

      {/* Why board */}
      <section className="py-12 px-4 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8 text-center">Why Board Roles?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_BOARD.map(w => (
              <div key={w.title} className="bg-white rounded-2xl border border-slate-200 p-5">
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
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Browse Board Roles</h2>
          <p className="text-gray-500 text-sm mb-10">Click any role to see live openings, compensation data, and what the position involves.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BOARD_ROLES.map(role => (
              <Link
                key={role.slug}
                to={`/board/${role.slug}`}
                className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:border-slate-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">{role.title}</h3>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                </div>
                <p className="text-xs text-gray-500 leading-snug line-clamp-2">{role.description}</p>
                <p className="text-xs font-bold text-slate-600">{role.salary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SEO text */}
      <section className="py-12 px-4 bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Find Board Seats at Leading Companies</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Hizorex aggregates board member, independent director, audit committee, and advisory board opportunities at
            public companies, PE-backed businesses, and high-growth startups. Use Apex™ to automatically surface and apply
            to board roles matching your background and governance expertise.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {["Board Member Jobs", "Independent Director Jobs", "Board Chair Jobs", "Advisory Board Jobs"].map(label => (
              <Link
                key={label}
                to={`/find-jobs?q=${encodeURIComponent(label.replace(" Jobs", ""))}`}
                className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors"
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
