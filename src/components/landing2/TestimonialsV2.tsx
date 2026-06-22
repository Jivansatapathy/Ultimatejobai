import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "CFO → CFO at Fortune 500",
    avatar: "SC",
    color: "bg-blue-100 text-blue-700",
    quote: "Apex™ applied to over 80 roles in 2 weeks while I was running a major business unit. I landed 6 interviews without ever touching a form. This is the future of executive job searching.",
    stars: 5,
  },
  {
    name: "James Okafor",
    role: "VP Engineering → CTO",
    avatar: "JO",
    color: "bg-emerald-100 text-emerald-700",
    quote: "The role matching is uncanny. Hizorex only surfaced CTO roles at companies where my background actually fit — no noise, just signal. Got my CTO offer within 5 weeks.",
    stars: 5,
  },
  {
    name: "Priya Mehta",
    role: "Director HR → CHRO",
    avatar: "PM",
    color: "bg-violet-100 text-violet-700",
    quote: "I was skeptical about AI applying on my behalf, but the applications Apex™ submitted were polished and professional. My resume was perfectly tailored for each role.",
    stars: 5,
  },
];

export const TestimonialsV2 = () => (
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
          Success Stories
        </span>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          Executives Who Leveled Up
          <span className="text-gray-400"> with Hizorex</span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
          >
            {/* Stars */}
            <div className="flex gap-0.5">
              {Array.from({ length: t.stars }).map((_, j) => (
                <Star key={j} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>

            <p className="text-gray-600 text-base leading-relaxed flex-1">"{t.quote}"</p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${t.color}`}>
                {t.avatar}
              </div>
              <div>
                <p className="text-gray-900 font-semibold text-base">{t.name}</p>
                <p className="text-gray-400 text-sm">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
