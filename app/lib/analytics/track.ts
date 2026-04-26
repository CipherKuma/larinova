"use client";

type EventType = "pageview" | "click" | "milestone";

type ClientEvent = {
  event_type: EventType;
  path?: string;
  raw_path?: string;
  element?: string;
  properties?: Record<string, unknown>;
};

const STORAGE_KEYS = {
  ANON: "lari_anonymous_id",
  SESSION: "lari_session_id",
};

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getOrCreateAnonId(): string {
  if (typeof window === "undefined") return "ssr";
  let v = localStorage.getItem(STORAGE_KEYS.ANON);
  if (!v) {
    v = uuid();
    try {
      localStorage.setItem(STORAGE_KEYS.ANON, v);
    } catch {}
  }
  return v;
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let v = sessionStorage.getItem(STORAGE_KEYS.SESSION);
  if (!v) {
    v = uuid();
    try {
      sessionStorage.setItem(STORAGE_KEYS.SESSION, v);
    } catch {}
  }
  return v;
}

function normalizePath(rawPath: string): string {
  return rawPath
    .replace(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?=\/|$)/g,
      "/[id]",
    )
    .replace(/\/\d+(?=\/|$)/g, "/[n]")
    .split("?")[0];
}

function elementLabel(el: HTMLElement): string | null {
  let node: HTMLElement | null = el;
  for (let depth = 0; node && depth < 5; depth++, node = node.parentElement) {
    const dataTrack = node.getAttribute("data-track");
    if (dataTrack) return `data-track:${dataTrack.slice(0, 60)}`;
    const role = node.getAttribute("role");
    const tag = node.tagName.toLowerCase();
    if (tag === "button" || role === "button") {
      return `button:${(node.textContent ?? "").trim().slice(0, 60)}`;
    }
    if (tag === "a") {
      const text = (node.textContent ?? "").trim();
      const href = node.getAttribute("href") ?? "";
      return `a:${text.slice(0, 40) || href.slice(0, 60)}`;
    }
  }
  return null;
}

class Tracker {
  private buffer: ClientEvent[] = [];
  private flushTimer: number | null = null;
  private initialized = false;

  init() {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;
    getOrCreateAnonId();
    getOrCreateSessionId();

    document.addEventListener(
      "click",
      (e) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        const label = elementLabel(target);
        if (!label) return;
        this.track({
          event_type: "click",
          element: label,
          path: normalizePath(window.location.pathname),
          raw_path: window.location.pathname + window.location.search,
        });
      },
      { capture: true },
    );

    window.addEventListener("pagehide", () => this.flush(true));
    window.addEventListener("beforeunload", () => this.flush(true));
  }

  trackPageview(path: string) {
    this.track({
      event_type: "pageview",
      path: normalizePath(path),
      raw_path: path,
    });
  }

  track(event: ClientEvent) {
    this.buffer.push(event);
    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.flushTimer != null) return;
    this.flushTimer = window.setTimeout(() => this.flush(false), 2000);
  }

  private async flush(useBeacon: boolean) {
    if (this.buffer.length === 0) {
      this.flushTimer = null;
      return;
    }
    const events = this.buffer.splice(0);
    this.flushTimer = null;
    const payload = JSON.stringify({
      session_id: getOrCreateSessionId(),
      anonymous_id: getOrCreateAnonId(),
      events,
    });
    const url = "/api/analytics/ingest";
    try {
      if (useBeacon && "sendBeacon" in navigator) {
        const ok = navigator.sendBeacon(
          url,
          new Blob([payload], { type: "application/json" }),
        );
        if (ok) return;
      }
      await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload,
        keepalive: useBeacon,
      });
    } catch {
      // swallow — analytics never break the app
    }
  }
}

export const tracker = new Tracker();
