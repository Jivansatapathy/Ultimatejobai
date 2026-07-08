import { Link } from "react-router-dom";
import { NavbarV2 } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";
import { SALARY_ROLES } from "@/data/salaryData";
import { DollarSign, TrendingUp, ChevronRight, MapPin, Award } from "lucide-react";

const DEPT_ORDER = ["Finance", "Technology", "Sales", "Marketing", "Operations", "HR", "Product", "Security"];

const INSIGHTS = [
  { icon: <TrendingUp className="h-5 w-5 text-green-600" />, title: "AI Premium", body: "Executives with AI/ML expertise earn 20–40% above market rate across all functions in 2025." },
  { icon: <MapPin className="h-5 w-5 text-blue-600" />, title: "Location Delta", body: "San Francisco pays 35–50% above the national median for C-suite roles. Remote premium has narrowed to ~10%." },
  { icon: <Award className="h-5 w-5 text-violet-600" />, title: "Equity Is Rising", body: "Pre-IPO equity has become the primary differentiator for senior roles — base salary gap matters less than vesting terms." },
  { icon: <DollarSign className="h-5 w-5 text-orange-600" />, title: "PE Carry", body: "Operating Partners and portfolio company executives at PE firms see 2–5x total comp through carried interest." },
];

export default function SalaryHub() {
  const rolesByDept = DEPT_ORDER.map(dept => ({
    dept,
    roles: SALARY_ROLES.filter(r => r.dept === dept),
  })).filter(d => d.roles.length > 0);

  return (
    <>
      <title>Executive Salary Guide 2025 — CFO, CTO, CMO, COO Salary Data | Hizorex</title>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ultimatejobai.vercel.app/" },
          { "@type": "ListItem", "position": 2, "name": "Salary Guides", "item": "https://ultimatejobai.vercel.app/salary" },
        ],
      }) }} />
      <NavbarV2 />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-300 mb-5">
            <DollarSign className="h-3 w-3" /> 2025 Salary Data
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Executive Salary Guide 2025
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Real salary ranges for CFO, CTO, CMO, COO, CRO, CHRO, CPO, and CISO roles — by company stage, location,
            and experience level. Know your worth before your next negotiation.
          </p>
          <Link
            to="/find-jobs"
            className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <DollarSign className="h-4 w-4" /> Browse Jobs With Salary
          </Link>
        </div>
      </section>

      {/* Market Insights */}
      <section className="py-12 px-4 bg-gray-50 border-b border-gray-200">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-xl font-extrabold text-gray-900 mb-6 text-center">2025 Market Insights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INSIGHTS.map(i => (
              <div key={i.title} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="mb-3">{i.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{i.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{i.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Salary cards grid */}
      <section className="py-14 px-4 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Salary by Role</h2>
          <p className="text-gray-500 text-sm mb-10">Click any role for a detailed breakdown by experience level, location, and company stage.</p>

          <div className="space-y-12">
            {rolesByDept.map(({ dept, roles }) => (
              <div key={dept}>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">{dept}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roles.map(role => (
                    <Link
                      key={role.slug}
                      to={`/salary/${role.slug}`}
                      className="group flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 hover:border-gray-400 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900">{role.abbr || role.title}</p>
                          <p className="text-xs text-gray-400">{role.title}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Total Compensation</p>
                          <p className="text-sm font-extrabold text-gray-900">{role.totalRange}</p>
                        </div>
                        <span className="text-xs font-semibold bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-100">
                          {role.dept}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Negotiation section */}
      <section className="py-12 px-4 bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">How to Negotiate an Executive Package</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { n: "01", title: "Know the Total Package", body: "Base is only part of it. Factor in bonus structure, equity (type, amount, vesting), benefits, severance, and LTIPs." },
              { n: "02", title: "Benchmark Publicly", body: "SEC proxy filings, Levels.fyi, Glassdoor, and Hizorex job listings with salary data are all legitimate benchmarks to cite." },
              { n: "03", title: "Negotiate Equity Terms", body: "Vesting schedule, cliff period, acceleration on acquisition, and strike price matter as much as the number of shares." },
              { n: "04", title: "Get Board Dynamics", body: "For C-suite roles, understanding the board's expectations and your relationship with the Chair matters as much as the salary." },
            ].map(t => (
              <div key={t.n} className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4">
                <span className="text-2xl font-black text-gray-100 shrink-0">{t.n}</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{t.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO blurb */}
      <section className="py-12 px-4 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Salary Data You Can Trust</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Hizorex salary guides are compiled from job postings, public proxy filings, recruiter surveys, and executive
            compensation data. Ranges are updated quarterly and reflect real-world offers, not aspirational figures.
            Use these benchmarks in your next salary negotiation.
          </p>
        </div>
      </section>

      <FooterV2 />
    </>
  );
}
