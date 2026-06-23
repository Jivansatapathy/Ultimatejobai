import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { UserCircle2, Search, Bot, FileText, Target, Zap, Crown, CheckCircle2, ArrowRight } from "lucide-react";
import type { HowItWorksStep } from "@/services/landingService";

const ICON_MAP: Record<string, React.ElementType> = {
  UserCircle2, Search, Bot, FileText, Target, Zap, Crown, CheckCircle2,
};

export const HowItWorksV2 = ({ steps }: { steps: HowItWorksStep[] }) => (
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
        {steps.map((step, i) => {
          const Icon = ICON_MAP[step.icon_name] || Bot;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`relative rounded-2xl border p-5 sm:p-7 flex flex-col gap-4 sm:gap-5 ${
                step.is_accent
                  ? "border-blue-200 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200"
                  : "border-gray-200 bg-white hover:shadow-md transition-shadow"
              }`}
            >
              <span className={`absolute top-6 right-6 text-[10px] font-black tracking-[0.3em] ${step.is_accent ? "text-white/40" : "text-gray-200"}`}>
                {step.number}
              </span>

              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border ${
                step.is_accent
                  ? "bg-white/20 border-white/30 text-white"
                  : "bg-gray-50 border-gray-200 text-gray-700"
              }`}>
                <Icon className="h-5 w-5" />
              </div>

              <div>
                <h3 className={`font-bold text-lg mb-2 ${step.is_accent ? "text-white" : "text-gray-900"}`}>
                  {step.title}
                </h3>
                <p className={`text-base leading-relaxed mb-4 ${step.is_accent ? "text-blue-100" : "text-gray-500"}`}>
                  {step.description}
                </p>
                {step.checklist_items.length > 0 && (
                  <ul className="space-y-1.5">
                    {step.checklist_items.map((d) => (
                      <li key={d} className="flex items-center gap-2">
                        <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${step.is_accent ? "text-white" : "text-blue-500"}`} />
                        <span className={`text-sm font-medium ${step.is_accent ? "text-white/80" : "text-gray-500"}`}>{d}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          );
        })}
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
