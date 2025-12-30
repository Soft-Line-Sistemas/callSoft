import { useQuery } from '@tanstack/react-query';
import { kanbanApi } from '@/services/kanban.service';

/**
 * Hook to fetch full Kanban details including columns and tasks.
 */
export const useKanbanDetails = (kanbanId: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: ['kanban', kanbanId],
    queryFn: () => kanbanApi.getById(kanbanId!),
    enabled: enabled && !!kanbanId,
  });
};
