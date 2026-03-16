import { AuthClient } from "@corely/auth-client";
import { WebStorageAdapter } from "./storage-adapter";

export type {
  CurrentUserResponse,
  EmailCodeMode,
  RequestEmailCodeData,
  RequestEmailCodeResponse,
  VerifyEmailCodeData,
} from "@corely/auth-client";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const storage = new WebStorageAdapter();

export const authClient = new AuthClient({
  apiUrl: API_URL,
  storage,
});
