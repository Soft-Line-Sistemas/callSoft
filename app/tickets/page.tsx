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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Filter, Search, Eye, KanbanSquare, Loader2 } from "lucide-react";
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
  const [creatingKanbanFor, setCreatingKanbanFor] = useState<string | null>(null);
  const [isKanbanModalOpen, setIsKanbanModalOpen] = useState(false);
  const [kanbanModalTicket, setKanbanModalTicket] = useState<Ticket | null>(null);
  const [kanbanOptions, setKanbanOptions] = useState<Array<{ id: string; titulo: string }>>([]);
  const [selectedKanbanId, setSelectedKanbanId] = useState<string>("");
  const isCreateNewSelected = selectedKanbanId === "__new__";
  const [kanbanLoading, setKanbanLoading] = useState(false);

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

  const handleCreateKanbanTask = async (ticket: Ticket) => {
    setKanbanModalTicket(ticket);
    setSelectedKanbanId("");
    setIsKanbanModalOpen(true);
    setKanbanLoading(true);
    try {
      const [existingRes, listRes] = await Promise.all([
        api.get("/api/v1/kanban", {
          params: { tipo: "SUPORTE", referenciaId: ticket.id },
        }),
        api.get("/api/v1/kanban", { params: { tipo: "SUPORTE" } }),
      ]);
      const existing = existingRes.data?.data?.[0];
      const options = (listRes.data?.data ?? []).map((k: any) => ({
        id: k.id,
        titulo: k.titulo,
      }));
      setKanbanOptions(options);
      if (existing?.id) {
        setSelectedKanbanId(existing.id);
      }
    } catch (error) {
      console.error("Erro ao carregar kanbans", error);
      addNotification({
        title: "Erro",
        message: "Falha ao carregar kanbans.",
        type: "error",
        category: "system",
      });
      setIsKanbanModalOpen(false);
    } finally {
      setKanbanLoading(false);
    }
  };

  const handleAttachToKanban = async () => {
    if (!kanbanModalTicket || !selectedKanbanId) return;
    setCreatingKanbanFor(kanbanModalTicket.id);
    try {
      const kanbanRes = await api.get(`/api/v1/kanban/${selectedKanbanId}`);
      const kanban = kanbanRes.data?.data;
      const colunas = (kanban?.colunas ?? []).slice().sort((a: any, b: any) => a.indice - b.indice);
      const colunaId = colunas[0]?.id;
      if (!colunaId) throw new Error("Kanban sem colunas");

      await api.post(`/api/v1/kanban/${selectedKanbanId}/task`, {
        colunaId,
        titulo: `Atendimento #${kanbanModalTicket.pedido}`,
        descricao: kanbanModalTicket.solicitacao ?? null,
        dataInicio: new Date().toISOString(),
      });

      addNotification({
        title: "Tarefa criada",
        message: "Tarefa adicionada ao Kanban selecionado.",
        type: "success",
        category: "system",
      });
      setIsKanbanModalOpen(false);
    } catch (error: any) {
      console.error("Erro ao adicionar tarefa no Kanban", error);
      addNotification({
        title: "Erro",
        message: error?.response?.data?.message || "Falha ao adicionar tarefa no Kanban.",
        type: "error",
        category: "system",
      });
    } finally {
      setCreatingKanbanFor(null);
    }
  };

  const handleCreateNewKanban = async () => {
    if (!kanbanModalTicket) return;
    setCreatingKanbanFor(kanbanModalTicket.id);
    try {
      const kanbanRes = await api.post("/api/v1/kanban", {
        titulo: `Suporte #${kanbanModalTicket.pedido}`,
        descricao: kanbanModalTicket.solicitacao ?? null,
        tipo: "SUPORTE",
        referenciaId: kanbanModalTicket.id,
      });
      const kanban = kanbanRes.data?.data;
      const colunas = (kanban?.colunas ?? []).slice().sort((a: any, b: any) => a.indice - b.indice);
      const colunaId = colunas[0]?.id;
      if (!kanban?.id || !colunaId) {
        throw new Error("Kanban sem colunas");
      }

      await api.post(`/api/v1/kanban/${kanban.id}/task`, {
        colunaId,
        titulo: `Atendimento #${kanbanModalTicket.pedido}`,
        descricao: kanbanModalTicket.solicitacao ?? null,
        dataInicio: new Date().toISOString(),
      });

      addNotification({
        title: "Kanban criado",
        message: "Kanban criado e tarefa adicionada.",
        type: "success",
        category: "system",
      });
      setIsKanbanModalOpen(false);
    } catch (error: any) {
      console.error("Erro ao criar Kanban", error);
      addNotification({
        title: "Erro",
        message: error?.response?.data?.message || "Falha ao criar Kanban.",
        type: "error",
        category: "system",
      });
    } finally {
      setCreatingKanbanFor(null);
    }
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
                              <Eye className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCreateKanbanTask(ticket)}
                              title="Criar tarefa no Kanban (Suporte)"
                              disabled={creatingKanbanFor === ticket.id}
                            >
                              {creatingKanbanFor === ticket.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <KanbanSquare className="h-5 w-5 text-indigo-300" />
                              )}
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

      <Dialog open={isKanbanModalOpen} onOpenChange={setIsKanbanModalOpen}>
        <DialogContent className="bg-slate-900 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar ao Kanban</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-300">
            Selecione um Kanban existente ou crie um novo com o nome do ticket.
          </p>

          <div className="mt-4 space-y-3">
            <label className="text-xs text-slate-400">Kanban existente</label>
            <select
              value={selectedKanbanId}
              onChange={(e) => setSelectedKanbanId(e.target.value)}
              className="w-full rounded-lg bg-slate-dark border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
            >
              <option value="">Selecione...</option>
              <option value="__new__">Criar novo Kanban (Suporte)</option>
              {kanbanOptions.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.titulo}
                </option>
              ))}
            </select>
            {kanbanLoading && <div className="text-xs text-slate-400">Carregando kanbans...</div>}
          </div>

          <div className="mt-6 flex flex-wrap gap-2 justify-between">
            {isCreateNewSelected && (
              <Button
                variant="destructive"
                onClick={handleCreateNewKanban}
                disabled={creatingKanbanFor === kanbanModalTicket?.id}
              >
                Criar novo
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsKanbanModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="outline"
                onClick={handleAttachToKanban}
                disabled={!selectedKanbanId || isCreateNewSelected || creatingKanbanFor === kanbanModalTicket?.id}
              >
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
