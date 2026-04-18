import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LockKeyhole, Sparkles } from "lucide-react";
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
      <DialogContent className="max-w-md rounded-[28px] border border-slate-200 bg-white p-0 shadow-[0_40px_120px_-50px_rgba(15,23,42,0.45)]">
        <div className="rounded-t-[28px] bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#f8fafc_100%)] px-6 py-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <DialogHeader className="mt-5 space-y-2 text-left">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              Member Access
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-950">{title}</DialogTitle>
            <DialogDescription className="text-base leading-7 text-slate-600">{description}</DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="gap-3 px-6 py-5 sm:justify-start sm:space-x-0">
          <Button
            className="rounded-full bg-blue-600 px-6 hover:bg-blue-700"
            onClick={() => navigate("/auth")}
          >
            Login / Sign Up
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-slate-200"
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
