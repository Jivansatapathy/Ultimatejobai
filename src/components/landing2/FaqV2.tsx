import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "What is Hizorex?",
    a: "Hizorex is an AI-powered Executive Career Platform designed for executives, startup leaders, board members, and fractional professionals looking for leadership opportunities.",
  },
  {
    q: "What types of executive jobs can I find?",
    a: "You can search Executive Jobs including CFO, CEO, CTO, CIO, COO, CMO, CRO, CHRO, CISO, Controller, Head of Product, Head of Engineering, Head of Sales, Board Member, and Fractional Executive roles.",
  },
  {
    q: "How does AI Job Matching work?",
    a: "Our AI analyzes your experience, executive background, skills, and preferences to recommend leadership opportunities that closely align with your profile.",
  },
  {
    q: "Does Hizorex offer resume tools?",
    a: "Yes. We provide an AI Resume Builder, Resume Optimization, AI Resume Optimization, interview preparation resources, and career guidance.",
  },
  {
    q: "Can companies recruit executives using Hizorex?",
    a: "Yes. Companies can use our Executive Hiring Platform to connect with experienced executives, startup leaders, board advisors, and fractional executives.",
  },
];

export const FaqV2 = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-gray-50 py-14 sm:py-20 px-4 sm:px-6 border-t border-gray-100">
      <div className="mx-auto max-w-3xl">
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 mb-4">
            <HelpCircle className="h-3 w-3" />
            FAQ
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="rounded-2xl border border-gray-200 bg-white overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left"
                >
                  <span className="font-bold text-gray-900 text-base">{item.q}</span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-1">
                    <p className="text-gray-500 text-sm sm:text-base leading-relaxed">{item.a}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
