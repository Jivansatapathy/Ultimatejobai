import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LockKeyhole, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LoginRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function LoginRequiredModal({
  open,
  onOpenChange,
  title = "Login to continue",
  description = "Sign in to view full job details, save jobs, and start applying with confidence.",
}: LoginRequiredModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 bg-white border border-zinc-200 shadow-2xl shadow-black/10 rounded-2xl gap-0 overflow-hidden">

        {/* Top black strip */}
        <div className="bg-black px-7 py-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 border border-white/15 mb-5">
            <LockKeyhole className="h-5 w-5 text-white" />
          </div>
          <DialogHeader className="space-y-1.5 text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-500/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-blue-400">
              Member Access
            </span>
            <DialogTitle className="text-xl font-extrabold text-white tracking-tight leading-snug">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-400 leading-relaxed">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Footer actions */}
        <DialogFooter className="flex flex-col gap-2.5 px-7 py-6 sm:flex-col sm:space-x-0">
          <button
            type="button"
            onClick={() => navigate("/auth")}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-black hover:bg-zinc-800 text-white text-sm font-bold transition-all"
          >
            Login / Sign Up
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full h-11 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-semibold transition-all"
          >
            Maybe later
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
