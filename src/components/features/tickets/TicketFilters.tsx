'use client';

import { useId } from 'react';
import { Search, Filter, RotateCcw, Download } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { TicketStatus, type TicketListFilters } from '@/types/ticket.types';

interface TicketFiltersProps {
  filters: TicketListFilters;
  onChange: (filters: Partial<TicketListFilters>) => void;
  onReset: () => void;
  onExport: () => void;
  isExporting?: boolean;
  searchValue?: string;
}

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: TicketStatus.ABERTO, label: 'Aberto' },
  { value: TicketStatus.PENDENTE_ATENDIMENTO, label: 'Pendente atendimento' },
  { value: TicketStatus.EM_ATENDIMENTO, label: 'Em atendimento' },
  { value: TicketStatus.CONCLUIDO, label: 'Concluído' },
  { value: TicketStatus.CANCELADO, label: 'Cancelado' },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export function TicketFilters({
  filters,
  onChange,
  onReset,
  onExport,
  isExporting,
  searchValue,
}: TicketFiltersProps) {
  const searchId = useId();

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <label htmlFor={searchId} className="sr-only">
          Buscar tickets
        </label>
        <Input
          id={searchId}
          type="search"
          placeholder="Buscar por solicitação ou contato WhatsApp"
          value={searchValue ?? filters.text ?? ''}
          onChange={(event) => onChange({ text: event.target.value })}
          leftIcon={<Search className="h-4 w-4" />}
          className="w-full"
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" className="whitespace-nowrap" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar filtros
          </Button>
          <Button variant="outline" onClick={onExport} isLoading={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-2">
            <Filter className="h-3.5 w-3.5" /> Status
          </label>
          <select
            value={filters.status ?? ''}
            onChange={(event) =>
              onChange({ status: event.target.value ? (event.target.value as TicketStatus) : undefined })
            }
            className="w-full rounded-lg bg-slate-dark border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
          >
            <option value="">Todos</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-slate-500 mb-2">Itens por página</label>
          <select
            value={filters.pageSize ?? 10}
            onChange={(event) => onChange({ pageSize: Number(event.target.value) })}
            className="w-full rounded-lg bg-slate-dark border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} por página
              </option>
            ))}
          </select>
        </div>

        <div className="hidden lg:block">
          <label className="text-xs uppercase tracking-wide text-slate-500 mb-2">Resultados</label>
          <p className="text-sm text-slate-300">
            Página {filters.page ?? 1} · {filters.pageSize ?? 10} itens/página
          </p>
        </div>
      </div>
    </div>
  );
}
