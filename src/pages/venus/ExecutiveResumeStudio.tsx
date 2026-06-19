import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2, Download, Plus, Trash2, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { venusService, ResumeVersion } from "@/services/venusService";

const MODES = [
  { key: "startup", label: "Startup / VC-backed", icon: "🚀", desc: "Growth metrics, scrappiness, equity mindset" },
  { key: "pe_portfolio", label: "PE Portfolio", icon: "💼", desc: "EBITDA, cost reduction, operational excellence" },
  { key: "board", label: "Board / Advisory", icon: "🏛️", desc: "Governance, risk, stakeholder relations" },
  { key: "fractional", label: "Fractional Executive", icon: "⚡", desc: "Multiple engagements, quick wins, ROI focus" },
] as const;

type Mode = typeof MODES[number]["key"];

function VersionCard({ version, onView, onDelete }: {
  version: ResumeVersion;
  onView: (v: ResumeVersion) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex items-start justify-between gap-3 hover:border-zinc-700 transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-bold text-white truncate">{version.version_label}</p>
          <span className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-violet-900/40 text-violet-300">
            {version.mode}
          </span>
        </div>
        <p className="text-xs text-zinc-500">{new Date(version.created_at).toLocaleDateString()} · {version.target_company || "General"}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Button size="sm" variant="outline" onClick={() => onView(version)}
          className="h-7 text-xs border-zinc-700 text-zinc-400 hover:bg-zinc-800">
          <Eye className="h-3 w-3 mr-1" /> View
        </Button>
        {version.id && (
          <Button size="sm" variant="outline" onClick={() => onDelete(version.id!)}
            className="h-7 text-xs border-red-900/50 text-red-400 hover:bg-red-950">
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function ResumePreview({ version, onClose }: { version: ResumeVersion; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-zinc-800 p-5 shrink-0">
          <div>
            <p className="text-sm font-black text-white">{version.version_label}</p>
            <p className="text-xs text-zinc-500">{version.mode} · {version.target_company || "General"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline"
              className="h-7 text-xs border-zinc-700 text-zinc-400 hover:bg-zinc-800"
              onClick={() => { const b = new Blob([version.content], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `${version.version_label}.txt`; a.click(); }}>
              <Download className="h-3 w-3 mr-1" /> Download
            </Button>
            <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white text-xl leading-none">&times;</button>
          </div>
        </div>
        <div className="overflow-y-auto p-6 flex-1">
          <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">{version.content}</pre>
        </div>
      </motion.div>
    </div>
  );
}

export default function ExecutiveResumeStudio() {
  const [selectedMode, setSelectedMode] = useState<Mode>("startup");
  const [targetCompany, setTargetCompany] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [generating, setGenerating] = useState(false);
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(true);
  const [previewing, setPreviewing] = useState<ResumeVersion | null>(null);

  useEffect(() => {
    venusService.getResumeVersions?.()
      .then(setVersions)
      .catch(() => setVersions([]))
      .finally(() => setLoadingVersions(false));
  }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      const version = await venusService.generateResume({ mode: selectedMode, target_company: targetCompany, target_role: targetRole });
      setVersions(v => [version, ...v]);
      toast.success("Resume generated.");
      setPreviewing(version);
    } catch {
      toast.error("API not connected — showing demo resume.");
      const demo: ResumeVersion = {
        id: `local-${Date.now()}`,
        mode: selectedMode,
        version_label: `${selectedMode.replace("_", " ")} Resume v${versions.length + 1}`,
        target_company: targetCompany || undefined,
        content: `[DEMO RESUME — ${selectedMode.toUpperCase()}]\n\nJane Smith\nCTO · San Francisco, CA\njane@example.com · linkedin.com/in/janesmith\n\n─────────────────────────────\nSUMMARY\n─────────────────────────────\nOperational CTO with 14 years scaling engineering orgs from 5 to 500+. Led two successful exits ($480M and $1.2B). Expert in ${selectedMode === "pe_portfolio" ? "EBITDA improvement, cost efficiency, and operational transformation" : selectedMode === "board" ? "board governance, risk management, and stakeholder relations" : selectedMode === "fractional" ? "rapid-cycle delivery, multi-engagement execution, and measurable ROI" : "hypergrowth engineering, product velocity, and equity value creation"}.\n\n─────────────────────────────\nEXPERIENCE\n─────────────────────────────\nCTO · Acme Inc (Series B → Acquired, $480M) · 2019–2024\n• Scaled engineering from 8 → 120 engineers across 3 continents\n• Architected core platform processing $2B+ ARR\n• Led technical due diligence for acquisition\n\nVP Engineering · CloudCo · 2015–2019\n• Built zero-to-one ML infrastructure team\n• Reduced infrastructure costs 40% via AWS optimization\n\n─────────────────────────────\nEDUCATION\n─────────────────────────────\nMS Computer Science · Stanford University\nBS Electrical Engineering · MIT\n\nGenerated by Venus AI Executive Career OS`,
        created_at: new Date().toISOString(),
      };
      setVersions(v => [demo, ...v]);
      setPreviewing(demo);
    } finally {
      setGenerating(false);
    }
  };

  const deleteVersion = (id: string) => {
    setVersions(v => v.filter(x => x.id !== id));
    toast.success("Version deleted.");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {previewing && <ResumePreview version={previewing} onClose={() => setPreviewing(null)} />}

      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Phase 3 · Resume & Brand</p>
        <h1 className="text-2xl font-black text-white mt-0.5">Executive Resume Studio</h1>
        <p className="text-sm text-zinc-500 mt-1">AI-tailored resumes for every type of executive opportunity.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Generator */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Select Mode</p>
            <div className="grid grid-cols-2 gap-2">
              {MODES.map(mode => (
                <button key={mode.key} type="button" onClick={() => setSelectedMode(mode.key)}
                  className={`rounded-xl border p-3 text-left transition-all ${selectedMode === mode.key ? "border-violet-500/60 bg-violet-950/40" : "border-zinc-800 bg-zinc-800/50 hover:border-zinc-700"}`}>
                  <span className="text-xl">{mode.icon}</span>
                  <p className="text-xs font-bold text-white mt-1">{mode.label}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{mode.desc}</p>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 block">Target Company (optional)</label>
                <Input value={targetCompany} onChange={e => setTargetCompany(e.target.value)}
                  placeholder="e.g. Stripe, Anthropic"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 rounded-xl" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 block">Target Role (optional)</label>
                <Input value={targetRole} onChange={e => setTargetRole(e.target.value)}
                  placeholder="e.g. CTO, COO, Board Director"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 rounded-xl" />
              </div>
            </div>

            <Button onClick={generate} disabled={generating}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white h-11">
              {generating
                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating with Groq AI...</>
                : <><Sparkles className="h-4 w-4 mr-2" />Generate Resume</>}
            </Button>
          </div>
        </div>

        {/* Version history */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-zinc-500" />
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Saved Versions</p>
          </div>
          {loadingVersions ? (
            <div className="flex items-center gap-2 text-zinc-500 py-6">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs">Loading versions...</span>
            </div>
          ) : versions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 py-10 text-center">
              <FileText className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-600">No versions yet</p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-2">
                {versions.map(v => (
                  <VersionCard key={v.id} version={v}
                    onView={setPreviewing}
                    onDelete={deleteVersion} />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
