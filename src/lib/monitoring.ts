export type FrontendErrorPayload = {
  message: string;
  stack?: string;
  componentStack?: string;
  url?: string;
  userAgent?: string;
  timestamp?: string;
  errorId?: string;
  extra?: Record<string, unknown>;
};

export type FrontendEventPayload = {
  name: string;
  timestamp?: string;
  properties?: Record<string, unknown>;
};

export type WebVitalPayload = {
  id: string;
  name: string;
  value: number;
  startTime?: number;
  label?: string;
  rating?: string;
  navigationType?: string;
  timestamp?: string;
  attribution?: Record<string, unknown>;
};

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:64231";
}

function sanitizeUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const noFragment = url.split("#")[0] ?? url;
  const noQuery = noFragment.split("?")[0] ?? noFragment;
  return noQuery.slice(0, 500);
}

async function sendMonitoring(path: string, payload: unknown): Promise<void> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const url = `${baseUrl}${path}`;
  const body = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    try {
      const blob = new Blob([body], { type: "application/json" });
      const ok = navigator.sendBeacon(url, blob);
      if (ok) return;
    } catch {
      // fall back to fetch
    }
  }

  if (typeof fetch === "function") {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  }
}

export async function reportFrontendError(error: unknown, context?: Omit<FrontendErrorPayload, "message" | "stack">) {
  const errorObject = error instanceof Error ? error : new Error(typeof error === "string" ? error : "Unknown error");

  const payload: FrontendErrorPayload = {
    message: errorObject.message || "Unknown error",
    stack: errorObject.stack,
    componentStack: context?.componentStack,
    url: sanitizeUrl(context?.url || (typeof window !== "undefined" ? window.location.href : undefined)),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    timestamp: new Date().toISOString(),
    errorId: context?.errorId,
    extra: context?.extra,
  };

  if (process.env.NODE_ENV === "development") {
    console.error("Frontend error reported", payload);
  }

  await sendMonitoring("/api/v1/monitoring/frontend/errors", payload);
}

export async function reportFrontendEvent(name: string, properties?: Record<string, unknown>) {
  const payload: FrontendEventPayload = {
    name,
    timestamp: new Date().toISOString(),
    properties,
  };

  if (process.env.NODE_ENV === "development") {
    console.info("Frontend event reported", payload);
  }

  await sendMonitoring("/api/v1/monitoring/frontend/events", payload);
}

export async function reportWebVital(metric: WebVitalPayload) {
  const payload: WebVitalPayload = {
    ...metric,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development") {
    console.info("Web vital reported", payload);
  }

  await sendMonitoring("/api/v1/monitoring/frontend/web-vitals", payload);
}

