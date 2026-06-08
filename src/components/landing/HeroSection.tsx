import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Search, MapPin, Crown, TrendingUp, Users2 } from "lucide-react";

const QUICK_ROLES = ["CEO", "CFO", "CTO", "COO", "CHRO", "VP Engineering", "VP Finance", "Director Operations"];

const STATS = [
  { value: "40,000+", label: "Active Roles" },
  { value: "500+",    label: "Hiring Companies" },
  { value: "Global", label: "Coverage" },
  { value: "Apex™",   label: "Your Apply Delegate" },
];

const ROLE_CATEGORIES = [
  { icon: Crown,      label: "C-Suite",  count: "24,000+", query: "seniority=C-Suite",  featured: true },
  { icon: TrendingUp, label: "VP Level", count: "8,000+",  query: "seniority=VP",        featured: false },
  { icon: Users2,     label: "Director", count: "12,000+", query: "seniority=Director",  featured: false },
];

export const HeroSection = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");

  const goSearch = (roleOverride?: string) => {
    const r = roleOverride ?? role;
    const params = new URLSearchParams();
    if (r) params.set("q", r);
    if (location) params.set("location", location);
    navigate(`/find-jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-0 border-b border-black/[0.07]">

      <div className="relative mx-auto max-w-5xl px-6 text-center">

        {/* Badge — blue accent */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700"
        >
          <Crown className="h-3 w-3 text-blue-500" />
          The AI-Powered Executive Job Platform
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06 }}
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.06] mb-5 text-black"
        >
          C-Suite &amp; Senior<br />
          <span className="text-blue-600">Leadership Roles</span><br />
          <span className="text-black/40 text-4xl md:text-5xl font-bold">For Senior Leaders, Worldwide</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="mx-auto mb-8 max-w-2xl text-base md:text-lg text-black/45 leading-relaxed"
        >
          Exclusive CEO, CFO, CTO, COO, VP &amp; Director opportunities — curated from 500+ top employers.{" "}
          <span className="text-black font-semibold">Meet Apex™</span> — your personal executive application delegate that applies while you lead.
        </motion.p>

        {/* Search bar */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          onSubmit={(e) => { e.preventDefault(); goSearch(); }}
          className="mx-auto mb-5 max-w-3xl"
        >
          <div className="flex flex-col sm:flex-row rounded-xl border border-black/[0.12] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="flex items-center flex-1 border-b sm:border-b-0 sm:border-r border-black/[0.08]">
              <Search className="shrink-0 ml-4 h-4 w-4 text-black/25" />
              <input
                type="text"
                placeholder="Job title, role or keyword  (e.g. CFO)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-4 bg-transparent text-sm text-black placeholder:text-black/30 outline-none"
              />
            </div>
            <div className="flex items-center flex-1 border-b sm:border-b-0 sm:border-r border-black/[0.08]">
              <MapPin className="shrink-0 ml-4 h-4 w-4 text-black/25" />
              <input
                type="text"
                placeholder="City, province or country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-4 bg-transparent text-sm text-black placeholder:text-black/30 outline-none"
              />
            </div>
            {/* Blue search button — Naukri style */}
            <button
              type="submit"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shrink-0"
            >
              Search Jobs
            </button>
          </div>
        </motion.form>

        {/* Quick role tags — blue hover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mb-12 flex flex-wrap items-center justify-center gap-2"
        >
          <span className="text-xs text-black/30 mr-1">Popular:</span>
          {QUICK_ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => goSearch(r)}
              className="rounded-full border border-black/10 bg-black/[0.03] px-3.5 py-1 text-xs font-medium text-black/50 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all"
            >
              {r}
            </button>
          ))}
        </motion.div>

        {/* Role category tiles */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="grid grid-cols-3 gap-3 max-w-2xl mx-auto mb-0"
        >
          {ROLE_CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              to={`/find-jobs?${cat.query}`}
              className={`group flex flex-col items-center gap-2 rounded-xl border p-5 transition-all hover:shadow-md ${
                cat.featured
                  ? "border-blue-200 bg-blue-50 hover:bg-blue-100"
                  : "border-black/10 bg-black/[0.03] hover:bg-black/[0.06]"
              }`}
            >
              <cat.icon className={`h-6 w-6 ${cat.featured ? "text-blue-600" : "text-black/60"}`} />
              <span className={`font-semibold text-sm ${cat.featured ? "text-blue-700" : "text-black"}`}>{cat.label}</span>
              <span className={`text-[11px] ${cat.featured ? "text-blue-500" : "text-black/40"}`}>{cat.count} roles</span>
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.38 }}
        className="mt-14 border-t border-black/[0.07] bg-black/[0.02]"
      >
        <div className="mx-auto max-w-4xl px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s, i) => (
            <div key={i}>
              <p className={`text-xl font-extrabold tabular-nums ${i === 0 ? "text-blue-600" : "text-black"}`}>{s.value}</p>
              <p className="text-xs text-black/35 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
