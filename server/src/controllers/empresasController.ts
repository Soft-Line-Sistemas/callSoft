import { Request, Response } from "express";
import { EmpresasService } from "../services/empresasService";

export class EmpresasController {
  private service = new EmpresasService();

  async create(req: Request, res: Response) {
    const {
      nomeFantasia,
      razaoSocial,
      cnpj,
      inscEstadual,
      im,
      cep,
      endereco,
      bairro,
      cidade,
      estado,
      telefone,
      telefoneSec,
      cabecalho,
      observacao
    } = req.body as any;
    if (!nomeFantasia || !razaoSocial) {
      return res.status(400).json({ error: "missing_fields" });
    }
    const created = await this.service.create({
      nomeFantasia,
      razaoSocial,
      cnpj,
      inscEstadual,
      im,
      cep,
      endereco,
      bairro,
      cidade,
      estado,
      telefone,
      telefoneSec,
      cabecalho,
      observacao
    });
    res.status(201).json(created);
  }
}
