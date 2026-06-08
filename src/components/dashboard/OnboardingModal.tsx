import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Target, Zap, Loader2, Bot } from "lucide-react";
import { careerService } from "@/services/careerService";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (role: string) => void;
}

const QUICK_ROLES = ["CEO", "CFO", "CTO", "COO", "VP Engineering", "VP Finance", "Director Operations", "CHRO"];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  open,
  onOpenChange,
  onComplete,
}) => {
  const [targetRole, setTargetRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) {
      toast.error("Please enter a target job role to continue.");
      return;
    }
    setIsSubmitting(true);
    try {
      const profile = await careerService.getProfile();
      await careerService.updateProfile({ ...profile, target_roles: [targetRole.trim()] });
      toast.success("Target role set. Personalizing your experience…");
      onComplete(targetRole);
      onOpenChange(false);
    } catch {
      toast.error("Failed to save your target role. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white border border-zinc-200 shadow-2xl shadow-black/10 rounded-2xl">
        {/* Header strip */}
        <div className="bg-black px-8 pt-8 pb-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 border border-white/15 mb-5">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-white tracking-tight leading-snug mb-1.5">
              What role are you targeting?
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm leading-relaxed">
              This helps Apex™ match you to the right executive opportunities and calibrate your AI scoring.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-8 py-7">
          {/* Quick-pick chips */}
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">
            Quick Select
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {QUICK_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTargetRole(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  targetRole === r
                    ? "bg-black border-black text-white"
                    : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-black"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 block">
                Or type your own
              </label>
              <input
                autoFocus
                placeholder="e.g. Chief Marketing Officer, VP of Product…"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full h-12 rounded-xl border border-zinc-200 bg-white px-4 text-sm text-black placeholder:text-zinc-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all font-medium"
              />
              <p className="text-[10px] text-zinc-400 mt-2 flex items-center gap-1.5 font-medium">
                <Zap className="h-3 w-3 text-zinc-400" />
                Calibrates your ATS score and job matching
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-11 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black text-sm font-bold transition-all border border-zinc-200"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !targetRole.trim()}
                className="flex-1 h-11 rounded-xl bg-black hover:bg-zinc-800 text-white text-sm font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Target className="h-4 w-4" />
                    Set Target
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="px-8 py-3 bg-zinc-50 border-t border-zinc-100">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] text-center">
            Executive Career Intelligence · Apex™ Platform
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
