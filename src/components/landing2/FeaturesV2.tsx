import { motion } from "framer-motion";
import { FileText, Bot, Target, BarChart3, Shield, Zap, Star, Crown, Search, Sparkles, Brain, Users } from "lucide-react";
import type { FeatureItem } from "@/services/landingService";

const ICON_MAP: Record<string, React.ElementType> = {
  Bot, FileText, Target, BarChart3, Shield, Zap, Star, Crown, Search, Sparkles, Brain, Users,
};

export const FeaturesV2 = ({ features }: { features: FeatureItem[] }) => (
  <section className="bg-gray-50 py-14 sm:py-20 px-4 sm:px-6 border-t border-gray-100">
    <div className="mx-auto max-w-6xl">

      <motion.div
        className="mb-14 text-center"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 mb-4">
          <Star className="h-3 w-3" />
          Platform Features
        </span>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          Everything a Senior Leader Needs<br className="hidden sm:block" />
          <span className="text-gray-400"> to Land Their Next Role</span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => {
          const Icon = ICON_MAP[f.icon_name] || Zap;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className={`group flex flex-col gap-4 rounded-2xl border p-6 transition-all duration-200 ${
                f.is_accent
                  ? "border-blue-200 bg-white shadow-sm hover:shadow-md hover:border-blue-300"
                  : "border-gray-200 bg-white hover:shadow-md hover:border-gray-300"
              }`}
            >
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-200 ${
                f.is_accent
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-gray-50 border-gray-200 text-gray-500 group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900"
              }`}>
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-gray-900 font-bold text-base tracking-tight">{f.title}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                  f.is_accent
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                }`}>
                  {f.tag}
                </span>
              </div>

              <p className="text-gray-500 text-base leading-relaxed">{f.description}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);
