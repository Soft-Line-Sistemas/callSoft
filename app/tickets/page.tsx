"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api, type Ticket, type TicketListResponse, type TicketStatus } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Filter, Search, Eye, MessageCircle } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";
import { CreateTicketModal } from "@/components/modals/CreateTicketModal";

const STATUS_OPTIONS: Array<{ value: TicketStatus | ""; label: string }> = [
  { value: "", label: "Todos" },
  { value: "SOLICITADO", label: "Solicitado" },
  { value: "PENDENTE_ATENDIMENTO", label: "Pendente" },
  { value: "EM_ATENDIMENTO", label: "Em atendimento" },
  { value: "CONCLUIDO", label: "Concluído" },
  { value: "CANCELADO", label: "Cancelado" },
];

function statusBadgeVariant(status: TicketStatus) {
  switch (status) {
    case "CONCLUIDO":
      return "success" as const;
    case "CANCELADO":
      return "destructive" as const;
    case "SOLICITADO":
      return "warning" as const;
    default:
      return "info" as const;
  }
}

export default function TicketsPage() {
  const router = useRouter();
  const { addNotification } = useNotificationStore();

  const [status, setStatus] = useState<TicketStatus | "">("");
  const [text, setText] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const params = useMemo(() => {
    return {
      status: status || undefined,
      text: text || undefined,
      from: from || undefined,
      to: to || undefined,
      page: 1,
      pageSize: 20,
    };
  }, [status, text, from, to]);

  const { data, isLoading, refetch } = useQuery<TicketListResponse>({
    queryKey: ["tickets", params],
    queryFn: async () => {
      const res = await api.get("/api/v1/tickets", { params });
      return res.data;
    },
  });

  const tickets: Ticket[] = data?.data.items ?? [];

  const { data: authMe } = useQuery<{ tenantId?: string }>({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await api.get("/api/v1/auth/me");
      return res.data.data;
    },
  });

  const handleWhatsApp = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (!digits) return;
    window.open(`https://wa.me/${digits}`, "_blank");
  };

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Header />

      <main className="ml-64 pt-16">
        <div className="p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-slide-up">
            <div>
              <h1 className="text-3xl font-bold text-white">Tickets</h1>
              <p className="mt-2 text-slate-400">Gerencie solicitações recebidas via bot/portal.</p>
            </div>

            <div className="flex flex-row gap-3 items-center">
              <Button
                variant="outline"
                onClick={() => {
                  void refetch();
                }}
                >
                <Filter className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="gradient" onClick={() => setIsCreateOpen(true)}>
                Criar ticket manual
              </Button>
            </div>
          </div>

          <div className="glass rounded-xl p-5 space-y-4 animate-slide-up">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="md:col-span-2">
                <Input
                  type="search"
                  placeholder="Buscar por empresa, responsável ou texto..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-lg bg-slate-dark border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full" />
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full" />
              </div>
            </div>
          </div>

          <div className="glass rounded-lg overflow-hidden animate-slide-up">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-slate-300">Pedido</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-300">Empresa</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-300">Responsável</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-300">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-300">Prioridade</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-300">Solicitação</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-300">Criado</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-300">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        Carregando tickets...
                      </td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        Nenhum ticket encontrado.
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4 text-sm text-white font-medium">#{ticket.pedido}</td>
                        <td className="p-4 text-sm text-slate-300">{ticket.empresa ?? "--"}</td>
                        <td className="p-4 text-sm text-slate-300">{ticket.responsavel ?? "--"}</td>
                        <td className="p-4 text-sm">
                          <Badge variant={statusBadgeVariant(ticket.status)}>
                            {ticket.status.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-slate-300">{ticket.prioridade ?? "--"}</td>
                        <td className="p-4 text-sm text-slate-300 max-w-xs truncate" title={ticket.solicitacao || ""}>
                          {ticket.solicitacao ? ticket.solicitacao : "--"}
                        </td>
                        <td className="p-4 text-sm text-slate-400">
                          {new Date(ticket.createdAt).toLocaleString("pt-BR")}
                        </td>
                        <td className="p-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/tickets/${ticket.id}`)}
                              title="Detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (!ticket.contatoWpp) {
                                  addNotification({
                                    title: "Sem contato",
                                    message: "Ticket não possui WhatsApp informado.",
                                    type: "info",
                                    category: "system",
                                  });
                                  return;
                                }
                                handleWhatsApp(ticket.contatoWpp);
                              }}
                              title="WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4 text-green-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={async (payload) => {
          try {
            const res = await api.post("/api/v1/tickets", {
              ...payload,
              tenantId: authMe?.tenantId,
            });
            const ticketId = res.data?.data?.id;

            if (ticketId) {
              await api.post(`/api/v1/tickets/${ticketId}/status`, { status: "PENDENTE_ATENDIMENTO" });
              await api.post(`/api/v1/tickets/${ticketId}/status`, { status: "EM_ATENDIMENTO" });
              await api.post(`/api/v1/tickets/${ticketId}/messages`, {
                message: payload.solicitacao,
                isInternal: false,
              });
            }
            addNotification({
              title: "Ticket criado",
              message: "Ticket criado e colocado em atendimento.",
              type: "success",
              category: "system",
            });
            setIsCreateOpen(false);
            void refetch();
          } catch (error: any) {
            addNotification({
              title: "Erro",
              message: error?.response?.data?.message || "Falha ao criar ticket.",
              type: "error",
              category: "system",
            });
          }
        }}
      />
    </div>
  );
}
