import { useQuery } from '@tanstack/react-query';
import { kanbanApi } from '@/services/kanban.service';

/**
 * Hook to fetch Kanban boards by reference ID (e.g., ticket ID).
 * Returns the first Kanban found with the given reference ID.
 */
export const useKanbanByReference = (referenciaId: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: ['kanban', 'by-reference', referenciaId],
    queryFn: async () => {
      if (!referenciaId) return null;

      const result = await kanbanApi.list({
        referenciaId,
        pageSize: 1
      });

      return result.items.length > 0 ? result.items[0] : null;
    },
    enabled: enabled && !!referenciaId,
  });
};
