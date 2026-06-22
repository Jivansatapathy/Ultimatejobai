import { Suspense, lazy } from "react";
import { useLocation, useNavigate, useMatch } from "react-router-dom";
import { ModeSelector } from "@/components/interview/ModeSelector";
import { useHealthCheck } from "@/hooks/use-health-check";
import { AIStatusBadge } from "@/components/interview/AIStatusBadge";
import { Loader2, Sparkles } from "lucide-react";
import { NavbarV2 as Navbar } from "@/components/landing2/NavbarV2";

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
    <div className="flex items-center gap-3 text-gray-500">
      <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
      <span>Loading interview workspace...</span>
    </div>
  </div>
);

const InterviewPanel = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialState = location.state as {
    mode?: "text" | "audio";
    jobDescription?: string;
    interviewType?: string;
  } | null;

  const isText = useMatch("/interview/text");
  const isAudio = useMatch("/interview/audio");
  const selectedMode: "text" | "audio" | null = isText
    ? "text"
    : isAudio
    ? "audio"
    : null;

  const { isHealthy, isChecking } = useHealthCheck();
  const initialJD = initialState?.jobDescription || "";

  const handleSelect = (mode: "text" | "audio") => {
    navigate(`/interview/${mode}`, { state: location.state });
  };

  const handleBack = () => {
    navigate("/interview");
  };

  // When a mode is active, the interview component owns the full screen (its own header)
  if (selectedMode === "text") {
    return (
      <Suspense fallback={<InterviewModeLoader />}>
        <TextInterview onBack={handleBack} initialJobDescription={initialJD} />
      </Suspense>
    );
  }

  if (selectedMode === "audio") {
    return (
      <Suspense fallback={<InterviewModeLoader />}>
        <VideoInterview onBack={handleBack} initialJobDescription={initialJD} />
      </Suspense>
    );
  }

  // Mode-selection view — shows the site navbar
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-50 border border-teal-200">
              <Sparkles className="h-5 w-5 text-teal-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Interview Practice</h1>
              <p className="text-sm text-gray-500 mt-0.5">Choose your practice mode below</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AIStatusBadge isHealthy={isHealthy} isChecking={isChecking} />
          </div>
        </div>
        <ModeSelector onSelect={handleSelect} />
      </main>
    </div>
  );
};

export default InterviewPanel;
