import type { TokenStorage } from "@corely/auth-client";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const WORKSPACE_ID_KEY = "corely-active-workspace";

export const setStoredWorkspaceId = (workspaceId: string | null) => {
  if (typeof window === "undefined") {
    return;
  }

  if (workspaceId) {
    window.localStorage.setItem(WORKSPACE_ID_KEY, workspaceId);
  } else {
    window.localStorage.removeItem(WORKSPACE_ID_KEY);
  }
};

export class WebStorageAdapter implements TokenStorage {
  async setAccessToken(token: string): Promise<void> {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  }

  async getAccessToken(): Promise<string | null> {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  async setRefreshToken(token: string): Promise<void> {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  }

  async getRefreshToken(): Promise<string | null> {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  async setActiveWorkspaceId(workspaceId: string | null): Promise<void> {
    setStoredWorkspaceId(workspaceId);
  }

  async getActiveWorkspaceId(): Promise<string | null> {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(WORKSPACE_ID_KEY);
  }

  async clear(): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(WORKSPACE_ID_KEY);
  }
}
