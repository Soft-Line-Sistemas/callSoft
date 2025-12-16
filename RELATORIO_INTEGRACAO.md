# Relatório de Integração Frontend-Backend

Este relatório detalha todas as integrações atualmente implementadas entre o frontend (Next.js) e o backend, identificadas através da análise do código fonte.

## 🟢 Status Geral
O sistema possui integrações funcionais para os principais módulos: Autenticação, Dashboard, Tickets e Fornecedores. Existem algumas inconsistências de padronização em módulos de configuração.

---

## 🔐 Autenticação (`/api/v1/auth/*`)
| Funcionalidade | Endpoint | Método | Arquivo |
|---|---|---|---|
| Login | `/api/v1/auth/login` | `POST` | `app/login/page.tsx` |
| Solicitar Redefinição de Senha | `/api/v1/auth/password-reset/request` | `POST` | `app/login/page.tsx` |
| Confirmar Redefinição de Senha | `/api/v1/auth/password-reset/confirm` | `POST` | `app/password-reset/page.tsx` |

---

## 📊 Dashboard (`/api/v1/dashboard/*`)
| Funcionalidade | Endpoint | Método | Arquivo |
|---|---|---|---|
| Métricas Gerais (KPIs) | `/api/v1/dashboard/metrics` | `GET` | `app/dashboard/page.tsx` |
| Tickets Recentes | `/api/v1/tickets` (com paginação) | `GET` | `app/dashboard/page.tsx` |

---

## 🎫 Tickets (`/api/v1/tickets/*`)
| Funcionalidade | Endpoint | Método | Arquivo |
|---|---|---|---|
| Listar Tickets (Filtros) | `/api/v1/tickets` | `GET` | `app/tickets/page.tsx` |
| Detalhes do Ticket | `/api/v1/tickets/{id}` | `GET` | `app/tickets/[id]/page.tsx` |
| Criar Ticket | `/api/v1/tickets` | `POST` | `app/tickets/page.tsx` |
| Listar Cotações do Ticket | `/api/v1/tickets/{id}/quotes` | `GET` | `app/tickets/[id]/page.tsx` |

### Cotações (`/api/v1/quotes/*`)
| Funcionalidade | Endpoint | Método | Arquivo |
|---|---|---|---|
| Criar Cotação | `/api/v1/quotes` | `POST` | `app/tickets/[id]/quotes/new/page.tsx` |

---

## 🏭 Fornecedores (`/api/v1/suppliers/*`)
| Funcionalidade | Endpoint | Método | Arquivo |
|---|---|---|---|
| Listar Fornecedores | `/api/v1/suppliers` | `GET` | `app/suppliers/page.tsx` |
| Detalhes do Fornecedor | `/api/v1/suppliers/{id}` | `GET` | `app/suppliers/[id]/page.tsx` |
| Estatísticas do Fornecedor | `/api/v1/suppliers/{id}/stats` | `GET` | `app/suppliers/[id]/page.tsx` |
| Criar Fornecedor | `/api/v1/suppliers` | `POST` | `app/suppliers/new/page.tsx` |
| Atualizar Fornecedor | `/api/v1/suppliers/{id}` | `PUT` | `app/suppliers/[id]/edit/page.tsx` |

---

## 📱 WhatsApp (`/api/v1/whatsapp/*`)
| Funcionalidade | Endpoint | Método | Arquivo |
|---|---|---|---|
| Obter QR Code | `/api/v1/whatsapp/qr` | `GET` | `app/whatsapp/contatos/page.tsx` |
| Listar Contatos (Via Tickets) | `/api/v1/tickets` | `GET` | `app/whatsapp/contatos/page.tsx` |

---

## ⚙️ Configurações (Atenção Necessária)
Estes endpoints parecem fugir do padrão `/api/v1/...` ou são legados.

| Funcionalidade | Endpoint | Método | Arquivo | Observação |
|---|---|---|---|---|
| Listar Usuários | `/usuarios` | `GET` | `app/settings/criar-usuario/page.tsx` | **Fora do padrão v1** |
| Upload Foto Usuário | `/api/v1/upload/usuario` | `POST` | `app/settings/criar-usuario/page.tsx` | OK |
| Criar Empresa | `/empresas` | `POST` | `app/settings/criar-empresa/page.tsx` | **Fora do padrão v1** |

---

## 🌐 APIs Externas
| Serviço | Endpoint | Uso |
|---|---|---|
| **BrasilAPI** | `https://brasilapi.com.br/api/cnpj/v1/{cnpj}` | Consulta de CNPJ em: <br> - `app/suppliers/new/page.tsx` <br> - `app/settings/criar-empresa/page.tsx` |
| **QR Server** | `https://api.qrserver.com/v1/create-qr-code/...` | Geração visual de QR Code em `app/whatsapp/contatos/page.tsx` |

## 📝 Observações Técnicas
1.  **Padronização**: A maioria dos endpoints segue o padrão `/api/v1/...`.
2.  **Inconsistências**: Os módulos de criação de usuário e empresa usam rotas raiz (`/usuarios`, `/empresas`) que podem falhar se o backend esperar `/api/v1/...`. Recomenda-se revisão.
3.  **React Query**: O projeto utiliza amplamente `useQuery` e `useMutation` para gerenciamento de estado do servidor, o que é uma boa prática.
