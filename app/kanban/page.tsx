"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Layout, MessageCircle, Megaphone, LifeBuoy, Calendar } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { KanbanListItem, KanbanTipo } from "@/types";

const tipoConfig: Record<KanbanTipo, { label: string; icon: React.ReactNode; bg: string; descricao: string }> = {
  PROJETO: {
    label: "Projeto",
    icon: <Layout size={22} />,
    bg: "from-blue-500 to-indigo-600",
    descricao: "Projetos internos ou externos com acompanhamento completo.",
  },
  CHAMADO: {
    label: "Chamado",
    icon: <MessageCircle size={22} />,
    bg: "from-purple-500 to-pink-500",
    descricao: "Solicitacoes ou tickets de atendimento e suporte.",
  },
  MARKETING: {
    label: "Marketing",
    icon: <Megaphone size={22} />,
    bg: "from-pink-500 to-rose-500",
    descricao: "Campanhas, conteudos e entregas de marketing.",
  },
  SUPORTE: {
    label: "Suporte",
    icon: <LifeBuoy size={22} />,
    bg: "from-yellow-400 to-orange-500",
    descricao: "Fluxo de suporte interno ou externo com prioridades.",
  },
  EVENTOS: {
    label: "Eventos",
    icon: <Calendar size={22} />,
    bg: "from-green-400 to-teal-500",
    descricao: "Planejamento e execucao de eventos.",
  },
};

const tipos = Object.keys(tipoConfig) as KanbanTipo[];

export default function KanbanListPage() {
  const [kanbans, setKanbans] = useState<KanbanListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTipo, setNewTipo] = useState<KanbanTipo>("CHAMADO");

  useEffect(() => {
    const fetchKanbans = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/v1/kanban");
        setKanbans(res.data?.data ?? []);
      } catch (err) {
        console.error("Erro ao buscar kanbans", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchKanbans();
  }, []);

  const handleCreateKanban = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await api.post("/api/v1/kanban", {
        titulo: newTitle.trim(),
        tipo: newTipo,
        referenciaId: null,
      });
      if (res.data?.data) {
        setKanbans([res.data.data, ...kanbans]);
      }
      if (!res.data?.data) {
        alert("Nao foi possivel criar o Kanban. Verifique suas permissoes.");
      }
      setNewTitle("");
      setNewTipo("CHAMADO");
    } catch (err) {
      console.error("Erro ao criar kanban", err);
      alert("Erro ao criar Kanban. Confira o console e as permissoes.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Header />

      <main className="ml-64 pt-16">
        <div className="p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-slide-up">
            <div>
              <h1 className="text-3xl font-bold text-white">Kanbans</h1>
              <p className="mt-2 text-slate-400">Organize projetos, chamados e campanhas em quadros visuais.</p>
            </div>
          </div>

          <Card className="animate-slide-up" variant="glass">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
              <div className="flex-1">
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Nome do novo Kanban..."
                />
              </div>
              <select
                value={newTipo}
                onChange={(e) => setNewTipo(e.target.value as KanbanTipo)}
                className="w-full lg:w-56 rounded-lg bg-slate-dark border border-slate-700 px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              >
                {tipos.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipoConfig[tipo].label}
                  </option>
                ))}
              </select>
              <Button variant="gradient" onClick={handleCreateKanban} isLoading={creating}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Kanban
              </Button>
            </div>
          </Card>

          {loading && <div className="text-center py-12 text-slate-400">Carregando Kanbans...</div>}
          {!loading && kanbans.length === 0 && (
            <div className="text-center py-12 text-slate-400">Nenhum Kanban encontrado.</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {kanbans.map((kanban) => {
              const config = tipoConfig[kanban.tipo];
              return (
                <Link key={kanban.id} href={`/kanban/${kanban.id}`}>
                  <Card variant="glass" hoverable className="h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${config.bg} text-white shadow-lg`}>
                        {config.icon}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">{config.label}</p>
                        <h2 className="text-lg font-semibold text-white">{kanban.titulo}</h2>
                      </div>
                    </div>
                    {kanban.descricao && <p className="text-sm text-slate-300 line-clamp-3">{kanban.descricao}</p>}
                  </Card>
                </Link>
              );
            })}
          </div>

          <Card variant="glass" className="animate-slide-up">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Legenda</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tipos.map((tipo) => {
                const config = tipoConfig[tipo];
                return (
                  <div key={tipo} className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${config.bg} text-white`}>
                      {config.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{config.label}</p>
                      <p className="text-xs text-slate-400">{config.descricao}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
