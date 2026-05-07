"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api, type TicketStatus } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Plus, Edit, FileText, FileSpreadsheet, Eye, Send } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";
import { EditTicketModal } from "@/components/modals/EditTicketModal";
import { TicketChat } from "@/components/features/TicketChat";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { downloadBlob } from "@/lib/download";
import { isEmailContact } from "@/lib/contact";
import { buildWhatsAppSendUrl } from "@/lib/whatsapp";

type TicketHistoryItem = {
  id: number;
  statusAnterior?: TicketStatus | null;
  statusNovo?: TicketStatus | null;
  historico: string;
  motivo?: string | null;
  observacao?: string | null;
  horaProposta?: string | null;
  autorTipo?: "BOT" | "PORTAL" | null;
  createdAt: string;
};

type TicketDetail = {
  id: string;
  pedido: number;
  contatoWpp: string;
  solicitacao: string;
  status: TicketStatus;
  horaProposta: string | null;
  empresa?: string | null;
  responsavel?: string | null;
  prioridade?: string | null;
  cliente?: {
    id: string;
    nome: string;
    whatsappNumber: string;
    email?: string | null;
    telefone?: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  historico: TicketHistoryItem[];
  cotacoes?: Array<{
    id: string;
    numero: number;
    fornecedor: { id: string; nome: string; pais: string };
    status: string;
    valorTotal: number | null;
    prazoEntregaDias?: number | null;
    dataPrevistaEntrega?: string | null;
    dataExpiracao?: string | null;
    observacoes?: string | null;
    itensCount?: number;
    createdAt: string;
  }>;
};

type CotacaoDetail = {
  id: string;
  numero: number;
  status: string;
  valorTotal: number | null;
  descontoGlobal: number | null;
  descontoTipo: string | null;
  prazoEntregaDias: number | null;
  dataPrevistaEntrega: string | null;
  dataExpiracao: string | null;
  observacoes: string | null;
  fornecedor: { id: string; nome: string; pais: string };
  itens: Array<{
    id: string;
    descricao: string;
    quantidade: number;
    unidade: string;
    precoUnitario: number | null;
    precoTotal: number | null;
  }>;
};

const COTACAO_STATUS_OPTIONS = [
  "RASCUNHO",
  "ENVIADA",
  "RESPONDIDA",
  "APROVADA",
  "REJEITADA",
  "EXPIRADA",
  "CANCELADA",
] as const;

const ALLOWED_COTACAO_TRANSITIONS: Record<string, string[]> = {
  RASCUNHO: ["ENVIADA", "CANCELADA"],
  ENVIADA: ["RESPONDIDA", "EXPIRADA", "CANCELADA"],
  RESPONDIDA: ["APROVADA", "REJEITADA", "EXPIRADA"],
  REJEITADA: ["APROVADA"],
  APROVADA: [],
  EXPIRADA: ["ENVIADA"],
  CANCELADA: [],
};

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

const ALLOWED_STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  SOLICITADO: ["PENDENTE_ATENDIMENTO"],
  PENDENTE_ATENDIMENTO: ["EM_ATENDIMENTO"],
  EM_ATENDIMENTO: ["EM_PROCESSO_LOGISTICO", "CANCELADO"],
  EM_PROCESSO_LOGISTICO: ["CONCLUIDO"],
  CONCLUIDO: [],
  CANCELADO: [],
};

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addNotification } = useNotificationStore();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCotacaoDialogOpen, setIsCotacaoDialogOpen] = useState(false);
  const [selectedCotacaoId, setSelectedCotacaoId] = useState<string | null>(null);
  const [cotacaoStatus, setCotacaoStatus] = useState<string>("");
  const [cotacaoObservacao, setCotacaoObservacao] = useState("");
  const [cotacaoMotivo, setCotacaoMotivo] = useState("");
  const [cotacaoCurrency, setCotacaoCurrency] = useState<"BRL" | "USD" | "EUR">("USD");
  const [cotacaoLocale, setCotacaoLocale] = useState<"pt-BR" | "en-US">("pt-BR");
  const [isUpdatingCotacaoStatus, setIsUpdatingCotacaoStatus] = useState(false);
  const [isSendingCotacao, setIsSendingCotacao] = useState(false);
  const [ticketMotivoRecusa, setTicketMotivoRecusa] = useState("");

  const { data: authMe } = useQuery<{ name?: string; email?: string }>({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await api.get("/api/v1/auth/me");
      return res.data.data;
    },
  });

  const { data: ticket, isLoading, refetch } = useQuery<TicketDetail>({
    queryKey: ["ticket-detail", params.id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/tickets/${params.id}`);
      return res.data.data;
    },
  });

  const { data: cotacaoDetail, isLoading: isLoadingCotacao, refetch: refetchCotacao } = useQuery<CotacaoDetail>({
    queryKey: ["cotacao-detail", selectedCotacaoId],
    enabled: Boolean(selectedCotacaoId && isCotacaoDialogOpen),
    queryFn: async () => {
      const res = await api.get(`/api/v1/cotacoes/${selectedCotacaoId}`);
      return res.data.data;
    },
  });

  useEffect(() => {
    if (cotacaoDetail?.status) {
      setCotacaoStatus(cotacaoDetail.status);
    }
  }, [cotacaoDetail?.status]);

  const cotacaoTotalItens = useMemo(
    () =>
      (cotacaoDetail?.itens ?? []).reduce((sum, item) => {
        const quantidade = Number(item.quantidade) || 0;
        return sum + quantidade;
      }, 0),
    [cotacaoDetail?.itens],
  );

  const cotacaoSubtotal = useMemo(
    () =>
      (cotacaoDetail?.itens ?? []).reduce((sum, item) => {
        const quantidade = Number(item.quantidade) || 0;
        const precoUnitario = Number(item.precoUnitario) || 0;
        return sum + quantidade * precoUnitario;
      }, 0),
    [cotacaoDetail?.itens],
  );

  const cotacaoValorGlobal = useMemo(() => {
    if (!cotacaoDetail) return 0;
    const desconto = Number(cotacaoDetail.descontoGlobal) || 0;
    if (!desconto) return cotacaoSubtotal;
    if (cotacaoDetail.descontoTipo === "PERCENTUAL") {
      return cotacaoSubtotal * (1 - desconto / 100);
    }
    return Math.max(0, cotacaoSubtotal - desconto);
  }, [cotacaoDetail, cotacaoSubtotal]);

  const formatCotacaoAmount = (value: number | null | undefined) =>
    value != null ? value.toLocaleString(cotacaoLocale, { style: "currency", currency: cotacaoCurrency }) : "--";

  const isEmailTicket = useMemo(() => isEmailContact(ticket?.contatoWpp), [ticket?.contatoWpp]);

  const whatsappUrl = useMemo(() => {
    if (isEmailTicket) return null;
    return buildWhatsAppSendUrl({
      phone: ticket?.cliente?.whatsappNumber || ticket?.cliente?.telefone || ticket?.contatoWpp,
      operatorName: authMe?.name || authMe?.email,
      clientName: ticket?.cliente?.nome,
      ticketNumber: ticket?.pedido,
      requestSummary: ticket?.solicitacao,
      companyName: ticket?.empresa,
    });
  }, [authMe?.email, authMe?.name, isEmailTicket, ticket?.cliente?.nome, ticket?.cliente?.telefone, ticket?.cliente?.whatsappNumber, ticket?.contatoWpp, ticket?.empresa, ticket?.pedido, ticket?.solicitacao]);

  const canTransitionTo = (current: TicketStatus, next: TicketStatus) =>
    (ALLOWED_STATUS_TRANSITIONS[current] ?? []).includes(next);

  const transitionStatus = async (
    status: TicketStatus,
    options?: { motivo?: string; cotacaoId?: string },
  ) => {
    if (!ticket) return;
    setIsUpdatingStatus(true);
    try {
      await api.post(`/api/v1/tickets/${ticket.id}/status`, {
        status,
        motivo: options?.motivo || undefined,
        cotacaoId: options?.cotacaoId || undefined,
      });
      addNotification({
        title: "Status atualizado",
        message: `Ticket atualizado para ${status.replace(/_/g, " ")}.`,
        type: "success",
        category: "system",
      });
      if (status === "CANCELADO") {
        setTicketMotivoRecusa("");
      }
      await refetch();
    } catch (error: any) {
      addNotification({
        title: "Erro",
        message: error?.response?.data?.message || "Falha ao atualizar status.",
        type: "error",
        category: "system",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const linkedCotacaoId = useMemo(() => {
    if (!ticket?.cotacoes?.length) return undefined;
    const cotacaoOrdenada = [...ticket.cotacoes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return cotacaoOrdenada[0]?.id;
  }, [ticket?.cotacoes]);

  const handleSaveTicket = async (data: { empresa?: string; responsavel?: string; prioridade?: string; contatoNome?: string }) => {
    if (!ticket) return;
    try {
      await api.patch(`/api/v1/tickets/${ticket.id}`, data);
      addNotification({
        title: "Ticket atualizado",
        message: "Os dados do ticket foram atualizados com sucesso.",
        type: "success",
        category: "system",
      });
      await refetch();
    } catch (error: any) {
      addNotification({
        title: "Erro",
        message: error?.response?.data?.message || "Falha ao atualizar ticket.",
        type: "error",
        category: "system",
      });
      throw error;
    }
  };

  const handleDownloadCotacao = async (id: string, numero: number, type: "pdf" | "xlsx") => {
    try {
      const res = await api.get(`/api/v1/cotacoes/${id}/${type}`, {
        responseType: "blob",
      });
      downloadBlob(res.data, `cotacao-${numero}.${type}`);
    } catch (error: any) {
      addNotification({
        title: "Erro",
        message: error?.response?.data?.message || "Falha ao baixar a cotação.",
        type: "error",
        category: "system",
      });
    }
  };

  const openCotacaoDialog = (cotacaoId: string, status: string) => {
    setSelectedCotacaoId(cotacaoId);
    setCotacaoStatus(status);
    setCotacaoObservacao("");
    setCotacaoMotivo("");
    setIsCotacaoDialogOpen(true);
  };

  const updateCotacaoStatus = async () => {
    if (!selectedCotacaoId || !cotacaoStatus) return;
    setIsUpdatingCotacaoStatus(true);
    try {
      await api.post(`/api/v1/cotacoes/${selectedCotacaoId}/status`, {
        status: cotacaoStatus,
        observacao: cotacaoObservacao || undefined,
        motivo: cotacaoStatus === "REJEITADA" ? cotacaoMotivo || undefined : undefined,
      });
      addNotification({
        title: "Status atualizado",
        message: "Status da cotação atualizado com sucesso.",
        type: "success",
        category: "system",
      });
      await refetch();
      setIsCotacaoDialogOpen(false);
    } catch (error: any) {
      addNotification({
        title: "Erro",
        message: error?.response?.data?.message || "Falha ao atualizar status da cotação.",
        type: "error",
        category: "system",
      });
    } finally {
      setIsUpdatingCotacaoStatus(false);
    }
  };

  const handleSendCotacao = async () => {
    if (!ticket || !cotacaoDetail) return;
    const canSend =
      cotacaoDetail.status === "ENVIADA" ||
      (ALLOWED_COTACAO_TRANSITIONS[cotacaoDetail.status] ?? []).includes("ENVIADA");
    if (!canSend) {
      addNotification({
        title: "Status inválido",
        message: `Não é possível enviar uma cotação em status ${cotacaoDetail.status}.`,
        type: "error",
        category: "system",
      });
      return;
    }

    setIsSendingCotacao(true);
    try {
      // Permite reenvio quando já estiver em ENVIADA.
      if (cotacaoDetail.status !== "ENVIADA") {
        await api.post(`/api/v1/cotacoes/${cotacaoDetail.id}/status`, {
          status: "ENVIADA",
          observacao: "Proposta comercial enviada via chat",
        });
      }

      const formatCurrency = (value: number | null | undefined) =>
        value != null ? value.toLocaleString(cotacaoLocale, { style: "currency", currency: cotacaoCurrency }) : "--";

      const formatDate = (value?: string | null) =>
        value ? new Date(value).toLocaleDateString(cotacaoLocale) : "--";

      const prazoDias = cotacaoDetail.prazoEntregaDias != null ? cotacaoDetail.prazoEntregaDias : null;
      const prazo =
        prazoDias == null
          ? "--"
          : cotacaoLocale === "pt-BR"
            ? `${prazoDias} dias`
            : `${prazoDias} days`;

      const valor = formatCurrency(cotacaoDetail.valorTotal);
      const entregaPrevista = formatDate(cotacaoDetail.dataPrevistaEntrega);
      const fornecedor = cotacaoDetail.fornecedor?.nome ?? "--";
      const itensQtd = cotacaoDetail.itens?.length ?? 0;
      const observacoes = cotacaoDetail.observacoes?.trim();

      const message =
        cotacaoLocale === "pt-BR"
          ? [
              `Proposta comercial — Ticket #${ticket.pedido}`,
              `Ticket: #${ticket.pedido}`,
              `Fornecedor: ${fornecedor}`,
              `Valor total (${cotacaoCurrency}): ${valor}`,
              `Prazo de entrega: ${prazo}`,
              `Entrega prevista: ${entregaPrevista}`,
              `Itens: ${itensQtd}`,
              observacoes ? `Observações: ${observacoes}` : null,
            ]
              .filter(Boolean)
              .join("\n")
          : [
              `Commercial proposal — Ticket #${ticket.pedido}`,
              `Ticket: #${ticket.pedido}`,
              `Supplier: ${fornecedor}`,
              `Total (${cotacaoCurrency}): ${valor}`,
              `Delivery lead time: ${prazo}`,
              `Estimated delivery: ${entregaPrevista}`,
              `Items: ${itensQtd}`,
              observacoes ? `Notes: ${observacoes}` : null,
            ]
              .filter(Boolean)
              .join("\n");

      const sendResponse = await api.post(`/api/v1/cotacoes/${cotacaoDetail.id}/send`, {
        message,
      });
      const channel = sendResponse?.data?.data?.channel;

      addNotification({
        title: "Proposta enviada",
        message:
          channel === "EMAIL"
            ? "A proposta foi enviada por email com anexos PDF e XLSX, e o status foi atualizado."
            : "A proposta foi enviada via WhatsApp com anexos PDF e XLSX, e o status foi atualizado.",
        type: "success",
        category: "system",
      });
      await refetch();
      await refetchCotacao();
    } catch (error: any) {
      addNotification({
        title: "Erro",
        message: error?.response?.data?.message || "Falha ao enviar a cotação.",
        type: "error",
        category: "system",
      });
    } finally {
      setIsSendingCotacao(false);
    }
  };

  const handleSendCotacaoCard = async (cotacao: NonNullable<TicketDetail["cotacoes"]>[number]) => {
    if (!ticket) return;
    const canSend =
      cotacao.status === "ENVIADA" ||
      (ALLOWED_COTACAO_TRANSITIONS[cotacao.status] ?? []).includes("ENVIADA");
    if (!canSend) {
      addNotification({
        title: "Status inválido",
        message: `Não é possível enviar uma cotação em status ${cotacao.status}.`,
        type: "error",
        category: "system",
      });
      return;
    }

    setIsSendingCotacao(true);
    try {
      if (cotacao.status !== "ENVIADA") {
        await api.post(`/api/v1/cotacoes/${cotacao.id}/status`, {
          status: "ENVIADA",
          observacao: "Proposta comercial enviada a partir do card da cotação",
        });
      }

      const formatCurrency = (value: number | null | undefined) =>
        value != null ? value.toLocaleString(cotacaoLocale, { style: "currency", currency: cotacaoCurrency }) : "--";

      const formatDate = (value?: string | null) =>
        value ? new Date(value).toLocaleDateString(cotacaoLocale) : "--";

      const prazo =
        cotacao.prazoEntregaDias == null
          ? "--"
          : cotacaoLocale === "pt-BR"
            ? `${cotacao.prazoEntregaDias} dias`
            : `${cotacao.prazoEntregaDias} days`;

      const message =
        cotacaoLocale === "pt-BR"
          ? [
              `Proposta comercial — Ticket #${ticket.pedido}`,
              `Ticket: #${ticket.pedido}`,
              `Fornecedor: ${cotacao.fornecedor?.nome ?? "--"}`,
              `Valor total (${cotacaoCurrency}): ${formatCurrency(cotacao.valorTotal)}`,
              `Prazo de entrega: ${prazo}`,
              `Entrega prevista: ${formatDate(cotacao.dataPrevistaEntrega)}`,
              `Itens: ${cotacao.itensCount ?? "--"}`,
              cotacao.observacoes?.trim() ? `Observações: ${cotacao.observacoes.trim()}` : null,
            ]
              .filter(Boolean)
              .join("\n")
          : [
              `Commercial proposal — Ticket #${ticket.pedido}`,
              `Ticket: #${ticket.pedido}`,
              `Supplier: ${cotacao.fornecedor?.nome ?? "--"}`,
              `Total (${cotacaoCurrency}): ${formatCurrency(cotacao.valorTotal)}`,
              `Delivery lead time: ${prazo}`,
              `Estimated delivery: ${formatDate(cotacao.dataPrevistaEntrega)}`,
              `Items: ${cotacao.itensCount ?? "--"}`,
              cotacao.observacoes?.trim() ? `Notes: ${cotacao.observacoes.trim()}` : null,
            ]
              .filter(Boolean)
              .join("\n");

      const sendResponse = await api.post(`/api/v1/cotacoes/${cotacao.id}/send`, {
        message,
      });
      const channel = sendResponse?.data?.data?.channel;

      addNotification({
        title: "Proposta enviada",
        message:
          channel === "EMAIL"
            ? "A proposta foi enviada por email com anexos PDF e XLSX."
            : "A proposta foi enviada via WhatsApp com anexos PDF e XLSX.",
        type: "success",
        category: "system",
      });

      await refetch();
      if (selectedCotacaoId === cotacao.id) {
        await refetchCotacao();
      }
    } catch (error: any) {
      addNotification({
        title: "Erro",
        message: error?.response?.data?.message || "Falha ao enviar a cotação.",
        type: "error",
        category: "system",
      });
    } finally {
      setIsSendingCotacao(false);
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
            Voltar para Tickets
          </Button>

          {isLoading ? (
            <div className="text-slate-400">Carregando detalhes do ticket...</div>
          ) : !ticket ? (
            <div className="text-red-400">Ticket não encontrado.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card variant="glass">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={statusBadgeVariant(ticket.status)}>{ticket.status.replace(/_/g, " ")}</Badge>
                        <span className="text-slate-400 text-sm">#{ticket.pedido}</span>
                      </div>
                      <CardTitle className="text-2xl">{ticket.empresa ?? "Ticket"}</CardTitle>
                      <p className="mt-2 text-slate-300 whitespace-pre-wrap">{ticket.solicitacao}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setIsEditModalOpen(true)} title="Editar ticket">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {whatsappUrl && (
                        <Button variant="ghost" size="icon" onClick={() => window.open(whatsappUrl, "_blank")} title="WhatsApp">
                          <MessageCircle className="h-4 w-4 text-green-400" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="col-span-1 md:col-span-2 border-b border-white/10 pb-4 mb-2">
                        <h3 className="text-slate-300 font-medium mb-3 flex items-center gap-2">
                           <span className="p-1 rounded bg-white/5">👤</span> Dados do Solicitante
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wider">Nome</p>
                                <p className="text-slate-100 font-medium text-lg">{ticket.cliente?.nome || "Não identificado"}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wider">
                                  {isEmailTicket ? "Email (origem)" : "Telefone / WhatsApp"}
                                </p>
                                <p className="text-slate-200">
                                  {isEmailTicket
                                    ? ticket.cliente?.email || ticket.contatoWpp || "--"
                                    : ticket.cliente?.whatsappNumber || ticket.cliente?.telefone || ticket.contatoWpp || "--"}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wider">Email</p>
                                <p className="text-slate-200">{ticket.cliente?.email || "--"}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wider">Empresa</p>
                                <p className="text-slate-200">{ticket.empresa || "--"}</p>
                            </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider">Responsável</p>
                        <p className="text-slate-200">{ticket.responsavel ?? "--"}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider">Prioridade</p>
                        <p className="text-slate-200">{ticket.prioridade ?? "--"}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider">Criado em</p>
                        <p className="text-slate-200">{new Date(ticket.createdAt).toLocaleString("pt-BR")}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {([
                        { value: "PENDENTE_ATENDIMENTO", label: "Pendente" },
                        { value: "EM_ATENDIMENTO", label: "Em atendimento" },
                        { value: "CONCLUIDO", label: "Concluir" },
                      ] as { value: TicketStatus; label: string }[]).map((option) => {
                        const isActive = ticket.status === option.value;
                        const canTransition = canTransitionTo(ticket.status, option.value);
                        const isDisabled = isUpdatingStatus || isActive || !canTransition;
                        const shouldGlow = option.value === "EM_ATENDIMENTO" && canTransition;
                        return (
                          <Button
                            key={option.value}
                            variant={isActive ? "default" : "outline"}
                            className={[
                              isActive ? "disabled:opacity-100 cursor-default" : "",
                              shouldGlow ? "border-sky-400 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.6)]" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            disabled={isDisabled}
                            onClick={() => transitionStatus(option.value)}
                          >
                            {option.label}
                          </Button>
                        );
                      })}
                      <Button
                        variant="outline"
                        disabled={
                          isUpdatingStatus ||
                          !canTransitionTo(ticket.status, "EM_PROCESSO_LOGISTICO")
                        }
                        onClick={() =>
                          transitionStatus("EM_PROCESSO_LOGISTICO", {
                            cotacaoId: linkedCotacaoId,
                          })
                        }
                      >
                        Aceita
                      </Button>
                      <div className="flex items-center gap-2">
                        <input
                          value={ticketMotivoRecusa}
                          onChange={(event) => setTicketMotivoRecusa(event.target.value)}
                          className="w-56 rounded-lg bg-slate-900/50 border border-slate-700 p-2 text-slate-100 text-sm"
                          placeholder="Motivo da recusa"
                        />
                        <Button
                          variant="outline"
                          disabled={
                            isUpdatingStatus ||
                            !canTransitionTo(ticket.status, "CANCELADO") ||
                            !ticketMotivoRecusa.trim()
                          }
                          onClick={() =>
                            transitionStatus("CANCELADO", {
                              motivo: ticketMotivoRecusa.trim(),
                              cotacaoId: linkedCotacaoId,
                            })
                          }
                        >
                          Recusada
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Mensagens</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[600px]">
                    <TicketChat
                      ticketId={ticket.id}
                      whatsappNumber={ticket.contatoWpp}
                      canSend={ticket.status === "EM_ATENDIMENTO"}
                    />
                  </CardContent>
                </Card>

                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Histórico de Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ticket.historico?.length ? (
                      <div className="space-y-3">
                        {ticket.historico
                          .slice()
                          .reverse()
                          .map((h) => (
                            <div key={h.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm text-slate-200">
                                  <span className="text-slate-400">{h.statusAnterior ?? "—"}</span>
                                  <span className="text-slate-500"> → </span>
                                  <span className="text-slate-200">{h.statusNovo ?? "—"}</span>
                                </p>
                                <p className="text-xs text-slate-400">{new Date(h.createdAt).toLocaleString("pt-BR")}</p>
                              </div>
                              {(h.motivo || h.observacao || h.historico) && (
                                <p className="mt-2 text-sm text-slate-300 whitespace-pre-wrap">
                                  {h.observacao || h.motivo || h.historico}
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">Sem histórico.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card variant="glass">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Cotações</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/tickets/${ticket.id}/quotes/new`)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova cotação
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {ticket.cotacoes?.length ? (
                      <div className="space-y-3">
                        {ticket.cotacoes.map((c) => (
                          <div key={c.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm text-slate-200 font-medium">Cotação #{c.numero}</p>
                                  <Badge variant="info">{c.status.replace(/_/g, " ")}</Badge>
                                </div>
                                <div className="grid grid-cols-1 gap-1 text-xs text-slate-400 md:grid-cols-2">
                                  <p>Fornecedor: {c.fornecedor.nome}</p>
                                  <p>
                                    Valor: {c.valorTotal != null ? c.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "--"}
                                  </p>
                                  <p>
                                    Prazo: {c.prazoEntregaDias != null ? `${c.prazoEntregaDias} dias` : "--"}
                                  </p>
                                  <p>
                                    Entrega prevista: {c.dataPrevistaEntrega ? new Date(c.dataPrevistaEntrega).toLocaleDateString("pt-BR") : "--"}
                                  </p>
                                  <p>
                                    Emitida em: {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                                  </p>
                                  <p>
                                    Itens: {c.itensCount ?? "--"}
                                  </p>
                                  <p>
                                    Expira em: {c.dataExpiracao ? new Date(c.dataExpiracao).toLocaleDateString("pt-BR") : "--"}
                                  </p>
                                  <p>
                                    Canal de envio: {isEmailContact(ticket.contatoWpp) ? "Email" : "WhatsApp"}
                                  </p>
                                </div>
                                {c.observacoes?.trim() ? (
                                  <p className="text-xs text-slate-300">
                                    Observações: <span className="text-slate-400">{c.observacoes.trim()}</span>
                                  </p>
                                ) : null}
                              </div>
                              <div className="flex flex-wrap gap-2 lg:justify-end">
                                <Button
                                  variant="gradient"
                                  size="sm"
                                  onClick={() => handleSendCotacaoCard(c)}
                                  disabled={isSendingCotacao}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Enviar
                                </Button>
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadCotacao(c.id, c.numero, "pdf")}
                              >
                                <FileText className="h-4 w-4 mr-2" /> PDF
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadCotacao(c.id, c.numero, "xlsx")}
                              >
                                <FileSpreadsheet className="h-4 w-4 mr-2" /> XLSX
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openCotacaoDialog(c.id, c.status)}
                              >
                                <Eye className="h-4 w-4 mr-2" /> Detalhes
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">Nenhuma cotação associada.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      {ticket && (
        <EditTicketModal
          ticket={ticket}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveTicket}
        />
      )}

      <Dialog open={isCotacaoDialogOpen} onOpenChange={setIsCotacaoDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Cotação</DialogTitle>
          </DialogHeader>
          {isLoadingCotacao ? (
            <div className="text-slate-400">Carregando cotação...</div>
          ) : !cotacaoDetail ? (
            <div className="text-slate-400">Cotação não encontrada.</div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Número</p>
                  <p className="text-slate-200">#{cotacaoDetail.numero}</p>
                </div>
                <div>
                  <p className="text-slate-400">Fornecedor</p>
                  <p className="text-slate-200">{cotacaoDetail.fornecedor?.nome ?? "--"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Status</p>
                  <p className="text-slate-200">{cotacaoDetail.status}</p>
                </div>
                <div>
                  <p className="text-slate-400">Valor total</p>
                  <p className="text-slate-200">
                    {formatCotacaoAmount(cotacaoDetail.valorTotal)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Prazo (dias)</p>
                  <p className="text-slate-200">{cotacaoDetail.prazoEntregaDias ?? "--"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Entrega prevista</p>
                  <p className="text-slate-200">
                    {cotacaoDetail.dataPrevistaEntrega
                      ? new Date(cotacaoDetail.dataPrevistaEntrega).toLocaleDateString("pt-BR")
                      : "--"}
                  </p>
                </div>
              </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-3">
                  <div>
                    <p className="text-sm text-slate-300 mb-2">Moeda para envio</p>
                    <div className="flex flex-wrap gap-2">
                      {(["BRL", "USD", "EUR"] as const).map((currency) => (
                        <Button
                          key={currency}
                          variant={cotacaoCurrency === currency ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCotacaoCurrency(currency)}
                        >
                          {currency === "BRL" ? "Real (BRL)" : currency === "USD" ? "Dólar (USD)" : "Euro (EUR)"}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300 mb-2">Idioma da mensagem</p>
                    <div className="flex flex-wrap gap-2">
                      {(["pt-BR", "en-US"] as const).map((locale) => (
                        <Button
                          key={locale}
                          variant={cotacaoLocale === locale ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCotacaoLocale(locale)}
                        >
                          {locale === "pt-BR" ? "Português (pt-BR)" : "English (en-US)"}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-sm text-slate-400 mb-2">Observações</p>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">
                    {cotacaoDetail.observacoes?.trim() || "--"}
                  </p>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-4 lg:col-span-2">
                  <p className="text-sm text-slate-300 mb-2">Itens</p>
                  <div className="grid grid-cols-12 gap-2 text-xs text-slate-400 border-b border-white/10 pb-2 mb-2">
                    <div className="col-span-4">Descrição</div>
                    <div className="col-span-2">Qtd</div>
                    <div className="col-span-2">Un</div>
                    <div className="col-span-2 text-right">Valor Unit.</div>
                    <div className="col-span-2 text-right">Total</div>
                  </div>
                  <div className="space-y-2">
                    {cotacaoDetail.itens.map((item) => (
                      <div key={item.id} className="space-y-1 py-1">
                        <div className="grid grid-cols-12 gap-2 text-sm text-slate-200">
                          <div className="col-span-4 font-medium">{item.descricao}</div>
                          <div className="col-span-2">{item.quantidade}</div>
                          <div className="col-span-2">{item.unidade}</div>
                          <div className="col-span-2 text-right">
                            {formatCotacaoAmount(item.precoUnitario)}
                          </div>
                          <div className="col-span-2 text-right">
                            {formatCotacaoAmount(item.precoTotal)}
                          </div>
                        </div>
                        <p className="text-xs text-slate-400">
                          Cálculo: {item.quantidade || 0} x{" "}
                          {formatCotacaoAmount(Number(item.precoUnitario) || 0)}{" "}
                          ={" "}
                          <span className="font-semibold text-emerald-400">
                            {formatCotacaoAmount((Number(item.quantidade) || 0) * (Number(item.precoUnitario) || 0))}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-lg border border-white/10 bg-slate-900/40 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-slate-400">Total de Itens (quantidades)</p>
                        <p className="text-lg font-semibold text-white">{cotacaoTotalItens}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Subtotal dos Itens</p>
                        <p className="text-lg font-semibold text-emerald-400">
                          {formatCotacaoAmount(cotacaoSubtotal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Valor Global</p>
                        <p className="text-lg font-semibold text-purple-300">
                          {formatCotacaoAmount(cotacaoValorGlobal)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-3 lg:col-span-2">
                  <p className="text-sm text-slate-300">Atualizar status</p>
                  <select
                    className="w-full rounded-lg bg-slate-900/50 border border-slate-700 p-2 text-slate-100 text-sm"
                    value={cotacaoStatus}
                    onChange={(event) => setCotacaoStatus(event.target.value)}
                  >
                    {COTACAO_STATUS_OPTIONS.map((status) => {
                      const current = cotacaoDetail.status;
                      const allowed = ALLOWED_COTACAO_TRANSITIONS[current] ?? [];
                      const isDisabled = status !== current && !allowed.includes(status);
                      return (
                        <option key={status} value={status} disabled={isDisabled}>
                          {status.replace(/_/g, " ")}
                        </option>
                      );
                    })}
                  </select>
                  {cotacaoStatus === "REJEITADA" && (
                    <textarea
                      value={cotacaoMotivo}
                      onChange={(event) => setCotacaoMotivo(event.target.value)}
                      rows={2}
                      className="w-full rounded-lg bg-slate-900/50 border border-slate-700 p-2 text-slate-100 text-sm"
                      placeholder="Motivo da rejeição"
                    />
                  )}
                  <textarea
                    value={cotacaoObservacao}
                    onChange={(event) => setCotacaoObservacao(event.target.value)}
                    rows={2}
                    className="w-full rounded-lg bg-slate-900/50 border border-slate-700 p-2 text-slate-100 text-sm"
                    placeholder="Observação (opcional)"
                  />
                  <div className="flex justify-end">
                    <Button
                      variant="gradient"
                      onClick={updateCotacaoStatus}
                      disabled={isUpdatingCotacaoStatus || (cotacaoStatus === "REJEITADA" && !cotacaoMotivo.trim())}
                    >
                      {isUpdatingCotacaoStatus ? "Atualizando..." : "Atualizar status"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={handleSendCotacao}
                  disabled={
                    isSendingCotacao ||
                    !(
                      cotacaoDetail.status === "ENVIADA" ||
                      (ALLOWED_COTACAO_TRANSITIONS[cotacaoDetail.status] ?? []).includes("ENVIADA")
                    )
                  }
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSendingCotacao ? "Enviando..." : "Enviar proposta no chat"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
