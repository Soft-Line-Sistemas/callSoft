type WhatsAppPrefillContext = {
  phone?: string | null;
  operatorName?: string | null;
  clientName?: string | null;
  ticketNumber?: number | string | null;
  requestSummary?: string | null;
  companyName?: string | null;
};

const FALLBACK_OPERATOR = "nosso time de atendimento";
const MAX_REQUEST_SUMMARY_LENGTH = 140;

function normalizeText(value?: string | null): string {
  return (value ?? "").trim().replace(/\s+/g, " ");
}

function truncateText(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trim()}...`;
}

export function buildWhatsAppPrefillMessage(context: Omit<WhatsAppPrefillContext, "phone">): string {
  const operatorName = normalizeText(context.operatorName) || FALLBACK_OPERATOR;
  const clientName = normalizeText(context.clientName);
  const companyName = normalizeText(context.companyName);
  const requestSummary = truncateText(normalizeText(context.requestSummary), MAX_REQUEST_SUMMARY_LENGTH);
  const ticketNumber = context.ticketNumber != null ? String(context.ticketNumber).trim() : "";

  const greeting = clientName ? `Olá, ${clientName}!` : "Olá!";
  const operatorLine = `Aqui é ${operatorName}, da equipe de atendimento da Interservice.`;

  const contextParts: string[] = [];
  if (ticketNumber) contextParts.push(`ticket #${ticketNumber}`);
  if (companyName) contextParts.push(`empresa ${companyName}`);
  const contextLine =
    contextParts.length > 0
      ? `Estou dando continuidade ao atendimento do ${contextParts.join(" - ")}.`
      : "Estou dando continuidade ao seu atendimento.";

  const requestLine = requestSummary ? `Solicitação: ${requestSummary}` : null;
  const closeLine = "Fico à disposição por aqui para seguirmos com o atendimento.";

  return [greeting, operatorLine, contextLine, requestLine, closeLine].filter(Boolean).join("\n");
}

export function buildWhatsAppSendUrl(context: WhatsAppPrefillContext): string | null {
  const digits = (context.phone ?? "").replace(/\D/g, "");
  if (!digits) return null;

  const message = buildWhatsAppPrefillMessage(context);
  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send/?phone=${digits}&text=${encodedMessage}&type=phone_number&app_absent=0`;
}
