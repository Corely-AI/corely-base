import React from "react";
import { EmailCodeAuthCard } from "./components/email-code-auth-card";

/**
 * Signup Page
 */
export const SignupPage: React.FC = () => {
  return <EmailCodeAuthCard mode="signup" />;
};

export default SignupPage;
