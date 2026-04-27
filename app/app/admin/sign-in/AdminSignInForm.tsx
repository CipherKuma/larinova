"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

type Step = "email" | "password" | "verify-otp";

export function AdminSignInForm() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === "verify-otp" && otp.join("").length === 6 && !loading) {
      verifyOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, step]);

  // Step 1: email → check what auth method to use
  const handleEmailContinue = async () => {
    if (!email.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 403) {
        toast.error("Not an admin email");
        setLoading(false);
        return;
      }
      const { hasPassword } = await res.json();
      if (hasPassword) {
        setStep("password");
      } else {
        await sendOtp();
      }
    } catch {
      toast.error("Something went wrong, try again");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setOtp(Array(6).fill(""));
    setStep("verify-otp");
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handlePasswordSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      toast.error("Wrong password");
      setLoading(false);
      return;
    }
    await onAuthSuccess();
  };

  const verifyOtp = async () => {
    const token = otp.join("");
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) {
      toast.error("Invalid code");
      setOtp(Array(6).fill(""));
      otpRefs.current[0]?.focus();
      setLoading(false);
      return;
    }
    await onAuthSuccess();
  };

  const onAuthSuccess = async () => {
    // Defense in depth — server already gates /admin via isAdminEmail
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Sign-in failed");
      setLoading(false);
      return;
    }
    // Hard navigate so the proxy reruns and applies admin gating cleanly
    window.location.href = "/admin";
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5" />
          Admin
        </div>
        <h1 className="text-2xl font-bold text-foreground">Larinova admin</h1>
        <p className="text-sm text-muted-foreground">
          Sign in with your admin email.
        </p>
      </div>

      {step === "email" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailContinue()}
              placeholder="you@larinova.com"
              className="min-h-[48px]"
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleEmailContinue}
            disabled={loading || !email.includes("@")}
            className="w-full min-h-[48px]"
          >
            {loading ? "…" : "Continue"}
          </Button>
        </div>
      )}

      {step === "password" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="admin-pw">Password</Label>
            <Input
              id="admin-pw"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePasswordSignIn()}
              className="min-h-[48px]"
              disabled={loading}
            />
          </div>
          <Button
            onClick={handlePasswordSignIn}
            disabled={loading || password.length < 6}
            className="w-full min-h-[48px]"
          >
            {loading ? "…" : "Sign in"}
          </Button>
          <button
            type="button"
            onClick={() => sendOtp()}
            disabled={loading}
            className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
          >
            Email me a one-time code instead
          </button>
        </div>
      )}

      {step === "verify-otp" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            We emailed a 6-digit code to {email}.
          </p>
          <div className="flex justify-center gap-2">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  otpRefs.current[i] = el;
                }}
                value={d}
                onChange={(e) => {
                  if (!/^\d*$/.test(e.target.value)) return;
                  const next = [...otp];
                  next[i] = e.target.value.slice(-1);
                  setOtp(next);
                  if (e.target.value && i < 5) otpRefs.current[i + 1]?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !otp[i] && i > 0) {
                    otpRefs.current[i - 1]?.focus();
                  }
                }}
                inputMode="numeric"
                maxLength={1}
                className="h-12 w-10 text-center text-lg font-mono rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setOtp(Array(6).fill(""));
            }}
            className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
          >
            Use a different email
          </button>
        </div>
      )}
    </div>
  );
}
