import { Router } from "express";
import { TicketsController } from "../controllers/ticketsController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
const controller = new TicketsController();

router.post("/", (req, res) => controller.create(req, res));
router.get("/:pedido", (req, res) => controller.getByPedido(req, res));
router.get("/", authMiddleware, (req, res) => controller.list(req, res));
router.patch("/:pedido/status", authMiddleware, (req, res) => controller.updateStatus(req, res));

export default router;
