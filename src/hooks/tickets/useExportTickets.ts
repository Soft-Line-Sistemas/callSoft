import { useMutation } from '@tanstack/react-query';
import { ticketsApi } from '@/services/tickets.service';
import type { TicketListFilters } from '@/types/ticket.types';
import { downloadBlob } from '@/lib/download';

// Export tickets as CSV and trigger download automatically on success.
export const useExportTickets = () => {
  return useMutation<Blob, Error, TicketListFilters | undefined>({
    mutationFn: (filters) => ticketsApi.exportCsv(filters ?? {}),
    onSuccess: (blob) => {
      downloadBlob(blob, `tickets-${new Date().toISOString()}.csv`);
    },
  });
};
