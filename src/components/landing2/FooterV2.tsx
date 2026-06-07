import { Link } from "react-router-dom";
import { Bot } from "lucide-react";

const LINKS = {
  "Job Seekers": [
    { label: "Browse Jobs", href: "/find-jobs" },
    { label: "Upload Resume", href: "/resume" },
    { label: "Interview Prep", href: "/interview" },
    { label: "Career Planner", href: "/career-planner" },
    { label: "AI Mentor", href: "/ai-mentor" },
  ],
  "Platform": [
    { label: "How It Works", href: "/v2#how-it-works" },
    { label: "Apex™ Bot", href: "/v2#features" },
    { label: "Pricing", href: "/v2#pricing" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  "Employers": [
    { label: "Post a Job", href: "/employer/auth" },
    { label: "Employer Login", href: "/employer/auth" },
    { label: "Talent Pool", href: "/employer/auth" },
  ],
  "Company": [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Return Policy", href: "/return-policy" },
  ],
};

export const FooterV2 = () => (
  <footer className="bg-gray-900 text-white">
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
        {/* Brand col */}
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-white">
              Job<span className="text-blue-400">AI</span>
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
        <p className="text-xs text-gray-600">© {new Date().getFullYear()} JobAI. All rights reserved.</p>
        <p className="text-xs text-gray-600">Connecting senior leaders with their next opportunity.</p>
      </div>
    </div>
  </footer>
);
