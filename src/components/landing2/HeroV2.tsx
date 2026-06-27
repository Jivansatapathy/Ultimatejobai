import { motion, useInView, animate } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Crown, ArrowRight, Sparkles, Target, DollarSign, Network } from "lucide-react";
import type { HeroContent } from "@/services/landingService";

function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const ctrl = animate(0, to, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1], // expo-out feel
      onUpdate(v) {
        if (ref.current) ref.current.textContent = Math.round(v) + suffix;
      },
    });
    return () => ctrl.stop();
  }, [inView, to, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export const HeroV2 = ({ hero }: { hero: HeroContent }) => {
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
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-10 sm:pt-16 pb-0">

      {/* Background blobs — like the screenshot */}
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
      <div className="absolute top-20 -right-20 h-64 w-64 rounded-full bg-indigo-100/50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-blue-50/80 blur-2xl pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">

        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-600/10 border border-blue-200 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-blue-700"
        >
          <Crown className="h-3 w-3" />
          {hero.badge_text}
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.07 }}
          className="mb-4 sm:mb-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.06] text-gray-900"
        >
          <span className="relative inline-block text-blue-600">
            {hero.headline_line1}
            <svg className="absolute -bottom-1 sm:-bottom-2 left-0 w-full" height="6" viewBox="0 0 300 6" fill="none" preserveAspectRatio="none">
              <path d="M0 5 Q150 0 300 5" stroke="#2563EB" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-gray-900"> for </span>
          <br />
          <span className="text-gray-800">{hero.headline_line2}</span>
          <br />
          <span className="text-gray-400 text-2xl sm:text-4xl md:text-5xl font-bold">{hero.headline_suffix}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14 }}
          className="mx-auto mb-7 sm:mb-10 max-w-2xl text-base sm:text-lg md:text-xl text-gray-500 leading-relaxed"
        >
          {hero.subtitle}
        </motion.p>

        {/* Search bar */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          onSubmit={(e) => { e.preventDefault(); goSearch(); }}
          className="mx-auto mb-5 sm:mb-6 max-w-3xl"
        >
          <div className="flex flex-col sm:flex-row rounded-2xl border border-gray-200 bg-white shadow-[0_8px_40px_rgba(37,99,235,0.12)] overflow-hidden">
            {/* Role input */}
            <div className="flex items-center flex-1 border-b sm:border-b-0 sm:border-r border-gray-100 px-3 sm:px-4 py-1">
              <Search className="h-4 w-4 text-gray-300 shrink-0" />
              <input
                type="text"
                placeholder={hero.search_role_placeholder}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-3 sm:py-3.5 bg-transparent text-sm sm:text-base text-gray-800 placeholder:text-gray-400 outline-none"
              />
            </div>
            {/* Location input */}
            <div className="flex items-center flex-1 border-b sm:border-b-0 sm:border-r border-gray-100 px-3 sm:px-4 py-1">
              <MapPin className="h-4 w-4 text-gray-300 shrink-0" />
              <input
                type="text"
                placeholder={hero.search_location_placeholder}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-3 sm:py-3.5 bg-transparent text-sm sm:text-base text-gray-800 placeholder:text-gray-400 outline-none"
              />
            </div>
            {/* CTA */}
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base transition-colors shrink-0"
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
          className="mb-10 sm:mb-14 flex flex-wrap items-center justify-center gap-2"
        >
          <span className="text-sm text-gray-400 font-medium mr-1">Popular:</span>
          {hero.quick_roles.map((r) => (
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

      {/* Hizorex AI Executive OS banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="relative mx-auto max-w-5xl px-4 sm:px-6 pb-10 sm:pb-14"
      >
        <Link to="/hizorex-os" className="group block">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-950 via-violet-900 to-indigo-900 border border-violet-700/40 shadow-[0_8px_40px_rgba(109,40,217,0.25)] hover:shadow-[0_12px_48px_rgba(109,40,217,0.4)] transition-all duration-300">
            {/* Glow blobs */}
            <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-violet-500/20 blur-2xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/4 h-28 w-28 rounded-full bg-indigo-500/20 blur-xl" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5 px-6 sm:px-8 py-5 sm:py-6">
              {/* Icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/30">
                <Crown className="h-6 w-6 text-white" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">New</p>
                  <span className="rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">Executive OS</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                  {hero.venus_banner_title}
                </h3>
                <p className="text-sm text-violet-300/80 mt-1 leading-relaxed">
                  {hero.venus_banner_subtitle}
                </p>
                {/* Feature pills */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {[
                    { icon: Target,     label: "EOS™ Scoring" },
                    { icon: DollarSign, label: "Comp Intelligence" },
                    { icon: Sparkles,   label: "AI Career Twin" },
                    { icon: Network,    label: "Exec Network" },
                  ].map(({ icon: Icon, label }) => (
                    <span key={label} className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-violet-200">
                      <Icon className="h-3 w-3" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA arrow */}
              <div className="shrink-0 flex items-center gap-2 rounded-xl bg-violet-600 group-hover:bg-violet-500 transition-colors px-5 py-3 text-white font-bold text-sm shadow-md shadow-violet-900/30 self-start sm:self-auto">
                Explore Hizorex
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.36 }}
        className="relative bg-white border-t border-gray-100"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {hero.stats.map((s, i) => (
              <div
                key={i}
                className={`flex flex-col items-center justify-center text-center px-4 sm:px-6 py-6 sm:py-8 gap-1
                  ${i % 2 !== 0 ? "border-l border-gray-100" : ""}
                  ${i >= 2 ? "border-t border-gray-100 md:border-t-0" : ""}
                  ${i > 0 ? "md:border-l md:border-gray-100" : ""}
                `}
              >
                <span className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none tabular-nums">
                  <CountUp to={s.num} suffix={s.suffix} />
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-700 mt-1.5 sm:mt-2 leading-snug">
                  {s.label}
                </span>
                <span className="text-[11px] sm:text-xs text-gray-400 font-medium">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Explore link */}
        <div className="border-t border-gray-100 flex justify-center py-3">
          <a
            href="#categories"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-600 transition-colors font-semibold"
          >
            Explore job categories
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </motion.div>
    </section>
  );
};
