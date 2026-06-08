import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { useState } from "react";

interface AtsOptimizerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AtsOptimizerDialog({ open, onOpenChange }: AtsOptimizerDialogProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const startOptimization = () => {
    setIsOptimizing(true);
    setProgress(0);
    setIsDone(false);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); setIsDone(true); return 100; }
        return prev + 10;
      });
    }, 300);
  };

  const reset = () => { setIsOptimizing(false); setProgress(0); setIsDone(false); };

  return (
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) setTimeout(reset, 300); }}>
      <DialogContent className="sm:max-w-[480px] p-0 bg-white border border-zinc-200 shadow-2xl shadow-black/10 rounded-2xl gap-0 overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-7 py-5 border-b border-zinc-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <DialogTitle className="text-base font-extrabold text-black tracking-tight">
              ATS Resume Optimizer
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 mt-0.5 font-medium">
              Analyse and optimize your resume for Applicant Tracking Systems.
            </DialogDescription>
          </div>
        </div>

        <div className="px-7 py-7">
          {!isOptimizing ? (
            /* Upload zone */
            <button
              type="button"
              onClick={startOptimization}
              className="w-full border-2 border-dashed border-zinc-200 hover:border-blue-400 rounded-xl p-10 flex flex-col items-center text-center transition-all group"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 mb-4 group-hover:bg-blue-100 transition-colors">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-sm font-bold text-black mb-1">Upload your resume</p>
              <p className="text-xs text-zinc-500 mb-4">PDF or DOCX · max 5 MB</p>
              <span className="h-9 px-5 rounded-lg bg-black text-white text-xs font-bold flex items-center group-hover:bg-zinc-800 transition-colors">
                Select File
              </span>
            </button>
          ) : !isDone ? (
            /* Analyzing */
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-200 shrink-0">
                  <FileText className="h-5 w-5 text-zinc-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-black">Analysing content…</p>
                  <p className="text-xs text-zinc-500">resume_v1.pdf</p>
                </div>
                <span className="text-sm font-bold text-zinc-700">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-zinc-100 [&>div]:bg-black [&>div]:transition-all" />
              <p className="text-xs text-zinc-400 text-center font-medium">
                Checking keyword density, formatting, and ATS compatibility…
              </p>
            </div>
          ) : (
            /* Results */
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center py-2">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-black mb-4">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-extrabold text-black tracking-tight">Optimization Complete</h3>
                <p className="text-zinc-500 text-sm mt-1">Your resume score increased by <span className="text-black font-bold">15%</span></p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black shrink-0 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">Keywords Matching</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Added 12 missing industry keywords</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 shrink-0 mt-0.5">
                    <AlertCircle className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">Formatting Issues</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Fixed 3 tabular data parsing errors</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full h-11 rounded-xl bg-black hover:bg-zinc-800 text-white text-sm font-bold transition-all"
              >
                View Detailed Report
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
