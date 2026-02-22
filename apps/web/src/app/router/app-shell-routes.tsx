import React from "react";
import { Route } from "react-router-dom";
import { AppShell } from "../AppShell";
import { WorkspaceOnboardingPage } from "../../modules/workspaces";
import { RequireAuth } from "./require-auth";
import { appSettingsRoutes } from "./app-settings-routes";
import { CopilotPage } from "../../routes/copilot";

export const appShellRoutes = (
  <Route element={<RequireAuth />}>
    <Route element={<AppShell />}>
      <Route path="/onboarding" element={<WorkspaceOnboardingPage />} />
      <Route path="/copilot" element={<CopilotPage />} />
      {appSettingsRoutes}
    </Route>
  </Route>
);
