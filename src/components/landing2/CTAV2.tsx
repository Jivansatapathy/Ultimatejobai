import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Crown, Sparkles } from "lucide-react";
import type { CTAContent } from "@/services/landingService";

export const CTAV2 = ({ cta }: { cta: CTAContent }) => (
  <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
    <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] [background-size:32px_32px]" />
    <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
    <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none" />

    <div className="relative mx-auto max-w-3xl text-center">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
      >
        <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
          <Crown className="h-3 w-3" />
          {cta.badge_text}
        </span>

        <h2 className="mb-5 text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
          {cta.headline}
        </h2>

        <p className="mx-auto mb-8 sm:mb-10 max-w-xl text-sm sm:text-base leading-relaxed text-white/60">
          {cta.subtitle}
        </p>

        <div className="mb-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to={cta.primary_button_url}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 sm:px-9 py-3.5 sm:py-4 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-sm sm:text-base transition-colors group shadow-lg"
          >
            <Sparkles className="h-4 w-4" />
            {cta.primary_button_text}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to={cta.secondary_button_url}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 sm:px-9 py-3.5 sm:py-4 rounded-xl border border-white/30 text-white/80 hover:text-white hover:border-white/50 font-bold text-sm sm:text-base transition-all"
          >
            {cta.secondary_button_text}
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-x-7 gap-y-3">
          {cta.benefits.map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-white/50">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-300 shrink-0" />
              <span className="text-sm">{b}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);
