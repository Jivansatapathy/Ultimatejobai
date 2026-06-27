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

import { NavbarV2 as Navbar } from "@/components/landing2/NavbarV2";
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
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <Navbar />

      <main className="px-4 pb-16 pt-24">
        <div className="mx-auto max-w-7xl">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[36px] border border-gray-200 bg-white px-6 py-12 shadow-sm md:px-10"
          >
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.25em] text-teal-600">
                <Sparkles className="h-3.5 w-3.5" />
                Strategic Module
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-gray-900 md:text-6xl uppercase">
                AI Career Strategist
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-medium text-gray-500 leading-relaxed">
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
                className="rounded-[28px] border border-gray-200 bg-white p-4 sm:p-6 md:p-8 shadow-sm hover:border-teal-400 transition-all hover:-translate-y-1 group"
              >
                <div className="flex items-start gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-gray-100 border border-gray-200 group-hover:bg-teal-50 group-hover:border-teal-200 transition-all">
                    <section.icon className="h-7 w-7 text-gray-500 group-hover:text-teal-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">{section.title}</h2>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">{section.description}</p>
                    <Link to={section.href} className="mt-6 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-teal-600 transition-colors">
                      {section.cta}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </section>

          <section className="mt-8 rounded-[32px] border border-teal-200 bg-gradient-to-br from-teal-50 to-white px-6 py-12 md:px-10">
            <div className="max-w-2xl">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-teal-600">Simulation Tracks</p>
              <h2 className="mt-4 text-3xl font-black text-gray-900 tracking-tight uppercase">Mock Scenarios</h2>
              <p className="mt-4 text-base font-medium text-gray-500 leading-relaxed">
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
                  className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 border border-gray-200">
                    <action.icon className="h-5 w-5 text-gray-500" />
                  </div>
                  <h3 className="mt-6 text-xl font-black text-gray-900 uppercase tracking-tight">{action.title}</h3>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-gray-500">{action.description}</p>
                  <Button
                    className="mt-8 w-full bg-teal-500 text-white hover:bg-teal-600 font-black uppercase tracking-widest text-[11px] h-12 rounded-xl border-none shadow-sm"
                    onClick={() => navigate("/interview", { state: { interviewType: action.interviewType, mode: action.mode } })}
                  >
                    {action.cta}
                  </Button>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-200">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                </div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Everything in One Place</h3>
              </div>
              <p className="mt-5 text-sm font-medium leading-relaxed text-gray-500">
                Gap analysis, interview practice, AI insights, and job fairs are all here so you don't have to jump between different tools.
              </p>
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 border border-sky-200">
                  <BarChart3 className="h-5 w-5 text-sky-500" />
                </div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Powered by Your Profile</h3>
              </div>
              <p className="mt-5 text-sm font-medium leading-relaxed text-gray-500">
                Recommendations are based on your resume, skills, and interview history so every suggestion is relevant to where you are right now.
              </p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
