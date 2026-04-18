
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";

interface AtsOptimizerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AtsOptimizerDialog({
    open,
    onOpenChange,
}: AtsOptimizerDialogProps) {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isDone, setIsDone] = useState(false);

    const startOptimization = () => {
        setIsOptimizing(true);
        setProgress(0);
        setIsDone(false);

        // Simulate progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsDone(true);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    };

    const reset = () => {
        setIsOptimizing(false);
        setProgress(0);
        setIsDone(false);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            onOpenChange(val);
            if (!val) setTimeout(reset, 300);
        }}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>ATS Resume Optimizer</DialogTitle>
                    <DialogDescription>
                        Analyze and optimize your resume for Applicant Tracking Systems.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    {!isOptimizing ? (
                        <div
                            className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-secondary/50 transition-colors cursor-pointer"
                            onClick={startOptimization}
                        >
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <Upload className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold mb-1">Upload Resume</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                PDF or DOCX up to 5MB
                            </p>
                            <Button onClick={(e) => { e.stopPropagation(); startOptimization(); }}>
                                Select File
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {!isDone ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-orange-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">Analyzing content...</p>
                                            <p className="text-xs text-muted-foreground">resume_v1.pdf</p>
                                        </div>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="text-center mb-6">
                                        <div className="inline-flex h-16 w-16 rounded-full bg-success/10 items-center justify-center mb-4">
                                            <CheckCircle2 className="h-8 w-8 text-success" />
                                        </div>
                                        <h3 className="text-xl font-bold">Optimization Complete!</h3>
                                        <p className="text-muted-foreground">Your resume score increased by 15%</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
                                            <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium">Keywords Matching</p>
                                                <p className="text-xs text-muted-foreground">Added 12 missing industry keywords</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50/50 border border-orange-200/20">
                                            <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium">Formatting Issues</p>
                                                <p className="text-xs text-muted-foreground">Fixed 3 tabular data parsing errors</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button className="w-full" onClick={() => onOpenChange(false)}>
                                        View Detailed Report
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
