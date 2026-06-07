import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { UserCircle2, Search, Bot, ArrowRight } from "lucide-react";

const STEPS = [
  {
    num: "01",
    icon: UserCircle2,
    title: "Build Your Executive Profile",
    desc: "Upload your resume and let our AI tailor it for C-Suite and senior leadership roles. ATS-optimized in minutes.",
    accent: false,
  },
  {
    num: "02",
    icon: Search,
    title: "Discover Curated Roles",
    desc: "Browse 40,000+ CEO, CFO, CTO, VP and Director positions globally — filtered for your exact seniority level.",
    accent: false,
  },
  {
    num: "03",
    icon: Bot,
    title: "Apex™ Handles the Rest",
    desc: "Your personal apply delegate fills and submits every application on your behalf — while you stay focused on leadership, not paperwork.",
    accent: true,
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="bg-white py-20 px-6 border-b border-black/[0.07]">
      <div className="mx-auto max-w-5xl">

        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          {/* Blue badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-black tracking-tight">
            Land Your Next Executive Role<br />
            <span className="text-black/30">in Three Simple Steps</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 relative">
          {/* Connector line — blue */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-blue-200" />

          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`relative flex flex-col gap-5 rounded-2xl border p-6 ${
                step.accent
                  ? "border-blue-200 bg-blue-50"
                  : "border-black/[0.08] bg-[#f9f9f9]"
              }`}
            >
              {/* Step number — blue */}
              <span className={`text-[10px] font-black tracking-[0.25em] uppercase absolute top-5 right-5 ${
                step.accent ? "text-blue-400" : "text-black/15"
              }`}>
                {step.num}
              </span>

              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border shadow-sm ${
                step.accent
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-black/10 text-black/60"
              }`}>
                <step.icon className="h-5 w-5" />
              </div>

              <div>
                <h3 className={`font-bold text-base mb-2 ${step.accent ? "text-blue-900" : "text-black"}`}>
                  {step.title}
                </h3>
                <p className={`text-sm leading-relaxed ${step.accent ? "text-blue-700/70" : "text-black/45"}`}>
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 }}
        >
          <Link
            to="/auth?mode=signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors"
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
