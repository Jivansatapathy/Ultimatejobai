import { motion } from "framer-motion";
import { FileText, Bot, Target, BarChart3, Shield, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: Bot,
    title: "Meet Apex™ — Your Apply Delegate",
    desc: "Apex is your personal executive application assistant. It reads, fills and submits applications on your behalf — saving 10+ hours a week so you can focus on leading, not applying.",
    tag: "Apex™",
    blue: true,
  },
  {
    icon: FileText,
    title: "Executive Resume Builder",
    desc: "Create a board-ready, ATS-optimized C-Suite resume with AI coaching tailored to senior leadership language.",
    tag: "Resume",
    blue: false,
  },
  {
    icon: Target,
    title: "Role-Level Job Matching",
    desc: "AI matches you only to CEO, CFO, CTO, VP and Director roles based on your seniority, industry and compensation target.",
    tag: "Matching",
    blue: false,
  },
  {
    icon: Zap,
    title: "Instant ATS Score",
    desc: "Know your resume's ATS compatibility before submitting. Get real-time suggestions to maximize shortlisting.",
    tag: "ATS Score",
    blue: true,
  },
  {
    icon: BarChart3,
    title: "Executive Career Analytics",
    desc: "Track response rates, interview conversions and market benchmarks for your level and industry in real time.",
    tag: "Analytics",
    blue: false,
  },
  {
    icon: Shield,
    title: "Confidential & Private",
    desc: "Your job search remains private. We never share your data with employers without your explicit consent.",
    tag: "Privacy",
    blue: false,
  },
];

export const FeaturesSection = () => {
  return (
    <section className="bg-[#f7f7f7] py-24 px-6 border-b border-black/[0.07]">
      <div className="mx-auto max-w-6xl">

        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          {/* Blue badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 mb-5">
            Platform Features
          </span>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-black leading-tight max-w-lg">
              Everything an Executive Needs<br />
              <span className="text-black/30">to Land Their Next Role</span>
            </h2>
            <p className="text-black/40 text-sm leading-relaxed max-w-xs md:text-right">
              Purpose-built for C-Suite and senior leadership job seekers worldwide.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-px bg-black/[0.07] rounded-2xl overflow-hidden border border-black/[0.07] md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="group relative flex flex-col gap-5 bg-white p-7 hover:bg-[#fafafa] transition-colors duration-200"
            >
              {/* Icon tile — blue for featured, black on hover for others */}
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-200 ${
                f.blue
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-black/[0.08] bg-black/[0.03] text-black/50 group-hover:bg-black group-hover:text-white group-hover:border-black"
              }`}>
                <f.icon className="h-5 w-5" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-black font-bold text-sm tracking-tight">{f.title}</h3>
                  {/* Blue tag for highlighted features, muted for others */}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                    f.blue
                      ? "bg-blue-50 text-blue-600 border-blue-200"
                      : "bg-black/[0.05] text-black/35 border-black/[0.06]"
                  }`}>
                    {f.tag}
                  </span>
                </div>
                <p className="text-black/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
