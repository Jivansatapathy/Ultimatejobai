import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, Zap, Sparkles, Loader2 } from "lucide-react";
import { careerService } from "@/services/careerService";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (role: string) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onOpenChange, onComplete }) => {
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
      // Fetch current profile to merge
      const profile = await careerService.getProfile();
      await careerService.updateProfile({
        ...profile,
        target_roles: [targetRole.trim()]
      });
      
      toast.success("Strategic target set! Personalizing your experience...");
      onComplete(targetRole);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save your target role. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-[#050811] border-white/10 sm:rounded-[32px]">
        <div className="relative p-8 pt-10">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
            <Sparkles className="h-32 w-32 text-teal-500 animate-pulse" />
          </div>

          <DialogHeader className="relative z-10 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-6">
              <Target className="h-7 w-7" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tighter text-white leading-none mb-4">
              Strategic Orientation
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium text-base leading-relaxed">
              Welcome to the Command Center. To calibrate our AI matching algorithms, we need to know your primary career target.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                Target Profession / Role
              </label>
              <div className="relative group">
                <Input
                  autoFocus
                  placeholder="e.g. Senior Product Designer, Cloud Architect..."
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="h-14 rounded-2xl bg-white/[0.05] border-white/10 text-white placeholder:text-slate-600 focus:border-teal-500/50 focus:ring-teal-500/20 px-6 font-bold text-base transition-all"
                />
                <div className="absolute inset-0 rounded-2xl border border-teal-500/0 group-focus-within:border-teal-500/20 pointer-events-none transition-all" />
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2 mt-2">
                <Zap className="h-3 w-3 text-teal-500" />
                This calibrates your ATS scoring & job matches
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl bg-teal-500 hover:bg-teal-400 text-[#050811] font-black uppercase text-sm tracking-[0.2em] shadow-[0_20px_50px_rgba(20,184,166,0.2)] transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Initialize System"
              )}
            </Button>
          </form>
        </div>
        
        <div className="px-8 py-4 bg-white/[0.02] border-t border-white/5 flex justify-center">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
            Institutional Grade Career Intelligence
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
