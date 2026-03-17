import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ModeSelector } from "@/components/interview/ModeSelector";
import { TextInterview } from "@/components/interview/TextInterview";
import { VideoInterview } from "@/components/interview/VideoInterview";
import { useHealthCheck } from "@/hooks/use-health-check";
import { AIStatusBadge } from "@/components/interview/AIStatusBadge";
import { ThemeToggle } from "@/components/interview/ThemeToggle";
import { useTheme } from "@/hooks/use-theme";
import { Sparkles } from "lucide-react";

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
      {/* Show navigation bar only when selecting modes. Inner components have their own headers. */}
      {!selectedMode && (
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold">AI Practice Platform</h1>
          </div>
          <div className="flex items-center gap-3">
            <AIStatusBadge isHealthy={isHealthy} isChecking={isChecking} />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>
      )}

      {!selectedMode && <ModeSelector onSelect={setSelectedMode} />}

      {selectedMode === "text" && (
        <TextInterview onBack={() => setSelectedMode(null)} initialJobDescription={initialJD} />
      )}

      {selectedMode === "audio" && (
        <VideoInterview onBack={() => setSelectedMode(null)} initialJobDescription={initialJD} />
      )}
    </div>
  );
};

export default InterviewPanel;
