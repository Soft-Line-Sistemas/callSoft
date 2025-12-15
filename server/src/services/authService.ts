import { UsuariosRepository } from "../repositories/usuariosRepository";
import bcrypt from "bcrypt";
import { signJwt } from "../utils/jwt";

// Whitelist de domínios autorizados (hardcoded por enquanto)
// TODO: Mover para configuração ou banco de dados
const ALLOWED_DOMAINS = ["callsoft.com.br", "softline.com.br"];

export class AuthService {
  private repo = new UsuariosRepository();

  async login(login: string, senha: string) {
    const user = await this.repo.findByLogin(login);
    if (!user) return null;

    // Validação de domínio do e-mail
    if (user.email) {
      const domain = user.email.split("@")[1]?.toLowerCase();
      if (domain && !ALLOWED_DOMAINS.includes(domain)) {
        return { error: "domain_not_allowed", message: "Domínio de e-mail não autorizado" };
      }
    }

    const ok = await bcrypt.compare(senha, user.senhaHash);
    if (!ok) return null;
    const isAdmin = user.op91 === "X";
    const token = signJwt({ codUsu: user.codUsu, isAdmin });
    return { token, user: { codUsu: user.codUsu, login: user.login, isAdmin } };
  }
}

