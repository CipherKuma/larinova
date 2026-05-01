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

export function PwaLaunchSplash() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isStandaloneDisplayMode()) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 1450);

    return () => window.clearTimeout(timer);
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
          src="/shared/larinova-icon.png"
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
