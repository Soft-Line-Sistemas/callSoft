/**
 * Attachment
 * Represents a file attachment for a ticket
 */
export interface Attachment {
  id: string;
  ticketId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedById: string;
  uploadedBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

/**
 * Upload Attachments Request
 */
export interface UploadAttachmentsRequest {
  files: File[];
}
