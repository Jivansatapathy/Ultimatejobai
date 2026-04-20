import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Calendar,
  ChevronRight,
  DollarSign,
  Lightbulb,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";

const mentorSections = [
  {
    title: "Resume Gap Analysis",
    description: "Review skill gaps, roadmap steps, and resume optimization signals from your current profile.",
    icon: Target,
    href: "/ai-mentor?tab=skills",
    cta: "Open Gap Analysis",
  },
  {
    title: "Interview Scheduling",
    description: "Plan practice sessions, choose your format, and jump into structured mock interviews.",
    icon: Calendar,
    href: "/ai-mentor?tab=practice",
    cta: "Plan Practice",
  },
  {
    title: "AI Insights",
    description: "Get strategic AI guidance, planning support, and role-specific mentoring prompts.",
    icon: Sparkles,
    href: "/ai-mentor?tab=ai-insights",
    cta: "View AI Insights",
  },
  {
    title: "Job Fairs",
    description: "Browse upcoming career fairs and recruiting events that match your next move.",
    icon: Briefcase,
    href: "/ai-mentor?tab=fairs",
    cta: "Explore Events",
  },
];

const mockInterviewActions = [
  {
    title: "Career Advice Interview",
    description: "Practice a coaching-style conversation around career direction and next-step decisions.",
    icon: BookOpen,
    interviewType: "career_advice",
    mode: "audio" as const,
    cta: "Start Career Advice Mock",
  },
  {
    title: "Salary Negotiation Interview",
    description: "Rehearse compensation conversations, employer pushback, and confident negotiation.",
    icon: DollarSign,
    interviewType: "salary_negotiation",
    mode: "audio" as const,
    cta: "Start Salary Mock",
  },
  {
    title: "General AI Interview",
    description: "Launch the main interview space for technical, behavioral, text, or video practice.",
    icon: Users,
    interviewType: "technical",
    mode: "text" as const,
    cta: "Open Interview Lab",
  },
];

export default function AIMentor() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0f1e] relative overflow-hidden text-white">
      {/* Atmospheric glows */}
      <div className="pointer-events-none absolute top-0 left-1/4 w-[800px] h-[500px] rounded-full bg-violet-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-0 w-[600px] h-[600px] rounded-full bg-teal-500/10 blur-[140px]" />

      <Navbar />

      <main className="px-4 pb-16 pt-24">
        <div className="mx-auto max-w-7xl">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[36px] border border-white/[0.08] bg-white/[0.03] px-6 py-12 backdrop-blur-xl md:px-10 hover:border-white/15 transition-all"
          >
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.25em] text-teal-400">
                <Sparkles className="h-3.5 w-3.5" />
                Strategic Module
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-white md:text-6xl uppercase italic">
                AI Career Strategist
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-medium text-slate-400 leading-relaxed">
                Your command center for guidance, professional practice, and high-velocity career strategy.
              </p>
            </div>
          </motion.section>


          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            {mentorSections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm hover:border-teal-500/30 transition-all hover:-translate-y-1 group"
              >
                <div className="flex items-start gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-white/[0.06] border border-white/10 group-hover:bg-teal-500/10 group-hover:border-teal-500/20 transition-all">
                    <section.icon className="h-7 w-7 text-slate-400 group-hover:text-teal-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">{section.title}</h2>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-slate-400">{section.description}</p>
                    <Link to={section.href} className="mt-6 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-teal-400 transition-colors">
                      {section.cta}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}

          </section>

          <section className="mt-8 rounded-[32px] border border-teal-500/20 bg-gradient-to-br from-white/[0.05] to-teal-500/5 px-6 py-12 md:px-10">
            <div className="max-w-2xl">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-teal-400">Simulation Tracks</p>
              <h2 className="mt-4 text-3xl font-black text-white tracking-tight uppercase italic">Mock Scenarios</h2>
              <p className="mt-4 text-base font-medium text-slate-400 leading-relaxed">
                Launch high-fidelity practice sessions optimized for strategic professional conversations.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">

              {mockInterviewActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + index * 0.06 }}
                  className="rounded-[24px] border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/10 group-hover:bg-teal-500/10 transition-all">
                    <action.icon className="h-5 w-5 text-slate-400 group-hover:text-teal-400" />
                  </div>
                  <h3 className="mt-6 text-xl font-black text-white uppercase tracking-tight">{action.title}</h3>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-slate-400">{action.description}</p>
                  <Button
                    className="mt-8 w-full bg-teal-500 text-white hover:bg-teal-400 font-black uppercase tracking-widest text-[11px] h-12 rounded-xl border-none shadow-lg shadow-teal-500/20"
                    onClick={() => navigate("/interview", { state: { interviewType: action.interviewType, mode: action.mode } })}
                  >
                    {action.cta}
                  </Button>
                </motion.div>
              ))}
            </div>
          </section>


          <section className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Consolidation</h3>
              </div>
              <p className="mt-5 text-sm font-medium leading-relaxed text-slate-400">
                Gap analysis, interview planning, AI insights, and job fairs are now unified under the Strategic hub for a seamless high-velocity experience.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20">
                  <BarChart3 className="h-5 w-5 text-sky-400" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Mechanics</h3>
              </div>
              <p className="mt-5 text-sm font-medium leading-relaxed text-slate-400">
                The hub leverages your existing resume diagnostics and interview data to provide cross-functional insights without losing any context.
              </p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
