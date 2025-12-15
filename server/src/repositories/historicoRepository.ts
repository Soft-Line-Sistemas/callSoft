import { Prisma } from "@prisma/client";

export class HistoricoRepository {
  async insert(
    tx: Prisma.TransactionClient,
    data: {
      pedidoId: number;
      statusAnterior: string | null;
      statusNovo: string | null;
      historico: string;
      data: Date;
      hora: string;
      codUsu: number | null;
    }
  ) {
    return tx.servicoHistorico.create({ data });
  }
}
