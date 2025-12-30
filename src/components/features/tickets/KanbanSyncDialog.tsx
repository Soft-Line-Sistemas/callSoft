'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { setKanbanSyncDisabled } from '@/lib/kanban-sync';

interface KanbanSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function KanbanSyncDialog({
  open,
  onOpenChange,
  columnName,
  onConfirm,
  onCancel,
}: KanbanSyncDialogProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleConfirm = () => {
    if (dontShowAgain) {
      setKanbanSyncDisabled(true);
    }
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (dontShowAgain) {
      setKanbanSyncDisabled(true);
    }
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sincronizar Kanban</DialogTitle>
          <DialogDescription>
            Você tem um cartão para esse atendimento. Deseja mover para <strong>{columnName}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-dark text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
            />
            <label
              htmlFor="dontShowAgain"
              className="text-sm text-slate-400 cursor-pointer select-none underline decoration-dotted underline-offset-2"
            >
              Não mostrar novamente
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={handleCancel}>
              Não
            </Button>
            <Button onClick={handleConfirm}>
              Sim
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
