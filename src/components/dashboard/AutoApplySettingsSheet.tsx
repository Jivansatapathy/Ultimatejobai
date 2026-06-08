import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";
import { Save, Bot, SlidersHorizontal } from "lucide-react";
import { activityTracker } from "@/services/activityTracker";

interface AutoApplySettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const inputCls =
  "w-full h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm text-black placeholder:text-zinc-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all";

export function AutoApplySettingsSheet({ open, onOpenChange }: AutoApplySettingsSheetProps) {
  const [loading, setLoading] = useState(false);
  const [remoteOnly, setRemoteOnly] = useState(true);
  const [quickApply, setQuickApply] = useState(true);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onOpenChange(false);
      activityTracker.trackAction("SETTINGS", "Updated auto-apply preferences", {
        source: "dashboard_settings",
      });
      toast.success("Settings saved", {
        description: "Your Apex™ auto-apply preferences have been updated.",
      });
    }, 1000);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-white border-l border-zinc-200 text-black p-0 flex flex-col gap-0 w-full sm:max-w-[420px]">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black shrink-0">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <SheetTitle className="text-base font-extrabold text-black tracking-tight leading-none">
              Apex™ Settings
            </SheetTitle>
            <SheetDescription className="text-xs text-zinc-500 mt-0.5 font-medium">
              Configure your automated application preferences.
            </SheetDescription>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          <div className="flex items-center gap-2 mb-1">
            <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Filters</p>
          </div>

          {/* Daily limit */}
          <div className="space-y-1.5">
            <label htmlFor="daily-limit" className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
              Daily Application Limit
            </label>
            <input
              id="daily-limit"
              type="number"
              defaultValue={50}
              className={inputCls}
            />
            <p className="text-[10px] text-zinc-400 font-medium">Max applications Apex™ will submit per day.</p>
          </div>

          {/* Keywords */}
          <div className="space-y-1.5">
            <label htmlFor="keywords" className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
              Target Keywords
            </label>
            <input
              id="keywords"
              placeholder="CEO, CFO, VP Finance, Director…"
              defaultValue="CEO, CFO, CTO, VP Engineering"
              className={inputCls}
            />
            <p className="text-[10px] text-zinc-400 font-medium">Comma-separated keywords to match in job titles.</p>
          </div>

          {/* Locations */}
          <div className="space-y-1.5">
            <label htmlFor="locations" className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
              Preferred Locations
            </label>
            <input
              id="locations"
              placeholder="Toronto, New York, Remote…"
              defaultValue="Toronto, Vancouver, New York, Remote"
              className={inputCls}
            />
            <p className="text-[10px] text-zinc-400 font-medium">Cities or regions to target. Use "Remote" for remote-only.</p>
          </div>

          <div className="h-px bg-zinc-100" />

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5">
              <div>
                <p className="text-sm font-semibold text-black">Remote Only</p>
                <p className="text-xs text-zinc-500 mt-0.5">Only apply to fully remote positions</p>
              </div>
              <Switch
                checked={remoteOnly}
                onCheckedChange={setRemoteOnly}
                aria-label="Remote only"
                className="data-[state=checked]:bg-black"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5">
              <div>
                <p className="text-sm font-semibold text-black">Quick Apply</p>
                <p className="text-xs text-zinc-500 mt-0.5">Skip jobs that require a cover letter</p>
              </div>
              <Switch
                checked={quickApply}
                onCheckedChange={setQuickApply}
                aria-label="Quick apply"
                className="data-[state=checked]:bg-black"
              />
            </div>
          </div>

          {/* Blue info callout */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3.5">
            <p className="text-xs font-bold text-blue-700 mb-1">Apex™ applies smartly</p>
            <p className="text-xs text-blue-600 leading-relaxed">
              Apex™ reads each job description before applying, filling fields with data from your executive profile. It skips roles that don't match your filters.
            </p>
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="px-6 py-5 border-t border-zinc-100">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-black hover:bg-zinc-800 text-white text-sm font-bold transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving…" : "Save Preferences"}
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
