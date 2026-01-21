import { TicketStatus } from '@/types/ticket.types';
import type { KanbanTipo, Kanban } from '@/types/kanban.types';

/**
 * Maps ticket status to Kanban column title based on Kanban type.
 * This mapping determines which column a task should be moved to when the ticket status changes.
 */
const TICKET_STATUS_TO_COLUMN_MAP: Record<KanbanTipo, Partial<Record<TicketStatus, string>>> = {
  SUPORTE: {
    [TicketStatus.ABERTO]: 'Novo',
    [TicketStatus.PENDENTE_ATENDIMENTO]: 'Em Atendimento',
    [TicketStatus.EM_ATENDIMENTO]: 'Em Atendimento',
    [TicketStatus.CONCLUIDO]: 'Resolvido',
    [TicketStatus.CANCELADO]: 'Arquivado',
  },
  CHAMADO: {
    [TicketStatus.ABERTO]: 'Aberto',
    [TicketStatus.PENDENTE_ATENDIMENTO]: 'Em Andamento',
    [TicketStatus.EM_ATENDIMENTO]: 'Em Andamento',
    [TicketStatus.CONCLUIDO]: 'Concluido',
    [TicketStatus.CANCELADO]: 'Arquivado',
  },
  PROJETO: {
    [TicketStatus.ABERTO]: 'A Fazer',
    [TicketStatus.PENDENTE_ATENDIMENTO]: 'Em Andamento',
    [TicketStatus.EM_ATENDIMENTO]: 'Em Andamento',
    [TicketStatus.CONCLUIDO]: 'Concluido',
    [TicketStatus.CANCELADO]: 'Arquivado',
  },
  MARKETING: {
    [TicketStatus.ABERTO]: 'Planejamento',
    [TicketStatus.PENDENTE_ATENDIMENTO]: 'Em Producao',
    [TicketStatus.EM_ATENDIMENTO]: 'Em Producao',
    [TicketStatus.CONCLUIDO]: 'Concluido',
  },
  EVENTOS: {
    [TicketStatus.ABERTO]: 'Planejamento',
    [TicketStatus.PENDENTE_ATENDIMENTO]: 'Preparacao',
    [TicketStatus.EM_ATENDIMENTO]: 'Em Execucao',
    [TicketStatus.CONCLUIDO]: 'Finalizado',
  },
};

/**
 * Gets the target column ID for a given ticket status in a specific Kanban board.
 * @param kanban The Kanban board containing columns
 * @param ticketStatus The new ticket status
 * @returns The column ID to move the task to, or undefined if no mapping exists
 */
export function getTargetColumnForTicketStatus(
  kanban: Kanban,
  ticketStatus: TicketStatus
): string | undefined {
  const columnTitleMap = TICKET_STATUS_TO_COLUMN_MAP[kanban.tipo];
  if (!columnTitleMap) return undefined;

  const targetColumnTitle = columnTitleMap[ticketStatus];
  if (!targetColumnTitle) return undefined;

  // Find column by title (case-insensitive)
  const column = kanban.colunas.find(
    (col) => col.titulo.toLowerCase() === targetColumnTitle.toLowerCase()
  );

  return column?.id;
}

/**
 * Gets the user-friendly message for the column name based on ticket status.
 * @param kanban The Kanban board
 * @param ticketStatus The new ticket status
 * @returns A user-friendly column name or undefined
 */
export function getColumnNameForStatus(
  kanban: Kanban,
  ticketStatus: TicketStatus
): string | undefined {
  const columnTitleMap = TICKET_STATUS_TO_COLUMN_MAP[kanban.tipo];
  if (!columnTitleMap) return undefined;

  return columnTitleMap[ticketStatus];
}

/**
 * Checks if the user has disabled Kanban sync prompts.
 * Checks localStorage for immediate feedback.
 * @returns true if prompts are disabled, false otherwise
 */
export function isKanbanSyncDisabled(): boolean {
  if (typeof window === 'undefined') return false;

  const value = localStorage.getItem('kanban_sync_disabled');
  return value === 'true';
}

/**
 * Sets the user preference for Kanban sync prompts in localStorage.
 * This provides immediate feedback without waiting for server response.
 * Should be synced with user settings via the settings page.
 * @param disabled true to disable prompts, false to enable
 */
export function setKanbanSyncDisabled(disabled: boolean): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem('kanban_sync_disabled', disabled ? 'true' : 'false');
}

/**
 * Gets the current Kanban sync preference from localStorage.
 * @returns true if enabled, false if disabled
 */
export function getKanbanSyncEnabled(): boolean {
  return !isKanbanSyncDisabled();
}
