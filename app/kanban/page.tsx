"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Layout,
  MessageCircle,
  Megaphone,
  LifeBuoy,
  Calendar,
  Pin,
  List,
  LayoutGrid,
  Pencil,
  Trash2,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { KanbanListItem, KanbanTipo } from "@/types";
import { useAuthStore } from "@/store/authStore";

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
const VIEW_MODE_KEY = "kanban:viewMode";
const PAGE_SIZE = 12;

export default function KanbanListPage() {
  const [kanbans, setKanbans] = useState<KanbanListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTipo, setNewTipo] = useState<KanbanTipo>("CHAMADO");
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState<KanbanTipo | "">("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingKanban, setEditingKanban] = useState<KanbanListItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isResponsaveisOpen, setIsResponsaveisOpen] = useState(false);
  const [selectedKanban, setSelectedKanban] = useState<KanbanListItem | null>(null);
  const userPermissions = useAuthStore((state) => state.user?.permissions);
  const canDeleteKanban = hasPermission(userPermissions, "kanban:delete");

  useEffect(() => {
    const fetchKanbans = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/v1/kanban", {
          params: {
            page,
            pageSize: PAGE_SIZE,
            search: search || undefined,
            tipo: filterTipo || undefined,
          },
        });
        const data = res.data?.data;
        setKanbans(data?.items ?? []);
        setTotal(data?.total ?? 0);
      } catch (err) {
        console.error("Erro ao buscar kanbans", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchKanbans();
  }, [page, search, filterTipo]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedView = window.localStorage.getItem(VIEW_MODE_KEY);
    if (savedView === "list" || savedView === "grid") setViewMode(savedView);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

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

  const togglePinned = async (kanban: KanbanListItem) => {
    const nextPinned = !kanban.pinned;
    setKanbans((prev) =>
      prev.map((item) => (item.id === kanban.id ? { ...item, pinned: nextPinned } : item)),
    );
    try {
      await api.patch(`/api/v1/kanban/${kanban.id}`, { pinned: nextPinned });
    } catch (err) {
      console.error("Erro ao fixar kanban", err);
      setKanbans((prev) =>
        prev.map((item) => (item.id === kanban.id ? { ...item, pinned: kanban.pinned } : item)),
      );
    }
  };

  const openEditModal = (kanban: KanbanListItem) => {
    setEditingKanban(kanban);
    setEditTitle(kanban.titulo);
    setIsEditOpen(true);
  };

  const saveKanbanTitle = async () => {
    if (!editingKanban) return;
    const title = editTitle.trim();
    if (!title) return;
    try {
      const res = await api.patch(`/api/v1/kanban/${editingKanban.id}`, { titulo: title });
      const updated = res.data?.data;
      setKanbans((prev) =>
        prev.map((item) => (item.id === editingKanban.id ? { ...item, titulo: updated.titulo } : item)),
      );
      setIsEditOpen(false);
      setEditingKanban(null);
    } catch (err) {
      console.error("Erro ao renomear kanban", err);
    }
  };

  const handleDeleteKanban = async (kanban: KanbanListItem) => {
    if (!confirm(`Excluir o Kanban "${kanban.titulo}"? Essa acao remove todas as tarefas.`)) return;
    try {
      await api.delete(`/api/v1/kanban/${kanban.id}`);
      setKanbans((prev) => prev.filter((item) => item.id !== kanban.id));
      setTotal((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Erro ao excluir kanban", err);
      alert("Nao foi possivel excluir o Kanban. Verifique suas permissoes.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openResponsaveisModal = (kanban: KanbanListItem) => {
    setSelectedKanban(kanban);
    setIsResponsaveisOpen(true);
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
            <div className="flex flex-col gap-4">
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

              <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
                <div className="flex-1">
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Pesquisar Kanban..."
                  />
                </div>
                <select
                  value={filterTipo}
                  onChange={(e) => {
                    setFilterTipo(e.target.value as KanbanTipo | "");
                    setPage(1);
                  }}
                  className="w-full lg:w-56 rounded-lg bg-slate-dark border border-slate-700 px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="">Todos os tipos</option>
                  {tipos.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipoConfig[tipo].label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "gradient" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    title="Visualizacao em grade"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "gradient" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    title="Visualizacao em lista"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {loading && <div className="text-center py-12 text-slate-400">Carregando Kanbans...</div>}
          {!loading && kanbans.length === 0 && (
            <div className="text-center py-12 text-slate-400">Nenhum Kanban encontrado.</div>
          )}

          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {kanbans.map((kanban) => {
              const config = tipoConfig[kanban.tipo];
              const responsaveis = kanban.responsaveis ?? [];
              const visibleResponsaveis = responsaveis.slice(0, 3);
              return (
                <Card key={kanban.id} variant="glass" hoverable className="h-full">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/kanban/${kanban.id}`} className="flex-1">
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
                      {visibleResponsaveis.length > 0 && (
                        <div className="mt-4 space-y-1 text-xs text-slate-300">
                          {visibleResponsaveis.map((resp) => (
                            <div key={resp.userId} className="truncate">
                              {resp.user?.email ?? "Usuario"}
                            </div>
                          ))}
                        </div>
                      )}
                      {responsaveis.length > 3 && (
                        <button
                          type="button"
                          className="mt-2 text-xs text-slate-400 hover:text-white"
                          onClick={(event) => {
                            event.preventDefault();
                            openResponsaveisModal(kanban);
                          }}
                        >
                          Ver mais...
                        </button>
                      )}
                    </Link>
                    <div className="flex flex-col gap-2">
                      <button
                        className={`rounded-full p-2 border border-white/10 hover:border-purple-400/50 ${
                          kanban.pinned ? "bg-purple-500/20 text-purple-200" : "text-slate-300"
                        }`}
                        onClick={() => togglePinned(kanban)}
                        title={kanban.pinned ? "Desafixar" : "Fixar"}
                      >
                        <Pin className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded-full p-2 border border-white/10 text-slate-300 hover:border-purple-400/50"
                        onClick={() => openEditModal(kanban)}
                        title="Renomear"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {canDeleteKanban && (
                        <button
                          className="rounded-full p-2 border border-white/10 text-slate-300 hover:border-red-400/50 hover:text-red-300"
                          onClick={() => handleDeleteKanban(kanban)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Pagina {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Proxima
              </Button>
            </div>
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

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-slate-900 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle>Renomear Kanban</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Novo nome do Kanban"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveKanbanTitle}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isResponsaveisOpen} onOpenChange={setIsResponsaveisOpen}>
        <DialogContent className="bg-slate-900 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle>Responsaveis</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {(selectedKanban?.responsaveis ?? []).map((resp) => {
              const email = resp.user?.email ?? "Usuario";
              const initials = email.trim().charAt(0).toUpperCase() || "?";
              return (
                <div key={resp.userId} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                    {resp.user?.profilePhotoUrl ? (
                      <img
                        src={resp.user.profilePhotoUrl}
                        alt={email}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-slate-200">{initials}</span>
                    )}
                  </div>
                  <div className="text-sm text-slate-200">{email}</div>
                </div>
              );
            })}
            {(selectedKanban?.responsaveis ?? []).length === 0 && (
              <div className="text-sm text-slate-400">Nenhum responsavel definido.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
