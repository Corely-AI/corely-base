import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Label,
} from "@corely/ui";
import { ArrowLeft, Loader2, LogIn, Mail, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth-provider";

const RESEND_COOLDOWN_SECONDS = 60;

type EmailCodeAuthCardProps = {
  mode: "login" | "signup";
};

export function EmailCodeAuthCard({ mode }: EmailCodeAuthCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { requestEmailCode, verifyEmailCode, error: authError } = useAuth();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<{ tone: "info" | "success"; message: string } | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [tenantId, setTenantId] = useState<string | null | undefined>(undefined);
  const otpRef = useRef<HTMLInputElement>(null);

  const from = searchParams.get("from") || "/";
  const isLogin = mode === "login";

  useEffect(() => {
    if (!isLogin) {
      return;
    }

    const tenantParam = searchParams.get("tenant");
    if (!tenantParam) {
      setTenantId(undefined);
      return;
    }

    if (tenantParam === "null" || tenantParam === "host") {
      setTenantId(null);
      return;
    }

    setTenantId(tenantParam);
  }, [isLogin, searchParams]);

  useEffect(() => {
    if (step !== "code") {
      return;
    }
    otpRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (resendCountdown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendCountdown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCountdown]);

  const copy = useMemo(
    () =>
      isLogin
        ? {
            title: "Sign in with email",
            subtitle: "Enter your email and we’ll send a 6-digit sign-in code.",
            emailCta: "Send sign-in code",
            codeCta: "Sign in",
            switchPrompt: "Need an account?",
            switchHref: "/auth/signup",
            switchLabel: "Create one",
          }
        : {
            title: "Create your account",
            subtitle: "Enter your email and we’ll send a 6-digit code. No password needed.",
            emailCta: "Send signup code",
            codeCta: "Create account",
            switchPrompt: "Already have an account?",
            switchHref: "/auth/login",
            switchLabel: "Sign in",
          },
    [isLogin]
  );

  const displayError = error || authError || "";

  const handleRequestCode = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const emailNormalized = email.trim();

    setError("");
    setNotice(null);
    setIsRequesting(true);

    try {
      const result = await requestEmailCode({
        email: emailNormalized,
        mode,
        tenantId: isLogin ? tenantId : undefined,
      });
      setEmail(emailNormalized);
      setNotice({
        tone: result.status === "code_sent" ? "success" : "info",
        message: result.message,
      });
      if (result.status === "code_sent") {
        toast.success(result.message);
      } else {
        toast(result.message);
      }

      if (!result.canProceed) {
        setStep("email");
        setCode("");
        setResendCountdown(0);
        return;
      }

      setCode("");
      setStep("code");
      setResendCountdown(result.cooldownSeconds ?? RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not send code";
      setError(message);
      toast.error(message);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice(null);
    setIsVerifying(true);

    try {
      await verifyEmailCode({
        email,
        code,
        mode,
        tenantId: isLogin ? tenantId : undefined,
      });
      navigate(from);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not verify code";
      setError(message);
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || isRequesting) {
      return;
    }
    await handleRequestCode();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("common.appName")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("common.tagline")}</p>
        </div>

        <Card className="border shadow-lg">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              {step === "email" ? (
                isLogin ? (
                   <LogIn className="h-7 w-7" />
                ) : (
                  <UserPlus className="h-7 w-7" />
                )
              ) : (
                <Mail className="h-7 w-7" />
              )}
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">{copy.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {step === "email" ? copy.subtitle : notice?.message || `We sent a code to ${email}.`}
              </p>
            </div>
          </CardHeader>

          {step === "email" ? (
            <form onSubmit={handleRequestCode}>
              <CardContent className="space-y-4">
                {displayError ? (
                  <div className="rounded-md bg-destructive/10 p-3">
                    <p className="text-sm text-destructive text-center">{displayError}</p>
                  </div>
                ) : null}

                {notice ? (
                  <div
                    className={
                      notice.tone === "success"
                        ? "rounded-md bg-emerald-50 p-3"
                        : "rounded-md bg-muted p-3"
                    }
                  >
                    <p
                      className={
                        notice.tone === "success"
                          ? "text-sm text-emerald-700 text-center"
                          : "text-sm text-muted-foreground text-center"
                      }
                    >
                      {notice.message}
                    </p>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    autoFocus
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex-col gap-4">
                <Button
                  type="submit"
                  variant="accent"
                  className="w-full h-11"
                  disabled={isRequesting || !email.trim()}
                >
                  {isRequesting ? <Loader2 className="h-4 w-4 animate-spin" /> : copy.emailCta}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {copy.switchPrompt}{" "}
                  <Link
                    to={`${copy.switchHref}${from !== "/" ? `?from=${encodeURIComponent(from)}` : ""}`}
                    className="font-medium text-accent hover:underline underline-offset-4"
                  >
                    {copy.switchLabel}
                  </Link>
                </p>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <CardContent className="space-y-4">
                {displayError ? (
                  <div className="rounded-md bg-destructive/10 p-3">
                    <p className="text-sm text-destructive text-center">{displayError}</p>
                  </div>
                ) : null}

                {notice ? (
                  <div
                    className={
                      notice.tone === "success"
                        ? "rounded-md bg-emerald-50 p-3"
                        : "rounded-md bg-muted p-3"
                    }
                  >
                    <p
                      className={
                        notice.tone === "success"
                          ? "text-sm text-emerald-700 text-center"
                          : "text-sm text-muted-foreground text-center"
                      }
                    >
                      {notice.message}
                    </p>
                  </div>
                ) : null}

                <div className="space-y-3">
                  <Label htmlFor="email-code">6-digit code</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      ref={otpRef}
                      id="email-code"
                      autoFocus
                      maxLength={6}
                      value={code}
                      onChange={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
                      containerClassName="justify-center"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Codes expire after 10 minutes. If you don’t see it, check spam.
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setStep("email");
                      setCode("");
                      setError("");
                      setNotice(null);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Change email
                  </button>
                  <button
                    type="button"
                    className="font-medium text-accent disabled:text-muted-foreground"
                    disabled={resendCountdown > 0 || isRequesting}
                    onClick={handleResend}
                  >
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend code"}
                  </button>
                </div>
              </CardContent>

              <CardFooter className="flex-col gap-4">
                <Button
                  type="submit"
                  variant="accent"
                  className="w-full h-11"
                  disabled={isVerifying || code.length !== 6}
                >
                  {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : copy.codeCta}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {copy.switchPrompt}{" "}
                  <Link
                    to={`${copy.switchHref}${from !== "/" ? `?from=${encodeURIComponent(from)}` : ""}`}
                    className="font-medium text-accent hover:underline underline-offset-4"
                  >
                    {copy.switchLabel}
                  </Link>
                </p>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
