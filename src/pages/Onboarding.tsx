import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Target, 
  CheckCircle2, 
  ArrowRight, 
  Upload, 
  Loader2, 
  Sparkles 
} from "lucide-react";
import { useResume } from "@/hooks/useResume";
import { parseResumeFromFile } from "@/services/aiService";
import { activityService } from "@/services/activityService";
import { toast } from "sonner";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tempResume, setTempResume] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const { importResumeData, analyzeFileATS, updateTargetJobRole } = useResume();
  const navigate = useNavigate();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }

    setFile(uploadedFile);
    setLoading(true);

    try {
      const parsedData = await parseResumeFromFile(uploadedFile);
      const newResume = importResumeData(parsedData);
      setTempResume(newResume);
      toast.success("Resume parsed successfully!");
      setStep(2);
    } catch (error) {
      console.error("Parsing failed:", error);
      toast.error("Failed to parse resume. You can fill it manually later.");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!targetRole) {
      toast.error("Please set a target job role.");
      return;
    }

    setLoading(true);
    try {
      updateTargetJobRole(targetRole);
      
      if (file && tempResume) {
        toast.info("Analyzing your resume for the first time...");
        // Pass tempResume to ensure we analyze the right one even if state hasn't updated
        await analyzeFileATS(file, { ...tempResume, targetJobRole: targetRole });
      }
      
      toast.success("Onboarding complete! Welcome to CareerAI.");
      activityService.logActivity({
        activity_type: 'ONBOARDING',
        description: `Completed onboarding with target role: ${targetRole}`,
        metadata: { targetRole }
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Analysis failed:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-accent" : "bg-secondary"
              }`} 
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 bg-secondary/30 border-white/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 mb-6">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-3">Upload Your Resume</h1>
              <p className="text-muted-foreground mb-8">
                We'll parse your skills and experience to provide personalized career insights. 
                We don't store your document, only the insights.
              </p>

              <div className="relative group">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept=".pdf"
                />
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center group-hover:border-accent/40 transition-colors">
                  {loading ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-accent" />
                      <p className="text-sm font-medium">AI is reading your resume...</p>
                    </div>
                  ) : (
                    <>
                      <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 text-accent">
                        <Upload className="h-6 w-6" />
                      </div>
                      <p className="font-medium mb-1">Click or drag PDF here</p>
                      <p className="text-xs text-muted-foreground">PDF resumes work best</p>
                    </>
                  )}
                </div>
              </div>

              <Button 
                variant="ghost" 
                className="w-full mt-6"
                onClick={() => setStep(2)}
              >
                Skip for now
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 bg-secondary/30 border-white/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 mb-6">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <h1 className="text-3xl font-bold mb-3">What's your goal?</h1>
              <p className="text-muted-foreground mb-8">
                Tell us the role you're targeting so we can find the best job matches and skill gaps for you.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Target Job Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Frontend Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="mt-12 flex items-center justify-between gap-4">
                 <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  disabled={loading}
                 >
                   Back
                 </Button>
                 <Button 
                  variant="hero" 
                  className="flex-1 gap-2"
                  onClick={handleCompleteOnboarding}
                  disabled={loading || !targetRole}
                 >
                   {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                   Finish & See Insights
                   <ArrowRight className="h-4 w-4" />
                 </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center mt-12 text-xs text-muted-foreground">
          Step {step} of 2. You can edit all this info later in your profile.
        </p>
      </div>
    </div>
  );
}
