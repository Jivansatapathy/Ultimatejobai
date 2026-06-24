import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { CHUNK_RELOAD_KEY, isChunkLoadError } from "@/lib/chunkReload";

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);

    // Fallback for stale-chunk failures that reach the boundary without
    // tripping the `vite:preloadError` listener in main.tsx — recover with
    // one hard reload instead of stranding the user on this screen.
    if (isChunkLoadError(error) && !sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
      sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e] px-4">
          <div className="text-center max-w-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
              <AlertTriangle className="h-7 w-7 text-red-400" />
            </div>
            <h1 className="text-xl font-black text-white uppercase tracking-tight mb-2">
              Something Went Wrong
            </h1>
            <p className="text-slate-400 text-sm mb-6">
              An unexpected error occurred. Try refreshing the page.
            </p>
            <Button
              className="h-10 px-6 bg-teal-600 hover:bg-teal-500 text-white font-bold uppercase text-xs rounded-lg"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
