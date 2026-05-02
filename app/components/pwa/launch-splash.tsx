"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

function isStandaloneDisplayMode() {
  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

// The splash stays up until the app signals it's ready (covers JS bundle
// parse + first-screen API calls), with a hard cap so a stalled fetch can
// never trap the user behind it.
const APP_READY_EVENT = "larinova:app-ready";
const SPLASH_MIN_VISIBLE_MS = 600;
const SPLASH_MAX_VISIBLE_MS = 6000;
const SPLASH_FADE_MS = 360;

export function PwaLaunchSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const root = document.documentElement;

    if (
      !isStandaloneDisplayMode() ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      root.classList.remove("larinova-pwa-launch");
      setVisible(false);
      return;
    }

    root.classList.add("larinova-pwa-launch");

    const startedAt = performance.now();
    let dismissTimer: number | null = null;
    let fadeTimer: number | null = null;
    let maxTimer: number | null = null;

    const dismiss = () => {
      if (dismissTimer !== null) return;
      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, SPLASH_MIN_VISIBLE_MS - elapsed);
      dismissTimer = window.setTimeout(() => {
        root.classList.add("larinova-pwa-launch--exiting");
        fadeTimer = window.setTimeout(() => {
          root.classList.remove("larinova-pwa-launch");
          root.classList.remove("larinova-pwa-launch--exiting");
          setVisible(false);
        }, SPLASH_FADE_MS);
      }, remaining);
    };

    // Primary trigger: the app says it's ready (data loaded, first paint).
    const onAppReady = () => dismiss();
    window.addEventListener(APP_READY_EVENT, onAppReady);

    // Fallback 1: window load fires after the initial bundle, CSS, and
    // priority images are in. Give React one beat to start its mount before
    // dropping the splash.
    const onWindowLoad = () => window.setTimeout(dismiss, 200);
    if (document.readyState === "complete") {
      onWindowLoad();
    } else {
      window.addEventListener("load", onWindowLoad, { once: true });
    }

    // Fallback 2: hard cap, in case a fetch hangs.
    maxTimer = window.setTimeout(dismiss, SPLASH_MAX_VISIBLE_MS);

    return () => {
      window.removeEventListener(APP_READY_EVENT, onAppReady);
      window.removeEventListener("load", onWindowLoad);
      if (dismissTimer !== null) window.clearTimeout(dismissTimer);
      if (fadeTimer !== null) window.clearTimeout(fadeTimer);
      if (maxTimer !== null) window.clearTimeout(maxTimer);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div aria-hidden="true" className="pwa-launch-splash" role="presentation">
      <div className="pwa-launch-splash__mark">
        <span className="pwa-launch-splash__ring" />
        <Image
          alt=""
          className="pwa-launch-splash__icon"
          height={104}
          priority
          src="/shared/dark-mode-icon-only.png"
          width={104}
        />
      </div>
      <div className="pwa-launch-splash__wordmark">Larinova</div>
      <div className="pwa-launch-splash__bar">
        <span />
      </div>
    </div>
  );
}
