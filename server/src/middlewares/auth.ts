import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "unauthorized" });
  const token = header.replace("Bearer ", "");
  const payload = verifyJwt(token);
  if (!payload) return res.status(401).json({ error: "unauthorized" });
  (req as any).user = payload;
  next();
}
