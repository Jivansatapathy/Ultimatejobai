import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const benefits = [
  "No credit card required",
  "Free forever tier",
  "Cancel anytime",
  "Full feature access",
];

export const CTASection = () => {
  return (
    <section className="relative overflow-hidden bg-[#0a0f1e] py-28 px-6">
      {/* Top border */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-teal-600/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Badge */}
          <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-teal-400">
            Get Started Today
          </span>

          {/* Heading */}
          <h2 className="mb-6 text-5xl font-black tracking-tight leading-[1.05] sm:text-6xl md:text-7xl">
            <span className="text-white">Ready to take your career</span>
            <br />
            <span className="bg-gradient-to-r from-teal-400 to-violet-400 bg-clip-text text-transparent">
              to the next level?
            </span>
          </h2>

          {/* Subtitle */}
          <p className="mx-auto mb-12 max-w-xl text-lg leading-relaxed text-slate-400">
            Join 50,000+ professionals who use{" "}
            <span className="text-white font-medium">CareerAI</span> to navigate
            the modern job market with confidence.
          </p>

          {/* CTA Buttons */}
          <div className="mb-14 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth?mode=signup" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-14 px-10 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-bold text-base shadow-lg shadow-teal-500/25 gap-2 group">
                Get Started Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/plans" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-14 px-10 rounded-xl border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 hover:border-white/25 hover:text-white font-bold text-base backdrop-blur-sm"
              >
                View Plans
              </Button>
            </Link>
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom border */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
};
