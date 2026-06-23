import { useState, useEffect } from "react";
import { fetchLandingContent, LandingContent } from "@/services/landingService";

const FALLBACK: LandingContent = {
  hero: {
    badge_text: "The AI-Powered Executive Job Platform",
    headline_line1: "Executive Jobs",
    headline_line2: "for C-Suite Leaders,",
    headline_suffix: "For Senior Leaders, Worldwide",
    subtitle:
      "Curated CEO, CFO, CTO, COO & VP roles from 500+ top employers. Let Apex™ — your AI delegate — handle every application while you stay focused on leading.",
    search_role_placeholder: "Job title, role or keyword",
    search_location_placeholder: "City, state or remote",
    quick_roles: ["CEO", "CFO", "CTO", "COO", "VP Engineering", "VP Sales", "CHRO", "Director"],
    stats: [
      { num: 100, suffix: "K+", label: "Executive roles listed", sub: "Updated daily" },
      { num: 500, suffix: "+", label: "Top hiring companies", sub: "F500 to high-growth" },
      { num: 3, suffix: "×", label: "Faster applications with Apex™", sub: "AI handles the paperwork" },
      { num: 92, suffix: "%", label: "Profile match accuracy", sub: "Powered by AI scoring" },
    ],
    venus_banner_title: "Venus AI — Your Executive Career Operating System",
    venus_banner_subtitle:
      "Company intelligence, compensation benchmarks, equity modeling, EOS™ scoring and live interview practice — built exclusively for C-suite leaders.",
  },
  features: [
    { title: "Apex™ — AI Apply Delegate", description: "Apex reads, fills and submits every executive job application on your behalf — saving 10+ hours per week.", tag: "Flagship", icon_name: "Bot", is_accent: true, order: 0, is_active: true },
    { title: "Executive Resume Builder", description: "Board-ready, ATS-optimized resumes built for C-Suite language — with AI coaching tailored to your seniority level.", tag: "Resume", icon_name: "FileText", is_accent: false, order: 1, is_active: true },
    { title: "Seniority-Level Matching", description: "AI matches only to CEO, CFO, CTO, VP and Director positions based on your exact background.", tag: "Matching", icon_name: "Target", is_accent: false, order: 2, is_active: true },
    { title: "Real-Time ATS Scoring", description: "See your ATS compatibility score before submitting. Get actionable suggestions to maximize shortlisting odds.", tag: "ATS Score", icon_name: "Zap", is_accent: true, order: 3, is_active: true },
    { title: "Career Analytics Dashboard", description: "Track response rates, interview conversions and compensation benchmarks in real time.", tag: "Analytics", icon_name: "BarChart3", is_accent: false, order: 4, is_active: true },
    { title: "Fully Private & Confidential", description: "Your executive job search stays private. We never share your data with employers without explicit consent.", tag: "Privacy", icon_name: "Shield", is_accent: false, order: 5, is_active: true },
  ],
  how_it_works: [
    { number: "01", title: "Build Your Executive Profile", description: "Upload your resume and let our AI tailor it for C-Suite and senior leadership roles. ATS-optimized in minutes.", icon_name: "UserCircle2", checklist_items: ["AI resume parsing", "ATS optimization", "Role-level tailoring"], is_accent: false, order: 0, is_active: true },
    { number: "02", title: "Discover Curated Roles", description: "Browse 40,000+ CEO, CFO, CTO, VP and Director positions globally — filtered for your exact seniority level.", icon_name: "Search", checklist_items: ["40,000+ executive roles", "US & Canada coverage", "Real-time updates"], is_accent: false, order: 1, is_active: true },
    { number: "03", title: "Apex™ Handles the Rest", description: "Your personal apply delegate fills and submits every application on your behalf — while you stay focused on leadership.", icon_name: "Bot", checklist_items: ["Auto form filling", "Cover letter generation", "Progress tracking"], is_accent: true, order: 2, is_active: true },
  ],
  cta: {
    badge_text: "Join Top Executives",
    headline: "Your Next C-Suite Role Is Waiting For You",
    subtitle:
      "Join thousands of senior leaders who use Hizorex to find exclusive CEO, CFO, CTO and VP roles — and let Apex™ handle every application.",
    benefits: ["Free to get started", "No credit card required", "Access 40,000+ executive roles", "Cancel anytime"],
    primary_button_text: "Start For Free",
    primary_button_url: "/auth?mode=signup",
    secondary_button_text: "Browse Jobs",
    secondary_button_url: "/find-jobs",
  },
  testimonials: [
    { author_name: "Sarah Chen", author_role: "CFO → CFO at Fortune 500", quote: "Apex™ applied to over 80 roles in 2 weeks while I was running a major business unit. I landed 6 interviews without ever touching a form.", avatar_initials: "SC", avatar_color: "bg-blue-100 text-blue-700", order: 0, is_active: true },
    { author_name: "James Okafor", author_role: "VP Engineering → CTO", quote: "The role matching is uncanny. Hizorex only surfaced CTO roles at companies where my background actually fit — no noise, just signal. Got my CTO offer within 5 weeks.", avatar_initials: "JO", avatar_color: "bg-emerald-100 text-emerald-700", order: 1, is_active: true },
    { author_name: "Priya Mehta", author_role: "Director HR → CHRO", quote: "I was skeptical about AI applying on my behalf, but the applications Apex™ submitted were polished and professional. My resume was perfectly tailored for each role.", avatar_initials: "PM", avatar_color: "bg-violet-100 text-violet-700", order: 2, is_active: true },
  ],
};

export function useLandingContent() {
  const [content, setContent] = useState<LandingContent>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLandingContent()
      .then(setContent)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { content, loading };
}
