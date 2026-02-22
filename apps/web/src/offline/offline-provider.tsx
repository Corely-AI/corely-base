import React, { createContext, useContext, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface OfflineContextValue {
  syncEngine: null;
}

const OfflineContext = createContext<OfflineContextValue>({ syncEngine: null });

interface OfflineProviderProps {
  queryClient: QueryClient;
  children: React.ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const value = useMemo<OfflineContextValue>(() => ({ syncEngine: null }), []);
  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
};

export const useOffline = (): OfflineContextValue => useContext(OfflineContext);

export const withOffline = (Component: React.ComponentType<any>): React.FC => {
  return function OfflineWrapper(props) {
    const queryClient = useMemo(
      () =>
        new QueryClient({
          defaultOptions: {
            queries: {
              retry: 2,
            },
          },
        }),
      []
    );
    return (
      <QueryClientProvider client={queryClient}>
        <OfflineProvider queryClient={queryClient}>
          <Component {...props} />
        </OfflineProvider>
      </QueryClientProvider>
    );
  };
};
