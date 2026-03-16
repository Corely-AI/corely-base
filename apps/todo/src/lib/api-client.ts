import { ApiClient } from "@corely/auth-client";
import { authClient } from "./auth-client";
import { WebStorageAdapter } from "./storage-adapter";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const apiClient = new ApiClient({
  apiUrl: API_URL,
  authClient,
  storage: new WebStorageAdapter(),
  onAuthError: () => {
    if (typeof window !== "undefined") {
      const currentPath = `${window.location.pathname}${window.location.search}`;
      window.location.href = `/auth/login?from=${encodeURIComponent(currentPath)}`;
    }
  },
});
