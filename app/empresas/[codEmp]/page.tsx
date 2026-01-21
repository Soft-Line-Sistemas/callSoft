"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { empresasApi, type EmpresaContactsResponse } from "@/services/empresas.service";
import { api } from "@/lib/api";
import { ArrowLeft, MessageCircle, UserRound } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";

type AuthMe = {
  id: string;
  email: string;
  tenantId?: string;
};

export default function EmpresaContactsPage({ params }: { params: { codEmp: string } }) {
  const router = useRouter();
  const { addNotification } = useNotificationStore();
  const codEmp = Number(params.codEmp);
  const [isStarting, setIsStarting] = useState<string | null>(null);

  const { data: authMe } = useQuery<AuthMe>({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await api.get("/api/v1/auth/me");
      return res.data.data;
    },
  });

  const { data, isLoading } = useQuery<EmpresaContactsResponse>({
    queryKey: ["empresas", codEmp, "contatos"],
    queryFn: () => empresasApi.listContacts(codEmp),
    enabled: Number.isFinite(codEmp),
  });

  const empresaNome = useMemo(() => {
    return data?.empresa?.nomeFantasia || data?.empresa?.razaoSocial || "Empresa";
  }, [data?.empresa]);

  const startChat = async (contatoWpp: string) => {
    if (!authMe?.tenantId) {
      addNotification({
        title: "Erro",
        message: "Tenant não encontrado para criar o atendimento.",
        type: "error",
        category: "system",
      });
      return;
    }
    setIsStarting(contatoWpp);
    try {
      const res = await api.post("/api/v1/tickets", {
        contatoWpp,
        solicitacao: "Atendimento iniciado pelo atendente",
        empresa: empresaNome,
        tenantId: authMe.tenantId,
      });
      const ticketId = res.data?.data?.id;

      if (ticketId) {
        await api.post(`/api/v1/tickets/${ticketId}/status`, { status: "PENDENTE_ATENDIMENTO" });
        await api.post(`/api/v1/tickets/${ticketId}/status`, { status: "EM_ATENDIMENTO" });
        router.push(`/tickets/${ticketId}`);
        return;
      }

      addNotification({
        title: "Erro",
        message: "Ticket criado sem ID retornado.",
        type: "error",
        category: "system",
      });
    } catch (error: any) {
      addNotification({
        title: "Erro",
        message: error?.response?.data?.message || "Falha ao iniciar atendimento.",
        type: "error",
        category: "system",
      });
    } finally {
      setIsStarting(null);
    }
  };

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Header />

      <main className="ml-64 pt-16 p-8">
        <div className="mb-6 animate-slide-up">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Empresas
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{empresaNome}</h1>
              <p className="mt-2 text-slate-400">
                Contatos com histórico de atendimento vinculados à empresa
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push(`/settings/criar-empresa?codEmp=${codEmp}`)}>
              Editar empresa
            </Button>
          </div>
        </div>

        <div className="glass rounded-lg overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-slate-300">Contato</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-300">Último status</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-300">Último atendimento</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-300">Histórico</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-300">Ação</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">Carregando contatos...</td>
                  </tr>
                ) : !data?.contatos?.length ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">Nenhum contato encontrado.</td>
                  </tr>
                ) : (
                  data.contatos.map((contato) => (
                    <tr key={contato.contatoWpp} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-200">
                          <UserRound className="h-4 w-4 text-slate-400" />
                          {contato.contatoWpp}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{contato.lastStatus.replace(/_/g, " ")}</Badge>
                      </td>
                      <td className="p-4 text-sm text-slate-300">
                        {new Date(contato.lastUpdatedAt).toLocaleString("pt-BR")}
                      </td>
                      <td className="p-4 text-sm text-slate-300">
                        {contato.ticketCount} ticket(s)
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startChat(contato.contatoWpp)}
                          disabled={isStarting === contato.contatoWpp}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {isStarting === contato.contatoWpp ? "Iniciando..." : "Iniciar chat"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
