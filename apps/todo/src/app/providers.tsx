import React, { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { computeBackoffDelayMs, defaultRetryPolicy } from "@corely/api-client";
import { SonnerToaster, Toaster, TooltipProvider } from "@corely/ui";
import { AuthProvider } from "@/lib/auth-provider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            retryDelay: (attempt) => computeBackoffDelayMs(attempt, defaultRetryPolicy),
          },
        },
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {children}
          <Toaster />
          <SonnerToaster richColors position="top-right" />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
