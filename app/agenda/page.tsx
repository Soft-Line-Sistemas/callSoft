"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function AgendaRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const goToAgenda = async () => {
      try {
        const res = await api.get("/api/v1/auth/me");
        const userId = res.data?.data?.id;
        if (userId) {
          router.replace(`/agenda/${userId}`);
        }
      } catch (err) {
        console.error("Erro ao carregar usuario", err);
      }
    };
    void goToAgenda();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-deep">
      <div className="flex flex-col items-center gap-3 text-slate-300">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        <span className="text-sm">Carregando agenda...</span>
      </div>
    </div>
  );
}
