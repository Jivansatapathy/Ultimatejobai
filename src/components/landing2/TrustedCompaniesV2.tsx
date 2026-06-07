import { motion } from "framer-motion";

const COMPANIES = [
  "Google", "Microsoft", "Amazon", "Meta", "Apple",
  "Goldman Sachs", "McKinsey", "Deloitte", "KPMG", "Accenture",
  "IBM", "Oracle", "Salesforce", "Shopify", "RBC",
];

export const TrustedCompaniesV2 = () => (
  <section className="bg-white py-14 px-6 border-t border-gray-100 overflow-hidden">
    <div className="mx-auto max-w-5xl">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-xs font-bold uppercase tracking-[0.22em] text-gray-400 mb-8"
      >
        Executives at these companies trust JobAI
      </motion.p>

      {/* Scrolling strip */}
      <div className="relative">
        <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        <div className="flex gap-8 overflow-hidden">
          <motion.div
            className="flex gap-8 shrink-0"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {[...COMPANIES, ...COMPANIES].map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="shrink-0 flex items-center justify-center rounded-xl border border-gray-100 bg-gray-50 px-6 py-3 min-w-[120px]"
              >
                <span className="text-sm font-bold text-gray-400 whitespace-nowrap">{name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  </section>
);
