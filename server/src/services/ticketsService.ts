import { ServicosRepository } from "../repositories/servicosRepository";
import { HistoricoRepository } from "../repositories/historicoRepository";
import { NotificationService } from "./notificationService";
import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

type CreateTicketInput = { contatoWpp?: string | null; contatoNome?: string | null; solicitacao: string; codEmp?: number | null; canalOrigem?: string; codUsu?: number | null };

export class TicketsService {
  private repo = new ServicosRepository();
  private hisRepo = new HistoricoRepository();
  private notificationService = new NotificationService();

  async create(input: CreateTicketInput) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const now = new Date();
      const hora = now.toTimeString().slice(0, 5);
      const ticket = await this.repo.create(tx, {
        data: now,
        contato: input.contatoWpp ?? null,
        tellResp: null,
        responsavel: input.contatoNome ?? null,
        solicitacao: input.solicitacao,
        status: "Solicitado",
        canalOrigem: input.canalOrigem ?? "WEB",
        horaProposta: null,
        codEmp: input.codEmp ?? null,
        codUsuUltimoEdit: input.codUsu ?? null
      });
      await this.hisRepo.insert(tx, {
        pedidoId: ticket.pedido,
        statusAnterior: null,
        statusNovo: "Solicitado",
        historico: "criado",
        data: now,
        hora,
        codUsu: input.codUsu ?? null
      });
      return ticket;
    });
  }

  async getByPedido(pedido: number) {
    return this.repo.findByPedido(pedido);
  }

  async list(params: { status?: string; dateFrom?: string; dateTo?: string; codEmp?: number; isAdmin: boolean }) {
    return this.repo.list({
      status: params.status,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      codEmp: params.isAdmin ? params.codEmp : params.codEmp
    });
  }

  async updateStatus(pedido: number, status: string, descricao: string, codUsu: number) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const now = new Date();
      const hora = now.toTimeString().slice(0, 5);
      const current = await this.repo.findByPedidoTx(tx, pedido);
      if (!current) throw new Error("not_found");
      const updated = await this.repo.updateStatus(tx, pedido, status, codUsu);
      await this.hisRepo.insert(tx, {
        pedidoId: pedido,
        statusAnterior: current.status,
        statusNovo: updated.status,
        historico: descricao,
        data: now,
        hora,
        codUsu
      });

      // Dispara notificação passiva ao cliente baseado no canal de origem
      await this.notificationService.notifyStatusChange(
        {
          pedido: updated.pedido,
          contato: updated.contato,
          canalOrigem: (updated as any).canalOrigem || "WEB",
          status: updated.status
        },
        current.status,
        updated.status
      );

      return updated;
    });
  }
}
