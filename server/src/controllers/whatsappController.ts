import { Request, Response } from "express";
import { WhatsAppService } from "../services/whatsappService";

export class WhatsAppController {
  private service = new WhatsAppService();

  async webhook(req: Request, res: Response) {
    const { message, contactId, contactName, pedido } = req.body as { message: string; contactId: string; contactName?: string; pedido?: number };
    const result = await this.service.processWebhook({ message, contactId, contactName, pedido });
    res.json(result);
  }
}
