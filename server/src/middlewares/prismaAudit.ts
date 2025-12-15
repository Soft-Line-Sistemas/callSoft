import { prisma } from "../config/prisma";
type NextFn = (params: any) => Promise<any>;

export function enableServicoAuditMiddleware() {
  const middleware = async (params: any, next: NextFn) => {
    if (params.model === "Servico" && params.action === "update") {
      const pedido = (params.args?.where as any)?.pedido;
      const before = await prisma.servico.findUnique({ where: { pedido } });
      const result = await next(params);
      const now = new Date();
      const hora = now.toTimeString().slice(0, 5);
      await prisma.servicoHistorico.create({
        data: {
          pedidoId: pedido,
          statusAnterior: before?.status ?? null,
          statusNovo: result.status ?? null,
          historico: "middleware_update",
          data: now,
          hora,
          codUsu: result.codUsuUltimoEdit ?? null
        }
      });
      return result;
    }
    return next(params);
  };
  prisma.$use(middleware);
}
