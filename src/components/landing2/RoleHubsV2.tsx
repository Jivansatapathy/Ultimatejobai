import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Rocket, Shield, DollarSign, Timer } from "lucide-react";

const STARTUP_ROLES = [
  { title: "Startup CEO", href: "/startup/ceo" },
  { title: "Startup CTO", href: "/startup/cto" },
  { title: "Co-Founder", href: "/startup/co-founder" },
  { title: "Founding Engineer", href: "/startup/founding-engineer" },
  { title: "Startup CFO", href: "/startup/cfo" },
  { title: "Startup CMO", href: "/startup/cmo" },
];

const BOARD_ROLES = [
  { title: "Board Member", href: "/board/board-member" },
  { title: "Board Chair", href: "/board/board-chair" },
  { title: "Independent Director", href: "/board/independent-director" },
  { title: "Board Advisor", href: "/board/board-advisor" },
  { title: "Audit Committee Chair", href: "/board/audit-committee-chair" },
];

const SALARY_ROLES = [
  { title: "CFO Salary 2025", sub: "$180K – $450K base", href: "/salary/cfo" },
  { title: "CTO Salary 2025", sub: "$200K – $500K base", href: "/salary/cto" },
  { title: "CMO Salary 2025", sub: "$160K – $400K base", href: "/salary/cmo" },
  { title: "COO Salary 2025", sub: "$170K – $450K base", href: "/salary/coo" },
  { title: "CRO Salary 2025", sub: "$180K – $420K base", href: "/salary/cro" },
  { title: "CISO Salary 2025", sub: "$200K – $500K base", href: "/salary/ciso" },
];

const INTERIM_ROLES = [
  { title: "Interim CFO", href: "/interim/cfo" },
  { title: "Interim CTO", href: "/interim/cto" },
  { title: "Interim CMO", href: "/interim/cmo" },
  { title: "Interim COO", href: "/interim/coo" },
  { title: "Interim CHRO", href: "/interim/chro" },
];

export const RoleHubsV2 = () => (
  <section className="py-14 sm:py-20 px-4 sm:px-6 bg-white border-t border-gray-100">
    <div className="mx-auto max-w-6xl space-y-14">

      {/* Startup Leadership */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100">
              <Rocket className="h-4 w-4 text-orange-600" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Startup Leadership Jobs</h2>
              <p className="text-sm text-gray-400">Founding & early-stage executive roles</p>
            </div>
          </div>
          <Link to="/startup" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-800 transition-colors">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STARTUP_ROLES.map(r => (
            <Link
              key={r.href}
              to={r.href}
              className="group rounded-xl border border-orange-100 bg-orange-50 px-4 py-3.5 text-sm font-semibold text-gray-800 hover:border-orange-300 hover:bg-orange-100 hover:text-orange-800 transition-all flex items-center justify-between gap-1"
            >
              <span className="truncate">{r.title}</span>
              <ChevronRight className="h-3.5 w-3.5 text-orange-300 shrink-0 group-hover:text-orange-600" />
            </Link>
          ))}
        </div>
        <Link to="/startup" className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-orange-600 hover:text-orange-800 sm:hidden">
          View all startup roles <ChevronRight className="h-4 w-4" />
        </Link>
      </motion.div>

      {/* Board & Advisory */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <Shield className="h-4 w-4 text-slate-600" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Board & Advisory Roles</h2>
              <p className="text-sm text-gray-400">Director, chair, and governance positions</p>
            </div>
          </div>
          <Link to="/board" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {BOARD_ROLES.map(r => (
            <Link
              key={r.href}
              to={r.href}
              className="group rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-slate-400 hover:bg-slate-100 transition-all flex items-center gap-1.5"
            >
              {r.title}
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-600" />
            </Link>
          ))}
          <Link to="/investors" className="group rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 hover:border-emerald-300 transition-all flex items-center gap-1.5">
            VC & PE Roles <ChevronRight className="h-3.5 w-3.5 text-emerald-300 group-hover:text-emerald-600" />
          </Link>
        </div>
      </motion.div>

      {/* Salary + Interim — 2 col */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Salary Guides */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border border-gray-200 bg-gray-50 p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900">
                <DollarSign className="h-4 w-4 text-white" />
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">Salary Guides 2025</h2>
                <p className="text-xs text-gray-400">Real ranges — not guesses</p>
              </div>
            </div>
            <Link to="/salary" className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-0.5">
              All guides <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {SALARY_ROLES.map(r => (
              <Link
                key={r.href}
                to={r.href}
                className="group flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-2.5 hover:border-gray-400 hover:shadow-sm transition-all"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.title}</p>
                  <p className="text-xs text-gray-400">{r.sub}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-600 shrink-0" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Interim Roles */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border border-teal-100 bg-teal-50 p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600">
                <Timer className="h-4 w-4 text-white" />
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">Interim Executive Roles</h2>
                <p className="text-xs text-gray-400">Contract · Bridge · Transformation</p>
              </div>
            </div>
            <Link to="/interim" className="text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors flex items-center gap-0.5">
              All interim <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-2 mb-4">
            {INTERIM_ROLES.map(r => (
              <Link
                key={r.href}
                to={r.href}
                className="group flex items-center justify-between rounded-xl bg-white border border-teal-100 px-4 py-2.5 hover:border-teal-300 hover:shadow-sm transition-all"
              >
                <p className="text-sm font-semibold text-gray-900">{r.title}</p>
                <ChevronRight className="h-3.5 w-3.5 text-teal-300 group-hover:text-teal-600 shrink-0" />
              </Link>
            ))}
          </div>
          <p className="text-xs text-teal-700 leading-relaxed">
            Interim executives deploy in days, not months — covering leadership gaps, M&A, and transformations.
          </p>
        </motion.div>
      </div>

    </div>
  </section>
);
