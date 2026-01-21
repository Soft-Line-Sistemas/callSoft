'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/lib/toast';
import { useAddTrackingEvent, useCotacaoTracking } from '@/hooks/cotacoes';

interface CotacaoTrackingDialogProps {
  cotacaoId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CotacaoTrackingDialog({ cotacaoId, open, onOpenChange }: CotacaoTrackingDialogProps) {
  const trackingQuery = useCotacaoTracking(cotacaoId ?? undefined, { enabled: open && Boolean(cotacaoId) });
  const addTrackingEventMutation = useAddTrackingEvent();

  const [evento, setEvento] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [dataHora, setDataHora] = useState('');

  const sortedEvents = useMemo(() => {
    const events = trackingQuery.data ?? [];
    return [...events].sort((left, right) => right.dataHora.localeCompare(left.dataHora));
  }, [trackingQuery.data]);

  useEffect(() => {
    if (!open) return;
    setEvento('');
    setLocalizacao('');
    setDataHora('');
  }, [open]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!cotacaoId) return;

    if (!evento.trim()) {
      toast.error('Informe o evento.');
      return;
    }

    if (!dataHora) {
      toast.error('Informe a data e hora do evento.');
      return;
    }

    addTrackingEventMutation.mutate(
      {
        id: cotacaoId,
        data: {
          evento: evento.trim(),
          localizacao: localizacao.trim() ? localizacao.trim() : undefined,
          dataHora: new Date(dataHora).toISOString(),
        },
      },
      {
        onSuccess: async () => {
          toast.success('Evento de rastreamento adicionado.');
          setEvento('');
          setLocalizacao('');
          setDataHora('');
          await trackingQuery.refetch();
        },
        onError: () => {
          toast.error('Não foi possível adicionar o evento. Tente novamente.');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rastreamento da cotação</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Eventos</p>

            {trackingQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-10 rounded-lg bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : trackingQuery.isError ? (
              <p className="text-sm text-red-200">Não foi possível carregar os eventos.</p>
            ) : sortedEvents.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhum evento registrado.</p>
            ) : (
              <div className="max-h-56 overflow-auto space-y-2 pr-1">
                {sortedEvents.map((eventItem) => (
                  <div key={eventItem.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-sm text-white">{eventItem.evento}</p>
                    <div className="mt-1 flex items-center justify-between gap-2 text-xs text-slate-400">
                      <span>
                        {eventItem.dataHora ? new Date(eventItem.dataHora).toLocaleString('pt-BR') : '—'}
                      </span>
                      <span>{eventItem.localizacao ?? ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Adicionar evento</p>

            <div className="space-y-2">
              <Input
                value={evento}
                onChange={(event) => setEvento(event.target.value)}
                placeholder="Evento (ex: Pedido enviado)"
                disabled={addTrackingEventMutation.isPending}
                required
              />
              <Input
                value={localizacao}
                onChange={(event) => setLocalizacao(event.target.value)}
                placeholder="Localização (opcional)"
                disabled={addTrackingEventMutation.isPending}
              />
              <Input
                type="datetime-local"
                value={dataHora}
                onChange={(event) => setDataHora(event.target.value)}
                disabled={addTrackingEventMutation.isPending}
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              <Button type="submit" variant="gradient" disabled={addTrackingEventMutation.isPending || !cotacaoId}>
                {addTrackingEventMutation.isPending ? 'Salvando...' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

