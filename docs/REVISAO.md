# Revisão de Composição Técnica — CALLSOFT v2.0

## Frontend
- Next.js (TypeScript): aderente. App Router com `app/`, `tsconfig` configurado.
- Axios tipado: aderente. Instância com tipos (`src/lib/api.ts`).
- React Query: aderente. Provider e `useQuery` em `TicketsList`.
- Tailwind: aderente. Configuração (`tailwind.config.js`) em ESM; `globals.css` aplica diretivas.
- Shadcn UI: parcialmente aderente. Base util `cn` e `Button` criados; componentes Shadcn completos não instalados via CLI.

Riscos/observações:
- Vulnerabilidade reportada na versão `next@14.2.10`. Recomenda-se atualização.
- Falta login/público privado: Dashboard consome API sem JWT; precisa interceptor e fluxo de autenticação.

## Backend
- API REST em Express: aderente. Rotas `/auth`, `/tickets`, `/whatsapp`.
- Camadas Controller/Service/Repository: aderente.
- Prisma ORM: aderente. `schema.prisma` com mapeamento legado e relações.
- Conexão e schemas: aderente. Datasource PostgreSQL via `DATABASE_URL`.
- Testes com Jest: parcialmente aderente. Configuração presente, testes ainda não criados.
- Logging: aderente. Winston JSON com timestamp.
- Segurança: aderente. Senhas com `bcrypt`; JWT implementado.
- Auditoria: aderente. Transação em Service e middleware Prisma para `update`.

Riscos/observações:
- Constraints de integridade: `Servico.codEmp` opcional; considerar tornar obrigatório e `onDelete: Restrict`.
- Autorização por flags `OpXX` ainda não aplicada nas rotas; somente `isAdmin` no token.
- Seeds mínimos presentes; ampliar para cenários reais.

## Recomendação de Próximos Passos
- Implementar autenticação no Portal: página de login, proteção de rotas e filtros por perfil.
- Adicionar testes Jest para serviços de tickets e auditoria.
- Instalar Shadcn UI via CLI e padronizar componentes.
- Revisar `next` para versão sem CVEs.
