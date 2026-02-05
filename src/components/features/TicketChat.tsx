"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Send, Lock, UserPlus, Zap, User, ImagePlus, Clock } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";
import { CreateClienteModal, type ClienteFormData } from "@/components/modals/CreateClienteModal";

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
const IMAGE_MESSAGE_SUFFIX = "]]";

function getImageAttachmentId(message: string): string | null {
  const trimmed = message.trim();
  if (!trimmed.startsWith(IMAGE_MESSAGE_PREFIX) || !trimmed.endsWith(IMAGE_MESSAGE_SUFFIX)) {
    return null;
  }
  const inner = trimmed.slice(IMAGE_MESSAGE_PREFIX.length, -IMAGE_MESSAGE_SUFFIX.length).trim();
  return inner.length > 0 ? inner : null;
}

function ChatImage({ ticketId, attachmentId }: { ticketId: string; attachmentId: string }) {
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
      alt="Imagem enviada"
      className="max-w-full max-h-48 w-auto rounded-md border border-slate-600 object-contain"
    />
  );
}

export function TicketChat({ ticketId, whatsappNumber, canSend = true }: TicketChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const hasLoadedMessagesRef = useRef(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

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

  const sendImageMutation = useMutation({
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
      addNotification({
        title: "Imagem enviada",
        message: "Sua imagem foi enviada com sucesso.",
        type: "success",
        category: "system",
      });
    },
    onError: (error: any) => {
      addNotification({
        title: "Erro",
        message: error?.response?.data?.message || "Falha ao enviar imagem.",
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
    mutationFn: async () => {
      const res = await api.post("/api/v1/tickets/clientes/whatsapp", {
        whatsappNumber,
        ticketId,
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

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canSend) return;
    const file = event.target.files?.[0];
    if (!file) return;
    sendImageMutation.mutate(file);
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
              <p className="text-sm text-slate-400">{whatsappNumber}</p>
              {cliente.empresa && (
                <p className="text-xs text-slate-500">{cliente.empresa}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-4 glass rounded-lg border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-amber-400" />
              <span className="text-sm text-amber-200">Cliente não cadastrado</span>
            </div>
          </div>
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
              onClick={() => createClienteWhatsAppMutation.mutate()}
              className="flex-1 flex items-center justify-center gap-2"
              disabled={createClienteWhatsAppMutation.isPending}
            >
              <Zap className="h-4 w-4" />
              {createClienteWhatsAppMutation.isPending ? "Cadastrando..." : "Auto-cadastrar"}
            </Button>
          </div>
        </div>
      )}

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
                const attachmentId = getImageAttachmentId(msg.message);
                if (attachmentId) {
                  return <ChatImage ticketId={ticketId} attachmentId={attachmentId} />;
                }
                return (
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">{msg.message}</p>
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
            accept="image/png,image/jpeg"
            onChange={handleImageSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => imageInputRef.current?.click()}
            disabled={!canSend || sendImageMutation.isPending}
            title="Enviar imagem"
          >
            <ImagePlus className="h-4 w-4" />
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
