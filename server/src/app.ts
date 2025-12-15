import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { logger } from "./config/logger";
import authRouter from "./routes/auth";
import ticketsRouter from "./routes/tickets";
import whatsappRouter from "./routes/whatsapp";
import empresasRouter from "./routes/empresas";
import cnpjRouter from "./routes/cnpj";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/tickets", ticketsRouter);
app.use("/whatsapp", whatsappRouter);
app.use("/empresas", empresasRouter);
app.use("/cnpj", cnpjRouter);

export default app;
