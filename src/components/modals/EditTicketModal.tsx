"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { empresasApi, type EmpresaResponse } from "@/services/empresas.service";
import { usuariosApi, type UsuarioResponse } from "@/services/usuarios.service";
import { api } from "@/lib/api";

interface EditTicketModalProps {
  ticket: {
    id: string;
    pedido: number;
    empresa?: string | null;
    responsavel?: string | null;
    prioridade?: string | null;
    contatoWpp?: string | null;
    cliente?: {
      nome: string;
    } | null;
  };
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { empresa?: string; responsavel?: string; prioridade?: string; contatoNome?: string }) => Promise<void>;
}

const PRIORIDADE_OPTIONS = ["BAIXA", "NORMAL", "ALTA", "URGENTE"];

export function EditTicketModal({ ticket, isOpen, onClose, onSave }: EditTicketModalProps) {
  const [empresa, setEmpresa] = useState(ticket.empresa ?? "");
  const [responsavel, setResponsavel] = useState(ticket.responsavel ?? "");
  const [prioridade, setPrioridade] = useState(ticket.prioridade ?? "");
  const [contatoNome, setContatoNome] = useState(ticket.cliente?.nome ?? "");
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
  const { data: cliente } = useQuery<{ nome: string } | null>({
    queryKey: ["ticket-cliente", ticket.id],
    queryFn: async () => {
      try {
        const res = await api.get(`/api/v1/tickets/${ticket.id}/cliente`);
        return res.data.data;
      } catch (error: any) {
        if (error?.response?.status === 404) return null;
        throw error;
      }
    },
    enabled: isOpen,
  });

  const empresaOptions = useMemo(() => {
    const names = empresas
      .map((item) => item.nomeFantasia || item.razaoSocial)
      .filter(Boolean) as string[];
    if (ticket.empresa && !names.includes(ticket.empresa)) {
      return [ticket.empresa, ...names];
    }
    return names;
  }, [empresas, ticket.empresa]);

  const responsavelOptions = useMemo(() => {
    const activeUsers = usuarios
      .filter((user) => !user.inativo || user.inativo === "0")
      .map((user) => user.login);
    if (ticket.responsavel && !activeUsers.includes(ticket.responsavel)) {
      return [ticket.responsavel, ...activeUsers];
    }
    return activeUsers;
  }, [usuarios, ticket.responsavel]);

  useEffect(() => {
    if (!isOpen) return;
    setEmpresa(ticket.empresa ?? "");
    setResponsavel(ticket.responsavel ?? "");
    setPrioridade(ticket.prioridade ?? "");
    // Initialize with cliente.nome from props if available, otherwise wait for async fetch or fallback to empty
    if (ticket.cliente?.nome) {
        setContatoNome(ticket.cliente.nome);
    }
  }, [isOpen, ticket.empresa, ticket.responsavel, ticket.prioridade, ticket.cliente]);

  useEffect(() => {
    if (!isOpen) return;
    if (cliente?.nome && !contatoNome) {
      setContatoNome(cliente.nome);
    }
  }, [cliente?.nome, contatoNome, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        empresa: empresa || undefined,
        responsavel: responsavel || undefined,
        prioridade: prioridade || undefined,
        contatoNome: contatoNome || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass rounded-xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Editar Ticket #{ticket.pedido}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-slate-300 mb-1">Contato</label>
            <Input
              type="text"
              value={contatoNome}
              onChange={(e) => setContatoNome(e.target.value)}
              placeholder="Nome do contato"
              disabled={isSubmitting}
            />
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
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
