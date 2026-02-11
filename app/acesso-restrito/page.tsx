"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/lib/permissions";
import { useAuthStore } from "@/store/authStore";

const ROUTE_PERMISSIONS: Array<{ prefix: string; required: string | string[] }> = [
  { prefix: "/dashboard", required: "dashboard:read" },
  { prefix: "/tickets", required: "tickets:read" },
  { prefix: "/kanban", required: "kanban:read" },
  { prefix: "/agenda", required: "kanban:read" },
  { prefix: "/reports", required: "metrics:read" },
  { prefix: "/settings/criar-usuario", required: "usuarios:read" },
  { prefix: "/settings", required: "roles:manage" },
];

export default function AcessoRestritoPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) return;
    const allowed = ROUTE_PERMISSIONS.find((route) =>
      hasPermission(user.permissions, route.required),
    );
    if (allowed?.prefix) {
      router.replace(allowed.prefix);
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-deep px-6">
      <div className="max-w-md rounded-2xl border border-white/10 bg-slate-900/70 p-8 text-center text-slate-200 shadow-xl">
        <h2 className="text-lg font-semibold">Acesso restrito</h2>
        <p className="mt-2 text-sm text-slate-400">
          Sua conta não possui permissões para acessar o sistema. Fale com um administrador para liberar o acesso.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
        >
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
