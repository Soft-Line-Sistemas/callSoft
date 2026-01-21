"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { hasPermission } from "@/lib/permissions";

const ROUTE_PERMISSIONS: Array<{ prefix: string; required: string | string[] }> = [
  { prefix: "/dashboard", required: "dashboard:read" },
  { prefix: "/tickets", required: "tickets:read" },
  { prefix: "/kanban", required: "kanban:read" },
  { prefix: "/agenda", required: "kanban:read" },
  { prefix: "/reports", required: "metrics:read" },
  { prefix: "/settings/criar-usuario", required: "usuarios:read" },
  { prefix: "/settings", required: "roles:manage" },
];

function getRequiredPermissions(pathname: string | null): string | string[] | null {
  if (!pathname) return null;
  const match = ROUTE_PERMISSIONS.find((rule) => pathname.startsWith(rule.prefix));
  return match?.required ?? null;
}

export function PermissionBoundary({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const required = getRequiredPermissions(pathname);
  const redirectTarget = useMemo(() => {
    if (!user) return null;
    const allowed = ROUTE_PERMISSIONS.find((route) =>
      hasPermission(user.permissions, route.required),
    );
    return allowed?.prefix ?? null;
  }, [user]);

  if (!required) {
    return <>{children}</>;
  }

  const allowed = hasPermission(user?.permissions, required);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-deep px-6">
        <div className="max-w-md rounded-2xl border border-white/10 bg-slate-900/70 p-8 text-center text-slate-200 shadow-xl">
          <h2 className="text-lg font-semibold">Acesso restrito</h2>
          <p className="mt-2 text-sm text-slate-400">
            Você não tem permissão para acessar esta área. Fale com um administrador para liberar o acesso.
          </p>
          {redirectTarget ? (
            <Link
              href={redirectTarget}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
            >
              Ir para uma área permitida
            </Link>
          ) : (
            <p className="mt-4 text-xs text-slate-500">Nenhuma área disponível para o seu perfil.</p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
