"use client";

import { useEffect, useState } from "react";
import { Share, Plus, X, Smartphone, CheckCircle2 } from "lucide-react";

type DeferredPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Platform = "ios" | "android" | "other";

const DISMISS_KEY = "larinova:install-prompt:dismissed-at";
const REPROMPT_AFTER_DAYS = 2;
const CONTINUE_BROWSER_KEY = "larinova:install-gate:continue-browser";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  return Boolean((window.navigator as { standalone?: boolean }).standalone);
}

function shouldShow(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return true;
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return true;
    const ageDays = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    return ageDays > REPROMPT_AFTER_DAYS;
  } catch {
    return true;
  }
}

export function InstallPrompt() {
  const [platform, setPlatform] = useState<Platform>("other");
  const [open, setOpen] = useState(false);
  const [mobileGate, setMobileGate] = useState(false);
  const [deferred, setDeferred] = useState<DeferredPrompt | null>(null);

  useEffect(() => {
    if (isStandalone()) return;

    const p = detectPlatform();
    const mobile = isMobileBrowser();
    setPlatform(p);
    setMobileGate(mobile);

    if (mobile) {
      try {
        if (sessionStorage.getItem(CONTINUE_BROWSER_KEY) === "true") return;
      } catch {}
      setOpen(true);
    } else if (!shouldShow()) {
      return;
    }

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as DeferredPrompt);
      setOpen(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    return () => window.removeEventListener("beforeinstallprompt", onBIP);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setOpen(false);
  };

  const triggerAndroidInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    if (choice.outcome === "accepted") dismiss();
  };

  if (!open) return null;

  const continueInBrowser = () => {
    try {
      sessionStorage.setItem(CONTINUE_BROWSER_KEY, "true");
    } catch {}
    setOpen(false);
  };

  if (mobileGate) {
    return (
      <div
        data-testid="mobile-install-gate"
        className="fixed inset-0 z-[100] flex min-h-dvh flex-col bg-background px-5 text-foreground"
      >
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(24px,env(safe-area-inset-top))]">
          <div className="mb-7 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-card shadow-2xl shadow-black/30">
            <Smartphone className="h-7 w-7 text-primary" />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Mobile app required
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-white">
            Install Larinova for the proper clinic experience.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-white/65">
            Larinova is built to be used full-screen from your Home Screen, not
            inside Safari or Chrome with browser controls taking up space.
          </p>

          {platform === "android" && deferred ? (
            <button
              onClick={triggerAndroidInstall}
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 active:bg-primary/90"
            >
              <CheckCircle2 className="h-5 w-5" />
              Install Larinova
            </button>
          ) : (
            <ol className="mt-8 space-y-3 text-base text-white/78">
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                  1
                </span>
                {platform === "android" ? (
                  <span>Open Chrome&apos;s menu</span>
                ) : (
                  <span className="flex min-w-0 items-center gap-2">
                    Tap
                    <Share className="h-5 w-5 text-sky-400" />
                    in Safari&apos;s toolbar
                  </span>
                )}
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                  2
                </span>
                {platform === "android" ? (
                  <span>
                    Choose{" "}
                    <span className="font-semibold text-white">
                      Install app
                    </span>{" "}
                    or{" "}
                    <span className="font-semibold text-white">
                      Add to Home screen
                    </span>
                  </span>
                ) : (
                  <span className="flex min-w-0 items-center gap-2">
                    Choose
                    <Plus className="h-5 w-5 text-white/90" />
                    <span className="font-semibold text-white">
                      Add to Home Screen
                    </span>
                  </span>
                )}
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                  3
                </span>
                <span>Open Larinova from the new Home Screen icon.</span>
              </li>
            </ol>
          )}

          <button
            type="button"
            onClick={continueInBrowser}
            className="mt-4 min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base font-semibold text-white/75 active:bg-white/[0.06]"
          >
            Continue in browser for now
          </button>
        </div>
      </div>
    );
  }

  if (platform === "other" && !deferred) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-50 px-4 sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="rounded-2xl border border-white/10 bg-[#15151b]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">
              Use Larinova as an app
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-white/60">
              {platform === "ios"
                ? "Add it to your Home Screen for full-screen clinic use without Safari chrome."
                : "Install once for a full-screen clinic workspace without browser bars."}
            </p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="rounded-md p-1 text-white/40 transition hover:bg-white/5 hover:text-white/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {platform === "ios" || (platform === "other" && !deferred) ? (
          <ol className="mt-3 space-y-2 text-xs text-white/70">
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-white">
                1
              </span>
              <span className="flex items-center gap-1">
                Tap
                <Share className="mx-0.5 inline h-3.5 w-3.5 text-sky-400" />
                in Safari&apos;s toolbar
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-white">
                2
              </span>
              <span className="flex items-center gap-1">
                Choose
                <Plus className="mx-0.5 inline h-3.5 w-3.5 text-white/80" />
                <span className="font-medium text-white">
                  Add to Home Screen
                </span>
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-white">
                3
              </span>
              <span>Tap the Larinova icon to launch.</span>
            </li>
          </ol>
        ) : (
          <button
            onClick={triggerAndroidInstall}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#0b0b0f] transition hover:bg-white/90"
          >
            <CheckCircle2 className="h-4 w-4" />
            Install app
          </button>
        )}
      </div>
    </div>
  );
}
