import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export class ServicosRepository {
  async create(
    tx: Prisma.TransactionClient,
    data: {
      data: Date;
      contato: string | null;
      tellResp: string | null;
      responsavel: string | null;
      solicitacao: string;
      status: string;
      canalOrigem?: string;
      horaProposta: string | null;
      codEmp: number | null;
      codUsuUltimoEdit: number | null;
    }
  ) {
    return tx.servico.create({ data: data as any });
  }
  async findByPedido(pedido: number) {
    return prisma.servico.findUnique({ where: { pedido } });
  }
  async findByPedidoTx(tx: Prisma.TransactionClient, pedido: number) {
    return tx.servico.findUnique({ where: { pedido } });
  }
  async updateStatus(tx: Prisma.TransactionClient, pedido: number, status: string, codUsu: number) {
    return tx.servico.update({ where: { pedido }, data: { status, codUsuUltimoEdit: codUsu } });
  }
  async list(params: { status?: string; dateFrom?: string; dateTo?: string; codEmp?: number }) {
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.codEmp !== undefined) where.codEmp = params.codEmp;
    if (params.dateFrom || params.dateTo) {
      where.data = {};
      if (params.dateFrom) where.data.gte = new Date(params.dateFrom);
      if (params.dateTo) where.data.lte = new Date(params.dateTo);
    }
    return prisma.servico.findMany({ where, orderBy: { data: "desc" } });
  }
}
