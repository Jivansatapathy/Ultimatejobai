import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Volume2 } from "lucide-react";

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
        <h2 className="text-4xl font-bold tracking-tight">Choose Interview Mode</h2>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          Practice your skills with a traditional text-based interface or an immersive AI voice interview.
        </p>
      </div>

      <div className="grid w-full max-w-4xl gap-8 md:grid-cols-2">
        <Card
          className="cursor-pointer transition-all hover:scale-105 hover:border-primary/50"
          onClick={() => onSelect("text")}
        >
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Text Interview</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              A classic chat-based interface. Practice formulating your answers at your own pace without the pressure of speaking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
              Select Mode -&gt;
            </div>
          </CardContent>
        </Card>

        <Card
          className={`relative overflow-hidden transition-all ${
            hasAudioInterview
              ? "cursor-pointer hover:scale-105 hover:border-primary/50"
              : "border-dashed opacity-80"
          }`}
          onClick={() => {
            if (hasAudioInterview) {
              onSelect("audio");
            }
          }}
        >
          <div className="absolute right-0 top-0 rounded-bl-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
            {hasAudioInterview ? "PREMIUM" : "LOCKED"}
          </div>
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Volume2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Audio Interview</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              An immersive experience powered by GROQ. Speak naturally and hear the AI recruiter talk back.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasAudioInterview ? (
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                Select Voice Mode -&gt;
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Audio interview practice is available on Accelerator and Executive plans.
                </p>
                <Button asChild variant="outline" className="mt-3 w-full">
                  <a href="/plans">Upgrade For Audio Mode</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
