import { PaginationParams } from './api.types';

/**
 * WhatsApp QR status response
 * Returned by GET /api/v1/whatsapp/qr
 */
export interface QRCodeResponse {
  ready: boolean;
  qrAvailable: boolean;
  qr?: string | null;
  generatedAt: number | null;
  message: string;
}

/**
 * Send WhatsApp Message Request
 */
export interface SendWhatsAppMessageRequest {
  /**
   * Single recipient number (E.164 or provider-accepted format).
   * Required when `recipients` is not provided.
   */
  to?: string;

  /**
   * Optional multiple recipients.
   * Required when `to` is not provided.
   */
  recipients?: string[];

  message: string;

  /**
   * Optional metadata persisted by the backend.
   */
  metadata?: Record<string, any>;
}

/**
 * WhatsApp Message Status Enum
 */
export enum WhatsAppMessageStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export interface SendWhatsAppMessageResult {
  notificationId: string;
  status: 'sent' | 'failed';
  error?: string;
  provider?: unknown;
}

/**
 * WhatsApp Message
 * Represents a WhatsApp message in the system
 */
export interface WhatsAppMessage {
  id: string;
  to: string;
  message: string;
  status: WhatsAppMessageStatus;
  provider?: string;
  providerRef?: string | null;
  sentAt?: string | null;
  error?: string | null;
  metadata?: unknown;
  createdAt: string;
}

/**
 * WhatsApp Message List Filters
 * Parameters for filtering WhatsApp message lists
 */
export interface WhatsAppMessageListFilters extends PaginationParams {
  status?: WhatsAppMessageStatus;
  search?: string;
}
