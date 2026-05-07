"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api, type Ticket, type TicketListResponse, type TicketStatus } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Filter, Search, Eye, KanbanSquare, Loader2, MessageCircle, Mail, Pencil, Phone, Globe, LayoutGrid, Table } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";
import { CreateTicketModal } from "@/components/modals/CreateTicketModal";
import { EditTicketModal } from "@/components/modals/EditTicketModal";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { buildWhatsAppSendUrl } from "@/lib/whatsapp";

const STATUS_OPTIONS: Array<{ value: TicketStatus | ""; label: string }> = [
  { value: "", label: "Todos" },
  { value: "SOLICITADO", label: "Solicitado" },
  { value: "PENDENTE_ATENDIMENTO", label: "Pendente" },
  { value: "EM_ATENDIMENTO", label: "Em atendimento" },
  { value: "EM_PROCESSO_LOGISTICO", label: "Em logística" },
  { value: "CONCLUIDO", label: "Concluído" },
  { value: "CANCELADO", label: "Recusado" },
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

function prioridadeClass(prioridade?: string | null) {
  switch (prioridade) {
    case "URGENTE":
      return "text-red-400";
    case "ALTA":
      return "text-orange-300";
    case "NORMAL":
      return "text-yellow-300";
    case "BAIXA":
      return "text-emerald-300";
    default:
      return "text-slate-300";
  }
}

function origemMeta(origem?: string | null) {
  switch ((origem || "").toUpperCase()) {
    case "WHATSAPP":
      return { label: "WhatsApp", icon: MessageCircle, className: "text-green-400" };
    case "EMAIL":
      return { label: "Email", icon: Mail, className: "text-sky-400" };
    case "TELEFONE":
      return { label: "Telefone", icon: Phone, className: "text-amber-300" };
    case "WEB":
      return { label: "Web", icon: Globe, className: "text-violet-300" };
    default:
      return { label: "Origem não informada", icon: Globe, className: "text-slate-400" };
  }
}

export default function TicketsPage() {
  type TicketsViewMode = "table" | "cards";
  const TICKETS_VIEW_STORAGE_KEY = "tickets:view-mode";
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
  const [hasLinkedKanban, setHasLinkedKanban] = useState(false);
  const [didSelectKanban, setDidSelectKanban] = useState(false);
  const [editTicket, setEditTicket] = useState<Ticket | null>(null);
  const [viewMode, setViewMode] = useState<TicketsViewMode>("cards");

  // Debounce do campo de texto para evitar requisições excessivas
  const debouncedText = useDebouncedValue(text, 500);

  const params = useMemo(() => {
    return {
      status: status || undefined,
      text: debouncedText || undefined,
      from: from || undefined,
      to: to || undefined,
      page: 1,
      pageSize: 20,
    };
  }, [status, debouncedText, from, to]);

  const { data, isLoading, refetch } = useQuery<TicketListResponse>({
    queryKey: ["tickets", params],
    queryFn: async () => {
      const res = await api.get("/api/v1/tickets", { params });
      return res.data;
    },
  });

  const tickets: Ticket[] = data?.data.items ?? [];

  const { data: authMe } = useQuery<{ tenantId?: string; name?: string; email?: string }>({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await api.get("/api/v1/auth/me");
      return res.data.data;
    },
  });

  const handleWhatsApp = (ticket: Ticket) => {
    const whatsappUrl = buildWhatsAppSendUrl({
      phone: ticket.cliente?.whatsappNumber || ticket.contatoWpp,
      operatorName: authMe?.name || authMe?.email,
      clientName: ticket.cliente?.nome,
      ticketNumber: ticket.pedido,
      requestSummary: ticket.solicitacao,
      companyName: ticket.empresa,
    });

    if (!whatsappUrl) return;
    window.open(whatsappUrl, "_blank");
  };

  const handleCreateKanbanTask = async (ticket: Ticket) => {
    setKanbanModalTicket(ticket);
    setSelectedKanbanId("");
    setKanbanOptions([]);
    setHasLinkedKanban(false);
    setDidSelectKanban(false);
    setIsKanbanModalOpen(true);
    setKanbanLoading(true);
    try {
      const [existingRes, listRes] = await Promise.all([
        api.get("/api/v1/kanban", {
          params: { tipo: "SUPORTE", referenciaId: ticket.id },
        }),
        api.get("/api/v1/kanban", { params: { tipo: "SUPORTE" } }),
      ]);
      const existing = existingRes.data?.data?.items?.[0];
      const options = (listRes.data?.data?.items ?? []).map((k: any) => ({
        id: k.id,
        titulo: k.titulo,
      }));
      setKanbanOptions(options);
      setHasLinkedKanban(Boolean(existing?.id));
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
    if (!didSelectKanban) {
      addNotification({
        title: "Ação necessária",
        message: "Selecione um Kanban antes de adicionar a tarefa.",
        type: "warning",
        category: "system",
      });
      return;
    }
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
    if (!didSelectKanban) {
      addNotification({
        title: "Ação necessária",
        message: "Selecione a opção de criar um novo Kanban antes de continuar.",
        type: "warning",
        category: "system",
      });
      return;
    }
    setCreatingKanbanFor(kanbanModalTicket.id);
    try {
      const kanbanRes = await api.post("/api/v1/kanban", {
        titulo: kanbanModalTicket.solicitacao ?? "Solicitação do cliente",
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
      router.push(`/kanban/${kanban.id}`);
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

  useEffect(() => {
    try {
      const storedView = window.localStorage.getItem(TICKETS_VIEW_STORAGE_KEY);
      if (storedView === "table" || storedView === "cards") {
        setViewMode(storedView);
      }
    } catch (error) {
      console.error("Erro ao ler preferência de visualização de tickets", error);
    }
  }, []);

  const handleChangeViewMode = (mode: TicketsViewMode) => {
    setViewMode(mode);
    try {
      window.localStorage.setItem(TICKETS_VIEW_STORAGE_KEY, mode);
    } catch (error) {
      console.error("Erro ao salvar preferência de visualização de tickets", error);
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
              <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
                <Button
                  variant={viewMode === "table" ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => handleChangeViewMode("table")}
                  className="h-8"
                >
                  <Table className="h-4 w-4 mr-2" />
                  Tabela
                </Button>
                <Button
                  variant={viewMode === "cards" ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => handleChangeViewMode("cards")}
                  className="h-8"
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Cards
                </Button>
              </div>
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

          {viewMode === "table" ? (
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
                    <th className="text-left p-4 text-sm font-semibold text-slate-300">Cliente</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-300">Criado</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-300">Ações</th>
                  </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400">
                          Carregando tickets...
                        </td>
                      </tr>
                    ) : tickets.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400">
                          Nenhum ticket encontrado.
                        </td>
                      </tr>
                    ) : (
                      tickets.map((ticket) => {
                        const origem = origemMeta(ticket.origem);
                        const OrigemIcon = origem.icon;

                        return (
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
                          <td className="p-4 text-sm">
                            <span className={prioridadeClass(ticket.prioridade)}>
                              {ticket.prioridade ?? "--"}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-slate-300 max-w-xs truncate" title={ticket.solicitacao || ""}>
                            {ticket.solicitacao ? ticket.solicitacao : "--"}
                          </td>
                            <td className="p-4 text-sm text-slate-300">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="inline-flex items-center justify-center rounded-full bg-white/5 p-1"
                                    title={`Origem: ${origem.label}`}
                                    aria-label={`Origem: ${origem.label}`}
                                  >
                                    <OrigemIcon className={`h-3.5 w-3.5 ${origem.className}`} />
                                  </span>
                                  <span className="font-medium text-white truncate max-w-[150px]" title={ticket.cliente?.nome || ticket.contatoWpp}>
                                    {ticket.cliente?.nome || ticket.contatoWpp || "--"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-400 truncate max-w-[170px]">
                                    {ticket.cliente?.telefone || ticket.cliente?.whatsappNumber || ticket.contatoWpp || "--"}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditTicket(ticket);
                                      }}
                                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
                                      title="Editar"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    {(ticket.cliente?.whatsappNumber || ticket.contatoWpp) && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleWhatsApp(ticket);
                                        }}
                                        className="text-green-400 hover:text-green-300 p-1 rounded hover:bg-white/5 transition-colors"
                                        title="WhatsApp"
                                      >
                                        <MessageCircle className="h-4 w-4" />
                                      </button>
                                    )}
                                    {ticket.cliente?.email && (
                                      <a
                                        href={`mailto:${ticket.cliente.email}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-sky-400 hover:text-sky-300 p-1 rounded hover:bg-white/5 transition-colors"
                                        title={ticket.cliente.email}
                                      >
                                        <Mail className="h-4 w-4" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
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
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3 animate-slide-up">
              {isLoading ? (
                <div className="glass rounded-lg p-8 text-center text-slate-400 md:col-span-2 2xl:col-span-3">
                  Carregando tickets...
                </div>
              ) : tickets.length === 0 ? (
                <div className="glass rounded-lg p-8 text-center text-slate-400 md:col-span-2 2xl:col-span-3">
                  Nenhum ticket encontrado.
                </div>
              ) : (
                tickets.map((ticket) => {
                  const origem = origemMeta(ticket.origem);
                  const OrigemIcon = origem.icon;

                  return (
                    <div key={ticket.id} className="glass rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm text-slate-400">Pedido</p>
                          <p className="text-base font-semibold text-white">#{ticket.pedido}</p>
                        </div>
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
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge variant={statusBadgeVariant(ticket.status)}>{ticket.status.replace(/_/g, " ")}</Badge>
                        <span className={prioridadeClass(ticket.prioridade)}>{ticket.prioridade ?? "--"}</span>
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        <p className="text-slate-300">
                          <span className="text-slate-400">Empresa:</span> {ticket.empresa ?? "--"}
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">Responsável:</span> {ticket.responsavel ?? "--"}
                        </p>
                        <p className="text-slate-300 line-clamp-2" title={ticket.solicitacao || ""}>
                          <span className="text-slate-400">Solicitação:</span> {ticket.solicitacao || "--"}
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex items-center justify-center rounded-full bg-white/5 p-1"
                            title={`Origem: ${origem.label}`}
                            aria-label={`Origem: ${origem.label}`}
                          >
                            <OrigemIcon className={`h-3.5 w-3.5 ${origem.className}`} />
                          </span>
                          <span className="text-slate-300">{ticket.cliente?.nome || ticket.contatoWpp || "--"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 truncate">
                            {ticket.cliente?.telefone || ticket.cliente?.whatsappNumber || ticket.contatoWpp || "--"}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditTicket(ticket);
                            }}
                            className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {(ticket.cliente?.whatsappNumber || ticket.contatoWpp) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWhatsApp(ticket);
                              }}
                              className="text-green-400 hover:text-green-300 p-1 rounded hover:bg-white/5 transition-colors"
                              title="WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          )}
                          {ticket.cliente?.email && (
                            <a
                              href={`mailto:${ticket.cliente.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-sky-400 hover:text-sky-300 p-1 rounded hover:bg-white/5 transition-colors"
                              title={ticket.cliente.email}
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {new Date(ticket.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
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
              accessKey: payload.accessKey,
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

      {editTicket && (
        <EditTicketModal
          ticket={editTicket}
          isOpen={!!editTicket}
          onClose={() => setEditTicket(null)}
          onSave={async (data) => {
            try {
              await api.patch(`/api/v1/tickets/${editTicket.id}`, {
                ...data,
                tenantId: authMe?.tenantId,
              });
              addNotification({
                title: "Sucesso",
                message: "Ticket atualizado com sucesso.",
                type: "success",
                category: "system",
              });
              void refetch();
            } catch (error: any) {
              console.error("Erro ao atualizar ticket:", error);
              addNotification({
                title: "Erro",
                message: error?.response?.data?.message || "Falha ao atualizar ticket.",
                type: "error",
                category: "system",
              });
            }
          }}
        />
      )}

      <Dialog
        open={isKanbanModalOpen}
        onOpenChange={(open) => {
          setIsKanbanModalOpen(open);
          if (!open) {
            setKanbanModalTicket(null);
            setSelectedKanbanId("");
            setKanbanOptions([]);
            setHasLinkedKanban(false);
            setDidSelectKanban(false);
          }
        }}
      >
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
              onChange={(e) => {
                setSelectedKanbanId(e.target.value);
                setDidSelectKanban(true);
              }}
              className="w-full rounded-lg bg-slate-dark border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
            >
              <option value="">Selecione...</option>
              <option value="__new__">Criar novo Kanban (Solicitação)</option>
              {kanbanOptions.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.titulo}
                </option>
              ))}
            </select>
            {kanbanLoading && <div className="text-xs text-slate-400">Carregando kanbans...</div>}
            {!kanbanLoading && hasLinkedKanban && (
              <div className="text-xs text-amber-300">
                Já existe um Kanban vinculado a este ticket. Selecione-o para adicionar a tarefa.
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2 justify-between">
            {isCreateNewSelected && (
              <Button
                variant="destructive"
                onClick={handleCreateNewKanban}
                disabled={creatingKanbanFor === kanbanModalTicket?.id}
                type="button"
              >
                Criar novo
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsKanbanModalOpen(false)}
                type="button"
              >
                Cancelar
              </Button>
              <Button
                variant="outline"
                onClick={handleAttachToKanban}
                disabled={
                  kanbanLoading ||
                  !selectedKanbanId ||
                  isCreateNewSelected ||
                  creatingKanbanFor === kanbanModalTicket?.id
                }
                type="button"
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
