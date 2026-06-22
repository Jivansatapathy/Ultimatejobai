import { Button } from "@/components/ui/button";
import { MessageSquare, Volume2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useSubscription } from "@/context/SubscriptionContext";

interface ModeSelectorProps {
  onSelect: (mode: "text" | "audio") => void;
}

export const ModeSelector = ({ onSelect }: ModeSelectorProps) => {
  const { hasFeature } = useSubscription();
  const hasAudioInterview = hasFeature("video_interview_access");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
      <div className="mb-12 space-y-4 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">Choose Interview Mode</h2>
        <p className="mx-auto max-w-2xl text-xl text-gray-500">
          Practice with a text-based chat interface or an immersive AI voice interview.
        </p>
      </div>

      <div className="grid w-full max-w-4xl gap-8 md:grid-cols-2">
        {/* Text Interview card */}
        <div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 hover:border-teal-400 hover:shadow-md"
          onClick={() => onSelect("text")}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
            <MessageSquare className="h-6 w-6 text-gray-700" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Text Interview</h3>
          <p className="text-base text-gray-500 mb-6">
            A classic chat-based interface. Practice formulating your answers at your own pace without the pressure of speaking.
          </p>
          <div className="flex items-center gap-2 text-sm font-medium text-teal-600">
            Select Mode <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        {/* Audio Interview card */}
        <div
          className={`relative overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl p-6 transition-all ${
            hasAudioInterview
              ? "cursor-pointer hover:scale-105 hover:border-teal-400 hover:shadow-md"
              : "border-dashed opacity-80"
          }`}
          onClick={() => { if (hasAudioInterview) onSelect("audio"); }}
        >
          <div className="absolute right-0 top-0 bg-teal-500 px-3 py-1 text-xs font-bold text-white rounded-bl-lg">
            {hasAudioInterview ? "PRO" : "LOCKED"}
          </div>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
            <Volume2 className="h-6 w-6 text-gray-700" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Audio Interview</h3>
          <p className="text-base text-gray-500 mb-6">
            An immersive experience powered by GROQ. Speak naturally and hear the AI recruiter talk back.
          </p>
          {hasAudioInterview ? (
            <div className="flex items-center gap-2 text-sm font-medium text-teal-600">
              Select Voice Mode <ArrowRight className="h-4 w-4" />
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-3">
                Audio interview practice is available on Accelerator and Executive plans.
              </p>
              <Button asChild className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                <Link to="/plans">Upgrade For Audio Mode</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
