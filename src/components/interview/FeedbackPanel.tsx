import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, RotateCcw, Loader2, CheckCircle2, Video, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackPanelProps {
  feedback: string | null;
  isLoading: boolean;
  onGetFeedback: () => void;
  onExportTranscript: () => void;
  onRestart: () => void;
  /** Optional — pass these to enable the Render Video button (video interview only) */
  onRenderVideo?: () => void;
  videoUrl?: string | null;
  isRenderingVideo?: boolean;
}

export function FeedbackPanel({
  feedback,
  isLoading,
  onGetFeedback,
  onExportTranscript,
  onRestart,
  onRenderVideo,
  videoUrl,
  isRenderingVideo,
}: FeedbackPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (feedback) {
      setIsExpanded(true);
    }
  }, [feedback]);

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 space-y-4 p-4 border-t bg-muted/30">
      <div className="flex items-center justify-center gap-2 text-center">
        <Badge className="gap-1.5 px-3 py-1.5">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Interview Completed
        </Badge>
      </div>

      {!feedback && (
        <div className="flex justify-center">
          <button
            onClick={onGetFeedback}
            disabled={isLoading}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Feedback...
              </>
            ) : (
              "Get Your Feedback"
            )}
          </button>
        </div>
      )}

      <div
        className={cn(
          "grid transition-all duration-500 ease-in-out",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          {feedback && (
            <Card className="mt-2 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>📋</span> Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                    {feedback}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Render Video section — only available in video interview */}
      {onRenderVideo && (
        <div className="space-y-3">
          {videoUrl ? (
            <div className="space-y-2">
              <video src={videoUrl} controls className="w-full rounded-xl border border-border shadow" />
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" /> Open video in new tab
              </a>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={onRenderVideo}
                disabled={isRenderingVideo}
                className="px-5 py-2 rounded-lg bg-violet-600 text-white font-medium flex items-center gap-2 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isRenderingVideo ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Rendering Video (3–10 min)…
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4" />
                    Render Interview Video
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <button
          onClick={onExportTranscript}
          className="px-5 py-2 rounded-lg border border-border bg-background font-medium flex items-center gap-2 hover:bg-muted"
        >
          <Download className="h-4 w-4" />
          Export Transcript
        </button>
        <button
          onClick={onRestart}
          className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:bg-primary/90"
        >
          <RotateCcw className="h-4 w-4" />
          Start New Interview
        </button>
      </div>
    </div>
  );
}
