"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { empresasApi, type EmpresaResponse } from "@/services/empresas.service";
import { usuariosApi, type UsuarioResponse } from "@/services/usuarios.service";
import { useQuery } from "@tanstack/react-query";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    contatoWpp: string;
    solicitacao: string;
    empresa?: string;
    responsavel?: string;
    prioridade?: string;
    accessKey?: string;
  }) => Promise<void>;
}

const PRIORIDADE_OPTIONS = ["BAIXA", "NORMAL", "ALTA", "URGENTE"];

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  const ddd = digits.slice(0, 2);
  const part1 = digits.length > 10 ? digits.slice(2, 7) : digits.slice(2, 6);
  const part2 = digits.length > 10 ? digits.slice(7, 11) : digits.slice(6, 10);
  if (!ddd) return digits;
  if (!part1) return `(${ddd}`;
  if (!part2) return `(${ddd}) ${part1}`;
  return `(${ddd}) ${part1}-${part2}`;
}

export function CreateTicketModal({ isOpen, onClose, onCreate }: CreateTicketModalProps) {
  const [telefone, setTelefone] = useState("");
  const [solicitacao, setSolicitacao] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [prioridade, setPrioridade] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: empresas = [], isLoading: isLoadingEmpresas } = useQuery<EmpresaResponse[]>({
    queryKey: ["empresas"],
    queryFn: () => empresasApi.list(),
    enabled: isOpen,
  });

  const { data: usuarios = [], isLoading: isLoadingUsuarios } = useQuery<UsuarioResponse[]>({
    queryKey: ["usuarios"],
    queryFn: () => usuariosApi.list(),
    enabled: isOpen,
  });

  const empresaOptions = useMemo(() => {
    return empresas
      .map((item) => item.nomeFantasia || item.razaoSocial)
      .filter(Boolean) as string[];
  }, [empresas]);

  const responsavelOptions = useMemo(() => {
    return usuarios
      .filter((user) => !user.inativo || user.inativo === "0")
      .map((user) => user.login);
  }, [usuarios]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = telefone.replace(/\D/g, "");
    if (!digits || solicitacao.trim().length === 0) return;

    setIsSubmitting(true);
    try {
      await onCreate({
        contatoWpp: digits,
        solicitacao: solicitacao.trim(),
        empresa: empresa || undefined,
        responsavel: responsavel || undefined,
        prioridade: prioridade || undefined,
        accessKey: accessKey || undefined,
      });
      setTelefone("");
      setSolicitacao("");
      setEmpresa("");
      setResponsavel("");
      setPrioridade("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass rounded-xl p-6 w-full max-w-lg shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Criar ticket manual</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Telefone *</label>
              <Input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(formatPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Chave de Acesso *</label>
              <Input
                type="text"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="Digite a chave de segurança"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Solicitação</label>
            <textarea
              rows={3}
              value={solicitacao}
              onChange={(e) => setSolicitacao(e.target.value)}
              className="w-full rounded-lg bg-slate-dark border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              placeholder="Descreva o atendimento..."
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Empresa</label>
            <select
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className="w-full rounded-lg bg-slate-dark border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              disabled={isSubmitting || isLoadingEmpresas}
            >
              <option value="">Selecione a empresa</option>
              {empresaOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Responsável</label>
            <select
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              className="w-full rounded-lg bg-slate-dark border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              disabled={isSubmitting || isLoadingUsuarios}
            >
              <option value="">Selecione o responsável</option>
              {responsavelOptions.map((login) => (
                <option key={login} value={login}>
                  {login}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Prioridade</label>
            <select
              value={prioridade}
              onChange={(e) => setPrioridade(e.target.value)}
              className="w-full rounded-lg bg-slate-dark border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              disabled={isSubmitting}
            >
              <option value="">Selecione a prioridade</option>
              {PRIORIDADE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar ticket"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
