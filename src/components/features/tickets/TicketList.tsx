'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import type { PaginatedResponse } from '@/types/api.types';
import type { Ticket, TicketStatus } from '@/types/ticket.types';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';

interface TicketListProps {
  data?: PaginatedResponse<Ticket>;
  isLoading: boolean;
  isFetching: boolean;
  onPageChange: (page: number) => void;
  onRowClick: (ticketId: string) => void;
}

const statusVariant: Record<TicketStatus, 'success' | 'warning' | 'info' | 'destructive' | 'default'> = {
  ABERTO: 'warning',
  PENDENTE_ATENDIMENTO: 'info',
  EM_ATENDIMENTO: 'info',
  CONCLUIDO: 'success',
  CANCELADO: 'destructive',
};

export function TicketList({ data, isLoading, isFetching, onPageChange, onRowClick }: TicketListProps) {
  const tickets = data?.items ?? [];
  const page = data?.page ?? 1;
  const pages = data?.pages ?? 1;

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-white/10 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3">Ticket / Solicitação</th>
              <th className="px-4 py-3">Solicitante</th>
              <th className="px-4 py-3">Contato</th>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Criado em</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse">
                  <td colSpan={7} className="p-4">
                    <div className="h-6 w-full rounded bg-white/5" />
                  </td>
                </tr>
              ))}

            {!isLoading && tickets.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  Nenhum ticket encontrado com os filtros selecionados.
                </td>
              </tr>
            )}

            {!isLoading &&
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="border-b border-white/5 text-sm text-slate-200 transition hover:bg-white/5 cursor-pointer"
                  onClick={() => onRowClick(ticket.id)}
                >
                  <td className="px-4 py-4">
                    <div className="font-semibold text-white">#{ticket.pedido || ticket.id.substring(0, 8)}</div>
                    <p className="text-xs text-slate-400 line-clamp-1">{ticket.solicitacao || ticket.descricaoSolicitacao}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-white">{ticket.cliente?.nome || ticket.nome || 'Não identificado'}</div>
                  </td>
                  <td className="px-4 py-4">
                     <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-300">{ticket.cliente?.whatsappNumber || ticket.cliente?.telefone || ticket.telefone || '—'}</span>
                        {ticket.cliente?.email && <span className="text-xs text-slate-400">{ticket.cliente.email}</span>}
                     </div>
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {ticket.empresa || '—'}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={statusVariant[ticket.status]} className="uppercase">
                      {ticket.status.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {ticket.createdAt
                      ? new Date(ticket.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRowClick(ticket.id);
                      }}
                    >
                      Ver detalhes
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          {isFetching && !isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>
            Mostrando {tickets.length} de {data?.total ?? 0} tickets
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
          </Button>
          <span className="text-white text-sm">
            {page} / {pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
          >
            Próxima <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
