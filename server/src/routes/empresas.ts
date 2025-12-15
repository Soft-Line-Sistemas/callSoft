import { Router } from "express";
import { EmpresasController } from "../controllers/empresasController";

const router = Router();
const controller = new EmpresasController();

router.post("/", (req, res) => controller.create(req, res));

export default router;
