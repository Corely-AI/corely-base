import { Loader2 } from "lucide-react";

export const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="flex items-center gap-3 rounded-full border border-border bg-background/90 px-5 py-3 shadow-sm backdrop-blur">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">Loading workspace…</span>
    </div>
  </div>
);
