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
import moment from "moment";
import "moment/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Kanban } from "@/types";

interface KanbanTask {
  id: string;
  titulo?: string;
  descricao?: string;
  dataInicio?: string;
  dataFim?: string;
}

export default function AgendaKanbanPage() {
  const params = useParams();
  const kanbanId = params?.id as string | undefined;

  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState<Date>(new Date());
  const [kanban, setKanban] = useState<Kanban | null>(null);

  moment.locale("pt-br");
  const localizer = momentLocalizer(moment);
  const DnDCalendar = withDragAndDrop<any>(Calendar);

  const fetchTasks = async () => {
    if (!kanbanId) return;
    setLoading(true);
    try {
      const [tasksRes, kanbanRes] = await Promise.all([
        api.get(`/api/v1/kanban-schedule/${kanbanId}`),
        api.get(`/api/v1/kanban/${kanbanId}`),
      ]);
      setTasks(tasksRes.data?.data ?? []);
      setKanban(kanbanRes.data?.data ?? null);
    } catch (err) {
      console.error("Erro ao buscar tarefas do Kanban", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTasks();
  }, [kanbanId]);

  const handleSelectSlot = async (slotInfo: SlotInfo) => {
    if (!kanbanId) return;
    const titulo = prompt("Titulo da nova tarefa:");
    if (!titulo) return;

    try {
      const res = await api.post("/api/v1/kanban-schedule", {
        kanbanId,
        titulo,
        dataInicio: slotInfo.start.toISOString(),
        dataFim: slotInfo.end.toISOString(),
      });
      if (res.data?.data) {
        setTasks((prev) => [...prev, res.data.data]);
      }
    } catch (err) {
      console.error("Erro ao criar tarefa", err);
    }
  };

  const handleSelectEvent = (event: any) => {
    const task = tasks.find((t) => t.id === event.id);
    if (!task) return;

    const novoTitulo = prompt("Editar titulo:", task.titulo || "");
    if (novoTitulo === null) return;

    api
      .patch(`/api/v1/kanban-schedule/${task.id}`, { titulo: novoTitulo })
      .then(() => {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, titulo: novoTitulo } : t)));
      })
      .catch((err) => console.error("Erro ao editar tarefa", err));
  };

  const handleEventDrop = ({ event, start, end }: any) => {
    api
      .patch(`/api/v1/kanban-schedule/${event.id}`, {
        dataInicio: start.toISOString(),
        dataFim: end.toISOString(),
      })
      .then(() => {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === event.id ? { ...t, dataInicio: start.toISOString(), dataFim: end.toISOString() } : t
          )
        );
      })
      .catch((err) => console.error("Erro ao mover tarefa", err));
  };

  const handleEventResize = ({ event, start, end }: any) => {
    api
      .patch(`/api/v1/kanban-schedule/${event.id}`, {
        dataInicio: start.toISOString(),
        dataFim: end.toISOString(),
      })
      .then(() => {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === event.id ? { ...t, dataInicio: start.toISOString(), dataFim: end.toISOString() } : t
          )
        );
      })
      .catch((err) => console.error("Erro ao redimensionar tarefa", err));
  };

  const eventPropGetter = () => ({
    style: {
      backgroundColor: "#6366f1",
      color: "white",
      borderRadius: "4px",
      padding: "2px",
      border: "none",
    },
  });

  const messages = {
    allDay: "Dia inteiro",
    previous: "Anterior",
    next: "Proximo",
    today: "Hoje",
    month: "Mes",
    week: "Semana",
    day: "Dia",
    agenda: "Agenda",
    date: "Data",
    time: "Hora",
    event: "Evento",
    noEventsInRange: "Nenhuma tarefa neste periodo.",
    showMore: (total: number) => `+ Ver mais (${total})`,
  };

  const events = tasks.map((t) => ({
    id: t.id,
    title: t.titulo + (t.descricao ? `: ${t.descricao}` : ""),
    start: t.dataInicio ? new Date(t.dataInicio) : new Date(),
    end: t.dataFim
      ? new Date(t.dataFim)
      : t.dataInicio
      ? new Date(new Date(t.dataInicio).getTime() + 60 * 60 * 1000)
      : new Date(new Date().getTime() + 60 * 60 * 1000),
    allDay: false,
  }));

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Header />

      <main className="ml-64 pt-16">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between animate-slide-up">
            <div>
              <h1 className="text-3xl font-bold text-white">Agenda do Kanban</h1>
              <p className="text-slate-400 mt-1">
                {kanban?.titulo ? `Quadro: ${kanban.titulo}` : "Visualize todas as tarefas do quadro."}
              </p>
            </div>
            <Button variant="outline" onClick={() => void fetchTasks()}>
              Atualizar
            </Button>
          </div>

          <div className="rounded-xl glass p-4 text-slate-100 shadow-xl rbc-theme-dark">
            {loading && <div className="py-10 text-center text-slate-600">Carregando tarefas...</div>}
            {!loading && (
              <DnDCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                views={["month"]}
                onView={setView}
                date={date}
                onNavigate={(newDate) => setDate(newDate)}
                selectable
                resizableAccessor={() => true}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                eventPropGetter={eventPropGetter}
                draggableAccessor={() => true}
                messages={messages}
                defaultView="month"
                style={{ height: 700 }}
              />
            )}
          </div>
        </div>
      </main>
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
