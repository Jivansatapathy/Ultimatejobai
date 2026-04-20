import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const benefits = [
  "No credit card required",
  "Free forever tier",
  "Cancel anytime",
  "Full feature access",
];

export const CTASection = () => {
  return (
    <section className="relative overflow-hidden bg-[#0a0f1e] py-28 px-6">
      {/* Subtle top border */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-orange-600 mb-8">
            Get Started Today
          </span>

          <h2 className="text-5xl font-black tracking-tight text-slate-900 sm:text-6xl md:text-7xl leading-[1.0] mb-6">
            Ready to take your career{" "}
            <span className="text-orange-500">to the next level?</span>
          </h2>

          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed mb-12">
            Join 50,000+ professionals who use UltimateJobAI to navigate the
            modern job market with confidence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/auth?mode=signup" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-14 px-10 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-black text-base shadow-lg shadow-orange-500/20 transition-all group">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/plans" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-14 px-10 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold text-base"
              >
                View Plans
              </Button>
            </Link>
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-slate-400"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
