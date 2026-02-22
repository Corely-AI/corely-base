import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "../../shared/components/NotFound";
import { LoginPage } from "../../routes/auth/login";
import SignupPage from "../../routes/auth/signup";
import ForgotPasswordPage from "../../routes/auth/forgot-password";
import ResetPasswordPage from "../../routes/auth/reset-password";
import { PublicWorkspaceProvider } from "../../shared/public-workspace";
import { isCustomDomain } from "../../lib/domain-helper";
import { appShellRoutes } from "./app-shell-routes";

export const Router = () => (
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/signup" element={<SignupPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

      <Route element={<PublicWorkspaceProvider />}>
        {/* Placeholder for public routes */}
      </Route>

      {appShellRoutes}

      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
