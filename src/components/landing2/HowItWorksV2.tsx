import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { UserCircle2, Search, Bot, CheckCircle2, ArrowRight } from "lucide-react";

const STEPS = [
  {
    num: "01",
    icon: UserCircle2,
    title: "Build Your Executive Profile",
    desc: "Upload your resume and let AI tailor it specifically for C-Suite and senior leadership roles. ATS-optimized in under 3 minutes.",
    done: ["AI resume parsing", "ATS optimization", "Role-level tailoring"],
  },
  {
    num: "02",
    icon: Search,
    title: "Discover Curated Roles",
    desc: "Browse 40,000+ CEO, CFO, CTO, VP and Director positions globally — filtered to your exact seniority level.",
    done: ["40,000+ executive roles", "US & Canada coverage", "Real-time updates"],
  },
  {
    num: "03",
    icon: Bot,
    title: "Apex™ Applies For You",
    desc: "Your personal AI delegate fills and submits every application on your behalf — while you stay focused on strategy and leadership.",
    done: ["Auto form filling", "Cover letter generation", "Progress tracking"],
    highlight: true,
  },
];

export const HowItWorksV2 = () => (
  <section className="bg-white py-14 sm:py-20 px-4 sm:px-6 border-t border-gray-100">
    <div className="mx-auto max-w-6xl">

      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 mb-4">
          How It Works
        </span>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          Land Your Next Executive Role<br className="hidden sm:block" />
          <span className="text-gray-400"> in Three Simple Steps</span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {STEPS.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className={`relative rounded-2xl border p-5 sm:p-7 flex flex-col gap-4 sm:gap-5 ${
              step.highlight
                ? "border-blue-200 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200"
                : "border-gray-200 bg-white hover:shadow-md transition-shadow"
            }`}
          >
            {/* Step number */}
            <span className={`absolute top-6 right-6 text-[10px] font-black tracking-[0.3em] ${step.highlight ? "text-white/40" : "text-gray-200"}`}>
              {step.num}
            </span>

            {/* Icon */}
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border ${
              step.highlight
                ? "bg-white/20 border-white/30 text-white"
                : "bg-gray-50 border-gray-200 text-gray-700"
            }`}>
              <step.icon className="h-5 w-5" />
            </div>

            <div>
              <h3 className={`font-bold text-lg mb-2 ${step.highlight ? "text-white" : "text-gray-900"}`}>
                {step.title}
              </h3>
              <p className={`text-base leading-relaxed mb-4 ${step.highlight ? "text-blue-100" : "text-gray-500"}`}>
                {step.desc}
              </p>
              <ul className="space-y-1.5">
                {step.done.map(d => (
                  <li key={d} className="flex items-center gap-2">
                    <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${step.highlight ? "text-white" : "text-blue-500"}`} />
                    <span className={`text-sm font-medium ${step.highlight ? "text-white/80" : "text-gray-500"}`}>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-10 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        <Link
          to="/auth?mode=signup"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-colors"
        >
          Get Started Free <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </div>
  </section>
);
