"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Calendar,
  momentLocalizer,
  SlotInfo,
  View,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment-timezone";
import "moment/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { ChromePicker, ColorResult } from "react-color";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { Kanban } from "@/types";
import { useNotificationStore } from "@/store/notificationStore";

interface KanbanTask {
  id: string;
  titulo?: string;
  kanbanId?: string;
  descricao?: string;
  cor?: string;
  dataInicio?: string;
  dataFim?: string;
}

export default function AgendaPage() {
  const params = useParams();
  const usuarioId = params?.id as string | undefined;
  const { addNotification } = useNotificationStore();

  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState<Date>(new Date());
  const [kanbans, setKanbans] = useState<Kanban[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("#6366f1");

  const [openModal, setOpenModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [selectedKanbanId, setSelectedKanbanId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);
  const [logs, setLogs] = useState<
    Array<{ id: string; actorEmail?: string; action: string; details?: string | null; createdAt: string }>
  >([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsLoading, setLogsLoading] = useState(false);
  const logsPageSize = 10;

  moment.locale("pt-br");
  const localizer = momentLocalizer(moment);
  const DnDCalendar = withDragAndDrop<any>(Calendar);

  useEffect(() => {
    if (!usuarioId) return;
    const fetchKanbans = async () => {
      try {
        const res = await api.get(`/api/v1/kanban/user/${usuarioId}`);
        setKanbans(res.data?.data ?? []);
      } catch (err) {
        console.error("Erro ao buscar kanbans", err);
      }
    };
    void fetchKanbans();
  }, [usuarioId]);

  const fetchTasks = async () => {
    if (!usuarioId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/schedule/${usuarioId}`);
      setTasks(res.data?.data ?? []);
    } catch (err) {
      console.error("Erro ao buscar tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTasks();
  }, [usuarioId]);

  useEffect(() => {
    if (!usuarioId) return;
    const fetchLogs = async () => {
      setLogsLoading(true);
      try {
        const res = await api.get(`/api/v1/schedule/${usuarioId}/logs`, {
          params: { page: logsPage, pageSize: logsPageSize },
        });
        const data = res.data?.data;
        setLogs(data?.items ?? []);
        setLogsTotal(data?.total ?? 0);
      } catch (err) {
        console.error("Erro ao buscar logs da agenda", err);
      } finally {
        setLogsLoading(false);
      }
    };
    void fetchLogs();
  }, [usuarioId, logsPage]);

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    if (!kanbans || kanbans.length === 0) {
      return alert("Voce ainda nao tem nenhum Kanban. Crie um primeiro!");
    }
    setSelectedSlot(slotInfo);
    setNewTaskTitle("");
    setSelectedKanbanId(kanbans[0]?.id ?? null);
    setSelectedColor("#6366f1");
    setEditingTask(null);
    setOpenModal(true);
  };

  const handleSelectEvent = (event: any) => {
    const task = tasks.find((t) => t.id === event.id);
    if (!task) return;

    setEditingTask(task);
    setNewTaskTitle(task.titulo || "");
    setSelectedKanbanId(task.kanbanId || null);
    setSelectedColor(task.cor || "#6366f1");
    setOpenModal(true);
  };

  const handleCreateTask = async () => {
    if (!selectedKanbanId || !selectedSlot || !newTaskTitle.trim() || !usuarioId) {
      return alert("Preencha Kanban e titulo.");
    }

    const kanban = kanbans.find((k) => k.id === selectedKanbanId);
    if (!kanban) return alert("Kanban invalido!");

    const start = moment.tz(selectedSlot.start, "America/Sao_Paulo");
    const end =
      selectedSlot.end && selectedSlot.start.getTime() !== selectedSlot.end.getTime()
        ? moment.tz(selectedSlot.end, "America/Sao_Paulo")
        : start.clone().add(2, "hours");

    try {
      const colunaId = kanban.colunas[0]?.id;
      if (!colunaId) {
        addNotification({
          title: "Erro",
          message: "Kanban selecionado não possui colunas!",
          type: "error",
          category: "system"
        });
        return;
      }

      const res = await api.post(`/api/v1/schedule/${usuarioId}/task`, {
        colunaId,
        kanbanId: kanban.id,
        titulo: newTaskTitle,
        cor: selectedColor,
        dataInicio: start.toISOString(),
        dataFim: end.toISOString(),
      });

      if (res.data?.data) {
        setTasks((prev) => [...prev, res.data.data]);
      }
      setOpenModal(false);
      setNewTaskTitle("");
      setSelectedSlot(null);
      addNotification({
        title: "Sucesso",
        message: "Tarefa criada com sucesso!",
        type: "success",
        category: "system"
      });
    } catch (err) {
      console.error("Erro ao criar task", err);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;
    try {
      await api.patch(`/api/v1/task/${editingTask.id}`, {
        titulo: newTaskTitle,
        kanbanId: selectedKanbanId,
        cor: selectedColor,
      });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...t, titulo: newTaskTitle, kanbanId: selectedKanbanId ?? undefined, cor: selectedColor }
            : t
        )
      );
      setEditingTask(null);
      setOpenModal(false);
      addNotification({
        title: "Sucesso",
        message: "Tarefa atualizada com sucesso!",
        type: "success",
        category: "system"
      });
    } catch (err) {
      console.error("Erro ao atualizar task", err);
      addNotification({
        title: "Erro",
        message: "Erro ao atualizar tarefa.",
        type: "error",
        category: "system"
      });
    }
  };

  const updateTaskTime = (taskId: string, start: Date, end: Date) => {
    const startSP = moment.tz(start, "America/Sao_Paulo").toISOString();
    const endSP = moment.tz(end, "America/Sao_Paulo").toISOString();

    api
      .patch(`/api/v1/task/${taskId}`, { dataInicio: startSP, dataFim: endSP })
      .then(() => {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, dataInicio: startSP, dataFim: endSP } : t))
        );
        addNotification({
          title: "Sucesso",
          message: "Horário da tarefa atualizado!",
          type: "success",
          category: "system"
        });
      })
      .catch((err) => {
        console.error("Erro ao atualizar horario da task", err);
        addNotification({
          title: "Erro",
          message: "Falha ao atualizar horário.",
          type: "error",
          category: "system"
        });
      });
  };

  const eventPropGetter = (event: any) => {
    const task = tasks.find((t) => t.id === event.id);
    return {
      style: {
        backgroundColor: task?.cor || "#6366f1",
        color: "white",
        borderRadius: "8px",
        padding: "6px",
        border: "none",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        fontSize: "0.85rem",
      },
    };
  };

  const events = tasks.map((t) => {
    const start = t.dataInicio
      ? moment.tz(t.dataInicio, "America/Sao_Paulo").toDate()
      : new Date();
    let end = t.dataFim
      ? moment.tz(t.dataFim, "America/Sao_Paulo").toDate()
      : moment(start).add(2, "hours").toDate();
    if (end < start) end = moment(start).add(2, "hours").toDate();

    const kanbanTitle = kanbans.find((k) => k.id === t.kanbanId)?.titulo ?? "Sem Kanban";

    return {
      id: t.id,
      title: t.titulo,
      start,
      end,
      allDay: false,
      desc: kanbanTitle,
    };
  });

  const messages = {
    allDay: "Dia inteiro",
    previous: "Anterior",
    next: "Proximo",
    today: "Hoje",
    month: "Semanal",
    week: "Diaria",
    day: "Dia",
    agenda: "Agenda",
    date: "Data",
    time: "Hora",
    event: "Evento",
    noEventsInRange: "Nenhum evento neste periodo.",
    showMore: (total: number) => `+ Ver mais (${total})`,
  };

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Header />

      <main className="ml-64 pt-16">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between animate-slide-up">
            <div>
              <h1 className="text-3xl font-bold text-white">Agenda</h1>
              <p className="text-slate-400 mt-1">Arraste tarefas e organize seu calendario.</p>
            </div>
            <Button variant="outline" onClick={() => void fetchTasks()}>
              Atualizar
            </Button>
          </div>

          <div className="rounded-xl glass p-4 text-slate-100 shadow-xl rbc-theme-dark">
            {loading ? (
              <div className="py-10 text-center text-slate-600">Carregando tarefas...</div>
            ) : (
              <DnDCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                views={["week", "month"]}
                defaultView="week"
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                selectable
                resizable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                onEventDrop={({ event, start, end }: any) => updateTaskTime(event.id, start, end)}
                onEventResize={({ event, start, end }: any) => updateTaskTime(event.id, start, end)}
                eventPropGetter={eventPropGetter}
                draggableAccessor={() => true}
                messages={messages}
                step={30}
                timeslots={2}
                min={new Date(0, 0, 0, 8, 0, 0)}
                max={new Date(0, 0, 0, 18, 0, 0)}
                style={{ height: 700 }}
                components={{
                  event: ({ event }: any) => (
                    <div>
                      <strong>{event.title}</strong>
                      <div className="text-xs">{event.desc}</div>
                    </div>
                  ),
                }}
              />
            )}
          </div>

          <div className="glass rounded-xl p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Historico de alteracoes</h3>
                <p className="text-xs text-slate-400">Registro por requisicao de agenda.</p>
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
                logs.map((log) => (
                  <div key={log.id} className="grid grid-cols-4 gap-2 border-t border-white/10 px-4 py-3 text-sm text-slate-200">
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                    <span>{log.actorEmail ?? "Sistema"}</span>
                    <span>{log.action}</span>
                    <span className="text-slate-400 line-clamp-2">
                      {log.details ? log.details : "-"}
                    </span>
                  </div>
                ))}
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
          </div>
        </div>
      </main>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="bg-slate-900 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Editar tarefa" : "Criar nova tarefa"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Kanban</label>
              <select
                className="w-full rounded-lg bg-slate-dark border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                value={selectedKanbanId ?? ""}
                onChange={(e) => setSelectedKanbanId(e.target.value || null)}
              >
                <option value="">Selecione...</option>
                {kanbans.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.titulo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Titulo</label>
              <Input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Digite o titulo..."
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Cor</label>
              <div className="flex items-center justify-center">
                <ChromePicker
                  color={selectedColor}
                  onChange={(c: ColorResult) => setSelectedColor(c.hex)}
                  disableAlpha
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpenModal(false)}>
                Cancelar
              </Button>
              <Button onClick={editingTask ? handleUpdateTask : handleCreateTask}>
                {editingTask ? "Atualizar" : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .rbc-theme-dark .rbc-calendar {
          color: #e2e8f0;
        }
        .rbc-theme-dark .rbc-toolbar button {
          color: #e2e8f0;
          border-color: rgba(255, 255, 255, 0.12);
        }
        .rbc-theme-dark .rbc-toolbar button.rbc-active {
          background: rgba(124, 58, 237, 0.25);
          border-color: rgba(124, 58, 237, 0.6);
          color: #fff;
        }
        .rbc-theme-dark .rbc-off-range-bg {
          background: rgba(15, 23, 42, 0.6);
        }
        .rbc-theme-dark .rbc-today {
          background: rgba(124, 58, 237, 0.12);
        }
        .rbc-theme-dark .rbc-month-view,
        .rbc-theme-dark .rbc-time-view,
        .rbc-theme-dark .rbc-agenda-view {
          background: transparent;
          border-color: rgba(255, 255, 255, 0.08);
        }
        .rbc-theme-dark .rbc-header,
        .rbc-theme-dark .rbc-time-header-content,
        .rbc-theme-dark .rbc-time-content,
        .rbc-theme-dark .rbc-timeslot-group,
        .rbc-theme-dark .rbc-time-gutter {
          border-color: rgba(255, 255, 255, 0.08);
        }
        .rbc-theme-dark .rbc-event,
        .rbc-theme-dark .rbc-day-slot .rbc-event {
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }
        .rbc-theme-dark .rbc-time-slot {
          border-color: rgba(255, 255, 255, 0.04);
        }
      `}</style>
    </div>
  );
}
