import { Suspense, lazy, useState } from "react";
import { useLocation } from "react-router-dom";
import { ModeSelector } from "@/components/interview/ModeSelector";
import { useHealthCheck } from "@/hooks/use-health-check";
import { AIStatusBadge } from "@/components/interview/AIStatusBadge";
import { ThemeToggle } from "@/components/interview/ThemeToggle";
import { useTheme } from "@/hooks/use-theme";
import { Loader2, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

const TextInterview = lazy(() =>
  import("@/components/interview/TextInterview").then((module) => ({
    default: module.TextInterview,
  })),
);

const VideoInterview = lazy(() =>
  import("@/components/interview/VideoInterview").then((module) => ({
    default: module.VideoInterview,
  })),
);

const InterviewModeLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="flex items-center gap-3 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>Loading interview workspace...</span>
    </div>
  </div>
);

const InterviewPanel = () => {
  const location = useLocation();
  const initialState = location.state as { 
    mode?: "text" | "audio", 
    jobDescription?: string,
    interviewType?: string 
  } | null;

  const [selectedMode, setSelectedMode] = useState<"text" | "audio" | null>(initialState?.mode || null);
  const { isHealthy, isChecking } = useHealthCheck();
  const { theme, toggleTheme } = useTheme();
  
  const initialJD = initialState?.jobDescription || "";

  return (
    <div className="min-h-screen bg-background">
      {/* Standard site Navbar — always visible */}
      <Navbar />

      {/* Mode-selection view */}
      {!selectedMode && (
        <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
          {/* Sub-header with AI status */}
          <div className="container mx-auto max-w-5xl mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI Interview Practice</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Choose your practice mode below</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AIStatusBadge isHealthy={isHealthy} isChecking={isChecking} />
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
          </div>
          <ModeSelector onSelect={setSelectedMode} />
        </main>
      )}

      {/* Interview mode views — rendered below the navbar */}
      {selectedMode === "text" && (
        <div className="pt-16">
          <Suspense fallback={<InterviewModeLoader />}>
            <TextInterview onBack={() => setSelectedMode(null)} initialJobDescription={initialJD} />
          </Suspense>
        </div>
      )}

      {selectedMode === "audio" && (
        <div className="pt-16">
          <Suspense fallback={<InterviewModeLoader />}>
            <VideoInterview onBack={() => setSelectedMode(null)} initialJobDescription={initialJD} />
          </Suspense>
        </div>
      )}
    </div>
  );
};

export default InterviewPanel;
