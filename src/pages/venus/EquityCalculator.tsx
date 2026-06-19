import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Loader2, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { venusService, EquityScenario } from "@/services/venusService";

const STAGES = ["Seed","Series A","Series B","Series C","Late Stage","Pre-IPO"];

const DEMO_SCENARIOS = (grant: number, val: number) => [
  { label: "2.5× Exit",  multiple: 2.5,  dilution: 40, gross: val * grant / 100 * 2.5 * 0.6, net_after_tax: val * grant / 100 * 2.5 * 0.6 * 0.7 },
  { label: "5× Exit",    multiple: 5,    dilution: 55, gross: val * grant / 100 * 5 * 0.45,   net_after_tax: val * grant / 100 * 5 * 0.45 * 0.7 },
  { label: "10× Exit",   multiple: 10,   dilution: 65, gross: val * grant / 100 * 10 * 0.35,  net_after_tax: val * grant / 100 * 10 * 0.35 * 0.7 },
  { label: "IPO @ 15×",  multiple: 15,   dilution: 70, gross: val * grant / 100 * 15 * 0.3,   net_after_tax: val * grant / 100 * 15 * 0.3 * 0.7 },
];

function FmtM(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function ScenarioTable({ scenario }: { scenario: EquityScenario }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <div className="p-5 border-b border-zinc-800">
        <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-0.5">{scenario.stage} · {scenario.vesting_years}yr vest / {scenario.cliff_months}mo cliff</p>
        <h3 className="text-xl font-black text-white">{scenario.company_name}</h3>
        <div className="flex gap-4 mt-2 text-sm">
          <span className="text-zinc-400">Grant: <span className="text-white font-bold">{scenario.grant_percent}%</span></span>
          <span className="text-zinc-400">Current val: <span className="text-white font-bold">{FmtM(scenario.current_valuation)}</span></span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {["Exit Scenario","Multiple","Dilution","Gross Proceeds","Net (After Tax ~30%)"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenario.scenarios.map((row, i) => (
              <tr key={i} className={`border-b border-zinc-800/50 ${i === scenario.scenarios.length - 1 ? "bg-violet-950/20" : ""}`}>
                <td className="px-4 py-3 font-semibold text-white">{row.label}</td>
                <td className="px-4 py-3 text-zinc-400">{row.multiple}×</td>
                <td className="px-4 py-3 text-zinc-400">{row.dilution}%</td>
                <td className="px-4 py-3 font-bold text-emerald-400">{FmtM(row.gross)}</td>
                <td className="px-4 py-3 font-black text-white">{FmtM(row.net_after_tax)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-zinc-800/30 text-xs text-zinc-500">
        * Dilution estimates typical for each exit stage. Tax rate 30% assumed. Secondary sale window typically Year 5–7.
      </div>
    </motion.div>
  );
}

export default function EquityCalculator() {
  const [form, setForm] = useState({
    company_name: "", stage: "Series B",
    grant_percent: 0.8, current_valuation: 80_000_000,
    vesting_years: 4, cliff_months: 12,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EquityScenario | null>(null);

  const set = (k: keyof typeof form, v: string | number) => setForm(p => ({ ...p, [k]: v }));

  const calculate = async () => {
    if (!form.company_name) { toast.error("Enter company name."); return; }
    setLoading(true);
    try {
      const data = await venusService.calculateEquity(form);
      setResult(data);
    } catch {
      toast.error("API not connected — showing demo calculation.");
      setResult({
        ...form,
        scenarios: DEMO_SCENARIOS(form.grant_percent, form.current_valuation),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Phase 2 · Intelligence</p>
        <h1 className="text-2xl font-black text-white mt-0.5">Equity Calculator</h1>
        <p className="text-sm text-zinc-500 mt-1">Model your equity payout across exit scenarios.</p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 block">Company Name</label>
            <Input value={form.company_name} onChange={e => set("company_name", e.target.value)}
              placeholder="e.g. Stripe, Acme Inc"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 rounded-xl" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 block">Current Stage</label>
            <select value={form.stage} onChange={e => set("stage", e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-300 outline-none focus:border-violet-500">
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 block">Equity Grant (%)</label>
            <Input type="number" step="0.01" min="0.01" max="20" value={form.grant_percent}
              onChange={e => set("grant_percent", parseFloat(e.target.value) || 0)}
              className="bg-zinc-800 border-zinc-700 text-white rounded-xl" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 block">Current Valuation ($)</label>
            <Input type="number" step="1000000" value={form.current_valuation}
              onChange={e => set("current_valuation", parseInt(e.target.value) || 0)}
              className="bg-zinc-800 border-zinc-700 text-white rounded-xl" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 block">Vesting Period (years)</label>
            <Input type="number" min={1} max={6} value={form.vesting_years}
              onChange={e => set("vesting_years", parseInt(e.target.value) || 4)}
              className="bg-zinc-800 border-zinc-700 text-white rounded-xl" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 block">Cliff (months)</label>
            <Input type="number" min={0} max={24} value={form.cliff_months}
              onChange={e => set("cliff_months", parseInt(e.target.value) || 12)}
              className="bg-zinc-800 border-zinc-700 text-white rounded-xl" />
          </div>
        </div>

        {/* Summary line */}
        <div className="rounded-xl bg-zinc-800/50 border border-zinc-700 px-4 py-3 flex justify-between items-center text-sm">
          <span className="text-zinc-400">Grant value at current val:</span>
          <span className="font-black text-white">{FmtM(form.current_valuation * form.grant_percent / 100)}</span>
        </div>

        <Button onClick={calculate} disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white h-11">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Calculating...</> : <><Calculator className="h-4 w-4 mr-2" />Model Exit Scenarios</>}
        </Button>
      </div>

      {result && <ScenarioTable scenario={result} />}

      {!result && !loading && (
        <div className="rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
          <TrendingUp className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 font-semibold">Enter your equity grant details above</p>
          <p className="text-xs text-zinc-600 mt-1">Models 2.5× through 15× exit scenarios with typical dilution</p>
        </div>
      )}
    </div>
  );
}
