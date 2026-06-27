import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, ChevronRight, ChevronLeft, Check, Building2, TrendingUp, Star, Settings, Briefcase, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { venusService, ExecutiveProfile } from "@/services/venusService";
import { getVenusBasePath } from "@/lib/venusBasePath";

const EXEC_ROLES = ["CEO","COO","CTO","CFO","CPO","CMO","CRO","CHRO","CISO","CIO","VP Engineering","VP Sales","VP Marketing","VP Product","VP Finance","VP Operations","Board Advisor","Fractional Executive"];
const INDUSTRIES = ["Technology","FinTech","HealthTech","SaaS","E-commerce","Manufacturing","Healthcare","Financial Services","Media","Education","Clean Energy","Real Estate","Consulting","Retail","Defense","Biotech"];
const STRENGTHS = ["P&L Ownership","Team Building","GTM Strategy","Product Vision","Technical Architecture","M&A","Fundraising","Operational Excellence","Brand Building","Data & Analytics","Customer Success","International Expansion"];
const SKILLS_LIST = ["SaaS","Enterprise Sales","Board Governance","Capital Markets","Digital Transformation","Supply Chain","Regulatory/Compliance","Private Equity","Venture Capital","IPO/Exit","Strategic Partnerships","Turnaround","Revenue Growth","Cost Reduction","Mergers & Acquisitions","Product-Led Growth","Sales-Led Growth","AI/ML","Cloud Infrastructure","Cybersecurity"];
const STAGES = [
  { value: "pre_seed", label: "Pre-Seed" },
  { value: "seed", label: "Seed" },
  { value: "series_a", label: "Series A" },
  { value: "series_b", label: "Series B" },
  { value: "series_c", label: "Series C" },
  { value: "late_stage", label: "Late Stage" },
  { value: "public", label: "Public" },
  { value: "pe_backed", label: "PE-Backed" },
  { value: "bootstrapped", label: "Bootstrapped" },
];

const STEPS = [
  { title: "Your Role", icon: Crown, desc: "What executive role best describes you?" },
  { title: "Industries & Stage", icon: Building2, desc: "Your sector expertise and preferred company stage" },
  { title: "Career History", icon: Briefcase, desc: "Where you've led and for how long" },
  { title: "Impact", icon: Trophy, desc: "Your measurable achievements and scope of leadership" },
  { title: "Skills & Strengths", icon: Zap, desc: "Your functional superpowers and domain expertise" },
  { title: "Preferences", icon: Settings, desc: "Compensation expectations and opportunity types" },
];

export default function ExecutiveProfileBuilder() {
  const navigate = useNavigate();
  const basePath = getVenusBasePath(useLocation().pathname);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<ExecutiveProfile>>({
    role: "",
    industries: [],
    growth_stage: "",
    leadership_years: 5,
    past_companies: [],
    exit_history: [],
    achievements: [],
    pl_size: undefined,
    team_size: undefined,
    functional_strengths: [],
    skills: [],
    education: "",
    fractional_open: false,
    advisory_open: false,
    confidential_mode: false,
    comp_floor: undefined,
    risk_tolerance: "medium",
    board_seats: [],
  });

  const set = (key: keyof ExecutiveProfile, val: unknown) =>
    setProfile(p => ({ ...p, [key]: val }));

  const toggleArr = (key: "industries" | "functional_strengths" | "skills" | "achievements", val: string) => {
    const arr = (profile[key] as string[]) || [];
    set(key, arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await venusService.updateProfile(profile);
      toast.success("Executive profile saved!");
      navigate(basePath);
    } catch {
      toast.error("Failed to save profile — API not yet connected.");
      navigate(basePath);
    } finally {
      setSaving(false);
    }
  };

  const canNext = () => {
    if (step === 0) return !!profile.role;
    if (step === 1) return (profile.industries?.length ?? 0) > 0;
    if (step === 4) return (profile.functional_strengths?.length ?? 0) > 0;
    return true;
  };

  return (
    <div className="min-h-full bg-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Hizorex AI</p>
            <p className="text-lg font-black text-gray-900">Executive Profile Builder</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1.5 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 flex-1">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black transition-all ${
                i < step ? "bg-blue-600 text-white" : i === step ? "bg-blue-600 text-white ring-2 ring-blue-200" : "bg-gray-100 text-gray-700"
              }`}>
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full transition-all ${i < step ? "bg-blue-600" : "bg-gray-100"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">Step {step + 1} of {STEPS.length}</p>
            <h2 className="text-2xl font-black text-gray-900">{STEPS[step].title}</h2>
            <p className="text-sm text-gray-800 mt-1">{STEPS[step].desc}</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 0 — Role */}
              {step === 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EXEC_ROLES.map(role => (
                    <button key={role} type="button"
                      onClick={() => set("role", role)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-semibold text-left transition-all ${
                        profile.role === role
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-gray-100 text-gray-800 hover:border-blue-400"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}

              {/* Step 1 — Industries & Stage */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-800 mb-2">Industries (pick up to 4)</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {INDUSTRIES.map(ind => (
                        <button key={ind} type="button"
                          onClick={() => (profile.industries?.length ?? 0) < 4 || profile.industries?.includes(ind) ? toggleArr("industries", ind) : null}
                          className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${
                            profile.industries?.includes(ind)
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 bg-gray-100 text-gray-800 hover:border-blue-400"
                          }`}
                        >{ind}</button>
                      ))}
                    </div>
                    {(profile.industries?.length ?? 0) >= 4 && (
                      <p className="text-xs text-gray-700 mt-1">Maximum 4 selected.</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-800 mb-2">Preferred Company Stage</p>
                    <div className="grid grid-cols-3 gap-2">
                      {STAGES.map(s => (
                        <button key={s.value} type="button"
                          onClick={() => set("growth_stage", s.value)}
                          className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${
                            profile.growth_stage === s.value
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 bg-gray-100 text-gray-800 hover:border-blue-400"
                          }`}
                        >{s.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 — Career History */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-800 mb-2 block">Total Years in Leadership</label>
                    <Input type="number" min={1} max={40} value={profile.leadership_years}
                      onChange={e => set("leadership_years", Number(e.target.value))}
                      className="bg-gray-100 border-gray-300 text-gray-900 w-32"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-800 mb-2 block">Past Companies</label>
                    <p className="text-xs text-gray-700 mb-3">Where you've held executive roles (most recent first)</p>
                    <div className="space-y-2">
                      {(profile.past_companies || []).map((pc, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <Input value={pc.company} placeholder="Company name"
                            onChange={e => { const arr = [...(profile.past_companies||[])]; arr[i] = {...arr[i], company: e.target.value}; set("past_companies", arr); }}
                            className="bg-gray-100 border-gray-300 text-gray-900 flex-1" />
                          <Input value={pc.title} placeholder="Your title"
                            onChange={e => { const arr = [...(profile.past_companies||[])]; arr[i] = {...arr[i], title: e.target.value}; set("past_companies", arr); }}
                            className="bg-gray-100 border-gray-300 text-gray-900 flex-1" />
                          <Input type="number" min={1} max={30} value={pc.duration_years || ""} placeholder="Yrs"
                            onChange={e => { const arr = [...(profile.past_companies||[])]; arr[i] = {...arr[i], duration_years: Number(e.target.value)}; set("past_companies", arr); }}
                            className="bg-gray-100 border-gray-300 text-gray-900 w-20" />
                          <button type="button" onClick={() => set("past_companies", (profile.past_companies||[]).filter((_,j) => j !== i))}
                            className="mt-2 text-gray-700 hover:text-red-600 text-lg leading-none">×</button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm"
                        onClick={() => set("past_companies", [...(profile.past_companies||[]), { company: "", title: "", duration_years: 2 }])}
                        className="border-gray-300 text-gray-800 hover:bg-gray-100">
                        + Add Company
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-800 mb-2 block">Notable Exits / IPOs (optional)</label>
                    <div className="space-y-2">
                      {(profile.exit_history || []).map((ex, i) => (
                        <div key={i} className="flex gap-2">
                          <Input value={ex.company} placeholder="Company"
                            onChange={e => { const arr = [...(profile.exit_history||[])]; arr[i] = {...arr[i], company: e.target.value}; set("exit_history", arr); }}
                            className="bg-gray-100 border-gray-300 text-gray-900 flex-1" />
                          <Input value={ex.type} placeholder="Acquisition / IPO"
                            onChange={e => { const arr = [...(profile.exit_history||[])]; arr[i] = {...arr[i], type: e.target.value}; set("exit_history", arr); }}
                            className="bg-gray-100 border-gray-300 text-gray-900 w-36" />
                          <Input type="number" value={ex.year} placeholder="Year"
                            onChange={e => { const arr = [...(profile.exit_history||[])]; arr[i] = {...arr[i], year: Number(e.target.value)}; set("exit_history", arr); }}
                            className="bg-gray-100 border-gray-300 text-gray-900 w-24" />
                        </div>
                      ))}
                      <Button variant="outline" size="sm"
                        onClick={() => set("exit_history", [...(profile.exit_history||[]), { company: "", type: "Acquisition", year: new Date().getFullYear() }])}
                        className="border-gray-300 text-gray-800 hover:bg-gray-100">
                        + Add Exit
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 — Impact */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-800 mb-2 block">Largest P&L Managed (USD)</label>
                      <p className="text-xs text-gray-700 mb-2">Revenue or budget you owned</p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 text-sm font-bold">$</span>
                        <Input type="number" min={0} step={1000000}
                          value={profile.pl_size ?? ""}
                          onChange={e => set("pl_size", e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="e.g. 50000000"
                          className="pl-7 bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-700" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-800 mb-2 block">Largest Team Led</label>
                      <p className="text-xs text-gray-700 mb-2">Total headcount you managed</p>
                      <Input type="number" min={1}
                        value={profile.team_size ?? ""}
                        onChange={e => set("team_size", e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="e.g. 250"
                        className="bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-700" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-800 mb-1 block">Key Achievements</label>
                    <p className="text-xs text-gray-700 mb-3">Quantified results — what you built, grew, or delivered. These go directly into your EOS scoring.</p>
                    <div className="space-y-2">
                      {(profile.achievements || []).map((ach, i) => (
                        <div key={i} className="flex gap-2">
                          <Input value={ach}
                            placeholder={i === 0 ? "e.g. Grew ARR from $3M to $22M in 18 months" : i === 1 ? "e.g. Led $80M Series C raise" : "e.g. Built and scaled sales team from 5 to 60 reps"}
                            onChange={e => { const arr = [...(profile.achievements||[])]; arr[i] = e.target.value; set("achievements", arr); }}
                            className="bg-gray-100 border-gray-300 text-gray-900 flex-1" />
                          <button type="button" onClick={() => set("achievements", (profile.achievements||[]).filter((_,j) => j !== i))}
                            className="text-gray-700 hover:text-red-600 text-lg leading-none px-1">×</button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm"
                        onClick={() => set("achievements", [...(profile.achievements||[]), ""])}
                        className="border-gray-300 text-gray-800 hover:bg-gray-100">
                        + Add Achievement
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4 — Skills & Strengths */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-800 mb-2">Functional Strengths <span className="text-blue-600">(required)</span></p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {STRENGTHS.map(s => (
                        <button key={s} type="button" onClick={() => toggleArr("functional_strengths", s)}
                          className={`rounded-xl border px-3 py-2.5 text-sm font-semibold text-left transition-all flex items-center gap-2 ${
                            profile.functional_strengths?.includes(s)
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 bg-gray-100 text-gray-800 hover:border-blue-400"
                          }`}
                        >
                          {profile.functional_strengths?.includes(s) && <Check className="h-3.5 w-3.5 shrink-0" />}
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-800 mb-2">Domain Skills</p>
                    <p className="text-xs text-gray-700 mb-2">Used to match your profile against job descriptions</p>
                    <div className="flex flex-wrap gap-2">
                      {SKILLS_LIST.map(s => (
                        <button key={s} type="button" onClick={() => toggleArr("skills", s)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
                            profile.skills?.includes(s)
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 bg-gray-100 text-gray-800 hover:border-blue-400"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5 — Preferences */}
              {step === 5 && (
                <div className="space-y-4">
                  {[
                    { key: "fractional_open" as const, label: "Open to Fractional roles", desc: "Part-time executive engagement" },
                    { key: "advisory_open" as const, label: "Open to Advisory roles", desc: "Board advisor or strategic advisor" },
                    { key: "confidential_mode" as const, label: "Confidential Search Mode", desc: "Your identity stays hidden until you approve interest" },
                  ].map(({ key, label, desc }) => (
                    <button key={key} type="button" onClick={() => set(key, !profile[key])}
                      className={`w-full flex items-center justify-between rounded-xl border px-4 py-4 transition-all ${
                        profile[key]
                          ? "border-blue-500 bg-blue-600/10"
                          : "border-gray-300 bg-gray-100 hover:border-gray-400"
                      }`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900">{label}</p>
                        <p className="text-xs text-gray-800 mt-0.5">{desc}</p>
                      </div>
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                        profile[key] ? "border-blue-500 bg-blue-600" : "border-gray-300"
                      }`}>
                        {profile[key] && <Check className="h-3.5 w-3.5 text-white" />}
                      </div>
                    </button>
                  ))}

                  <div className="rounded-xl border border-gray-300 bg-gray-100 px-4 py-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-900">Minimum Base Salary</p>
                    <p className="text-xs text-gray-800">Used as your comp floor in EOS financial scoring</p>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 text-sm font-bold">$</span>
                      <Input
                        type="number" min={0} step={10000}
                        value={profile.comp_floor ?? ""}
                        onChange={e => set("comp_floor", e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="e.g. 300000"
                        className="pl-7 bg-white border-gray-300 text-gray-900 placeholder:text-gray-700 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-300 bg-gray-100 px-4 py-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-900">Risk Tolerance</p>
                    <p className="text-xs text-gray-800">Affects EOS™ scoring for early-stage / high-equity opportunities</p>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {(['low', 'medium', 'high'] as const).map(level => (
                        <button key={level} type="button"
                          onClick={() => set("risk_tolerance", level)}
                          className={`rounded-xl border py-2.5 text-sm font-bold capitalize transition-all ${
                            profile.risk_tolerance === level
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 text-gray-800 hover:border-gray-400"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-300 bg-gray-100 px-4 py-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-900">Education (optional)</p>
                    <p className="text-xs text-gray-800">e.g. MBA, Harvard Business School · BS Computer Science, MIT</p>
                    <Input
                      value={profile.education ?? ""}
                      onChange={e => set("education", e.target.value)}
                      placeholder="MBA, Wharton · BA Economics, Stanford"
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-700 mt-1"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={() => step > 0 ? setStep(s => s - 1) : navigate(basePath)}
              className="border-gray-300 text-gray-800 hover:bg-gray-100">
              <ChevronLeft className="h-4 w-4 mr-1" />
              {step === 0 ? "Cancel" : "Back"}
            </Button>

            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
                className="bg-blue-600 hover:bg-blue-700 text-white">
                Continue
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white">
                {saving ? "Saving..." : "Create Profile"}
                <Crown className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
