import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-provider";
import { LoadingScreen } from "./LoadingScreen";

export const RequireAuth: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth/login?from=${encodeURIComponent(from)}`} replace />;
  }

  return <Outlet />;
};
