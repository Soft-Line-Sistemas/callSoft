'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { useCompareCotacoes } from '@/hooks/tickets';
import type { CompareCotacoesParams } from '@/types/ticket.types';
import { RefreshCcw } from 'lucide-react';

interface CotacoesComparisonProps {
  ticketId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SORT_OPTIONS: { label: string; value: CompareCotacoesParams['sortBy'] }[] = [
  { label: 'Menor valor total', value: 'valorTotal' },
  { label: 'Menor prazo de entrega', value: 'prazoEntrega' },
  { label: 'Desempenho do fornecedor', value: 'desempenhoFornecedor' },
];

export function CotacoesComparison({ ticketId, open, onOpenChange }: CotacoesComparisonProps) {
  const [params, setParams] = useState<CompareCotacoesParams>({ sortBy: 'valorTotal' });
  const { data, isLoading, isFetching, refetch } = useCompareCotacoes(ticketId, params, { enabled: open });

  const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Comparar cotações</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select
              value={params.sortBy ?? ''}
              onChange={(event) => setParams({ sortBy: event.target.value as CompareCotacoesParams['sortBy'] })}
              className="flex-1 rounded-lg bg-slate-dark border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value ?? ''}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCcw className="h-4 w-4 mr-2" /> Atualizar
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-16 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : !data || data.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhuma cotação encontrada para este ticket.</p>
          ) : (
            <div className="space-y-3">
              {data.map((cotacao) => (
                <div key={cotacao.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Fornecedor</p>
                      <p className="text-white font-medium">{cotacao.fornecedor?.nomeFantasia ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Valor total</p>
                      <p className="text-lg font-semibold text-emerald-400">
                        {formatter.format(cotacao.valorTotal)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Prazo</p>
                      <p className="text-white">
                        {cotacao.prazoEntrega
                          ? new Date(cotacao.prazoEntrega).toLocaleDateString('pt-BR')
                          : '—'}
                      </p>
                    </div>
                    <Badge variant="info" className="uppercase">
                      {cotacao.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
