import { EmpresasRepository } from "../repositories/empresasRepository";
import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

type CreateEmpresaInput = {
  nomeFantasia: string;
  razaoSocial: string;
  cnpj?: string | null;
  inscEstadual?: string | null;
  im?: string | null;
  cep?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  telefone?: string | null;
  telefoneSec?: string | null;
  cabecalho?: string | null;
  observacao?: string | null;
};

export class EmpresasService {
  private repo = new EmpresasRepository();

  async create(input: CreateEmpresaInput) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await this.repo.create(tx, { ...input, ativo: true } as any);
      return created;
    });
  }
}
