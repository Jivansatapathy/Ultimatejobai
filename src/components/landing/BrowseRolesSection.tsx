import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Crown, TrendingUp, Users2, ChevronRight } from "lucide-react";

const ROLES = [
  { title: "Chief Executive Officer",    abbr: "CEO",  count: "1,200+",  level: "C-Suite",  q: "CEO" },
  { title: "Chief Financial Officer",    abbr: "CFO",  count: "800+",    level: "C-Suite",  q: "CFO" },
  { title: "Chief Technology Officer",   abbr: "CTO",  count: "4,500+",  level: "C-Suite",  q: "CTO" },
  { title: "Chief Operating Officer",    abbr: "COO",  count: "1,100+",  level: "C-Suite",  q: "COO" },
  { title: "Chief Marketing Officer",    abbr: "CMO",  count: "600+",    level: "C-Suite",  q: "CMO" },
  { title: "Chief HR Officer",           abbr: "CHRO", count: "500+",    level: "C-Suite",  q: "CHRO" },
  { title: "VP Engineering",             abbr: "VP",   count: "2,800+",  level: "VP",       q: "VP Engineering" },
  { title: "VP Sales",                   abbr: "VP",   count: "1,900+",  level: "VP",       q: "VP Sales" },
  { title: "VP Finance",                 abbr: "VP",   count: "1,400+",  level: "VP",       q: "VP Finance" },
  { title: "VP Operations",             abbr: "VP",   count: "1,200+",  level: "VP",       q: "VP Operations" },
  { title: "Director, Engineering",      abbr: "Dir",  count: "3,200+",  level: "Director", q: "Director, Engineering" },
  { title: "Director, Operations",       abbr: "Dir",  count: "2,800+",  level: "Director", q: "Director, Operations" },
  { title: "Director, Human Resources",  abbr: "Dir",  count: "2,400+",  level: "Director", q: "Director, Human Resources" },
  { title: "Director, Info Technology",  abbr: "Dir",  count: "2,100+",  level: "Director", q: "Director, Information Technology" },
  { title: "Director, Supply Chain",     abbr: "Dir",  count: "1,800+",  level: "Director", q: "Director, Supply Chain" },
  { title: "Director, Cybersecurity",    abbr: "Dir",  count: "1,600+",  level: "Director", q: "Director, Cybersecurity" },
];

const LEVEL_ICON: Record<string, React.ElementType> = {
  "C-Suite": Crown, "VP": TrendingUp, "Director": Users2,
};

export const BrowseRolesSection = () => {
  return (
    <section className="bg-[#f7f7f7] py-20 px-6 border-b border-black/[0.07]">
      <div className="mx-auto max-w-6xl">

        <motion.div
          className="mb-12 flex items-end justify-between gap-4"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.05] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-black/50 mb-4">
              Browse by Role
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-black tracking-tight leading-tight">
              Find Roles That Match<br />
              <span className="text-black/35">Your Leadership Level</span>
            </h2>
          </div>
          <Link
            to="/find-jobs"
            className="hidden md:inline-flex items-center gap-1.5 text-sm text-black/60 hover:text-black font-medium transition-colors shrink-0"
          >
            View all roles <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ROLES.map((role, i) => {
            const Icon = LEVEL_ICON[role.level];
            return (
              <motion.div
                key={role.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.025 }}
              >
                <Link
                  to={`/find-jobs?q=${encodeURIComponent(role.q)}`}
                  className="group flex flex-col gap-3 rounded-xl border border-black/[0.08] bg-white p-4 transition-all hover:shadow-md hover:border-black/20"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border border-black/[0.08] bg-black/[0.04] text-black/50">
                      <Icon className="h-2.5 w-2.5" />
                      {role.level}
                    </span>
                  </div>
                  <p className="text-black/85 font-semibold text-sm leading-snug group-hover:text-black transition-colors">
                    {role.title}
                  </p>
                  <p className="text-xs font-bold text-black/40 tabular-nums">{role.count} jobs</p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            to="/find-jobs"
            className="inline-flex items-center gap-1.5 text-sm text-black/60 hover:text-black font-medium"
          >
            View all roles <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
