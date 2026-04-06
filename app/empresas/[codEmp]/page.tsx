"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { empresasApi, type EmpresaContactsResponse } from "@/services/empresas.service";
import { ticketsApi } from "@/services/tickets.service";
import { api } from "@/lib/api";
import { ArrowLeft, FileSpreadsheet, FileText, MessageCircle, UserRound } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { downloadBlob } from "@/lib/download";

type AuthMe = {
  id: string;
  email: string;
  tenantId?: string;
};

type ContactTicket = {
  id: string;
  pedido: number;
  status: string;
  contatoWpp: string;
  solicitacao: string;
  responsavel?: string | null;
  empresa?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function EmpresaContactsPage({ params }: { params: { codEmp: string } }) {
  const router = useRouter();
  const { addNotification } = useNotificationStore();
  const codEmp = Number(params.codEmp);
  const [isStarting, setIsStarting] = useState<string | null>(null);
  const [ticketsModalContact, setTicketsModalContact] = useState<{ contatoWpp: string; contatoNome?: string | null } | null>(null);
  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<{ ticketId: string; format: "pdf" | "csv" } | null>(null);

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

  const { data: contactTickets = [], isLoading: isLoadingContactTickets } = useQuery<ContactTicket[]>({
    queryKey: ["contato-tickets", ticketsModalContact?.contatoWpp],
    enabled: isTicketsModalOpen && Boolean(ticketsModalContact?.contatoWpp),
    queryFn: async () => {
      const res = await api.get("/api/v1/tickets", {
        params: {
          contatoWpp: ticketsModalContact?.contatoWpp,
          page: 1,
          pageSize: 100,
        },
      });
      return res.data?.data?.items ?? [];
    },
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
        canalOrigem: "WHATSAPP",
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

  const openTicketsModal = (contatoWpp: string, contatoNome?: string | null) => {
    setTicketsModalContact({ contatoWpp, contatoNome });
    setIsTicketsModalOpen(true);
  };

  const exportConversation = async (ticketId: string, format: "pdf" | "csv") => {
    setIsExporting({ ticketId, format });
    try {
      const blob =
        format === "pdf"
          ? await ticketsApi.exportConversationPdf(ticketId)
          : await ticketsApi.exportConversationCsv(ticketId);
      downloadBlob(blob, `ticket-${ticketId}-conversa.${format}`);
    } catch (error: any) {
      addNotification({
        title: "Erro",
        message: error?.response?.data?.message || `Falha ao exportar conversa em ${format.toUpperCase()}.`,
        type: "error",
        category: "system",
      });
    } finally {
      setIsExporting(null);
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
                        <div className="flex items-start gap-2 text-slate-200">
                          <UserRound className="h-4 w-4 text-slate-400" />
                          <div className="flex flex-col leading-tight">
                            {contato.contatoNome ? (
                              <>
                                <span className="text-slate-100">{contato.contatoNome}</span>
                                <span className="text-xs text-slate-400">{contato.contatoWpp}</span>
                              </>
                            ) : (
                              <span>{contato.contatoWpp}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{contato.lastStatus.replace(/_/g, " ")}</Badge>
                      </td>
                      <td className="p-4 text-sm text-slate-300">
                        {new Date(contato.lastUpdatedAt).toLocaleString("pt-BR")}
                      </td>
                      <td className="p-4 text-sm text-slate-300">
                        <button
                          type="button"
                          onClick={() => openTicketsModal(contato.contatoWpp, contato.contatoNome)}
                          className="text-sky-300 underline underline-offset-4 hover:text-sky-200"
                        >
                          {contato.ticketCount} ticket(s)
                        </button>
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startChat(contato.contatoWpp)}
                          disabled={isStarting === contato.contatoWpp}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {isStarting === contato.contatoWpp ? "Iniciando..." : "Novo chat"}
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

      <Dialog
        open={isTicketsModalOpen}
        onOpenChange={(open) => {
          setIsTicketsModalOpen(open);
          if (!open) {
            setTicketsModalContact(null);
          }
        }}
      >
        <DialogContent className="w-[960px] max-w-[95vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Tickets de {ticketsModalContact?.contatoNome || ticketsModalContact?.contatoWpp || "contato"}
            </DialogTitle>
          </DialogHeader>

          {isLoadingContactTickets ? (
            <p className="text-slate-400">Carregando tickets...</p>
          ) : !contactTickets.length ? (
            <p className="text-slate-400">Nenhum ticket encontrado para este contato.</p>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
              {contactTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-lg border border-white/10 bg-white/5 p-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-slate-100 font-medium">Ticket #{ticket.pedido}</p>
                    <p className="text-xs text-slate-300">
                      Status: {ticket.status.replace(/_/g, " ")} | Responsável: {ticket.responsavel || "--"}
                    </p>
                    <p className="text-xs text-slate-400">
                      Criado em {new Date(ticket.createdAt).toLocaleString("pt-BR")}
                    </p>
                    <p className="text-sm text-slate-300 line-clamp-2">{ticket.solicitacao}</p>
                  </div>

                  <div className="flex flex-col gap-2 w-[180px] min-w-[180px] shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-center"
                      onClick={() => router.push(`/tickets/${ticket.id}`)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Ir para chat
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-center"
                      onClick={() => exportConversation(ticket.id, "pdf")}
                      disabled={isExporting?.ticketId === ticket.id && isExporting.format === "pdf"}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {isExporting?.ticketId === ticket.id && isExporting.format === "pdf" ? "Exportando..." : "PDF"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-center"
                      onClick={() => exportConversation(ticket.id, "csv")}
                      disabled={isExporting?.ticketId === ticket.id && isExporting.format === "csv"}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      {isExporting?.ticketId === ticket.id && isExporting.format === "csv" ? "Exportando..." : "CSV"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
