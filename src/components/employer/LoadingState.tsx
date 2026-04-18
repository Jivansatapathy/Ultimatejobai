import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading employer workspace..." }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-border/60 bg-card/80 px-6 py-14 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-accent" />
      <p className="mt-4 text-sm font-medium text-foreground">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">Realtime employer data will appear here as soon as the backend responds.</p>
    </div>
  );
}
