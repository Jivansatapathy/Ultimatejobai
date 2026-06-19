import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, ChevronRight, ChevronLeft, Check, Building2, TrendingUp, Star, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { venusService, ExecutiveProfile } from "@/services/venusService";

const EXEC_ROLES = ["CEO","COO","CTO","CFO","CPO","CMO","CRO","CHRO","CISO","CIO","VP Engineering","VP Sales","VP Marketing","VP Product","VP Finance","VP Operations","Board Advisor","Fractional Executive"];
const INDUSTRIES = ["Technology","FinTech","HealthTech","SaaS","E-commerce","Manufacturing","Healthcare","Financial Services","Media","Education","Clean Energy","Real Estate","Consulting","Retail","Defense","Biotech"];
const STRENGTHS = ["P&L Ownership","Team Building","GTM Strategy","Product Vision","Technical Architecture","M&A","Fundraising","Operational Excellence","Brand Building","Data & Analytics","Customer Success","International Expansion"];

const STEPS = [
  { title: "Your Role", icon: Crown, desc: "What executive role best describes you?" },
  { title: "Industries", icon: Building2, desc: "Which industries have you led in?" },
  { title: "Experience", icon: TrendingUp, desc: "Your leadership background" },
  { title: "Strengths", icon: Star, desc: "Your functional superpowers" },
  { title: "Preferences", icon: Settings, desc: "What opportunities are you open to?" },
];

export default function ExecutiveProfileBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<ExecutiveProfile>>({
    role: "", industries: [], functional_strengths: [],
    leadership_years: 5, exit_history: [], board_seats: [],
    fractional_open: false, advisory_open: false, confidential_mode: false,
    comp_floor: undefined, risk_tolerance: 'medium' as const,
  });

  const set = (key: keyof ExecutiveProfile, val: unknown) =>
    setProfile(p => ({ ...p, [key]: val }));

  const toggleArr = (key: "industries" | "functional_strengths", val: string) => {
    const arr = (profile[key] as string[]) || [];
    set(key, arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await venusService.updateProfile(profile);
      toast.success("Executive profile saved!");
      navigate("/venus");
    } catch {
      toast.error("Failed to save profile — API not yet connected.");
      navigate("/venus");
    } finally {
      setSaving(false);
    }
  };

  const canNext = () => {
    if (step === 0) return !!profile.role;
    if (step === 1) return (profile.industries?.length ?? 0) > 0;
    if (step === 3) return (profile.functional_strengths?.length ?? 0) > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-800">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Venus AI</p>
            <p className="text-lg font-black text-white">Executive Profile Builder</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black transition-all ${
                i < step ? "bg-violet-600 text-white" : i === step ? "bg-violet-600 text-white ring-2 ring-violet-400/30" : "bg-zinc-800 text-zinc-500"
              }`}>
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full transition-all ${i < step ? "bg-violet-600" : "bg-zinc-800"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-1">Step {step + 1} of {STEPS.length}</p>
            <h2 className="text-2xl font-black text-white">{STEPS[step].title}</h2>
            <p className="text-sm text-zinc-400 mt-1">{STEPS[step].desc}</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EXEC_ROLES.map(role => (
                    <button key={role} type="button"
                      onClick={() => set("role", role)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-semibold text-left transition-all ${
                        profile.role === role
                          ? "border-violet-500 bg-violet-600/20 text-violet-300"
                          : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-violet-600/50"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Pick up to 4 industries</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {INDUSTRIES.map(ind => (
                      <button key={ind} type="button"
                        onClick={() => (profile.industries?.length ?? 0) < 4 || profile.industries?.includes(ind) ? toggleArr("industries", ind) : null}
                        className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${
                          profile.industries?.includes(ind)
                            ? "border-violet-500 bg-violet-600/20 text-violet-300"
                            : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-violet-600/50"
                        }`}
                      >{ind}</button>
                    ))}
                  </div>
                  {(profile.industries?.length ?? 0) >= 4 && (
                    <p className="text-xs text-zinc-500">Maximum 4 selected. Deselect one to change.</p>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Years in Leadership</label>
                    <Input type="number" min={1} max={40} value={profile.leadership_years}
                      onChange={e => set("leadership_years", Number(e.target.value))}
                      className="bg-zinc-800 border-zinc-700 text-white w-32"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Notable Exits / IPOs (optional)</label>
                    <div className="space-y-2">
                      {(profile.exit_history || []).map((ex, i) => (
                        <div key={i} className="flex gap-2">
                          <Input value={ex.company} placeholder="Company"
                            onChange={e => { const arr = [...(profile.exit_history||[])]; arr[i] = {...arr[i], company: e.target.value}; set("exit_history", arr); }}
                            className="bg-zinc-800 border-zinc-700 text-white flex-1" />
                          <Input value={ex.type} placeholder="Exit type"
                            onChange={e => { const arr = [...(profile.exit_history||[])]; arr[i] = {...arr[i], type: e.target.value}; set("exit_history", arr); }}
                            className="bg-zinc-800 border-zinc-700 text-white w-32" />
                        </div>
                      ))}
                      <Button variant="outline" size="sm"
                        onClick={() => set("exit_history", [...(profile.exit_history||[]), { company: "", type: "Acquisition", year: 2023 }])}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                        + Add Exit
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-2 gap-2">
                  {STRENGTHS.map(s => (
                    <button key={s} type="button" onClick={() => toggleArr("functional_strengths", s)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-semibold text-left transition-all flex items-center gap-2 ${
                        profile.functional_strengths?.includes(s)
                          ? "border-violet-500 bg-violet-600/20 text-violet-300"
                          : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-violet-600/50"
                      }`}
                    >
                      {profile.functional_strengths?.includes(s) && <Check className="h-3.5 w-3.5 shrink-0" />}
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  {[
                    { key: "fractional_open" as const, label: "Open to Fractional roles", desc: "Part-time executive engagement" },
                    { key: "advisory_open" as const, label: "Open to Advisory roles", desc: "Board advisor or strategic advisor" },
                    { key: "confidential_mode" as const, label: "Confidential Search Mode", desc: "Your identity stays hidden until you approve interest" },
                  ].map(({ key, label, desc }) => (
                    <button key={key} type="button" onClick={() => set(key, !profile[key])}
                      className={`w-full flex items-center justify-between rounded-xl border px-4 py-4 transition-all ${
                        profile[key]
                          ? "border-violet-500 bg-violet-600/10"
                          : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-semibold text-white">{label}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{desc}</p>
                      </div>
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                        profile[key] ? "border-violet-500 bg-violet-600" : "border-zinc-600"
                      }`}>
                        {profile[key] && <Check className="h-3.5 w-3.5 text-white" />}
                      </div>
                    </button>
                  ))}

                  {/* Minimum acceptable base salary */}
                  <div className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-4 space-y-2">
                    <p className="text-sm font-semibold text-white">Minimum Base Salary</p>
                    <p className="text-xs text-zinc-400">Opportunities below this floor are filtered out of your matches</p>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">$</span>
                      <Input
                        type="number"
                        min={0}
                        step={10000}
                        value={profile.comp_floor ?? ""}
                        onChange={e => set("comp_floor", e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="e.g. 300000"
                        className="pl-7 bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-500 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Risk tolerance */}
                  <div className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-4 space-y-2">
                    <p className="text-sm font-semibold text-white">Risk Tolerance</p>
                    <p className="text-xs text-zinc-400">Affects EOS™ scoring weight for early-stage / high-equity opportunities</p>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {(['low', 'medium', 'high'] as const).map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => set("risk_tolerance", level)}
                          className={`rounded-xl border py-2.5 text-sm font-bold capitalize transition-all ${
                            profile.risk_tolerance === level
                              ? "border-violet-500 bg-violet-600/20 text-violet-300"
                              : "border-zinc-600 text-zinc-400 hover:border-zinc-500 hover:text-white"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800">
            <Button variant="outline" onClick={() => step > 0 ? setStep(s => s - 1) : navigate("/venus")}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              <ChevronLeft className="h-4 w-4 mr-1" />
              {step === 0 ? "Cancel" : "Back"}
            </Button>

            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
                className="bg-violet-600 hover:bg-violet-700 text-white">
                Continue
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={saving}
                className="bg-violet-600 hover:bg-violet-700 text-white">
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
