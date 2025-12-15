import { Router } from "express";
import { WhatsAppController } from "../controllers/whatsappController";

const router = Router();
const controller = new WhatsAppController();

router.post("/webhook", (req, res) => controller.webhook(req, res));

export default router;
