import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Search, MapPin, Briefcase, TrendingUp, Users2, Crown, ArrowRight } from "lucide-react";

const QUICK_ROLES = ["CEO", "CFO", "CTO", "COO", "VP Engineering", "VP Sales", "CHRO", "Director"];

const STATS = [
  { value: "40,000+", label: "Executive Roles", icon: Briefcase },
  { value: "500+",    label: "Hiring Companies", icon: TrendingUp },
  { value: "Global", label: "Coverage", icon: MapPin },
  { value: "Apex™",   label: "AI Apply Delegate", icon: Crown },
];

export const HeroV2 = () => {
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
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-16 pb-0">

      {/* Background blobs — like the screenshot */}
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
      <div className="absolute top-20 -right-20 h-64 w-64 rounded-full bg-indigo-100/50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-blue-50/80 blur-2xl pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-6 text-center">

        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-600/10 border border-blue-200 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-blue-700"
        >
          <Crown className="h-3 w-3" />
          The AI-Powered Executive Job Platform
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.07 }}
          className="mb-5 text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.06] text-gray-900"
        >
          <span className="relative inline-block text-blue-600">
            Executive Jobs
            {/* Blue underline decoration */}
            <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 300 6" fill="none" preserveAspectRatio="none">
              <path d="M0 5 Q150 0 300 5" stroke="#2563EB" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-gray-900"> for </span>
          <br />
          <span className="text-gray-800">C-Suite Leaders,</span>
          <br />
          <span className="text-gray-400 text-5xl md:text-6xl font-bold">For Senior Leaders, Worldwide</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14 }}
          className="mx-auto mb-10 max-w-2xl text-lg md:text-xl text-gray-500 leading-relaxed"
        >
          Curated CEO, CFO, CTO, COO &amp; VP roles from 500+ top employers.{" "}
          Let <span className="font-semibold text-gray-800">Apex™</span> — your AI delegate — handle every application while you stay focused on leading.
        </motion.p>

        {/* Search bar */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          onSubmit={(e) => { e.preventDefault(); goSearch(); }}
          className="mx-auto mb-6 max-w-3xl"
        >
          <div className="flex flex-col sm:flex-row rounded-2xl border border-gray-200 bg-white shadow-[0_8px_40px_rgba(37,99,235,0.12)] overflow-hidden">
            {/* Role input */}
            <div className="flex items-center flex-1 border-b sm:border-b-0 sm:border-r border-gray-100 px-4 py-1">
              <Search className="h-4 w-4 text-gray-300 shrink-0" />
              <input
                type="text"
                placeholder="Job title, role or keyword"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-3.5 bg-transparent text-base text-gray-800 placeholder:text-gray-400 outline-none"
              />
            </div>
            {/* Location input */}
            <div className="flex items-center flex-1 border-b sm:border-b-0 sm:border-r border-gray-100 px-4 py-1">
              <MapPin className="h-4 w-4 text-gray-300 shrink-0" />
              <input
                type="text"
                placeholder="City, state or remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-3.5 bg-transparent text-base text-gray-800 placeholder:text-gray-400 outline-none"
              />
            </div>
            {/* CTA */}
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-colors shrink-0 sm:rounded-r-2xl"
            >
              <Search className="h-4 w-4" />
              Search Jobs
            </button>
          </div>
        </motion.form>

        {/* Quick role tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.28 }}
          className="mb-14 flex flex-wrap items-center justify-center gap-2"
        >
          <span className="text-sm text-gray-400 font-medium mr-1">Popular:</span>
          {QUICK_ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => goSearch(r)}
              className="rounded-full border border-gray-200 bg-white/80 px-4 py-1.5 text-sm font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all shadow-sm"
            >
              {r}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.36 }}
        className="relative border-t border-gray-200 bg-white/80 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-4xl px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-gray-900 leading-tight">{s.value}</p>
                  <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Scroll cue */}
      <div className="flex justify-center py-4 bg-white">
        <a href="#categories" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors font-medium">
          Explore job categories <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
};
