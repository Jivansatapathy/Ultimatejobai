import { Progress } from "@/components/ui/progress";

interface InterviewProgressProps {
  current: number;
  max: number;
}

export function InterviewProgress({ current, max }: InterviewProgressProps) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className="flex items-center gap-3 w-full max-w-xs">
      <Progress value={percentage} className="h-2" />
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {current} / {max}
      </span>
    </div>
  );
}
