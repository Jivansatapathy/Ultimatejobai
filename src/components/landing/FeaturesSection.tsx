import { motion } from "framer-motion";
import {
  FileText,
  Target,
  Briefcase,
  Send,
  BarChart3,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Resume Intelligence",
    description:
      "Create ATS-optimized resumes from scratch or rebuild existing ones with AI-powered keyword optimization.",
    tag: "Builder",
  },
  {
    icon: Target,
    title: "ATS Score Analysis",
    description:
      "Real-time ATS compatibility scoring with explainable insights and actionable recommendations to improve your match rate.",
    tag: "Scoring",
  },
  {
    icon: Briefcase,
    title: "Smart Job Discovery",
    description:
      "AI-driven job recommendations based on your resume, skills, and behavior — quality over quantity.",
    tag: "Discovery",
  },
  {
    icon: Send,
    title: "Auto-Apply Automation",
    description:
      "Consent-driven automated applications with personalized cover letters sent to verified hiring contacts.",
    tag: "Automation",
  },
  {
    icon: BarChart3,
    title: "Career Analytics",
    description:
      "Track your job search momentum with detailed analytics on applications, responses, and interview conversion.",
    tag: "Analytics",
  },
  {
    icon: Shield,
    title: "Privacy-First Design",
    description:
      "Your data stays yours. Enterprise-grade encryption, GDPR compliance, and transparent data handling.",
    tag: "Security",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="bg-[#0f0e0e] py-28 px-6 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-orange-400 mb-6">
            Platform Features
          </span>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl leading-[1.05] max-w-xl">
              Everything you need to{" "}
              <span className="text-orange-400">land your dream job.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs md:text-right">
              A complete career operations platform built for the modern job
              market.
            </p>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06] md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="group relative flex flex-col gap-5 bg-[#0f0e0e] p-8 hover:bg-white/[0.03] transition-colors duration-300"
            >
              {/* Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:bg-orange-500/15 group-hover:border-orange-500/30 transition-all duration-300">
                <feature.icon className="h-5 w-5 text-slate-400 group-hover:text-orange-400 transition-colors duration-300" />
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {feature.title}
                  </h3>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-500 border border-white/5">
                    {feature.tag}
                  </span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
