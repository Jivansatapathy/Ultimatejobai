import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight, ArrowUpRight, Rocket, Shield, DollarSign, Timer, Globe,
  Crown, Cpu, Briefcase, Target, Users2, Code2, Layers, Award,
  ClipboardCheck, TrendingUp, Star, ShieldAlert, HeartHandshake,
} from "lucide-react";

const STARTUP_ROLES = [
  { title: "Startup CEO", sub: "Founding leadership", icon: Crown, href: "/startup/ceo" },
  { title: "Startup CTO", sub: "Technical co-founder", icon: Cpu, href: "/startup/cto" },
  { title: "Startup CFO", sub: "Early-stage finance", icon: DollarSign, href: "/startup/cfo" },
  { title: "Startup COO", sub: "Ops & scaling", icon: Briefcase, href: "/startup/coo" },
  { title: "Startup CMO", sub: "Growth & brand", icon: Target, href: "/startup/cmo" },
  { title: "Co-Founder", sub: "Ground-floor equity", icon: Users2, href: "/startup/co-founder" },
  { title: "Founding Engineer", sub: "First technical hire", icon: Code2, href: "/startup/founding-engineer" },
];

const FRACTIONAL_ROLES = [
  { title: "Fractional CFO", sub: "Part-time finance lead", icon: DollarSign, href: "/fractional/cfo" },
  { title: "Fractional CTO", sub: "Part-time tech lead", icon: Cpu, href: "/fractional/cto" },
  { title: "Fractional COO", sub: "Part-time operations", icon: Briefcase, href: "/fractional/coo" },
  { title: "Fractional CMO", sub: "Part-time marketing", icon: Target, href: "/fractional/cmo" },
  { title: "Fractional CIO", sub: "Part-time IT strategy", icon: Layers, href: "/fractional/cio" },
];

const BOARD_ROLES = [
  { title: "Board Member", sub: "Governance seat", icon: Shield, href: "/board/board-member" },
  { title: "Board Chair", sub: "Board leadership", icon: Crown, href: "/board/board-chair" },
  { title: "Independent Director", sub: "Non-executive director", icon: Users2, href: "/board/independent-director" },
  { title: "Board Advisor", sub: "Strategic counsel", icon: Award, href: "/board/board-advisor" },
  { title: "Audit Committee Chair", sub: "Financial oversight", icon: ClipboardCheck, href: "/board/audit-committee-chair" },
  { title: "Venture Partner", sub: "VC leadership", icon: TrendingUp, href: "/investors/venture-partner" },
  { title: "Operating Partner", sub: "PE portfolio ops", icon: Briefcase, href: "/investors/operating-partner" },
  { title: "Managing Partner", sub: "Firm leadership", icon: Crown, href: "/investors/managing-partner" },
  { title: "Portfolio CEO", sub: "PE-backed CEO", icon: Star, href: "/investors/portfolio-ceo" },
];

const SALARY_ROLES = [
  { title: "CFO Salary 2025", sub: "$180K – $450K base", icon: DollarSign, href: "/salary/cfo" },
  { title: "CTO Salary 2025", sub: "$200K – $500K base", icon: Cpu, href: "/salary/cto" },
  { title: "CMO Salary 2025", sub: "$160K – $400K base", icon: Target, href: "/salary/cmo" },
  { title: "COO Salary 2025", sub: "$170K – $450K base", icon: Briefcase, href: "/salary/coo" },
  { title: "CRO Salary 2025", sub: "$180K – $420K base", icon: TrendingUp, href: "/salary/cro" },
  { title: "CISO Salary 2025", sub: "$200K – $500K base", icon: ShieldAlert, href: "/salary/ciso" },
];

const INTERIM_ROLES = [
  { title: "Interim CFO", sub: "Finance leadership", icon: DollarSign, href: "/interim/cfo" },
  { title: "Interim CTO", sub: "Technology leadership", icon: Cpu, href: "/interim/cto" },
  { title: "Interim CMO", sub: "Marketing leadership", icon: Target, href: "/interim/cmo" },
  { title: "Interim COO", sub: "Operations leadership", icon: Briefcase, href: "/interim/coo" },
  { title: "Interim CHRO", sub: "People leadership", icon: HeartHandshake, href: "/interim/chro" },
];

type Accent = {
  ring: string;
  wash: string;
  badge: string;
  badgeIcon: string;
  cardBorder: string;
  cardHoverBorder: string;
  cardIconBg: string;
  cardIconHoverBg: string;
  cardIconText: string;
  link: string;
  linkHover: string;
  pill: string;
  pillHover: string;
};

const ACCENTS: Record<"orange" | "violet" | "slate", Accent> = {
  orange: {
    ring: "border-orange-100",
    wash: "from-orange-50/70",
    badge: "bg-gradient-to-br from-orange-500 to-orange-600",
    badgeIcon: "text-white",
    cardBorder: "border-gray-200",
    cardHoverBorder: "hover:border-orange-300",
    cardIconBg: "bg-orange-50",
    cardIconHoverBg: "group-hover:bg-orange-600",
    cardIconText: "text-orange-600",
    link: "text-orange-700",
    linkHover: "hover:text-orange-900",
    pill: "border-orange-200 bg-orange-50 text-orange-700",
    pillHover: "hover:bg-orange-100 hover:border-orange-300",
  },
  violet: {
    ring: "border-violet-100",
    wash: "from-violet-50/70",
    badge: "bg-gradient-to-br from-violet-500 to-violet-600",
    badgeIcon: "text-white",
    cardBorder: "border-gray-200",
    cardHoverBorder: "hover:border-violet-300",
    cardIconBg: "bg-violet-50",
    cardIconHoverBg: "group-hover:bg-violet-600",
    cardIconText: "text-violet-600",
    link: "text-violet-700",
    linkHover: "hover:text-violet-900",
    pill: "border-violet-200 bg-violet-50 text-violet-700",
    pillHover: "hover:bg-violet-100 hover:border-violet-300",
  },
  slate: {
    ring: "border-slate-200",
    wash: "from-slate-50/70",
    badge: "bg-gradient-to-br from-slate-700 to-slate-900",
    badgeIcon: "text-white",
    cardBorder: "border-gray-200",
    cardHoverBorder: "hover:border-slate-400",
    cardIconBg: "bg-slate-100",
    cardIconHoverBg: "group-hover:bg-slate-800",
    cardIconText: "text-slate-700",
    link: "text-slate-700",
    linkHover: "hover:text-slate-900",
    pill: "border-slate-200 bg-slate-50 text-slate-700",
    pillHover: "hover:bg-slate-100 hover:border-slate-400",
  },
};

function RoleHubSection({
  accent, icon: Icon, title, subtitle, viewAllHref, roles, footer,
}: {
  accent: keyof typeof ACCENTS;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  viewAllHref: string;
  roles: { title: string; sub: string; icon: React.ElementType; href: string }[];
  footer: string;
}) {
  const a = ACCENTS[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className={`rounded-3xl border ${a.ring} bg-gradient-to-br ${a.wash} to-white p-5 sm:p-8`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-4">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${a.badge}`}>
            <Icon className={`h-5 w-5 ${a.badgeIcon}`} />
          </span>
          <div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900 leading-tight">{title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <Link
          to={viewAllHref}
          className={`inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors shrink-0 ${a.pill} ${a.pillHover}`}
        >
          View all <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {roles.map((r, i) => (
          <motion.div
            key={r.href}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: (i % 8) * 0.04 }}
          >
            <Link
              to={r.href}
              className={`group relative flex flex-col gap-3 rounded-2xl border ${a.cardBorder} ${a.cardHoverBorder} bg-white p-4 h-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
            >
              <div className="flex items-center justify-between">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${a.cardIconBg} ${a.cardIconHoverBg} transition-colors`}>
                  <r.icon className={`h-4 w-4 ${a.cardIconText} group-hover:text-white transition-colors`} />
                </span>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm leading-tight">{r.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">{r.sub}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <p className="mt-6 text-sm text-gray-500 leading-relaxed max-w-3xl">{footer}</p>
    </motion.div>
  );
}

export const RoleHubsV2 = () => (
  <section className="py-14 sm:py-20 px-4 sm:px-6 bg-white border-t border-gray-100">
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">

      <RoleHubSection
        accent="orange"
        icon={Rocket}
        title="Startup Executive Jobs & Founding Leadership Roles"
        subtitle="Looking to join an ambitious startup? Browse founding and early-stage executive roles."
        viewAllHref="/startup"
        roles={STARTUP_ROLES}
        footer="Our platform helps startups discover experienced executive talent while helping leaders find exciting early-stage opportunities."
      />

      <RoleHubSection
        accent="violet"
        icon={Globe}
        title="Fractional Executive Jobs for Modern Companies"
        subtitle="Experienced leaders hired on a flexible, part-time basis"
        viewAllHref="/fractional"
        roles={FRACTIONAL_ROLES}
        footer="Whether you're an experienced consultant or building a portfolio career, Hizorex connects executives with growing startups, venture-backed companies, and enterprise organizations."
      />

      <RoleHubSection
        accent="slate"
        icon={Shield}
        title="Board Member & Advisory Opportunities"
        subtitle="Expand your executive career with strategic leadership and governance roles"
        viewAllHref="/board"
        roles={BOARD_ROLES}
        footer="These opportunities are ideal for executives looking to contribute strategic leadership, governance, and operational expertise."
      />

      {/* Salary + Interim — 2 col */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 pt-6 sm:pt-8">

        {/* Salary Guides */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-900 to-black p-6 sm:p-7"
        >
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm">
                <DollarSign className="h-5 w-5 text-white" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight">Salary Guides 2025</h2>
                <p className="text-xs text-gray-400 mt-0.5">Real ranges — not guesses</p>
              </div>
            </div>
            <Link
              to="/salary"
              className="inline-flex items-center gap-1.5 self-start rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-300 hover:bg-white/10 hover:border-amber-400/40 transition-colors shrink-0"
            >
              All guides <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="relative grid grid-cols-2 gap-3">
            {SALARY_ROLES.map((r, i) => (
              <motion.div
                key={r.href}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Link
                  to={r.href}
                  className="group flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 h-full hover:bg-white/[0.08] hover:border-amber-400/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 group-hover:bg-amber-500 transition-colors">
                      <r.icon className="h-3.5 w-3.5 text-amber-300 group-hover:text-white transition-colors" />
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">{r.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.sub}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interim Roles */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50/70 to-white p-6 sm:p-7"
        >
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-sm">
                <Timer className="h-5 w-5 text-white" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">Interim Executive Roles</h2>
                <p className="text-xs text-gray-500 mt-0.5">Contract · Bridge · Transformation</p>
              </div>
            </div>
            <Link
              to="/interim"
              className="inline-flex items-center gap-1.5 self-start rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-teal-700 hover:bg-teal-100 hover:border-teal-300 transition-colors shrink-0"
            >
              All interim <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {INTERIM_ROLES.map((r, i) => (
              <motion.div
                key={r.href}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className={i === 4 ? "col-span-2 sm:col-span-1" : ""}
              >
                <Link
                  to={r.href}
                  className="group flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-3.5 h-full hover:border-teal-300 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 group-hover:bg-teal-600 transition-colors">
                      <r.icon className="h-3.5 w-3.5 text-teal-600 group-hover:text-white transition-colors" />
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{r.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.sub}</p>
                  </div>
                </Link>
              </motion.div>
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
