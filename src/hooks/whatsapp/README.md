# WhatsApp Hooks

Hooks under `src/hooks/whatsapp` provide a React Query interface for WhatsApp integration:

- `useWhatsAppQrStatus` polls `GET /api/v1/whatsapp/qr` for connection status and QR availability.
- `useRefreshWhatsAppSession` forces a new QR via `GET /api/v1/whatsapp/qr?refresh=1`.
- `useSendWhatsAppMessage` enqueues messages via `POST /api/v1/whatsapp/messages`.
- `useWhatsAppMessages` lists WhatsApp notifications via `GET /api/v1/whatsapp/messages`.
- `useWhatsAppMessage` fetches a single notification by id via `GET /api/v1/whatsapp/messages/:id`.

## UI

- `app/whatsapp/config/page.tsx` shows connection status and QR when available.
- `app/whatsapp/contatos/page.tsx` provides message sending and history (and a small list of WhatsApp-origin tickets).
