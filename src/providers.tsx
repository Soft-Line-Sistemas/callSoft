"use client";
import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthBoundary } from "@/components/layout/AuthBoundary";
import { ToastContainer } from "@/components/ui/ToastContainer";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBoundary>{children}</AuthBoundary>
      <ToastContainer />
    </QueryClientProvider>
  );
}
