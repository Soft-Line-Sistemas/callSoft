# Services Layer

API services centralize HTTP access logic and keep components free from request details. Each service wraps a backend resource, returns typed data, and is consumed by React Query hooks.

## Folder Shape
```
src/
├── services/          # API clients (this folder)
│   ├── health.service.ts
│   ├── auth.service.ts
│   ├── attachments.service.ts
│   ├── cotacoes.service.ts
│   ├── dashboard.service.ts
│   ├── tickets.service.ts
│   ├── whatsapp.service.ts
│   ├── metrics.service.ts
│   ├── templates/
│   │   └── service.template.ts
│   └── index.ts       # Barrel export
└── hooks/             # React Query hooks (e.g., useHealth.ts)
```

## Naming Rules
- Files: `kebab-case` with suffix `.service.ts` (`tickets.service.ts`).
- Export a single object named `[module]Api` (e.g., `ticketsApi`).
- Methods use verbs that describe the action (`list`, `getById`, `create`, `update`, `delete`).
- Types live in `src/types` and are imported into services.

## Request/Response Pattern
- Use the shared Axios instance from `@/lib/api`.
- Backend responses follow `ApiResponse<T>`; always return `response.data.data!` so hooks/components receive typed payloads.
- For non-standard responses (e.g., `/health/liveness`), type the raw shape explicitly.

```typescript
import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api.types';
import type { Ticket, TicketListFilters } from '@/types/ticket.types';
import type { PaginatedResponse } from '@/types/api.types';

export const ticketsApi = {
  list: async (filters: TicketListFilters = {}): Promise<PaginatedResponse<Ticket>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Ticket>>>(
      '/api/v1/tickets',
      { params: filters }
    );
    return response.data.data!;
  },
};
```

## Creating a New Service
1. Add or update types under `src/types` (and export in `src/types/index.ts`).
2. Copy `src/services/templates/service.template.ts` and adjust names/endpoints/types.
3. Keep methods small and side-effect free; parse and return only the `data` payload.
4. Export the service in `src/services/index.ts`.
5. Create a React Query hook under `src/hooks` that consumes the service (`use[Module].ts`).

## React Query Hooks
- `useQuery` for reads (`queryKey` includes module and params).
- `useMutation` for writes; invalidate or update related queries on success.
- Set sensible caching defaults (e.g., `staleTime` for non-volatile data, `refetchInterval` for health checks).

## Attachments
- Query key convention: `['tickets', ticketId, 'attachments']`
- Use `attachmentsApi.upload(ticketId, files)` for multipart uploads (`files` field).

## Templates & Examples
- Reference `src/services/templates/service.template.ts` for a ready-to-copy skeleton.
- `src/services/health.service.ts` and `src/hooks/useHealth.ts` show a complete flow (service → hook) including barrel exports.
