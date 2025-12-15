import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export class UsuariosRepository {
  async findByLogin(login: string) {
    return prisma.usuario.findUnique({ where: { login } });
  }
  async create(tx: Prisma.TransactionClient, data: { login: string; senhaHash: string; isAdmin?: boolean }) {
    return tx.usuario.create({ data });
  }
}
