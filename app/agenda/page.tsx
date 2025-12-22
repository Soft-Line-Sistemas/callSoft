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

  return null;
}
