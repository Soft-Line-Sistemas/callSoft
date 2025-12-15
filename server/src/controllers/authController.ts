import { Request, Response } from "express";
import { AuthService } from "../services/authService";

export class AuthController {
  private service = new AuthService();

  async login(req: Request, res: Response) {
    const { login, senha } = req.body;
    const result = await this.service.login(login, senha);
    if (!result) {
      return res.status(401).json({ error: "invalid_credentials" });
    }
    res.json(result);
  }
}
