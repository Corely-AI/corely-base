import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createBaseViteConfig } from "@corely/vite-config";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const port = Number(env.TODO_PORT || 8088);
  const apiTarget = env.VITE_API_BASE_URL || "http://localhost:3000";

  const baseConfig = createBaseViteConfig({
    port,
    plugins: [react()],
    aliases: {
      "@": path.resolve(__dirname, "./src"),
      "@corely/api-client": path.resolve(__dirname, "../../packages/api-client/src"),
      "@corely/auth-client": path.resolve(__dirname, "../../packages/auth-client/src"),
      "@corely/contracts": path.resolve(__dirname, "../../packages/contracts/src"),
      "@corely/ui": path.resolve(__dirname, "../../packages/ui/src"),
    },
    excludeFromOptimizeDeps: ["@corely/contracts"],
    watchWorkspacePackages: ["@corely/*"],
    apiProxy: {
      target: apiTarget,
    },
  });

  return {
    ...baseConfig,
    build: {
      ...baseConfig.build,
      chunkSizeWarningLimit: 1000,
    },
  };
});
