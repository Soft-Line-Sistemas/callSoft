"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Send, Lock, UserPlus, Zap, User, Clock, Paperclip, FileText, Download } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";
import { CreateClienteModal, type ClienteFormData } from "@/components/modals/CreateClienteModal";
import { isEmailContact } from "@/lib/contact";
import { downloadBlob } from "@/lib/download";

interface Message {
  id: string;
  ticketId: string;
  userId?: string | null;
  senderType: "USER" | "CLIENT" | "BOT" | "SYSTEM";
  senderName: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

interface Cliente {
  id: string;
  whatsappNumber: string;
  nome: string;
  email?: string | null;
  empresa?: string | null;
  whatsappProfilePicUrl?: string | null;
  whatsappName?: string | null;
}

interface TicketChatProps {
  ticketId: string;
  whatsappNumber: string;
  canSend?: boolean;
}

const IMAGE_MESSAGE_PREFIX = "[[image:";
const ATTACHMENT_MESSAGE_PREFIX = "[[attachment:";
const IMAGE_MESSAGE_SUFFIX = "]]";

type AttachmentToken = {
  attachmentId: string;
  isLegacyImage: boolean;
};

interface TicketAttachment {
  id: string;
  fileNameOriginal: string;
  mimeType: string;
}

interface CotacaoChatItem {
  id: string;
  descricao: string;
  quantidade: number;
  unidade?: string | null;
  precoUnitario?: number | null;
  precoTotal?: number | null;
}

interface CotacaoChatSummary {
  id: string;
  numero: number;
  fornecedor?: { nome?: string | null } | null;
  valorTotal: number | null;
  prazoEntregaDias: number | null;
  dataPrevistaEntrega: string | null;
  observacoes: string | null;
  itens: CotacaoChatItem[];
  createdAt?: string;
}

interface ParsedQuoteMessage {
  supplier?: string;
  total?: number;
  totalCurrency?: string;
  prazoEntregaDias?: number;
  entregaPrevista?: string;
  itensCount?: number;
  observacoes?: string;
  locale: "pt-BR" | "en-US";
}

function parseAttachmentToken(message: string): AttachmentToken | null {
  const trimmed = message.trim();
  const isAttachment = trimmed.startsWith(ATTACHMENT_MESSAGE_PREFIX) && trimmed.endsWith(IMAGE_MESSAGE_SUFFIX);
  const isLegacyImage = trimmed.startsWith(IMAGE_MESSAGE_PREFIX) && trimmed.endsWith(IMAGE_MESSAGE_SUFFIX);
  if (!isAttachment && !isLegacyImage) {
    return null;
  }
  const prefix = isAttachment ? ATTACHMENT_MESSAGE_PREFIX : IMAGE_MESSAGE_PREFIX;
  const inner = trimmed.slice(prefix.length, -IMAGE_MESSAGE_SUFFIX.length).trim();
  if (!inner) return null;
  return { attachmentId: inner, isLegacyImage };
}

function normalizeText(value?: string | null): string {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function parseLocalizedNumber(raw?: string | null): number | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/[^\d.,-]/g, "").trim();
  if (!cleaned) return undefined;

  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");
  let normalized = cleaned;

  if (hasComma && hasDot) {
    normalized =
      cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.replace(/,/g, "");
  } else if (hasComma) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = cleaned.replace(/,/g, "");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseQuoteMessage(message: string): ParsedQuoteMessage | null {
  const lines = message
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return null;
  const header = lines[0] || "";
  const isPt = /^Proposta comercial\s+[—-]\s+Ticket\s*#\d+/i.test(header);
  const isEn = /^Commercial proposal\s+[—-]\s+Ticket\s*#\d+/i.test(header);
  if (!isPt && !isEn) return null;

  const locale: "pt-BR" | "en-US" = isPt ? "pt-BR" : "en-US";

  const lineByLabel = (pattern: RegExp): string | undefined => {
    const line = lines.find((entry) => pattern.test(entry));
    if (!line) return undefined;
    const split = line.split(":");
    if (split.length < 2) return undefined;
    return split.slice(1).join(":").trim();
  };

  const totalLine = lineByLabel(isPt ? /^Valor total/i : /^Total/i);
  const totalCurrencyMatch = lines
    .find((entry) => (isPt ? /^Valor total/i : /^Total/i).test(entry))
    ?.match(/\(([A-Za-z]{3})\)/);

  const prazoLine = lineByLabel(isPt ? /^Prazo de entrega/i : /^Delivery lead time/i);
  const prazoEntregaDias = prazoLine ? Number((prazoLine.match(/\d+/) || [])[0]) : undefined;
  const parsedPrazoEntregaDias = Number.isFinite(prazoEntregaDias) ? prazoEntregaDias : undefined;

  const itensLine = lineByLabel(isPt ? /^Itens/i : /^Items/i);
  const itensCount = itensLine ? Number((itensLine.match(/\d+/) || [])[0]) : undefined;
  const parsedItensCount = Number.isFinite(itensCount) ? itensCount : undefined;

  return {
    supplier: lineByLabel(isPt ? /^Fornecedor/i : /^Supplier/i),
    total: parseLocalizedNumber(totalLine),
    totalCurrency: totalCurrencyMatch?.[1]?.toUpperCase(),
    prazoEntregaDias: parsedPrazoEntregaDias,
    entregaPrevista: lineByLabel(isPt ? /^Entrega prevista/i : /^Estimated delivery/i),
    itensCount: parsedItensCount,
    observacoes: lineByLabel(isPt ? /^Observações/i : /^Notes/i),
    locale,
  };
}

function matchesDateLabel(inputDateLabel: string | undefined, quoteDate: string | null): boolean {
  if (!inputDateLabel || !quoteDate) return false;
  const raw = inputDateLabel.trim();
  if (!raw) return false;
  const date = new Date(quoteDate);
  if (Number.isNaN(date.getTime())) return false;
  return [date.toLocaleDateString("pt-BR"), date.toLocaleDateString("en-US")].includes(raw);
}

function resolveCotacaoFromMessage(
  message: string,
  cotacoes: CotacaoChatSummary[]
): { parsed: ParsedQuoteMessage; cotacao: CotacaoChatSummary | null } | null {
  const parsed = parseQuoteMessage(message);
  if (!parsed) return null;
  if (!cotacoes.length) return { parsed, cotacao: null };

  const withScore = cotacoes.map((cotacao) => {
    let score = 0;

    if (parsed.supplier) {
      const supplierA = normalizeText(parsed.supplier);
      const supplierB = normalizeText(cotacao.fornecedor?.nome);
      if (supplierA && supplierB && (supplierA.includes(supplierB) || supplierB.includes(supplierA))) {
        score += 5;
      } else {
        score -= 2;
      }
    }

    if (parsed.total != null && cotacao.valorTotal != null) {
      const diff = Math.abs(Number(cotacao.valorTotal) - parsed.total);
      if (diff <= 0.5) score += 4;
      else score -= 1;
    }

    if (parsed.prazoEntregaDias != null && cotacao.prazoEntregaDias != null) {
      if (Number(cotacao.prazoEntregaDias) === parsed.prazoEntregaDias) score += 2;
    }

    if (parsed.entregaPrevista && matchesDateLabel(parsed.entregaPrevista, cotacao.dataPrevistaEntrega)) {
      score += 2;
    }

    if (parsed.itensCount != null) {
      if ((cotacao.itens?.length ?? 0) === parsed.itensCount) score += 3;
    }

    if (parsed.observacoes && cotacao.observacoes) {
      const obsA = normalizeText(parsed.observacoes);
      const obsB = normalizeText(cotacao.observacoes);
      if (obsA && obsB && (obsA.includes(obsB) || obsB.includes(obsA))) score += 1;
    }

    return { cotacao, score };
  });

  withScore.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (
      new Date(b.cotacao.createdAt || 0).getTime() -
      new Date(a.cotacao.createdAt || 0).getTime()
    );
  });

  const best = withScore[0];
  return { parsed, cotacao: best?.cotacao ?? null };
}

function formatItemAmount(
  value: number | null | undefined,
  locale: "pt-BR" | "en-US",
  currency?: string
): string | null {
  if (value == null) return null;
  const curr = currency && /^[A-Z]{3}$/.test(currency) ? currency : undefined;
  if (!curr) return value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  try {
    return value.toLocaleString(locale, { style: "currency", currency: curr });
  } catch {
    return value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}

function ChatImage({ ticketId, attachmentId, fileName }: { ticketId: string; attachmentId: string; fileName?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    api
      .get(`/api/v1/tickets/${ticketId}/attachments/${attachmentId}/download`, {
        responseType: "blob",
      })
      .then((res) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(res.data);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!active) return;
        setError(true);
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [attachmentId, ticketId]);

  if (error) {
    return <p className="text-sm text-amber-400">Imagem indisponível.</p>;
  }

  if (!url) {
    return <p className="text-sm text-slate-400">Carregando imagem...</p>;
  }

  return (
    <img
      src={url}
      alt={fileName || "Imagem enviada"}
      className="max-w-full max-h-48 w-auto rounded-md border border-slate-600 object-contain"
    />
  );
}

function ChatFile({
  ticketId,
  attachmentId,
  fileName,
}: {
  ticketId: string;
  attachmentId: string;
  fileName: string;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(false);

  const handleDownload = async () => {
    setError(false);
    setIsDownloading(true);
    try {
      const res = await api.get(`/api/v1/tickets/${ticketId}/attachments/${attachmentId}/download`, {
        responseType: "blob",
      });
      downloadBlob(res.data, fileName || `anexo-${attachmentId}`);
    } catch {
      setError(true);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="rounded-md border border-slate-600/80 bg-slate-800/40 p-3">
      <div className="flex items-center gap-2 text-slate-200">
        <FileText className="h-4 w-4 text-slate-300" />
        <span className="text-sm break-all">{fileName || "Arquivo"}</span>
      </div>
      <div className="mt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isDownloading ? "Baixando..." : "Baixar"}
        </Button>
      </div>
      {error && <p className="mt-2 text-xs text-amber-400">Não foi possível baixar o arquivo.</p>}
    </div>
  );
}

export function TicketChat({ ticketId, whatsappNumber, canSend = true }: TicketChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [fallbackNome, setFallbackNome] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const hasLoadedMessagesRef = useRef(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();
  const isEmailTicket = isEmailContact(whatsappNumber);

  // Busca cliente vinculado
  const { data: cliente, refetch: refetchCliente } = useQuery<Cliente | null>({
    queryKey: ["ticket-cliente", ticketId],
    queryFn: async () => {
      try {
        const res = await api.get(`/api/v1/tickets/${ticketId}/cliente`);
        return res.data.data;
      } catch (error: any) {
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
  });

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["ticket-messages", ticketId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/tickets/${ticketId}/messages`, {
        params: { includeInternal: true },
      });
      return res.data.data;
    },
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });

  const { data: ticketAttachments = [] } = useQuery<TicketAttachment[]>({
    queryKey: ["ticket-attachments-chat", ticketId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/tickets/${ticketId}/attachments`);
      return res.data.data ?? [];
    },
  });
  const attachmentsById = useMemo(
    () =>
      new Map(
        (ticketAttachments || []).map((attachment) => [attachment.id, attachment])
      ),
    [ticketAttachments]
  );
  const { data: ticketCotacoes = [] } = useQuery<CotacaoChatSummary[]>({
    queryKey: ["ticket-cotacoes-chat", ticketId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/tickets/${ticketId}/cotacoes`);
      return res.data.data ?? [];
    },
    enabled: Boolean(ticketId),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string; isInternal: boolean }) => {
      const res = await api.post(`/api/v1/tickets/${ticketId}/messages`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-messages", ticketId] });
      setNewMessage("");
      addNotification({
        title: "Mensagem enviada",
        message: "Sua mensagem foi enviada com sucesso.",
        type: "success",
        category: "system",
      });
    },
    onError: (error: any) => {
      addNotification({
        title: "Erro",
        message: error?.response?.data?.message || "Falha ao enviar mensagem.",
        type: "error",
        category: "system",
      });
    },
  });

  const sendFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("isInternal", String(isInternal));
      const res = await api.post(`/api/v1/tickets/${ticketId}/messages`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-messages", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["ticket-attachments-chat", ticketId] });
      addNotification({
        title: "Arquivo enviado",
        message: "Seu arquivo foi enviado com sucesso.",
        type: "success",
        category: "system",
      });
    },
    onError: (error: any) => {
      addNotification({
        title: "Erro",
        message: error?.response?.data?.message || "Falha ao enviar arquivo.",
        type: "error",
        category: "system",
      });
    },
  });

  const releaseBotMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/api/v1/tickets/${ticketId}/messages`, {
        releaseBot: true,
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-messages", ticketId] });
      addNotification({
        title: "Modo espera acionado",
        message: "O cliente foi avisado e o robô foi liberado.",
        type: "success",
        category: "system",
      });
    },
    onError: (error: any) => {
      addNotification({
        title: "Erro",
        message: error?.response?.data?.message || "Falha ao acionar modo espera.",
        type: "error",
        category: "system",
      });
    },
  });

  const createClienteManualMutation = useMutation({
    mutationFn: async (data: ClienteFormData) => {
      const res = await api.post("/api/v1/tickets/clientes/manual", {
        ...data,
        ticketId,
      });
      return res.data.data;
    },
    onSuccess: () => {
      refetchCliente();
      addNotification({
        title: "Cliente cadastrado",
        message: "Cliente cadastrado com sucesso!",
        type: "success",
        category: "system",
      });
    },
    onError: (error: any) => {
      addNotification({
        title: "Erro",
        message: error?.response?.data?.message || "Falha ao cadastrar cliente.",
        type: "error",
        category: "system",
      });
    },
  });

  const createClienteWhatsAppMutation = useMutation({
    mutationFn: async (nomeFallback?: string) => {
      const res = await api.post("/api/v1/tickets/clientes/whatsapp", {
        whatsappNumber,
        ticketId,
        nomeFallback: nomeFallback?.trim() || undefined,
      });
      return res.data.data;
    },
    onSuccess: () => {
      refetchCliente();
      addNotification({
        title: "Cliente cadastrado",
        message: "Cliente cadastrado automaticamente do WhatsApp!",
        type: "success",
        category: "system",
      });
      setFallbackNome("");
    },
    onError: (error: any) => {
      addNotification({
        title: "Erro",
        message: error?.response?.data?.message || "Falha ao cadastrar cliente do WhatsApp.",
        type: "error",
        category: "system",
      });
    },
  });

  const handleSend = () => {
    if (!canSend) return;
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate({ message: newMessage, isInternal });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!canSend) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canSend) return;
    const file = event.target.files?.[0];
    if (!file) return;
    sendFileMutation.mutate(file);
    event.target.value = "";
  };

  useEffect(() => {
    if (messages.length === 0) {
      lastMessageIdRef.current = null;
      return;
    }

    const lastMessage = messages[messages.length - 1];

    const scrollToBottom = (behavior: ScrollBehavior) => {
      const container = messagesContainerRef.current;
      if (!container) return;
      container.scrollTo({ top: container.scrollHeight, behavior });
    };

    if (!hasLoadedMessagesRef.current) {
      hasLoadedMessagesRef.current = true;
      lastMessageIdRef.current = lastMessage.id;
      requestAnimationFrame(() => scrollToBottom("auto"));
      return;
    }

    if (lastMessage.id !== lastMessageIdRef.current && lastMessage.senderType !== "USER") {
      requestAnimationFrame(() => scrollToBottom("smooth"));
    }

    lastMessageIdRef.current = lastMessage.id;
  }, [messages]);

  const getSenderColor = (senderType: string) => {
    switch (senderType) {
      case "USER":
        return "text-blue-400";
      case "CLIENT":
        return "text-green-400";
      case "BOT":
        return "text-purple-400";
      case "SYSTEM":
        return "text-yellow-400";
      default:
        return "text-slate-400";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Card de Cliente */}
      {cliente ? (
        <div className="mb-4 p-4 glass rounded-lg border border-slate-700">
          <div className="flex items-center gap-3">
            {cliente.whatsappProfilePicUrl ? (
              <img
                src={cliente.whatsappProfilePicUrl}
                alt={cliente.nome}
                className="w-12 h-12 rounded-full border-2 border-green-500"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center">
                <User className="h-6 w-6 text-slate-400" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-white font-semibold">{cliente.nome}</h3>
              <p className="text-sm text-slate-400">
                {isEmailTicket ? cliente.email || whatsappNumber : whatsappNumber}
              </p>
              {cliente.empresa && (
                <p className="text-xs text-slate-500">{cliente.empresa}</p>
              )}
            </div>
          </div>
        </div>
      ) : !isEmailTicket ? (
        <div className="mb-4 p-4 glass rounded-lg border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-amber-400" />
              <span className="text-sm text-amber-200">Cliente não cadastrado</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Input
              type="text"
              value={fallbackNome}
              onChange={(e) => setFallbackNome(e.target.value)}
              placeholder="Nome manual (fallback, opcional)"
              disabled={createClienteWhatsAppMutation.isPending}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2"
                disabled={createClienteManualMutation.isPending}
              >
                <UserPlus className="h-4 w-4" />
                Cadastrar Manualmente
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => createClienteWhatsAppMutation.mutate(fallbackNome)}
                className="flex-1 flex items-center justify-center gap-2"
                disabled={createClienteWhatsAppMutation.isPending}
              >
                <Zap className="h-4 w-4" />
                {createClienteWhatsAppMutation.isPending ? "Cadastrando..." : "Auto-cadastrar"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-dark/30 rounded-lg"
      >
        {isLoading ? (
          <div className="text-center text-slate-400 py-8">Carregando mensagens...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            Nenhuma mensagem ainda. Seja o primeiro a escrever!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.senderType === "USER"
                  ? "bg-blue-500/10 border-l-2 border-blue-500 ml-8"
                  : "bg-slate-700/50 border-l-2 border-slate-600"
              } ${msg.isInternal ? "border-yellow-500 bg-yellow-500/5" : ""}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-semibold ${getSenderColor(msg.senderType)}`}>
                  {msg.senderName}
                </span>
                {msg.isInternal && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Interna
                  </span>
                )}
                <span className="text-xs text-slate-500 ml-auto">
                  {new Date(msg.createdAt).toLocaleString("pt-BR")}
                </span>
              </div>
              {(() => {
                const token = parseAttachmentToken(msg.message);
                if (token) {
                  const attachment = attachmentsById.get(token.attachmentId);
                  const mimeType = attachment?.mimeType || "";
                  const fileName = attachment?.fileNameOriginal;
                  const isImage = token.isLegacyImage || mimeType.startsWith("image/");

                  if (isImage) {
                    return (
                      <ChatImage
                        ticketId={ticketId}
                        attachmentId={token.attachmentId}
                        fileName={fileName}
                      />
                    );
                  }

                  return (
                    <ChatFile
                      ticketId={ticketId}
                      attachmentId={token.attachmentId}
                      fileName={fileName || `anexo-${token.attachmentId}`}
                    />
                  );
                }
                const quoteData = resolveCotacaoFromMessage(msg.message, ticketCotacoes);
                const matchedCotacao = quoteData?.cotacao;
                const quoteLocale = quoteData?.parsed.locale ?? "pt-BR";
                const quoteCurrency = quoteData?.parsed.totalCurrency;

                return (
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-start">
                    <p className="text-sm text-slate-200 whitespace-pre-wrap flex-1 min-w-0">{msg.message}</p>
                    {matchedCotacao?.itens?.length ? (
                      <div className="w-full lg:w-80 shrink-0 rounded-md border border-cyan-500/30 bg-cyan-500/5 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-cyan-300 font-semibold">
                          Complemento da cotação
                        </p>
                        <p className="text-xs text-cyan-100/90 mb-2">
                          Itens do pedido (fora da mensagem enviada no chat)
                        </p>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {matchedCotacao.itens.map((item, index) => {
                            const unitAmount = formatItemAmount(
                              item.precoUnitario,
                              quoteLocale,
                              quoteCurrency
                            );
                            const totalAmount = formatItemAmount(
                              item.precoTotal,
                              quoteLocale,
                              quoteCurrency
                            );
                            return (
                              <div key={item.id || `${matchedCotacao.id}-${index}`} className="rounded bg-slate-900/40 px-2 py-1.5">
                                <p className="text-xs text-slate-100 font-medium break-words">
                                  {index + 1}. {item.descricao}
                                </p>
                                <p className="text-[11px] text-slate-300">
                                  Qtd: {item.quantidade} {item.unidade || "UN"}
                                </p>
                                {(unitAmount || totalAmount) && (
                                  <p className="text-[11px] text-slate-300">
                                    {unitAmount ? `Unitário: ${unitAmount}` : ""}
                                    {unitAmount && totalAmount ? " | " : ""}
                                    {totalAmount ? `Total: ${totalAmount}` : ""}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })()}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="rounded border-slate-600 bg-slate-700"
              disabled={!canSend}
            />
            <Lock className="h-3 w-3" />
            Mensagem interna (não visível ao cliente)
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => releaseBotMutation.mutate()}
            disabled={!canSend || releaseBotMutation.isPending}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            {releaseBotMutation.isPending ? "Enviando..." : "Em espera"}
          </Button>
        </div>
        <div className="flex gap-2">
          <input
            ref={imageInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => imageInputRef.current?.click()}
            disabled={!canSend || sendFileMutation.isPending}
            title="Enviar arquivo"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            disabled={!canSend || sendMessageMutation.isPending}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!canSend || !newMessage.trim() || sendMessageMutation.isPending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {!canSend && (
          <p className="text-xs text-amber-400">
            Para enviar mensagens, primeiro avance o ticket para Em atendimento.
          </p>
        )}
      </div>

      <CreateClienteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={(data) => createClienteManualMutation.mutateAsync(data)}
        whatsappNumber={whatsappNumber}
      />
    </div>
  );
}
