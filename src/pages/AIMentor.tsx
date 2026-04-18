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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.08),_transparent_24%),radial-gradient(circle_at_right,_rgba(14,165,233,0.08),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eefbf5_20%,#ffffff_100%)]">
      <Navbar />

      <main className="px-4 pb-16 pt-24">
        <div className="mx-auto max-w-7xl">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[36px] border border-white/70 bg-white/80 px-6 py-10 shadow-[0_40px_120px_-70px_rgba(15,23,42,0.45)] backdrop-blur-xl md:px-10"
          >
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                AI Mentor
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
                One place for guidance, practice, and career strategy
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-slate-600">
                Use AI Mentor to review resume gaps, schedule interviews, explore job fairs, and practice higher-value coaching scenarios like career advice and salary negotiations.
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
                className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-60px_rgba(15,23,42,0.4)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
                    <section.icon className="h-6 w-6 text-emerald-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-semibold text-slate-950">{section.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{section.description}</p>
                    <Link to={section.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800">
                      {section.cta}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </section>

          <section className="mt-8 rounded-[32px] border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-[0_32px_100px_-65px_rgba(15,23,42,0.75)] md:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">AI Interview Tracks</p>
              <h2 className="mt-3 text-3xl font-semibold">Career coaching and negotiation practice</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Start focused interview experiences for strategic conversations, not just standard mock interview rounds.
              </p>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {mockInterviewActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + index * 0.06 }}
                  className="rounded-[24px] border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <action.icon className="h-5 w-5 text-emerald-300" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{action.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{action.description}</p>
                  <Button
                    className="mt-5 w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                    onClick={() => navigate("/interview", { state: { interviewType: action.interviewType, mode: action.mode } })}
                  >
                    {action.cta}
                  </Button>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-60px_rgba(15,23,42,0.4)]">
              <div className="flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h3 className="text-xl font-semibold text-slate-950">What moved here</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Resume gap analysis, interview planning, AI insights, job fairs, career advice practice, and salary negotiation practice are now grouped under AI Mentor for a cleaner experience.
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-60px_rgba(15,23,42,0.4)]">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-sky-600" />
                <h3 className="text-xl font-semibold text-slate-950">How it works</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                AI Mentor acts as the hub. The deeper tools still use your existing career insights and interview systems, so you get the new organization without losing current functionality.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
