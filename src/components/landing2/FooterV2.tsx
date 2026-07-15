import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const LINKS = {
  "Executive Roles": [
    { label: "CFO Jobs", href: "/executive-roles/cfo" },
    { label: "CTO Jobs", href: "/executive-roles/cto" },
    { label: "COO Jobs", href: "/executive-roles/coo" },
    { label: "CMO Jobs", href: "/executive-roles/cmo" },
    { label: "All Executive Roles", href: "/executive-roles", bold: true },
  ],
  "Fractional & Startup": [
    { label: "Fractional CFO", href: "/fractional/cfo" },
    { label: "Startup CEO", href: "/startup/ceo" },
    { label: "Co-Founder", href: "/startup/co-founder" },
    { label: "All Fractional Roles", href: "/fractional", bold: true },
  ],
  "Board & Investors": [
    { label: "Board Member", href: "/board/board-member" },
    { label: "Managing Partner", href: "/investors/managing-partner" },
    { label: "Portfolio CEO", href: "/investors/portfolio-ceo" },
    { label: "All Investor Roles", href: "/investors", bold: true },
  ],
  "Resources": [
    { label: "Salary Guide", href: "/salary" },
    { label: "Interim Roles", href: "/interim" },
    { label: "Browse All Roles A–Z", href: "/browse-roles" },
    { label: "Blog & Insights", href: "/blog" },
  ],
  "Platform": [
    { label: "Browse Jobs", href: "/find-jobs" },
    { label: "Pricing", href: "/v2#pricing" },
    { label: "For Employers", href: "/employer/auth" },
  ],
  "Company": [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookie-policy" },
    { label: "Acceptable Use Policy", href: "/acceptable-use-policy" },
    { label: "Return Policy", href: "/return-policy" },
    { label: "Contact", href: "/contact" },
  ],
};

export const FooterV2 = () => (
  <footer className="bg-gray-900 text-white">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 lg:gap-6">
        {/* Brand col */}
        <div className="col-span-2 lg:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white p-1">
              <img src="/hizorex-logo.jpg" alt="Hizorex" className="h-full w-full rounded object-cover" />
            </span>
            <span className="text-base font-extrabold tracking-tight text-white">
              Hizorex
            </span>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed max-w-[200px]">
            The AI-powered executive job platform for senior leaders worldwide.
          </p>
        </div>

        {/* Link groups */}
        {Object.entries(LINKS).map(([group, links]) => (
          <div key={group}>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">{group}</p>
            <ul className="space-y-2.5">
              {links.map(l => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    className={`group inline-flex items-center gap-1 text-sm transition-colors ${
                      "bold" in l && l.bold
                        ? "text-gray-300 hover:text-white font-semibold"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {l.label}
                    {"bold" in l && l.bold && (
                      <ChevronRight className="h-3 w-3 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-600">© {new Date().getFullYear()} Hizorex. All rights reserved.</p>
        <p className="text-xs text-gray-600">Connecting senior leaders with their next opportunity.</p>
      </div>
    </div>
  </footer>
);
