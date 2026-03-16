import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  authClient,
  type CurrentUserResponse,
  type RequestEmailCodeData,
  type RequestEmailCodeResponse,
  type VerifyEmailCodeData,
} from "./auth-client";
import { setStoredWorkspaceId } from "./storage-adapter";

interface AuthContextType {
  user: CurrentUserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  requestEmailCode: (data: RequestEmailCodeData) => Promise<RequestEmailCodeResponse>;
  verifyEmailCode: (data: VerifyEmailCodeData) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const syncWorkspaceFromUser = (user: CurrentUserResponse | null) => {
  const workspaceId = user?.activeWorkspaceId ?? user?.activeTenantId ?? null;
  setStoredWorkspaceId(workspaceId);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<CurrentUserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await authClient.loadStoredTokens();

        if (authClient.getAccessToken()) {
          const currentUser = await authClient.getCurrentUser();
          syncWorkspaceFromUser(currentUser);
          setUser(currentUser);
        }
      } catch (err) {
        await authClient.clearTokens();
        syncWorkspaceFromUser(null);
        setError(err instanceof Error ? err.message : "Auth initialization failed");
      } finally {
        setIsLoading(false);
      }
    };

    void initAuth();
  }, []);

  const requestEmailCode = async (
    data: RequestEmailCodeData
  ): Promise<RequestEmailCodeResponse> => {
    try {
      setError(null);
      return await authClient.requestEmailCode(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not request sign-in code";
      setError(message);
      throw err;
    }
  };

  const verifyEmailCode = async (data: VerifyEmailCodeData): Promise<void> => {
    try {
      setError(null);
      await authClient.verifyEmailCode(data);
      const currentUser = await authClient.getCurrentUser();
      syncWorkspaceFromUser(currentUser);
      setUser(currentUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not verify code";
      setError(message);
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      await authClient.signout();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign out failed";
      setError(message);
      throw err;
    } finally {
      syncWorkspaceFromUser(null);
      setUser(null);
      queryClient.clear();
    }
  };

  const refresh = async (): Promise<void> => {
    try {
      await authClient.refreshAccessToken();
      const currentUser = await authClient.getCurrentUser();
      syncWorkspaceFromUser(currentUser);
      setUser(currentUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    requestEmailCode,
    verifyEmailCode,
    logout,
    refresh,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
