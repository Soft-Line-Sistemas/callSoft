import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api.types';
import type { Attachment } from '@/types/attachment.types';

export const attachmentsApi = {
  /**
   * Upload one or more attachments for a ticket (multipart/form-data).
   */
  upload: async (ticketId: string, files: File[]): Promise<Attachment[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await api.post<ApiResponse<Attachment[]>>(
      `/api/v1/tickets/${ticketId}/attachments`,
      formData
    );
    return response.data.data!;
  },

  /**
   * List all attachments for a ticket.
   */
  list: async (ticketId: string): Promise<Attachment[]> => {
    const response = await api.get<ApiResponse<Attachment[]>>(
      `/api/v1/tickets/${ticketId}/attachments`
    );
    return response.data.data!;
  },

  /**
   * Download a specific attachment as Blob.
   */
  download: async (ticketId: string, attachmentId: string): Promise<Blob> => {
    const response = await api.get(
      `/api/v1/tickets/${ticketId}/attachments/${attachmentId}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  },
};
