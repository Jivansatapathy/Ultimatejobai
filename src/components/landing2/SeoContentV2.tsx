import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search, FileText, Sparkles, MessageSquare, ClipboardList, Building2,
  ChevronRight, ArrowRight, DollarSign, Cpu, Users2, TrendingUp,
  Shield, Layers, Target, BarChart3, Brain, Crown, Star, Zap,
  Rocket, Globe, Award, Network, Briefcase, Check, X, Minus, Bot,
} from "lucide-react";

const POPULAR_EXECUTIVE_JOBS = [
  { label: "CFO Jobs", sub: "Finance leadership", icon: DollarSign, color: "bg-amber-50 border-amber-200 text-amber-700", icon_bg: "bg-amber-600", href: "/executive-roles/cfo" },
  { label: "Controller Jobs", sub: "Financial reporting", icon: BarChart3, color: "bg-amber-50 border-amber-200 text-amber-700", icon_bg: "bg-amber-600", href: "/executive-roles/controller" },
  { label: "CTO Jobs", sub: "Technology leadership", icon: Cpu, color: "bg-sky-50 border-sky-200 text-sky-700", icon_bg: "bg-sky-600", href: "/executive-roles/cto" },
  { label: "CIO Jobs", sub: "Information systems", icon: Layers, color: "bg-sky-50 border-sky-200 text-sky-700", icon_bg: "bg-sky-600", href: "/executive-roles/cio" },
  { label: "COO Jobs", sub: "Operations leadership", icon: Briefcase, color: "bg-orange-50 border-orange-200 text-orange-700", icon_bg: "bg-orange-600", href: "/executive-roles/coo" },
  { label: "CRO Jobs", sub: "Revenue leadership", icon: TrendingUp, color: "bg-blue-50 border-blue-200 text-blue-700", icon_bg: "bg-blue-600", href: "/executive-roles/cro" },
  { label: "CMO Jobs", sub: "Marketing leadership", icon: Target, color: "bg-blue-50 border-blue-200 text-blue-700", icon_bg: "bg-blue-600", href: "/executive-roles/cmo" },
  { label: "CHRO Jobs", sub: "People & culture", icon: Users2, color: "bg-pink-50 border-pink-200 text-pink-700", icon_bg: "bg-pink-600", href: "/executive-roles/chro" },
  { label: "CISO Jobs", sub: "Security leadership", icon: Shield, color: "bg-red-50 border-red-200 text-red-700", icon_bg: "bg-red-600", href: "/executive-roles/ciso" },
  { label: "CPO Jobs", sub: "Product leadership", icon: Star, color: "bg-violet-50 border-violet-200 text-violet-700", icon_bg: "bg-violet-600", href: "/executive-roles/cpo" },
  { label: "Head of Product", sub: "Product strategy", icon: Zap, color: "bg-violet-50 border-violet-200 text-violet-700", icon_bg: "bg-violet-600", href: "/executive-roles/head-of-product" },
  { label: "Head of Engineering", sub: "Engineering leadership", icon: Cpu, color: "bg-sky-50 border-sky-200 text-sky-700", icon_bg: "bg-sky-600", href: "/executive-roles/head-of-engineering" },
  { label: "Head of Sales", sub: "Sales leadership", icon: TrendingUp, color: "bg-blue-50 border-blue-200 text-blue-700", icon_bg: "bg-blue-600", href: "/executive-roles/head-of-sales" },
];

const CAREER_ASSISTANT_CARDS = [
  { label: "AI Career Assistant", desc: "Personalized guidance for every career decision", icon: Brain, href: "/ai-mentor", iconBg: "bg-blue-600" },
  { label: "AI Job Recommendations", desc: "Roles matched to your leadership profile", icon: Sparkles, href: "/find-jobs", iconBg: "bg-indigo-600" },
  { label: "Executive Job Matching", desc: "Fit-scored opportunities, ranked for you", icon: Target, href: "/find-jobs", iconBg: "bg-violet-600" },
  { label: "Executive Salary Guide", desc: "Real 2025 compensation benchmarks", icon: DollarSign, href: "/salary", iconBg: "bg-amber-600" },
  { label: "Career Resources", desc: "Guides, playbooks, and career insights", icon: FileText, href: "/ai-mentor", iconBg: "bg-teal-600" },
];

// status: "yes" | "partial" | "no"
const COMPARISON_ROWS: { label: string; icon: React.ElementType; generic: "yes" | "partial" | "no"; genericNote?: string; hizorexNote?: string }[] = [
  { label: "AI-powered Executive Job Search", icon: Search, generic: "no" },
  { label: "Personalized AI Job Matching", icon: Sparkles, generic: "no" },
  { label: "Executive Resume Builder", icon: FileText, generic: "partial", genericNote: "Generic templates", hizorexNote: "AI-tailored for C-suite" },
  { label: "AI Interview Coach", icon: MessageSquare, generic: "no" },
  { label: "Job Application Tracker", icon: ClipboardList, generic: "no", hizorexNote: "Built-in pipeline" },
  { label: "Executive Salary Guide", icon: DollarSign, generic: "partial", genericNote: "Crowd-sourced estimates", hizorexNote: "Verified 2025 ranges" },
  { label: "Autonomous Apply Bot", icon: Bot, generic: "no", hizorexNote: "Apex™ auto-applies for you" },
  { label: "Startup Executive Jobs", icon: Rocket, generic: "partial", genericNote: "Mixed with junior roles", hizorexNote: "Dedicated hub" },
  { label: "Fractional Executive Jobs", icon: Globe, generic: "no" },
  { label: "Board Opportunities", icon: Crown, generic: "no" },
  { label: "Executive Recruitment Platform", icon: Building2, generic: "no", genericNote: "Listings only", hizorexNote: "Full AI hiring platform" },
];

const RECRUITMENT_STATS = [
  { icon: Building2, label: "Companies Hiring", value: "500+" },
  { icon: Network, label: "Functions Covered", value: "9" },
  { icon: Zap, label: "AI-Matched Candidates", value: "Instant" },
];

const RECRUITMENT_AVATARS = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&q=80&auto=format&fit=crop",
];

export const SeoContentV2 = () => (
  <>
    {/* AI Job Search */}
    <section className="bg-white py-14 sm:py-20 px-4 sm:px-6 border-t border-gray-100">
      <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 mb-4">
            <Search className="h-3 w-3" />
            AI Job Search
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Smarter AI Job Search for Executive Careers
          </h2>
          <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-7">
            Traditional job boards show thousands of listings. Hizorex uses advanced AI Job Matching to recommend
            executive opportunities based on your experience, leadership background, industry expertise, and
            career goals — helping you discover the right opportunities with less effort.
          </p>
          <Link
            to="/find-jobs"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 transition-colors"
          >
            Search Jobs Now <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="relative rounded-3xl overflow-hidden shadow-xl shadow-gray-200/70 border border-gray-200"
        >
          <img
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=75&auto=format&fit=crop"
            alt="AI analyzing executive job matches on a laptop dashboard"
            loading="lazy"
            className="w-full h-80 sm:h-[26rem] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/60" />

          {/* Floating AI match badges */}
          <div className="absolute top-5 left-5 flex items-center gap-2.5 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg px-3.5 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500">
              <DollarSign className="h-4 w-4 text-white" />
            </span>
            <div>
              <p className="text-xs font-black text-gray-900 leading-none">CFO Match</p>
              <p className="text-[11px] text-emerald-600 font-bold mt-0.5">94% fit</p>
            </div>
          </div>

          <div className="absolute top-5 right-5 flex items-center gap-2.5 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg px-3.5 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500">
              <Cpu className="h-4 w-4 text-white" />
            </span>
            <div>
              <p className="text-xs font-black text-gray-900 leading-none">CTO Match</p>
              <p className="text-[11px] text-emerald-600 font-bold mt-0.5">91% fit</p>
            </div>
          </div>

          <div className="absolute bottom-5 left-5 flex items-center gap-2.5 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg px-3.5 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
              <Target className="h-4 w-4 text-white" />
            </span>
            <div>
              <p className="text-xs font-black text-gray-900 leading-none">CMO Match</p>
              <p className="text-[11px] text-emerald-600 font-bold mt-0.5">88% fit</p>
            </div>
          </div>

          <div className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full bg-blue-600 shadow-lg px-3.5 py-2">
            <Sparkles className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-bold text-white">AI Matching Live</span>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Popular Executive Jobs — bento grid */}
    <section className="bg-gray-50 py-14 sm:py-20 px-4 sm:px-6 border-t border-gray-100">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 text-center sm:text-left"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div className="mx-auto sm:mx-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 mb-4">
              Popular Searches
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Browse Executive Jobs by Leadership Role
            </h2>
            <p className="text-gray-500 text-base max-w-2xl">
              Explore executive opportunities across finance, technology, operations, marketing, product, security, and revenue leadership.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-[136px] gap-4 [grid-auto-flow:dense]">
          {/* Featured photo tile */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="col-span-2 row-span-2"
          >
            <Link
              to="/find-jobs"
              className="group relative flex h-full flex-col justify-end overflow-hidden rounded-2xl p-5 sm:p-6"
            >
              <img
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=75&auto=format&fit=crop"
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
              <div className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/90 mb-3">
                  Live Search
                </span>
                <p className="text-3xl sm:text-4xl font-black text-white leading-none">40,000+</p>
                <p className="text-sm text-white/70 font-semibold mt-1.5">Executive roles across every function</p>
                <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-white group-hover:gap-2.5 transition-all">
                  Search all jobs <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </motion.div>

          {POPULAR_EXECUTIVE_JOBS.map((r, i) => (
            <motion.div
              key={r.href + r.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: (i % 8) * 0.04 }}
              className="h-full"
            >
              <Link
                to={r.href}
                className={`group flex h-full flex-col justify-between gap-3 rounded-2xl border p-4 bg-white hover:shadow-md transition-all duration-200 ${r.color}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${r.icon_bg}`}>
                    <r.icon className="h-4 w-4 text-white" />
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-current group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm leading-tight">{r.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.sub}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* AI Resume Builder */}
    <section className="bg-white py-14 sm:py-20 px-4 sm:px-6 border-t border-gray-100">
      <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 mb-4">
            <FileText className="h-3 w-3" />
            AI Resume Builder
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
            AI Resume Builder & Resume Optimization
          </h2>
          <p className="text-gray-500 text-base leading-relaxed mb-6">
            Stand out with an executive resume designed for modern hiring. Hizorex includes an intelligent AI
            Resume Builder that helps executives create compelling leadership resumes, improve ATS compatibility,
            and strengthen professional branding through advanced Resume Optimization.
          </p>
          <Link
            to="/resume"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 transition-colors"
          >
            Build Your Resume <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="relative rounded-3xl overflow-hidden shadow-xl shadow-gray-200/70 border border-gray-200"
        >
          <img
            src="https://images.unsplash.com/photo-1519337265831-281ec6cc8514?w=900&q=75&auto=format&fit=crop"
            alt="Executive drafting a resume on a laptop"
            loading="lazy"
            className="w-full h-80 sm:h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

          {/* Floating glass stat card */}
          <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600">
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              <div>
                <p className="font-bold text-white text-sm leading-none">ATS Match Score</p>
                <p className="text-[11px] text-white/60 mt-1">Live analysis preview</p>
              </div>
              <span className="ml-auto text-2xl font-black text-white">87%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden mb-4">
              <div className="h-full w-[87%] bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: "Keywords", value: "92%" },
                { label: "Formatting", value: "88%" },
                { label: "Impact", value: "81%" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/10 border border-white/10 px-2.5 py-2 text-center">
                  <p className="text-sm font-black text-white">{s.value}</p>
                  <p className="text-[10px] text-white/60 font-semibold">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* AI Career Assistant */}
    <section className="bg-gray-50 py-14 sm:py-20 px-4 sm:px-6 border-t border-gray-100">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-12 text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 mb-4">
            <Sparkles className="h-3 w-3" />
            AI Career Assistant
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Your Personal AI Career Assistant
          </h2>
          <p className="text-gray-500 text-base sm:text-lg leading-relaxed">
            Advance your career with AI-powered tools. Receive personalized recommendations based on your
            experience, leadership background, preferred industries, and career objectives.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-10 items-center">
          {/* Editorial feature list */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-2 divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white overflow-hidden"
          >
            {CAREER_ASSISTANT_CARDS.map((c) => (
              <Link
                key={c.label}
                to={c.href}
                className="group flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.iconBg}`}>
                  <c.icon className="h-4 w-4 text-white" />
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm leading-tight">{c.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-snug">{c.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all ml-auto mt-1.5 shrink-0" />
              </Link>
            ))}
          </motion.div>

          {/* AI chat mockup */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="lg:col-span-3 rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60 overflow-hidden"
          >
            {/* Chat header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Brain className="h-4 w-4 text-white" />
              </span>
              <div>
                <p className="text-sm font-bold text-white leading-none">Hizorex AI Career Assistant</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <p className="text-[11px] text-blue-100 font-medium">Online now</p>
                </div>
              </div>
            </div>

            {/* Chat body */}
            <div className="bg-gray-50 p-5 space-y-4">
              {/* User message */}
              <div className="flex items-end justify-end gap-2.5">
                <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-blue-600 px-4 py-2.5">
                  <p className="text-sm text-white leading-snug">
                    I'm a VP of Engineering looking for my next CTO role in fintech.
                  </p>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&q=80&auto=format&fit=crop"
                  alt=""
                  loading="lazy"
                  className="h-7 w-7 rounded-full object-cover shrink-0"
                />
              </div>

              {/* AI response */}
              <div className="flex items-end gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600">
                  <Brain className="h-3.5 w-3.5 text-white" />
                </span>
                <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-white border border-gray-200 px-4 py-2.5">
                  <p className="text-sm text-gray-800 leading-snug">
                    Found <span className="font-bold">3 strong-fit CTO roles</span> at fintech companies —
                    your profile matches <span className="font-bold text-emerald-600">91%</span> on average.
                    Want me to tailor your resume for these?
                  </p>
                </div>
              </div>

              {/* Quick replies */}
              <div className="flex flex-wrap gap-2 pl-9">
                {["Yes, tailor my resume", "Show me the roles", "Check salary range"].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* Chat input mockup */}
            <div className="flex items-center gap-3 border-t border-gray-200 bg-white px-5 py-3.5">
              <p className="flex-1 text-sm text-gray-400">Ask your AI Career Assistant…</p>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600">
                <ArrowRight className="h-4 w-4 text-white" />
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Executive Interview + Job Application Tracker — 2 col */}
    <section className="bg-white py-14 sm:py-20 px-4 sm:px-6 border-t border-gray-100">
      <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-8"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 mb-5">
            <MessageSquare className="h-5 w-5 text-white" />
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-3">Executive Interview Preparation</h2>
          <p className="text-gray-500 text-base leading-relaxed mb-5">
            Prepare for executive interviews with confidence. Use our AI Interview Coach to practice leadership
            interviews, improve executive communication, prepare for board discussions, and strengthen responses
            for C-level positions.
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {["Technical", "Behavioral", "Board-Level", "Mock Interview"].map((tag) => (
              <span key={tag} className="rounded-full bg-white border border-indigo-200 text-indigo-700 text-xs font-bold px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
          <Link to="/interview" className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
            Practice an Interview <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-8"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 mb-5">
            <ClipboardList className="h-5 w-5 text-white" />
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-3">Track Every Executive Application</h2>
          <p className="text-gray-500 text-base leading-relaxed mb-5">
            Stay organized with our built-in Job Application Tracker. Monitor submitted applications, interview
            progress, recruiter conversations, offers, and follow-ups from one dashboard.
          </p>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { label: "Applied", value: "24" },
              { label: "Interview", value: "6" },
              { label: "Offers", value: "2" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white border border-emerald-200 px-3 py-2.5 text-center">
                <p className="text-lg font-black text-gray-900">{s.value}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
          <Link to="/applications" className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-800 transition-colors">
            View Your Applications <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>

    {/* Executive Recruitment */}
    <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 border-t border-gray-100">
      {/* Background photo + overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=70&auto=format&fit=crop"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950/95 via-gray-950/93 to-blue-950/90" />
      </div>
      <div className="absolute top-0 right-1/4 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-6xl grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 mb-4">
            <Building2 className="h-3 w-3" />
            Executive Recruitment
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Built for Executive Recruitment
          </h2>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-8">
            Hizorex isn't just another Executive Job Board. Our AI-powered Executive Hiring Platform helps
            companies simplify Executive Recruitment while helping leaders discover high-quality executive
            opportunities across finance, technology, operations, sales, product, and cybersecurity.
          </p>
          <Link
            to="/employer/auth"
            className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-sm px-6 py-3 transition-colors"
          >
            For Employers <ChevronRight className="h-4 w-4" />
          </Link>

          {/* Avatar stack / social proof */}
          <div className="mt-9 flex items-center gap-3">
            <div className="flex -space-x-3">
              {RECRUITMENT_AVATARS.map((src) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  loading="lazy"
                  className="h-9 w-9 rounded-full border-2 border-gray-900 object-cover"
                />
              ))}
            </div>
            <p className="text-xs text-white/60 font-medium leading-snug">
              Trusted by <span className="text-white font-bold">2,400+</span> placed executives
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          {/* Photo card with floating stat */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=75&auto=format&fit=crop"
              alt="Executives celebrating a successful placement"
              loading="lazy"
              className="w-full h-64 sm:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600">
                <Building2 className="h-4 w-4 text-white" />
              </span>
              <div>
                <p className="text-lg font-black text-white leading-none">500+</p>
                <p className="text-[11px] text-white/70 font-semibold mt-0.5">Companies Hiring</p>
              </div>
            </div>
          </div>

          {/* Compact stat pills */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {RECRUITMENT_STATS.slice(1).map((s) => (
              <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600">
                  <s.icon className="h-4 w-4 text-white" />
                </span>
                <div className="min-w-0">
                  <p className="text-lg font-black text-white leading-none">{s.value}</p>
                  <p className="text-[11px] text-white/50 font-semibold mt-1 leading-tight">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>

    {/* Why Hizorex — comparison table */}
    <section className="bg-white py-14 sm:py-20 px-4 sm:px-6 border-t border-gray-100">
      <div className="mx-auto max-w-4xl">
        <motion.div
          className="mb-10 sm:mb-12 text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 mb-4">
            <Crown className="h-3 w-3" />
            Why Hizorex
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Hizorex vs. Generic Job Boards
          </h2>
          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Built specifically for executive careers — not a mass-market listings site with a search bar bolted on.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl border border-gray-200 overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-xs font-bold uppercase tracking-wide text-gray-400 px-5 sm:px-6 py-4 w-1/2">
                    Feature
                  </th>
                  <th className="text-center text-xs font-bold uppercase tracking-wide text-gray-400 px-4 py-4 w-1/4">
                    Generic Job Boards
                  </th>
                  <th className="px-4 py-4 w-1/4 bg-blue-600">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wide text-white">
                      <Crown className="h-3.5 w-3.5" />
                      Hizorex
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <motion.tr
                    key={row.label}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    className="border-t border-gray-100"
                  >
                    <td className="px-5 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                          <row.icon className="h-3.5 w-3.5 text-blue-600" />
                        </span>
                        <span className="text-sm font-bold text-gray-900 leading-tight">{row.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {row.generic === "yes" && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                            <Check className="h-3.5 w-3.5 text-gray-400" />
                          </span>
                        )}
                        {row.generic === "partial" && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                            <Minus className="h-3.5 w-3.5 text-gray-400" />
                          </span>
                        )}
                        {row.generic === "no" && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                            <X className="h-3.5 w-3.5 text-gray-300" />
                          </span>
                        )}
                        {row.genericNote && <span className="text-[10px] text-gray-400 leading-tight">{row.genericNote}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center bg-blue-50/50">
                      <div className="flex flex-col items-center gap-1">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                        </span>
                        {row.hizorexNote && <span className="text-[10px] text-blue-700 font-semibold leading-tight">{row.hizorexNote}</span>}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  </>
);
