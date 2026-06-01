import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Search,
  Briefcase,
  Bot,
  FileText,
  Target,
} from "lucide-react";

const splitKeywordAndLocation = (query: string) => {
  const trimmed = query.trim().replace(/\s+/g, " ");
  const match = trimmed.match(/^(.+?)\s+in\s+(.+)$/i);
  if (!match) return { keyword: trimmed, location: "" };
  const keyword = match[1].trim();
  const location = match[2].trim();
  if (!keyword || !location) return { keyword: trimmed, location: "" };
  return { keyword, location };
};

const FEATURES = [
  { icon: FileText, label: "ATS Resume Builder" },
  { icon: Target, label: "Smart Job Matching" },
  { icon: Bot, label: "Auto-Apply Bot" },
  { icon: Zap, label: "Instant ATS Score" },
  { icon: Shield, label: "Privacy-First" },
  { icon: TrendingUp, label: "Career Analytics" },
];

const QUICK_TAGS = [
  { label: "Remote", query: "is_remote=true" },
  { label: "Full-time", query: "employment_type=full-time" },
  { label: "Engineering", query: "search=engineering" },
  { label: "AI & ML", query: "search=AI" },
  { label: "High Salary", query: "ordering=-salary_min" },
];

export const HeroSection = () => {
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState("");

  const navigateToJobs = (searchOverride?: string) => {
    const next = searchOverride ?? heroSearch;
    const parsed = splitKeywordAndLocation(next);
    const params = new URLSearchParams();
    if (parsed.keyword) {
      params.set("title", parsed.keyword);
      params.set("search", parsed.keyword);
    }
    if (parsed.location) params.set("location", parsed.location);
    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="relative overflow-hidden bg-[#0a0f1e] pt-28 pb-20">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-teal-600/12 blur-[140px]" />
        <div className="absolute top-1/2 -left-32 h-[350px] w-[350px] rounded-full bg-violet-700/10 blur-[100px]" />
        <div className="absolute top-1/2 -right-32 h-[350px] w-[350px] rounded-full bg-rose-600/8 blur-[100px]" />
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.025] hero-grid-texture" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 backdrop-blur-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-teal-400" />
          AI-Powered Career Intelligence
          <span className="rounded-full bg-teal-500 px-2 py-0.5 text-[10px] font-bold text-white tracking-normal normal-case">
            New
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl leading-[1.08] mb-6"
        >
          <span className="text-white">Your Career,</span>
          <br />
          <span className="bg-gradient-to-r from-teal-400 via-violet-400 to-teal-300 bg-clip-text text-transparent">
            Supercharged
          </span>
          <br />
          <span className="text-white">by AI</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mx-auto mb-10 max-w-xl text-lg text-slate-400 leading-relaxed"
        >
          ATS-optimized resumes, smart job matching, and an AI bot that applies
          for you — all in one platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="mb-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link to="/auth?mode=signup">
            <Button
              size="lg"
              className="w-full sm:w-auto h-12 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold px-8 shadow-lg shadow-teal-500/30 gap-2 group"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
          <Link to="/jobs">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-12 rounded-xl border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 hover:border-white/25 hover:text-white px-8 font-medium backdrop-blur-sm"
            >
              Explore Jobs
            </Button>
          </Link>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          onSubmit={(e) => { e.preventDefault(); navigateToJobs(); }}
          className="mx-auto mb-4 max-w-2xl flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-md p-2 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]"
        >
          <div className="relative flex-1">
            <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Python developer in USA"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              className="w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-teal-500/40 transition-all"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            className="rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold px-7 h-10 shadow-md shadow-teal-500/20 shrink-0"
          >
            <Search className="h-4 w-4 mr-1.5" />
            Find Jobs
          </Button>
        </motion.form>

        {/* Quick filter tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mb-16 flex flex-wrap items-center justify-center gap-2"
        >
          <span className="text-xs text-slate-600 mr-1">Trending:</span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => navigate(`/jobs?${tag.query}`)}
              className="rounded-full border border-white/8 bg-white/[0.04] px-3.5 py-1 text-xs font-medium text-slate-400 hover:border-teal-500/40 hover:text-teal-300 hover:bg-teal-500/10 transition-all"
            >
              {tag.label}
            </button>
          ))}
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.42 }}
          className="flex flex-wrap justify-center gap-2.5 mb-20"
        >
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.04] backdrop-blur-sm px-4 py-2 text-xs text-slate-400"
            >
              <f.icon className="h-3.5 w-3.5 text-teal-400 shrink-0" />
              {f.label}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Dashboard preview */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="relative mx-auto max-w-5xl px-6"
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-sm p-1.5">
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.03]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-teal-400/50" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-white/5 text-xs text-slate-500 font-medium">
                  app.careerai.com/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard mock content */}
            <div className="bg-[#0d1424] p-6 space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Resume Score", value: "94", accent: true },
                  { label: "Jobs Applied", value: "127", accent: false },
                  { label: "Interviews", value: "23", accent: false },
                  { label: "Response Rate", value: "32%", accent: true },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
                  >
                    <p className="text-[11px] text-slate-500 mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.accent ? "text-teal-400" : "text-white"}`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 h-32">
                  <p className="text-[11px] text-slate-500 mb-3">Application Activity</p>
                  <div className="flex items-end gap-1 h-16">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-teal-600 to-teal-400 opacity-70 bar-height"
                        style={{ "--bar-h": `${h}%` } as React.CSSProperties}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 h-32">
                  <p className="text-[11px] text-slate-500 mb-3">Top Skills</p>
                  <div className="space-y-2.5">
                    {[["React", 90], ["TypeScript", 75], ["Node.js", 60]].map(([skill, pct], i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-1.5 rounded-full bg-white/5 flex-1">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-violet-500 bar-fill"
                            style={{ "--bar-pct": `${pct}%` } as React.CSSProperties}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 w-16 shrink-0">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fade-out at bottom to blend into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0f1e] to-transparent pointer-events-none" />
      </motion.div>
    </section>
  );
};
