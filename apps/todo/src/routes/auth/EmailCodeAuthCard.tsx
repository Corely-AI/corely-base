import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
  useToast,
} from "@corely/ui";
import { ArrowLeft, Loader2, LogIn, Mail, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth-provider";

const RESEND_COOLDOWN_SECONDS = 60;

type EmailCodeAuthCardProps = {
  mode: "login" | "signup";
};

export function EmailCodeAuthCard({ mode }: EmailCodeAuthCardProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
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

  const from = searchParams.get("from") || "/todos";
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
    if (step === "code") {
      otpRef.current?.focus();
    }
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
            subtitle: "Enter your email and get a 6-digit code.",
            emailCta: "Send sign-in code",
            codeCta: "Sign in",
            switchPrompt: "Need an account?",
            switchHref: `/auth/signup?from=${encodeURIComponent(from)}`,
            switchLabel: "Create one",
          }
        : {
            title: "Create your account",
            subtitle: "Use the same email-code flow as the main app, without passwords.",
            emailCta: "Send signup code",
            codeCta: "Create account",
            switchPrompt: "Already have an account?",
            switchHref: `/auth/login?from=${encodeURIComponent(from)}`,
            switchLabel: "Sign in",
          },
    [from, isLogin]
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

      toast({
        title: result.status === "code_sent" ? "Code sent" : "Heads up",
        description: result.message,
      });

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
      toast({ title: "Request failed", description: message, variant: "destructive" });
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
      toast({ title: "Verification failed", description: message, variant: "destructive" });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Corely Todo</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Lightweight frontend for shared task work
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This app reuses the same auth API as the main platform but keeps the UI focused on the
            todo module.
          </p>
        </div>

        <Card className="rounded-[2rem] border-border/70 bg-background/85 shadow-lg">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
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
                  <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                    {displayError}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isRequesting || !email.trim()}>
                  {isRequesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {copy.emailCta}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {copy.switchPrompt}{" "}
                  <Link to={copy.switchHref} className="font-medium text-primary hover:underline">
                    {copy.switchLabel}
                  </Link>
                </p>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <CardContent className="space-y-5">
                {displayError ? (
                  <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                    {displayError}
                  </div>
                ) : null}

                {notice ? (
                  <div className="rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
                    {notice.message}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="code">Verification code</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      id="code"
                      ref={otpRef}
                      maxLength={6}
                      value={code}
                      onChange={setCode}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <button
                    type="button"
                    className="font-medium text-primary disabled:text-muted-foreground"
                    disabled={resendCountdown > 0 || isRequesting}
                    onClick={() => void handleRequestCode()}
                  >
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend code"}
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setStep("email");
                      setCode("");
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Change email
                  </button>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isVerifying || code.length < 6}>
                  {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {copy.codeCta}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Codes expire quickly. Request a new one if the current code stops working.
                </p>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
