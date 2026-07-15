import { useState } from "react";
import { motion } from "framer-motion";
import { NavbarV2 as Navbar } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  Clock,
  Calendar,
  Send,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Star,
  Shield,
  Loader2,
} from "lucide-react";

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (opts: { url: string }) => void;
    };
  }
}

function openCalendly(url: string) {
  if (window.Calendly) {
    window.Calendly.initPopupWidget({ url });
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

// Replace these with your real Calendly event URLs
const CALL_TIERS = [
  {
    id: "free",
    name: "Free Assessment",
    price: "Free",
    duration: "15 min",
    description: "Quick career consultation — no commitment",
    cta: "Book Free Call",
    ctaCls: "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
    icon: Sparkles,
    iconBg: "bg-gray-100",
    iconCls: "text-gray-600",
    calendlyUrl: "https://calendly.com/YOUR_TEAM/15-min-consultation",
  },
  {
    id: "beginner",
    name: "30-Min Session",
    price: "$199/mo",
    duration: "30 min",
    description: "One executive recruiter session per month",
    cta: "Book 30-Min Call",
    ctaCls: "bg-teal-500 hover:bg-teal-600 text-white",
    icon: Phone,
    iconBg: "bg-teal-50",
    iconCls: "text-teal-600",
    calendlyUrl: "https://calendly.com/YOUR_TEAM/30-min-executive-session",
  },
  {
    id: "professional",
    name: "Pro Sessions",
    price: "$399/mo",
    duration: "2 × 30 min",
    description: "Two sessions per month — 60 min total",
    cta: "Book Pro Session",
    ctaCls: "bg-teal-500 hover:bg-teal-600 text-white",
    icon: Star,
    iconBg: "bg-teal-50",
    iconCls: "text-teal-600",
    calendlyUrl: "https://calendly.com/YOUR_TEAM/30-min-executive-session",
  },
  {
    id: "personal",
    name: "Dedicated Recruiter",
    price: "$999/mo",
    duration: "3 × 30 min",
    description: "Dedicated recruiter + 90 min monthly",
    cta: "Book with Recruiter",
    ctaCls: "bg-orange-500 hover:bg-orange-600 text-white",
    icon: Shield,
    iconBg: "bg-orange-50",
    iconCls: "text-orange-600",
    calendlyUrl: "https://calendly.com/YOUR_TEAM/dedicated-executive-search",
  },
];

export default function Contact() {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      // Replace with your real contact API endpoint
      await new Promise(res => setTimeout(res, 1200)); // placeholder delay
      setSent(true);
    } catch {
      setError("Failed to send message. Please try again or email us directly.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="pt-24 pb-20 px-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-teal-600 mb-6">
            <Mail className="h-3.5 w-3.5" /> Get in Touch
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4 leading-[1.1]">
            We're here to help
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Send us a message, or book a call with one of our executive recruiters — free or paid.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-10">

          {/* ── Left: Contact form ─────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-1">Send a Message</h2>
              <p className="text-sm text-gray-500 mb-6">We typically respond within 24 hours.</p>

              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 gap-4 text-center"
                >
                  <div className="h-16 w-16 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-teal-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Message sent!</h3>
                  <p className="text-gray-500 max-w-sm">
                    Thanks for reaching out. Our team will reply to <strong>{form.email}</strong> within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="text-sm text-teal-600 hover:underline mt-2"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Jane Smith"
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="jane@company.com"
                        value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                    <input
                      type="text"
                      placeholder="How can we help?"
                      value={form.subject}
                      onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                      className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Tell us more about what you need…"
                      value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full h-11 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {sending ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                    ) : (
                      <><Send className="h-4 w-4" /> Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Contact info strip */}
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Email us</p>
                  <a href="mailto:support@hizorex.com" className="text-sm font-semibold text-gray-900 hover:text-teal-600 transition-colors">
                    support@hizorex.com
                  </a>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Response time</p>
                  <p className="text-sm font-semibold text-gray-900">Within 24 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Book a Call ─────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-gray-900 leading-tight">Book a Recruiter Call</h2>
                  <p className="text-xs text-gray-500">Choose the session that fits your plan</p>
                </div>
              </div>

              <div className="space-y-3">
                {CALL_TIERS.map((tier) => {
                  const Icon = tier.icon;
                  return (
                    <div
                      key={tier.id}
                      className="rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:border-teal-300 transition-all group"
                    >
                      <div className={`shrink-0 h-9 w-9 rounded-lg flex items-center justify-center ${tier.iconBg}`}>
                        <Icon className={`h-4 w-4 ${tier.iconCls}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{tier.name}</p>
                          <span className="text-[10px] text-gray-400 font-medium">{tier.duration}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{tier.description}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-bold text-gray-900 mb-1">{tier.price}</p>
                        {isAuthenticated ? (
                          <button
                            type="button"
                            onClick={() => openCalendly(tier.calendlyUrl)}
                            className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${tier.ctaCls}`}
                          >
                            <Calendar className="h-3 w-3" />
                            Book
                          </button>
                        ) : (
                          <Link
                            to="/auth"
                            className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-1"
                          >
                            Sign in
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100">
                <Link
                  to="/book-a-call"
                  className="flex items-center justify-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                >
                  View full plan comparison
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      <FooterV2 />
    </div>
  );
}
