"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AuthGuard } from "./AuthGuard";
import { PermissionBoundary } from "./PermissionBoundary";

const PUBLIC_ROUTES = ["/login", "/password-reset", "/first-login"];

function isPublicRoute(pathname: string | null): boolean {
  if (!pathname) return true;
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function AuthBoundary({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (isPublicRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <PermissionBoundary>{children}</PermissionBoundary>
    </AuthGuard>
  );
}
