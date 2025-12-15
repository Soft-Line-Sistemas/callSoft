import { TicketsService } from "./ticketsService";

type WebhookInput = { message: string; contactId: string; pedido?: number };

export class WhatsAppService {
  private tickets = new TicketsService();

  async processWebhook(input: WebhookInput) {
    const msg = (input.message || "").trim().toLowerCase();
    if (msg === "oi" || msg === "menu") {
      return { menu: ["1) Solicitar", "2) Consultar", "3) Falar com Operador"] };
    }
    if (msg.startsWith("1")) {
      const created = await this.tickets.create({ contatoWpp: input.contactId, solicitacao: input.message, canalOrigem: "WHATSAPP" });
      return { pedido: created.pedido, status: created.status };
    }
    if (msg.startsWith("2")) {
      if (!input.pedido) return { error: "pedido_required" };
      const ticket = await this.tickets.getByPedido(input.pedido);
      if (!ticket) return { error: "not_found" };
      return { pedido: ticket.pedido, status: ticket.status, horaProposta: ticket.horaProposta ?? null };
    }
    if (msg.startsWith("3")) {
      if (!input.pedido) return { error: "pedido_required" };
      const updated = await this.tickets.updateStatus(input.pedido, "Pendente Atendimento", "pendente_atendimento", 0);
      return { pedido: updated.pedido, status: updated.status };
    }
    return { message: "use 'Oi' para menu" };
  }
}
