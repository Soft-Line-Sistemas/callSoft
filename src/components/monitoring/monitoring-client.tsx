"use client";

import { useEffect } from "react";
import { useReportWebVitals } from "next/web-vitals";
import { reportFrontendError, reportWebVital } from "../../lib/monitoring";

export function MonitoringClient() {
  useReportWebVitals((metric) => {
    void reportWebVital({
      id: metric.id,
      name: metric.name,
      value: metric.value,
      startTime: metric.startTime,
      label: metric.label,
    });
  });

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      void reportFrontendError(event.error || event.message, {
        extra: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      void reportFrontendError(event.reason, {
        extra: { type: "unhandledrejection" },
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}

