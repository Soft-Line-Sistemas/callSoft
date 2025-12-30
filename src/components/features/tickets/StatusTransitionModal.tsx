'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TicketStatus, type Ticket } from '@/types/ticket.types';
import { useUpdateTicketStatus } from '@/hooks/tickets';
import { useKanbanByReference, useKanbanDetails, useMoveTask } from '@/hooks/kanban';
import { getTargetColumnForTicketStatus, getColumnNameForStatus, isKanbanSyncDisabled } from '@/lib/kanban-sync';
import { toast } from '@/lib/toast';
import { KanbanSyncDialog } from './KanbanSyncDialog';

interface StatusTransitionModalProps {
  ticket?: Ticket;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: TicketStatus.ABERTO, label: 'Aberto' },
  { value: TicketStatus.PENDENTE_ATENDIMENTO, label: 'Pendente atendimento' },
  { value: TicketStatus.EM_ATENDIMENTO, label: 'Em atendimento' },
  { value: TicketStatus.CONCLUIDO, label: 'Concluído' },
  { value: TicketStatus.CANCELADO, label: 'Cancelado' },
];

export function StatusTransitionModal({ ticket, open, onOpenChange, onSuccess }: StatusTransitionModalProps) {
  const [status, setStatus] = useState<TicketStatus>(TicketStatus.ABERTO);
  const [observacao, setObservacao] = useState('');
  const [showKanbanSync, setShowKanbanSync] = useState(false);
  const [pendingKanbanSync, setPendingKanbanSync] = useState<{
    kanbanId: string;
    taskId: string;
    columnId: string;
    columnName: string;
  } | null>(null);

  const { mutate, isPending } = useUpdateTicketStatus();
  const { data: kanbanReference } = useKanbanByReference(ticket?.id, open);
  const { data: kanbanDetails } = useKanbanDetails(kanbanReference?.id, !!kanbanReference?.id);
  const { mutate: moveTask, isPending: isMovingTask } = useMoveTask();

  useEffect(() => {
    if (ticket && open) {
      setStatus(ticket.status);
      setObservacao('');
      setPendingKanbanSync(null);
      setShowKanbanSync(false);
    }
  }, [ticket, open]);

  const handleKanbanSyncConfirm = () => {
    if (!pendingKanbanSync) return;

    moveTask(
      { taskId: pendingKanbanSync.taskId, colunaId: pendingKanbanSync.columnId },
      {
        onSuccess: () => {
          toast.success('Cartão movido com sucesso.');
        },
        onError: () => {
          toast.error('Não foi possível mover o cartão.');
        },
      }
    );
  };

  const handleKanbanSyncCancel = () => {
    // User chose not to move the Kanban card
  };

  const checkKanbanSync = (newStatus: TicketStatus) => {
    // Check if Kanban sync is disabled
    if (isKanbanSyncDisabled()) return;

    // Check if there's a Kanban board linked to this ticket
    if (!kanbanDetails || !kanbanReference) return;

    // Find the task in the Kanban board (assuming first task is the one linked)
    const task = kanbanDetails.colunas
      .flatMap((col) => col.tarefas)
      .find((t) => t.kanbanId === kanbanDetails.id);

    if (!task) return;

    // Get the target column for the new status
    const targetColumnId = getTargetColumnForTicketStatus(kanbanDetails, newStatus);
    const columnName = getColumnNameForStatus(kanbanDetails, newStatus);

    if (!targetColumnId || !columnName) return;

    // Check if task is already in the target column
    if (task.colunaId === targetColumnId) return;

    // Show sync dialog
    setPendingKanbanSync({
      kanbanId: kanbanDetails.id,
      taskId: task.id,
      columnId: targetColumnId,
      columnName,
    });
    setShowKanbanSync(true);
  };

  const handleSubmit = () => {
    if (!ticket) return;

    mutate(
      { id: ticket.id, data: { status, observacao: observacao || undefined } },
      {
        onSuccess: () => {
          toast.success('Status atualizado com sucesso.');
          onSuccess?.();
          onOpenChange(false);

          // Check if we should prompt for Kanban sync
          checkKanbanSync(status);
        },
        onError: () => {
          toast.error('Não foi possível atualizar o status.');
        },
      }
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar status do ticket</DialogTitle>
          </DialogHeader>

          {!ticket ? (
            <p className="text-sm text-slate-400">Selecione um ticket para atualizar.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase text-slate-500">Status atual</label>
                <p className="text-sm text-white">{ticket.status.replace(/_/g, ' ')}</p>
              </div>

              <div>
                <label className="text-xs uppercase text-slate-500 mb-2">Novo status</label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as TicketStatus)}
                  className="w-full rounded-lg bg-slate-dark border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs uppercase text-slate-500 mb-2">Observações</label>
                <textarea
                  rows={3}
                  value={observacao}
                  onChange={(event) => setObservacao(event.target.value)}
                  className="w-full rounded-lg bg-slate-dark border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  placeholder="Contexto adicional para a equipe..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} isLoading={isPending}>
                  Atualizar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <KanbanSyncDialog
        open={showKanbanSync}
        onOpenChange={setShowKanbanSync}
        columnName={pendingKanbanSync?.columnName || ''}
        onConfirm={handleKanbanSyncConfirm}
        onCancel={handleKanbanSyncCancel}
      />
    </>
  );
}
