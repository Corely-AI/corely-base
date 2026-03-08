import React from "react";
import { EmailCodeAuthCard } from "./components/email-code-auth-card";

/**
 * Login Page
 */
export const LoginPage: React.FC = () => {
  return <EmailCodeAuthCard mode="login" />;
};

export default LoginPage;
