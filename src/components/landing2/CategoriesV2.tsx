import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Crown, TrendingUp, Users2, Briefcase, Globe, Cpu, DollarSign,
  HeartPulse, ChevronRight,
} from "lucide-react";

const CATEGORIES = [
  { icon: Crown,       label: "C-Suite",         sub: "CEO, CFO, CTO & more",  count: "12,400+", color: "bg-blue-50 border-blue-200 text-blue-700",  icon_bg: "bg-blue-600", q: "seniority=C-Suite" },
  { icon: TrendingUp,  label: "VP Level",         sub: "VP Engineering, Sales…", count: "8,200+",  color: "bg-violet-50 border-violet-200 text-violet-700", icon_bg: "bg-violet-600", q: "seniority=VP" },
  { icon: Users2,      label: "Director",         sub: "Dir. Operations, HR…",  count: "11,800+", color: "bg-emerald-50 border-emerald-200 text-emerald-700", icon_bg: "bg-emerald-600", q: "seniority=Director" },
  { icon: Cpu,         label: "Technology",       sub: "CTO, CIO, VP Eng…",     count: "9,100+",  color: "bg-sky-50 border-sky-200 text-sky-700",    icon_bg: "bg-sky-600", q: "q=technology" },
  { icon: DollarSign,  label: "Finance",          sub: "CFO, VP Finance…",      count: "5,600+",  color: "bg-amber-50 border-amber-200 text-amber-700", icon_bg: "bg-amber-600", q: "q=finance" },
  { icon: Globe,       label: "Operations",       sub: "COO, Dir. Operations…", count: "7,300+",  color: "bg-teal-50 border-teal-200 text-teal-700",  icon_bg: "bg-teal-600", q: "q=operations" },
  { icon: HeartPulse,  label: "Human Resources",  sub: "CHRO, VP HR, Dir. HR…", count: "4,200+",  color: "bg-pink-50 border-pink-200 text-pink-700",  icon_bg: "bg-pink-600", q: "q=human+resources" },
  { icon: Briefcase,   label: "General Mgmt",     sub: "GM, Business Unit Head", count: "6,100+",  color: "bg-orange-50 border-orange-200 text-orange-700", icon_bg: "bg-orange-600", q: "q=general+manager" },
];

export const CategoriesV2 = () => (
  <section id="categories" className="bg-gray-50 py-14 sm:py-20 px-4 sm:px-6 border-t border-gray-100">
    <div className="mx-auto max-w-6xl">

      <motion.div
        className="mb-8 sm:mb-12 flex items-start sm:items-end justify-between gap-4"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 mb-4">
            Browse by Category
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Find the Right Role<br className="hidden sm:block" />
            <span className="text-gray-400"> for Your Leadership Level</span>
          </h2>
        </div>
        <Link
          to="/find-jobs"
          className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors shrink-0"
        >
          View all <ChevronRight className="h-4 w-4" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <Link
              to={`/find-jobs?${cat.q}`}
              className={`group flex flex-col gap-4 rounded-2xl border p-5 bg-white hover:shadow-md transition-all duration-200 ${cat.color}`}
            >
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${cat.icon_bg}`}>
                <cat.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-base leading-tight">{cat.label}</p>
                <p className="text-sm text-gray-400 mt-0.5 leading-snug">{cat.sub}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-gray-900 tabular-nums">{cat.count}</span>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
