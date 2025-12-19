"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";

interface CreateClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ClienteFormData) => Promise<void>;
  whatsappNumber: string;
}

export interface ClienteFormData {
  whatsappNumber: string;
  nome: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  cpfCnpj?: string;
  endereco?: string;
  observacoes?: string;
}

export function CreateClienteModal({
  isOpen,
  onClose,
  onSave,
  whatsappNumber,
}: CreateClienteModalProps) {
  const [formData, setFormData] = useState<ClienteFormData>({
    whatsappNumber,
    nome: "",
    email: "",
    telefone: "",
    empresa: "",
    cpfCnpj: "",
    endereco: "",
    observacoes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ClienteFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Cadastrar Cliente</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                WhatsApp <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                placeholder="(00) 00000-0000"
                disabled
                className="bg-slate-700"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Nome Completo <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                placeholder="Nome do cliente"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">E-mail</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="cliente@exemplo.com"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Telefone</label>
              <Input
                type="text"
                value={formData.telefone}
                onChange={(e) => handleChange("telefone", e.target.value)}
                placeholder="(00) 0000-0000"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Empresa</label>
              <Input
                type="text"
                value={formData.empresa}
                onChange={(e) => handleChange("empresa", e.target.value)}
                placeholder="Nome da empresa"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">CPF/CNPJ</label>
              <Input
                type="text"
                value={formData.cpfCnpj}
                onChange={(e) => handleChange("cpfCnpj", e.target.value)}
                placeholder="000.000.000-00"
                disabled={isSubmitting}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Endereço</label>
              <Input
                type="text"
                value={formData.endereco}
                onChange={(e) => handleChange("endereco", e.target.value)}
                placeholder="Rua, número, bairro, cidade - UF"
                disabled={isSubmitting}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Observações</label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => handleChange("observacoes", e.target.value)}
                placeholder="Observações adicionais sobre o cliente"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-slate-dark border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500 min-h-[80px]"
              />
            </div>
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
              {isSubmitting ? "Salvando..." : "Salvar Cliente"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
