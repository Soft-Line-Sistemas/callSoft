"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { Smartphone, Clock, CheckCircle2, XCircle, RefreshCw, MessageCircle, LogOut } from "lucide-react";
import { useWhatsAppMessages, useWhatsAppQrStatus, useDisconnectWhatsApp } from "@/hooks/whatsapp";
import { useHealth } from "@/hooks/useHealth";
import { WhatsAppMessageStatus, type WhatsAppMessage } from "@/types/whatsapp.types";

export default function WhatsAppContatosPage() {
  const [manualQrText, setManualQrText] = useState<string>("");
  const { data: qrStatus, isLoading: isQrLoading } = useWhatsAppQrStatus();
  const disconnectMutation = useDisconnectWhatsApp();
  const { data: messageData, isLoading: isMessagesLoading } = useWhatsAppMessages({
    page: 1,
    pageSize: 10,
  });
  const { data: healthStatus } = useHealth();

  const qrText = manualQrText || qrStatus?.qr || "";
  const qrReady = qrStatus?.ready ?? false;
  const qrAvailable = qrStatus?.qrAvailable ?? false;
  const messages = messageData?.items ?? [];

  const whatsappStatus = healthStatus?.services?.whatsapp ?? "unknown";
  const statusMeta = {
    up: {
      label: "Serviço Ativo",
      description: healthStatus?.details?.whatsapp ?? "Sessão WhatsApp disponível.",
      className: "bg-green-500/10 border-green-500/20 text-green-400",
      dotClassName: "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]",
    },
    down: {
      label: "Serviço Instável",
      description: healthStatus?.details?.whatsapp ?? "Aguardando conexão do WhatsApp.",
      className: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      dotClassName: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]",
    },
    disabled: {
      label: "Serviço Desabilitado",
      description: healthStatus?.details?.whatsapp ?? "WhatsApp desativado na configuração.",
      className: "bg-slate-600/20 border-slate-600/30 text-slate-300",
      dotClassName: "bg-slate-500",
    },
    unknown: {
      label: "Status Indisponível",
      description: "Não foi possível obter o status do WhatsApp.",
      className: "bg-slate-600/20 border-slate-600/30 text-slate-300",
      dotClassName: "bg-slate-500",
    },
  };
  const statusInfo = statusMeta[whatsappStatus as keyof typeof statusMeta] ?? statusMeta.unknown;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleDisconnect = async () => {
    if (!confirm("Tem certeza que deseja desconectar o WhatsApp? Você precisará escanear o QR Code novamente.")) {
      return;
    }

    try {
      await disconnectMutation.mutateAsync();
      alert("WhatsApp desconectado com sucesso!");
    } catch (error) {
      alert("Erro ao desconectar WhatsApp: " + (error instanceof Error ? error.message : "Erro desconhecido"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Code Section */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-400" />
              Conexão WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center sm:flex-row gap-8">
              <div className="relative group">
                <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center p-2 shadow-lg shadow-green-500/10 transition-transform group-hover:scale-105">
                  {qrReady ? (
                    <div className="flex flex-col items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-8 h-8" />
                      <span className="text-sm font-medium">Sessão conectada</span>
                    </div>
                  ) : qrText ? (
                    <img
                      alt="QR Code WhatsApp"
                      className="w-full h-full object-contain"
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrText)}`}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <RefreshCw className={`w-8 h-8 ${isQrLoading ? "animate-spin" : ""}`} />
                      <span className="text-sm">Carregando QR...</span>
                    </div>
                  )}
                </div>
                {qrText && !qrReady && (
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-lg w-[200px]">
                    Pronto para escanear
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div>
                  <h3 className="text-lg font-medium text-slate-200 mb-1">Conecte seu dispositivo</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Abra o WhatsApp no seu celular, vá em <span className="text-white font-medium">Configurações {'>'} Aparelhos conectados</span> e escaneie o código ao lado.
                  </p>
                </div>
                
                {!qrReady && !qrAvailable && (
                  <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 space-y-2">
                    <p className="text-slate-400 text-xs">
                      Caso o QR Code não carregue automaticamente:
                    </p>
                    <Input
                      placeholder="Cole o código do QR aqui"
                      value={manualQrText}
                      onChange={(e) => setManualQrText(e.target.value)}
                      className="h-8 text-xs bg-slate-900/50"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status / Instructions Card could go here or just keep full width history below */}
        <Card variant="glass" className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-400" />
                        Status da Conexão
                    </div>
                    {qrReady && (
                        <Button
                            onClick={handleDisconnect}
                            disabled={disconnectMutation.isPending}
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            {disconnectMutation.isPending ? "Desconectando..." : "Desconectar"}
                        </Button>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className={`flex items-center gap-4 p-4 rounded-lg border ${statusInfo.className}`}>
                    <div className={`h-3 w-3 rounded-full ${statusInfo.dotClassName}`} />
                    <div>
                        <p className="font-medium">{statusInfo.label}</p>
                        <p className="text-sm opacity-80">{statusInfo.description}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-300">Dicas de conexão:</p>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                            Mantenha o celular conectado à internet
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                            Não feche o WhatsApp no celular durante o pareamento
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                            Recarregue a página se o QR Code expirar
                        </li>
                    </ul>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Connection History */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Histórico de Mensagens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {messages.map((message: WhatsAppMessage) => (
              <div 
                key={message.id}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    message.status === WhatsAppMessageStatus.SENT
                      ? 'bg-green-500/10 text-green-400'
                      : message.status === WhatsAppMessageStatus.FAILED
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {message.status === WhatsAppMessageStatus.SENT ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : message.status === WhatsAppMessageStatus.FAILED ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <RefreshCw className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-slate-200 font-medium flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-slate-400" />
                      {message.to}
                    </p>
                    <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">{message.message}</p>
                  </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                        <Clock className="w-3 h-3" />
                        {formatDate(message.sentAt ?? message.createdAt)}
                    </div>
                    <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full border ${
                        message.status === WhatsAppMessageStatus.SENT
                          ? 'border-green-500/20 text-green-400 bg-green-500/5'
                          : message.status === WhatsAppMessageStatus.FAILED
                            ? 'border-red-500/20 text-red-400 bg-red-500/5'
                            : 'border-amber-500/20 text-amber-400 bg-amber-500/5'
                    }`}>
                        {message.status === WhatsAppMessageStatus.SENT
                          ? 'Enviado'
                          : message.status === WhatsAppMessageStatus.FAILED
                            ? 'Falhou'
                            : 'Pendente'}
                    </span>
                </div>
              </div>
            ))}
            
            {!isMessagesLoading && messages.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                Nenhuma mensagem encontrada.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
