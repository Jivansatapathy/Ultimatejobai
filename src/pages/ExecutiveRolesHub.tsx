import { Link } from "react-router-dom";
import { NavbarV2 } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";
import { EXEC_ROLES, DEPTS, DEPT_COLORS } from "@/data/executiveRoles";
import { ChevronRight, Briefcase } from "lucide-react";

const DEPT_ICONS: Record<string, string> = {
  Finance: "💰", Technology: "💻", Sales: "📈", Marketing: "📣",
  Operations: "⚙️", HR: "👥", Legal: "⚖️", Security: "🔐", Product: "🎯",
};

export default function ExecutiveRolesHub() {
  const rolesByDept = DEPTS.map(dept => ({
    dept,
    roles: EXEC_ROLES.filter(r => r.dept === dept),
  }));

  return (
    <>
      <title>Executive Roles — C-Suite & Senior Leadership Jobs | Hizorex</title>
      <NavbarV2 />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-200 mb-5">
            Executive &amp; Senior Leadership Roles
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Find Your Next Executive Role
          </h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto mb-8">
            Browse C-suite, VP, and Director-level opportunities across Finance, Technology, Sales, Marketing, and more.
          </p>
          <Link
            to="/find-jobs"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors"
          >
            <Briefcase className="h-4 w-4" /> Search All Executive Jobs
          </Link>
        </div>
      </section>

      {/* Role grid by department */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Browse by Function</h2>
          <p className="text-gray-500 text-sm mb-10">Click any role to see live job listings, salary data, and career insights.</p>

          <div className="space-y-12">
            {rolesByDept.filter(d => d.roles.length > 0).map(({ dept, roles }) => {
              const colors = DEPT_COLORS[dept];
              return (
                <div key={dept}>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-2xl">{DEPT_ICONS[dept]}</span>
                    <h3 className="text-xl font-bold text-gray-900">{dept}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {roles.map(role => (
                      <Link
                        key={role.slug}
                        to={`/executive-roles/${role.slug}`}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3.5 bg-white hover:shadow-sm transition-all group ${colors.border}`}
                      >
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{role.title}</p>
                          {role.abbr && <p className="text-xs text-gray-400 mt-0.5">{role.abbr}</p>}
                        </div>
                        <ChevronRight className={`h-4 w-4 shrink-0 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEO footer blurb */}
      <section className="py-12 px-4 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Hizorex — Built for Executive Job Seekers</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Hizorex is the AI-powered job platform built exclusively for senior leaders. We aggregate thousands of executive
            openings across CFO, CTO, COO, CMO, CHRO, and hundreds of VP, Director, and Head roles worldwide.
            Our Apex™ AI automatically applies to matching jobs on your behalf, saving hours of manual applications.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {["CFO Jobs", "CTO Jobs", "COO Jobs", "CMO Jobs", "CRO Jobs", "CHRO Jobs", "CPO Jobs", "CISO Jobs"].map(label => (
              <Link
                key={label}
                to={`/find-jobs?q=${label.replace(" Jobs", "")}`}
                className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:text-blue-700 transition-colors"
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
