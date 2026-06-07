import { motion } from "framer-motion";

const COMPANIES = [
  "Shopify", "RBC", "TD Bank", "Scotiabank", "Manulife",
  "Sun Life", "Enbridge", "Suncor", "Rogers", "Bell Canada",
  "Telus", "Air Canada", "Bombardier", "CGI Group", "Open Text",
  "Brookfield", "Fairfax", "CIBC", "BMO", "Intact Financial",
];

export const TopCompaniesSection = () => {
  return (
    <section className="bg-white py-16 px-6 border-b border-black/[0.07] overflow-hidden">
      <div className="mx-auto max-w-5xl">

        <motion.p
          className="text-center text-xs font-bold uppercase tracking-[0.2em] text-black/25 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Top Companies Actively Hiring
        </motion.p>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Row 1 */}
          <div className="flex gap-3 mb-3 overflow-hidden">
            <motion.div
              className="flex gap-3 shrink-0"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              {[...COMPANIES, ...COMPANIES].map((company, i) => (
                <div
                  key={i}
                  className="shrink-0 px-5 py-2.5 rounded-lg border border-black/[0.08] bg-[#f7f7f7] text-black/50 text-sm font-medium whitespace-nowrap hover:border-black/20 hover:text-black/70 transition-colors"
                >
                  {company}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Row 2 — reversed */}
          <div className="flex gap-3 overflow-hidden">
            <motion.div
              className="flex gap-3 shrink-0"
              animate={{ x: ["-50%", "0%"] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            >
              {[...COMPANIES.slice(10), ...COMPANIES.slice(0, 10), ...COMPANIES.slice(10), ...COMPANIES.slice(0, 10)].map((company, i) => (
                <div
                  key={i}
                  className="shrink-0 px-5 py-2.5 rounded-lg border border-black/[0.06] bg-[#f7f7f7] text-black/35 text-sm font-medium whitespace-nowrap"
                >
                  {company}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
