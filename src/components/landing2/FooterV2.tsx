import { Link } from "react-router-dom";
import { Bot } from "lucide-react";

const LINKS = {
  "Popular Roles": [
    { label: "CFO Jobs", href: "/executive-roles/cfo" },
    { label: "CTO Jobs", href: "/executive-roles/cto" },
    { label: "COO Jobs", href: "/executive-roles/coo" },
    { label: "CMO Jobs", href: "/executive-roles/cmo" },
    { label: "CRO Jobs", href: "/executive-roles/cro" },
    { label: "CHRO Jobs", href: "/executive-roles/chro" },
    { label: "All Executive Roles", href: "/executive-roles" },
  ],
  "Fractional": [
    { label: "Fractional CFO", href: "/fractional/cfo" },
    { label: "Fractional CTO", href: "/fractional/cto" },
    { label: "Fractional CMO", href: "/fractional/cmo" },
    { label: "Fractional COO", href: "/fractional/coo" },
    { label: "All Fractional Roles", href: "/fractional" },
  ],
  "Startup & Board": [
    { label: "Startup CEO", href: "/startup/ceo" },
    { label: "Startup CTO", href: "/startup/cto" },
    { label: "Co-Founder", href: "/startup/co-founder" },
    { label: "Board Member", href: "/board/board-member" },
    { label: "Independent Director", href: "/board/independent-director" },
    { label: "All Startup Roles", href: "/startup" },
  ],
  "Investors": [
    { label: "Managing Partner", href: "/investors/managing-partner" },
    { label: "General Partner", href: "/investors/general-partner" },
    { label: "Operating Partner", href: "/investors/operating-partner" },
    { label: "Portfolio CEO", href: "/investors/portfolio-ceo" },
    { label: "All Investor Roles", href: "/investors" },
  ],
  "Platform": [
    { label: "Browse Executive Jobs", href: "/find-jobs" },
    { label: "How It Works", href: "/v2#how-it-works" },
    { label: "Apex™ AI Apply Bot", href: "/v2#features" },
    { label: "Pricing", href: "/v2#pricing" },
    { label: "For Employers", href: "/employer/auth" },
  ],
  "Company": [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Return Policy", href: "/return-policy" },
    { label: "Contact", href: "/contact" },
  ],
};

export const FooterV2 = () => (
  <footer className="bg-gray-900 text-white">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8">
        {/* Brand col */}
        <div className="col-span-2 lg:col-span-1">
          <Link to="/" className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
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
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {l.label}
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
