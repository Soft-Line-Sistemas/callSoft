import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kanbanApi } from '@/services/kanban.service';

interface MoveTaskVariables {
  taskId: string;
  colunaId: string;
}

/**
 * Mutation hook for moving a task to a different column with cache invalidation.
 */
export const useMoveTask = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, MoveTaskVariables>({
    mutationFn: ({ taskId, colunaId }) => kanbanApi.moveTask(taskId, { colunaId }),
    onSuccess: () => {
      // Invalidate all kanban queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['kanban'] });
    },
  });
};
