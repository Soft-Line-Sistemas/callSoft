"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth";
import { getAuthToken } from "@/lib/auth";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { data: user, isLoading } = useAuth();
  const router = useRouter();
  const token = getAuthToken();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router, token]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (!token || !user) {
    return null;
  }

  return <>{children}</>;
}
