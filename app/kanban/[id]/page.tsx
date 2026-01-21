"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
  CalendarDays,
  Check,
  Clock,
  LifeBuoy,
  Layout,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Plus,
  Users,
  X,
  Calendar,
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
import { Kanban, KanbanSubtarefa, KanbanTarefa, KanbanTipo } from "@/types";
import { useAuthStore } from "@/store/authStore";

const tipoConfig: Record<KanbanTipo, { label: string; icon: React.ReactNode; bg: string }> = {
  PROJETO: { label: "Projeto", icon: <Layout size={18} />, bg: "from-blue-500 to-indigo-600" },
  CHAMADO: { label: "Chamado", icon: <MessageCircle size={18} />, bg: "from-purple-500 to-pink-500" },
  MARKETING: { label: "Marketing", icon: <Megaphone size={18} />, bg: "from-pink-500 to-rose-500" },
  SUPORTE: { label: "Suporte", icon: <LifeBuoy size={18} />, bg: "from-yellow-400 to-orange-500" },
  EVENTOS: { label: "Eventos", icon: <Calendar size={18} />, bg: "from-green-400 to-teal-500" },
};

const apiInstance = {
  async fetchKanban(kanbanId: string) {
    const res = await api.get(`/api/v1/kanban/${kanbanId}`);
    return res.data?.data as Kanban;
  },
  async createTarefa(kanbanId: string, colunaId: string, payload: Partial<KanbanTarefa>) {
    const res = await api.post(`/api/v1/kanban/${kanbanId}/task`, { colunaId, ...payload });
    return res.data?.data as KanbanTarefa;
  },
  async moveTarefa(tarefaId: string, colunaId: string) {
    await api.patch(`/api/v1/task/${tarefaId}/mover`, { colunaId });
  },
  async addComentario(tarefaId: string, conteudo: string, userId: string) {
    const res = await api.post(`/api/v1/task/${tarefaId}/comentario`, { userId, conteudo });
    return res.data?.data;
  },
  async updateTarefa(tarefaId: string, payload: Partial<KanbanTarefa>) {
    const res = await api.patch(`/api/v1/task/${tarefaId}`, payload);
    return res.data?.data as KanbanTarefa;
  },
  async deleteTarefa(tarefaId: string) {
    await api.delete(`/api/v1/task/${tarefaId}`);
  },
};

const moveItemBetween = (
  sourceArr: KanbanTarefa[],
  destArr: KanbanTarefa[],
  sourceIndex: number,
  destIndex: number,
  destColId: string
) => {
  const item = sourceArr[sourceIndex];
  const newSource = [...sourceArr];
  newSource.splice(sourceIndex, 1);
  const newDest = [...destArr];
  newDest.splice(destIndex, 0, { ...item, colunaId: destColId });
  return { newSource, newDest, moved: { ...item, colunaId: destColId } };
};

const ACTION_LABELS: Record<string, string> = {
  KANBAN_CREATE: "Kanban criado",
  KANBAN_UPDATE: "Kanban atualizado",
  KANBAN_DELETE: "Kanban excluido",
  KANBAN_TASK_CREATE: "Tarefa criada",
  KANBAN_TASK_UPDATE: "Tarefa atualizada",
  KANBAN_TASK_MOVE: "Tarefa movida",
  KANBAN_TASK_DELETE: "Tarefa excluida",
  KANBAN_COMMENT_ADD: "Comentario adicionado",
  KANBAN_SUBTASK_CREATE: "Subtarefa criada",
  KANBAN_SUBTASK_UPDATE: "Subtarefa atualizada",
  KANBAN_SUBTASK_DELETE: "Subtarefa excluida",
  KANBAN_RESPONSAVEL_ADD: "Responsavel adicionado",
  KANBAN_RESPONSAVEL_REMOVE: "Responsavel removido",
  KANBAN_SCHEDULE_TASK_CREATE: "Agenda: tarefa criada",
  KANBAN_SCHEDULE_TASK_UPDATE: "Agenda: tarefa atualizada",
  KANBAN_SCHEDULE_TASK_DELETE: "Agenda: tarefa excluida",
};

const toLabel = (value?: string | null) => (value ? `"${value}"` : "");

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
};

const truncate = (value: string, max = 80) => {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 3)}...`;
};

const parseDetails = (raw?: string | null) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const formatLogDetails = (action: string, details: Record<string, any> | null, kanban: Kanban | null) => {
  if (!details) return "-";

  const colLabel = details.colunaId && kanban?.colunas?.find((c) => c.id === details.colunaId)?.titulo;
  const dataInicio = formatDate(details.dataInicio);
  const dataFim = formatDate(details.dataFim);

  switch (action) {
    case "KANBAN_CREATE":
      return [details.titulo ? `Kanban ${toLabel(details.titulo)}` : "", details.tipo ? `(${details.tipo})` : ""]
        .filter(Boolean)
        .join(" ")
        .trim() || "-";
    case "KANBAN_UPDATE": {
      const parts = [];
      if (details.titulo) parts.push(`Titulo: ${toLabel(details.titulo)}`);
      if (details.descricao) parts.push(`Descricao: ${toLabel(details.descricao)}`);
      if (typeof details.pinned === "boolean") parts.push(details.pinned ? "Fixado" : "Desafixado");
      return parts.join(" • ") || "-";
    }
    case "KANBAN_TASK_CREATE":
    case "KANBAN_TASK_DELETE":
      return details.titulo ? `Tarefa ${toLabel(details.titulo)}` : "-";
    case "KANBAN_TASK_MOVE":
      return `Para coluna ${colLabel ? toLabel(colLabel) : toLabel(details.colunaId) || "-"}`;
    case "KANBAN_TASK_UPDATE": {
      const parts = [];
      if (details.titulo) parts.push(`Titulo: ${toLabel(details.titulo)}`);
      if (details.descricao) parts.push(`Descricao: ${toLabel(details.descricao)}`);
      if (details.cor) parts.push(`Cor: ${details.cor}`);
      if (dataInicio) parts.push(`Inicio: ${dataInicio}`);
      if (dataFim) parts.push(`Fim: ${dataFim}`);
      if (details.colunaId) parts.push(`Coluna: ${colLabel ? toLabel(colLabel) : toLabel(details.colunaId)}`);
      if (details.kanbanId) parts.push(`Kanban: ${toLabel(details.kanbanId)}`);
      return parts.join(" • ") || "-";
    }
    case "KANBAN_COMMENT_ADD":
      return details.conteudo ? `Comentario: "${truncate(String(details.conteudo))}"` : "-";
    case "KANBAN_SUBTASK_CREATE":
      return details.conteudo ? `Subtarefa ${toLabel(details.conteudo)}` : "-";
    case "KANBAN_SUBTASK_UPDATE":
      if (typeof details.concluido === "boolean") {
        return details.concluido ? "Subtarefa concluida" : "Subtarefa reaberta";
      }
      return details.subtaskId ? `Subtarefa ${toLabel(details.subtaskId)}` : "-";
    case "KANBAN_SUBTASK_DELETE":
      return details.subtaskId ? `Subtarefa ${toLabel(details.subtaskId)}` : "-";
    case "KANBAN_RESPONSAVEL_ADD":
    case "KANBAN_RESPONSAVEL_REMOVE":
      return details.userId ? `Usuario ${toLabel(details.userId)}` : "-";
    case "KANBAN_SCHEDULE_TASK_CREATE":
    case "KANBAN_SCHEDULE_TASK_UPDATE": {
      const parts = [];
      if (details.titulo) parts.push(`Tarefa ${toLabel(details.titulo)}`);
      if (dataInicio) parts.push(`Inicio: ${dataInicio}`);
      if (dataFim) parts.push(`Fim: ${dataFim}`);
      return parts.join(" • ") || "-";
    }
    case "KANBAN_SCHEDULE_TASK_DELETE":
      return details.titulo ? `Tarefa ${toLabel(details.titulo)}` : "-";
    case "KANBAN_DELETE":
      return details.titulo ? `Kanban ${toLabel(details.titulo)}` : "-";
    default:
      return "-";
  }
};

export default function KanbanPage() {
  const params = useParams();
  const router = useRouter();
  const kanbanId = params?.id as string | undefined;

  const [kanban, setKanban] = useState<Kanban | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openTask, setOpenTask] = useState<KanbanTarefa | null>(null);
  const [creatingForCol, setCreatingForCol] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [portalUsers, setPortalUsers] = useState<
    Array<{ id: string; email: string; roles: string[] }>
  >([]);
  const [taskDraft, setTaskDraft] = useState<{
    titulo?: string;
    descricao?: string;
    dataInicio?: string | null;
    dataFim?: string | null;
  } | null>(null);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const usersPageSize = 10;
  const [logs, setLogs] = useState<
    Array<{ id: string; actorEmail?: string; action: string; details?: string | null; createdAt: string }>
  >([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsLoading, setLogsLoading] = useState(false);
  const logsPageSize = 10;
  const userPermissions = useAuthStore((state) => state.user?.permissions);
  const canDeleteTask = hasPermission(userPermissions, "kanban:delete");

  const tipoLabel = useMemo(() => {
    const tipo = kanban?.tipo ?? "PROJETO";
    return tipoConfig[tipo];
  }, [kanban?.tipo]);

  useEffect(() => {
    if (!openTask) {
      setTaskDraft(null);
      return;
    }
    setTaskDraft({
      titulo: openTask.titulo ?? "",
      descricao: openTask.descricao ?? "",
      dataInicio: openTask.dataInicio ?? null,
      dataFim: openTask.dataFim ?? null,
    });
  }, [openTask?.id]);

  useEffect(() => {
    if (!kanbanId) return;
    setLoading(true);
    apiInstance
      .fetchKanban(kanbanId)
      .then((data) => {
        if (data) {
          data.colunas = data.colunas.map((c) => ({ ...c, tarefas: c.tarefas ?? [] }));
          setKanban(data);
        }
      })
      .catch((err) => console.error("fetchKanban error", err))
      .finally(() => setLoading(false));
  }, [kanbanId]);

  useEffect(() => {
    if (!kanbanId) return;
    const fetchLogs = async () => {
      setLogsLoading(true);
      try {
        const res = await api.get(`/api/v1/kanban/${kanbanId}/logs`, {
          params: { page: logsPage, pageSize: logsPageSize },
        });
        const data = res.data?.data;
        setLogs(data?.items ?? []);
        setLogsTotal(data?.total ?? 0);
      } catch (err) {
        console.error("Erro ao buscar logs do kanban", err);
      } finally {
        setLogsLoading(false);
      }
    };
    void fetchLogs();
  }, [kanbanId, logsPage]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/api/v1/auth/me");
        setCurrentUserId(res.data?.data?.id ?? null);
      } catch (err) {
        console.error("Erro ao buscar usuario", err);
      }
    };
    void fetchMe();
  }, []);

  useEffect(() => {
    if (!isUsersModalOpen) return;
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const res = await api.get("/api/v1/users", {
          params: {
            page: usersPage,
            pageSize: usersPageSize,
            search: usersSearch || undefined,
          },
        });
        const data = res.data?.data;
        setPortalUsers(data?.items ?? []);
        setUsersTotal(data?.total ?? 0);
      } catch (err) {
        console.error("Erro ao buscar usuarios", err);
      } finally {
        setUsersLoading(false);
      }
    };
    void fetchUsers();
  }, [isUsersModalOpen, usersPage, usersSearch]);

  const onDragEnd = async (result: DropResult) => {
    if (!kanban) return;
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
      const col = kanban.colunas.find((c) => c.id === source.droppableId);
      if (!col) return;
      const tarefas = Array.from(col.tarefas);
      const [moved] = tarefas.splice(source.index, 1);
      tarefas.splice(destination.index, 0, moved);

      setKanban({
        ...kanban,
        colunas: kanban.colunas.map((c) => (c.id === col.id ? { ...c, tarefas } : c)),
      });
      return;
    }

    const sourceCol = kanban.colunas.find((c) => c.id === source.droppableId);
    const destCol = kanban.colunas.find((c) => c.id === destination.droppableId);
    if (!sourceCol || !destCol) return;

    const resultMove = moveItemBetween(
      sourceCol.tarefas,
      destCol.tarefas,
      source.index,
      destination.index,
      destCol.id
    );

    setKanban({
      ...kanban,
      colunas: kanban.colunas.map((c) => {
        if (c.id === sourceCol.id) return { ...c, tarefas: resultMove.newSource };
        if (c.id === destCol.id) return { ...c, tarefas: resultMove.newDest };
        return c;
      }),
    });

    setSaving(true);
    try {
      await apiInstance.moveTarefa(draggableId, destCol.id);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTask = async (colId: string, titulo: string) => {
    if (!kanban) return;
    setSaving(true);
    try {
      const nova = await apiInstance.createTarefa(kanban.id, colId, { titulo });
      setKanban({
        ...kanban,
        colunas: kanban.colunas.map((c) => (c.id === colId ? { ...c, tarefas: [nova, ...c.tarefas] } : c)),
      });
      setCreatingForCol(null);
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!openTask || !commentText.trim() || !currentUserId) return;
    try {
      const novo = await apiInstance.addComentario(openTask.id, commentText.trim(), currentUserId);
      const updatedTask = {
        ...openTask,
        comentarios: [...(openTask.comentarios ?? []), novo],
      };
      setOpenTask(updatedTask);
      setKanban((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          colunas: prev.colunas.map((c) => ({
            ...c,
            tarefas: c.tarefas.map((t) => (t.id === openTask.id ? updatedTask : t)),
          })),
        };
      });
      setCommentText("");
    } catch (err) {
      console.error("addComentario error", err);
    }
  };

  const handleUpdateTask = async (patch: Partial<KanbanTarefa>) => {
    if (!openTask) return;
    const updatedLocal = { ...openTask, ...patch };
    setOpenTask(updatedLocal);
    setKanban((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        colunas: prev.colunas.map((c) => ({
          ...c,
          tarefas: c.tarefas.map((t) => (t.id === openTask.id ? { ...t, ...patch } : t)),
        })),
      };
    });

    try {
      await apiInstance.updateTarefa(openTask.id, patch);
    } catch (err) {
      console.error("updateTarefa error", err);
    }
  };

  const getTaskProgress = (tarefa: KanbanTarefa) => {
    const total = tarefa.subtarefas?.length ?? 0;
    if (total === 0) return null;
    const done = tarefa.subtarefas?.filter((s) => s.concluido).length ?? 0;
    return Math.round((done / total) * 100);
  };

  const persistDraft = async () => {
    if (!openTask || !taskDraft) return;
    const patch: Partial<KanbanTarefa> = {};

    if ((openTask.titulo ?? "") !== (taskDraft.titulo ?? "")) {
      patch.titulo = taskDraft.titulo ?? "";
    }
    if ((openTask.descricao ?? "") !== (taskDraft.descricao ?? "")) {
      patch.descricao = taskDraft.descricao ?? "";
    }
    if ((openTask.dataInicio ?? null) !== (taskDraft.dataInicio ?? null)) {
      patch.dataInicio = taskDraft.dataInicio ?? null;
    }
    if ((openTask.dataFim ?? null) !== (taskDraft.dataFim ?? null)) {
      patch.dataFim = taskDraft.dataFim ?? null;
    }

    if (Object.keys(patch).length === 0) return;
    await handleUpdateTask(patch);
  };

  const closeTaskPanel = () => {
    void persistDraft();
    setOpenTask(null);
  };

  const handleDeleteTask = async () => {
    if (!openTask) return;
    const label = openTask.titulo ? `"${openTask.titulo}"` : "esta tarefa";
    if (!confirm(`Excluir ${label}? Essa acao nao pode ser desfeita.`)) return;
    setSaving(true);
    try {
      await apiInstance.deleteTarefa(openTask.id);
      setKanban((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          colunas: prev.colunas.map((c) => ({
            ...c,
            tarefas: c.tarefas.filter((t) => t.id !== openTask.id),
          })),
        };
      });
      setOpenTask(null);
    } catch (err) {
      console.error("deleteTarefa error", err);
      alert("Nao foi possivel excluir a tarefa. Verifique suas permissoes.");
    } finally {
      setSaving(false);
    }
  };

  async function addResponsavel(tarefaId: string, userId: string) {
    const res = await api.post(`/api/v1/task/${tarefaId}/responsavel`, { userId });
    return res.data?.data;
  }

  async function removeResponsavel(tarefaId: string, userId: string) {
    await api.delete(`/api/v1/task/${tarefaId}/responsavel/${userId}`);
  }

  const headerLabel = tipoLabel ?? tipoConfig.PROJETO;

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Header />

      <main className="ml-64 pt-16">
        <div className="p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 text-white shadow-lg bg-gradient-to-br ${headerLabel.bg}`}>
                {headerLabel.icon}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white">
                  {headerLabel.label} • {kanban?.titulo ?? "Carregando..."}
                </h1>
                <p className="text-sm text-slate-400">Arraste tarefas entre colunas e acompanhe detalhes.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  if (kanban?.id) router.push(`/kanban/${kanban.id}/agenda`);
                }}
              >
                <CalendarDays className="mr-2 h-4 w-4" /> Agenda
              </Button>
              {/* <Button variant="outline" onClick={() => setIsUsersModalOpen(true)}>
                <Users className="mr-2 h-4 w-4" /> Responsaveis
              </Button> */}
              <Button
                variant="gradient"
                onClick={() => {
                  const firstCol = kanban?.colunas?.[0];
                  if (firstCol) setCreatingForCol(firstCol.id);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Nova tarefa
              </Button>
            </div>
          </div>

          <Card className="animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {kanban?.tipo && (
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs">
                    {kanban.tipo}
                  </span>
                )}
                <h2 className="text-lg font-medium text-white">{kanban?.titulo}</h2>
                {kanban?.descricao && <p className="text-sm text-slate-400">— {kanban.descricao}</p>}
              </div>
              {saving && <div className="text-xs text-amber-300">Salvando alteracoes...</div>}
            </div>

            <div className="overflow-x-auto pb-6">
              {loading && <div className="py-20 text-center text-slate-400">Carregando kanban...</div>}

              {!loading && kanban && (
                <DragDropContext onDragEnd={onDragEnd}>
                  <div className="flex gap-6 px-2">
                    {kanban.colunas.map((col) => (
                      <div key={col.id} className="w-[320px] flex-shrink-0">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                            <span className="text-base">{col.titulo}</span>
                            <span className="ml-1 text-xs px-2 py-0.5 bg-white/10 text-slate-300 rounded-full">
                              {col.tarefas.length}
                            </span>
                          </h3>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setCreatingForCol(col.id)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Droppable droppableId={col.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`min-h-[680px] p-4 rounded-xl transition-all border ${
                                snapshot.isDraggingOver
                                  ? "border-purple-400/60 bg-purple-500/10 shadow-lg"
                                  : "border-white/10 bg-slate-900/40"
                              }`}
                            >
                              {col.tarefas.map((t, idx) => (
                                <Draggable draggableId={t.id} index={idx} key={t.id}>
                                  {(dragProvided, dragSnapshot) => (
                                    <div
                                      ref={dragProvided.innerRef}
                                      {...dragProvided.draggableProps}
                                      {...dragProvided.dragHandleProps}
                                      className={`mb-3 p-3 bg-slate-900/80 rounded-2xl shadow-sm cursor-pointer border transition ${
                                        dragSnapshot.isDragging
                                          ? "border-purple-400/70 ring-2 ring-purple-400/30"
                                          : "border-white/10 hover:border-purple-400/40"
                                      }`}
                                      onClick={() => setOpenTask(t)}
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-medium text-slate-100 truncate">
                                            {t.titulo}
                                          </div>
                                          {t.descricao && (
                                            <div className="text-xs text-slate-400 mt-2 line-clamp-2">
                                              {t.descricao}
                                            </div>
                                          )}
                                          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                                            {t.dataInicio && (
                                              <div className="flex items-center gap-1">
                                                <Clock size={12} />{" "}
                                                <span>{new Date(t.dataInicio).toLocaleDateString()}</span>
                                              </div>
                                            )}
                                            {t.dataFim && (
                                              <div className="flex items-center gap-1">
                                                <CalendarDays size={12} />{" "}
                                                <span>{new Date(t.dataFim).toLocaleDateString()}</span>
                                              </div>
                                            )}
                                            {(t.comentarios?.length ?? 0) > 0 && (
                                              <div className="flex items-center gap-1">
                                                <MessageSquare size={12} />
                                                <span>{t.comentarios?.length}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        {getTaskProgress(t) !== null && (
                                          <div className="ml-2 flex items-center">
                                            <div
                                              className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-semibold text-slate-100"
                                              style={{
                                                background: `conic-gradient(#8b5cf6 ${getTaskProgress(t)}%, rgba(255,255,255,0.12) 0)`,
                                              }}
                                              title={`Subtarefas: ${getTaskProgress(t)}%`}
                                            >
                                              <span className="h-6 w-6 rounded-full bg-slate-900/90 flex items-center justify-center">
                                                {getTaskProgress(t)}%
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}

                              {provided.placeholder}

                              {creatingForCol === col.id && (
                                <CreateInline
                                  onCancel={() => setCreatingForCol(null)}
                                  onCreate={(title) => handleCreateTask(col.id, title)}
                                />
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    ))}
                  </div>
                </DragDropContext>
              )}
            </div>
          </Card>

          <Card className="animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Historico de alteracoes</h3>
                <p className="text-xs text-slate-400">Registro por requisicao de Kanban/Schedule.</p>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 overflow-hidden">
              <div className="grid grid-cols-4 gap-2 bg-white/5 px-4 py-2 text-xs uppercase text-slate-400">
                <span>Data/Hora</span>
                <span>Usuario</span>
                <span>Acao</span>
                <span>Detalhes</span>
              </div>
              {logsLoading && (
                <div className="px-4 py-6 text-sm text-slate-400">Carregando historico...</div>
              )}
              {!logsLoading && logs.length === 0 && (
                <div className="px-4 py-6 text-sm text-slate-400">Nenhum registro encontrado.</div>
              )}
              {!logsLoading &&
                logs.map((log) => {
                  const details = parseDetails(log.details);
                  const actionLabel = ACTION_LABELS[log.action] ?? log.action;
                  const friendlyDetails = details
                    ? formatLogDetails(log.action, details, kanban)
                    : log.details || "-";
                  return (
                    <div key={log.id} className="grid grid-cols-4 gap-2 border-t border-white/10 px-4 py-3 text-sm text-slate-200">
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                      <span>{log.actorEmail ?? "Sistema"}</span>
                      <span>{actionLabel}</span>
                      <span className="text-slate-400 line-clamp-2">
                        {friendlyDetails}
                      </span>
                    </div>
                  );
                })}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>
                Pagina {logsPage} de {Math.max(1, Math.ceil(logsTotal / logsPageSize))}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={logsPage <= 1}
                  onClick={() => setLogsPage((prev) => Math.max(prev - 1, 1))}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={logsPage >= Math.ceil(logsTotal / logsPageSize)}
                  onClick={() => setLogsPage((prev) => prev + 1)}
                >
                  Proxima
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {openTask && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={closeTaskPanel} />
          <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-[520px] bg-slate-900 border-l border-white/10 shadow-2xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{openTask.titulo}</h3>
                  <p className="text-xs text-slate-500 mt-1">ID: {openTask.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  {canDeleteTask && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-400/40 text-red-300 hover:text-red-200"
                      onClick={handleDeleteTask}
                      title="Excluir tarefa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={closeTaskPanel}>
                    <X />
                  </Button>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <label className="text-xs text-slate-400">Titulo</label>
                  <Input
                    value={taskDraft?.titulo ?? ""}
                    onChange={(e) =>
                      setTaskDraft((prev) => ({ ...(prev ?? {}), titulo: e.target.value }))
                    }
                    onBlur={() => void persistDraft()}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400">Descricao</label>
                  <textarea
                    className="w-full mt-2 rounded-lg border border-slate-700 bg-slate-dark px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={taskDraft?.descricao ?? ""}
                    onChange={(e) =>
                      setTaskDraft((prev) => ({ ...(prev ?? {}), descricao: e.target.value }))
                    }
                    onBlur={() => void persistDraft()}
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 flex items-center gap-2">
                    <Users size={14} /> Responsaveis
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(openTask.responsaveis ?? []).map((r) => (
                      <span
                        key={r.userId}
                        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200"
                      >
                        {r.user?.email ?? "Usuario"}
                        <button
                          className="text-slate-400 hover:text-white"
                          onClick={async () => {
                            if (!openTask) return;
                            try {
                              await removeResponsavel(openTask.id, r.userId);
                              const updated = (openTask.responsaveis ?? []).filter((x) => x.userId !== r.userId);
                              const updatedTask = { ...openTask, responsaveis: updated };
                              setOpenTask(updatedTask);
                              setKanban((prev) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  colunas: prev.colunas.map((c) => ({
                                    ...c,
                                    tarefas: c.tarefas.map((t) =>
                                      t.id === openTask.id ? updatedTask : t
                                    ),
                                  })),
                                };
                              });
                            } catch (err) {
                              console.error("removeResponsavel error", err);
                            }
                          }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {(openTask.responsaveis ?? []).length === 0 && (
                      <span className="text-xs text-slate-400">Nenhum responsavel definido.</span>
                    )}
                  </div>

                  <div className="mt-3">
                    <Button variant="outline" onClick={() => setIsUsersModalOpen(true)}>
                      Gerenciar responsaveis
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 flex items-center gap-2">
                    <Check size={14} /> Subtarefas
                  </label>
                  <SubtaskEditor
                    subtarefas={openTask.subtarefas ?? []}
                    onAdd={async (conteudo) => {
                      try {
                        const res = await api.post(`/api/v1/task/${openTask.id}/subtasks`, { conteudo });
                        const nova = res.data?.data as KanbanSubtarefa;
                        const updatedTask = {
                          ...openTask,
                          subtarefas: [...(openTask.subtarefas ?? []), nova],
                        };
                        setOpenTask(updatedTask);
                        setKanban((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            colunas: prev.colunas.map((c) => ({
                              ...c,
                              tarefas: c.tarefas.map((t) => (t.id === openTask.id ? updatedTask : t)),
                            })),
                          };
                        });
                      } catch (err) {
                        console.error("Erro ao criar subtarefa", err);
                      }
                    }}
                    onToggle={async (subtaskId, concluido) => {
                      try {
                        const res = await api.patch(`/api/v1/task/${openTask.id}/subtasks/${subtaskId}`, {
                          concluido,
                        });
                        const updated = res.data?.data as KanbanSubtarefa;
                        const updatedTask = {
                          ...openTask,
                          subtarefas: (openTask.subtarefas ?? []).map((s) =>
                            s.id === updated.id ? updated : s
                          ),
                        };
                        setOpenTask(updatedTask);
                        setKanban((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            colunas: prev.colunas.map((c) => ({
                              ...c,
                              tarefas: c.tarefas.map((t) => (t.id === openTask.id ? updatedTask : t)),
                            })),
                          };
                        });
                      } catch (err) {
                        console.error("Erro ao atualizar subtarefa", err);
                      }
                    }}
                    onRemove={async (subtaskId) => {
                      try {
                        await api.delete(`/api/v1/task/${openTask.id}/subtasks/${subtaskId}`);
                        const updatedTask = {
                          ...openTask,
                          subtarefas: (openTask.subtarefas ?? []).filter((s) => s.id !== subtaskId),
                        };
                        setOpenTask(updatedTask);
                        setKanban((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            colunas: prev.colunas.map((c) => ({
                              ...c,
                              tarefas: c.tarefas.map((t) => (t.id === openTask.id ? updatedTask : t)),
                            })),
                          };
                        });
                      } catch (err) {
                        console.error("Erro ao remover subtarefa", err);
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 flex items-center gap-2">
                    <MessageSquare size={14} /> Comentarios
                  </label>

                  <div className="mt-3 space-y-3">
                    <div className="max-h-64 overflow-y-auto space-y-3">
                      {(openTask.comentarios ?? []).map((c) => (
                        <div key={c.id} className="border border-white/10 rounded-md p-3 bg-white/5">
                          <div className="text-sm text-slate-200">{c.conteudo}</div>
                          <div className="text-xs text-slate-500 mt-2">
                            {c.user?.email ?? "Usuario"} •{" "}
                            {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Escreva um comentario..."
                      />
                      <Button onClick={handleAddComment}>Enviar</Button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 flex items-center gap-2">
                    <Clock size={14} /> Datas
                  </label>
                  <div className="mt-2 flex gap-2 items-center">
                    <Input
                      type="date"
                      value={taskDraft?.dataInicio ? taskDraft.dataInicio.split("T")[0] : ""}
                      onChange={(e) =>
                        setTaskDraft((prev) => ({
                          ...(prev ?? {}),
                          dataInicio: e.target.value ? new Date(e.target.value).toISOString() : null,
                        }))
                      }
                      onBlur={() => void persistDraft()}
                    />
                    <span className="text-slate-400">→</span>
                    <Input
                      type="date"
                      value={taskDraft?.dataFim ? taskDraft.dataFim.split("T")[0] : ""}
                      onChange={(e) =>
                        setTaskDraft((prev) => ({
                          ...(prev ?? {}),
                          dataFim: e.target.value ? new Date(e.target.value).toISOString() : null,
                        }))
                      }
                      onBlur={() => void persistDraft()}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  {canDeleteTask && (
                    <Button variant="outline" className="text-red-300 border-red-400/40" onClick={handleDeleteTask}>
                      Excluir tarefa
                    </Button>
                  )}
                  <Button variant="outline" onClick={closeTaskPanel}>
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      <Dialog open={isUsersModalOpen} onOpenChange={setIsUsersModalOpen}>
        <DialogContent className="bg-slate-900 text-slate-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Selecionar responsaveis</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Buscar usuario por email..."
              value={usersSearch}
              onChange={(e) => {
                setUsersSearch(e.target.value);
                setUsersPage(1);
              }}
            />

            <div className="rounded-lg border border-white/10 bg-white/5">
              {usersLoading ? (
                <div className="p-4 text-sm text-slate-400">Carregando usuarios...</div>
              ) : (
                <div className="max-h-72 overflow-y-auto">
                  {portalUsers.map((user) => {
                    const isSelected = (openTask?.responsaveis ?? []).some((r) => r.userId === user.id);
                    const roleLabel = user.roles.length ? user.roles.join(", ") : "Sem funcao";

                    return (
                      <label
                        key={user.id}
                        className="flex items-center justify-between gap-3 px-4 py-3 text-sm border-b border-white/10 last:border-b-0"
                      >
                        <div>
                          <div className="text-slate-100">{user.email}</div>
                          <div className="text-xs text-slate-400">{roleLabel}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={async (e) => {
                            if (!openTask) return;
                            try {
                              if (e.target.checked) {
                                const novo = await addResponsavel(openTask.id, user.id);
                                const updatedTask = {
                                  ...openTask,
                                  responsaveis: [...(openTask.responsaveis ?? []), novo],
                                };
                                setOpenTask(updatedTask);
                                setKanban((prev) => {
                                  if (!prev) return prev;
                                  return {
                                    ...prev,
                                    colunas: prev.colunas.map((c) => ({
                                      ...c,
                                      tarefas: c.tarefas.map((t) =>
                                        t.id === openTask.id ? updatedTask : t
                                      ),
                                    })),
                                  };
                                });
                              } else {
                                await removeResponsavel(openTask.id, user.id);
                                const updated = (openTask.responsaveis ?? []).filter((x) => x.userId !== user.id);
                                const updatedTask = { ...openTask, responsaveis: updated };
                                setOpenTask(updatedTask);
                                setKanban((prev) => {
                                  if (!prev) return prev;
                                  return {
                                    ...prev,
                                    colunas: prev.colunas.map((c) => ({
                                      ...c,
                                      tarefas: c.tarefas.map((t) =>
                                        t.id === openTask.id ? updatedTask : t
                                      ),
                                    })),
                                  };
                                });
                              }
                            } catch (err) {
                              console.error("responsavel toggle error", err);
                            }
                          }}
                          className="h-4 w-4 rounded border-white/20 bg-transparent"
                        />
                      </label>
                    );
                  })}

                  {portalUsers.length === 0 && (
                    <div className="p-4 text-sm text-slate-400">Nenhum usuario encontrado.</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                Pagina {usersPage} de {Math.max(1, Math.ceil(usersTotal / usersPageSize))}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={usersPage <= 1}
                  onClick={() => setUsersPage((prev) => Math.max(prev - 1, 1))}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={usersPage >= Math.ceil(usersTotal / usersPageSize)}
                  onClick={() => setUsersPage((prev) => prev + 1)}
                >
                  Proxima
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateInline({ onCancel, onCreate }: { onCancel: () => void; onCreate: (title: string) => void }) {
  const [title, setTitle] = useState("");
  return (
    <div className="mt-3 p-3 bg-slate-900/70 rounded-xl shadow-sm border border-white/10">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-sm"
        placeholder="Titulo da tarefa..."
      />
      <div className="mt-2 flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={() => {
            if (title.trim() === "") return;
            onCreate(title.trim());
            setTitle("");
          }}
        >
          Criar
        </Button>
      </div>
    </div>
  );
}

function SubtaskEditor({
  subtarefas,
  onAdd,
  onToggle,
  onRemove,
}: {
  subtarefas: KanbanSubtarefa[];
  onAdd: (conteudo: string) => void;
  onToggle: (id: string, concluido: boolean) => void;
  onRemove: (id: string) => void;
}) {
  const [newText, setNewText] = useState("");
  return (
    <div>
      <ul className="space-y-2 mb-3">
        {subtarefas.map((s) => (
          <li key={s.id} className="flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={Boolean(s.concluido)}
              onChange={(e) => onToggle(s.id, e.target.checked)}
              className="w-4 h-4"
            />
            <span className={s.concluido ? "line-through text-slate-500" : ""}>{s.conteudo}</span>
            <button
              className="ml-auto text-slate-500 hover:text-red-400"
              onClick={() => onRemove(s.id)}
              aria-label="Remover subtarefa"
            >
              <X size={12} />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <Input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Nova subtarefa..."
        />
        <Button
          onClick={() => {
            if (!newText.trim()) return;
            onAdd(newText.trim());
            setNewText("");
          }}
        >
          <Plus size={14} />
        </Button>
      </div>
    </div>
  );
}
