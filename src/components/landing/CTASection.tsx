import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Crown } from "lucide-react";

const BENEFITS = [
  "Free to get started",
  "No credit card required",
  "Access 40,000+ executive roles",
  "Cancel anytime",
];

export const CTASection = () => {
  return (
    <section className="relative overflow-hidden bg-black py-24 px-6">
      {/* Subtle blue glow top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

      <div className="relative mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          {/* Blue-tinted badge */}
          <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400">
            <Crown className="h-3 w-3" />
            Join Top Executives
          </span>

          <h2 className="mb-5 text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.06] text-white">
            Your Next C-Suite Role<br />
            <span className="text-blue-400">Is Waiting For You</span>
          </h2>

          <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-white/40">
            Join thousands of senior leaders who use our platform to find exclusive CEO, CFO, CTO and VP roles —{" "}
            and let <span className="text-white font-semibold">Apex™</span>, your personal apply delegate, handle every application for you.
          </p>

          <div className="mb-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Blue primary CTA */}
            <Link
              to="/auth?mode=signup"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-colors group"
            >
              Start For Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/find-jobs"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-bold text-base transition-all"
            >
              Browse Jobs
            </Link>
          </div>

          {/* Blue checkmarks */}
          <div className="flex flex-wrap justify-center gap-x-7 gap-y-3">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-white/35">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span className="text-sm">{b}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
