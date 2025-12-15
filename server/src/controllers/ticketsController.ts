import { Request, Response } from "express";
import { TicketsService } from "../services/ticketsService";
import { verifyJwt } from "../utils/jwt";

export class TicketsController {
  private service = new TicketsService();

  async create(req: Request, res: Response) {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.replace("Bearer ", "") : undefined;
    const payload = token ? verifyJwt(token) : null;
    const codUsu = payload?.codUsu ?? null;
    const data = await this.service.create({
      contatoWpp: req.body.contato ?? null,
      solicitacao: req.body.solicitacao,
      codEmp: req.body.codEmp ?? null,
      codUsu
    });
    res.status(201).json(data);
  }

  async getByPedido(req: Request, res: Response) {
    const pedido = Number(req.params.pedido);
    const ticket = await this.service.getByPedido(pedido);
    if (!ticket) return res.status(404).json({ error: "not_found" });
    res.json({
      pedido: ticket.pedido,
      status: ticket.status,
      data: ticket.data,
      horaProposta: ticket.horaProposta ?? null
    });
  }

  async list(req: Request, res: Response) {
    const status = req.query.status as string | undefined;
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;
    const codEmp = req.query.codEmp ? Number(req.query.codEmp) : undefined;
    const user = (req as any).user as { isAdmin: boolean };
    const result = await this.service.list({ status, dateFrom, dateTo, codEmp, isAdmin: user.isAdmin });
    res.json(result);
  }

  async updateStatus(req: Request, res: Response) {
    const pedido = Number(req.params.pedido);
    const { status, descricao } = req.body as { status: string; descricao?: string };
    const user = (req as any).user as { codUsu: number };
    const updated = await this.service.updateStatus(pedido, status, descricao ?? "status_update", user.codUsu);
    res.json(updated);
  }
}
