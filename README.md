# CALLSOFT Web

Next.js App Router com TypeScript, Tailwind, Shadcn UI, React Query e Axios tipado.

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- npm ou pnpm
- Backend rodando na porta 64231

### Instalação

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.local

# Editar .env.local com suas configurações
# Certifique-se de que NEXT_PUBLIC_API_BASE_URL aponta para o backend correto
```

### Desenvolvimento

```bash
# Rodar servidor de desenvolvimento
npm run dev

# Aplicação estará disponível em http://localhost:64232
```

### Build

```bash
# Build de produção
npm run build

# Iniciar servidor de produção
npm start
```

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

### Configuração da API

| Variável | Descrição | Valor Padrão | Obrigatória |
|----------|-----------|--------------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | URL base da API backend | `http://localhost:64231` | ✅ |
| `NEXT_PUBLIC_ENV` | Ambiente de execução | `development` | ✅ |

### Feature Flags (Opcionais)

| Variável | Descrição | Valor Padrão | Obrigatória |
|----------|-----------|--------------|-------------|
| `NEXT_PUBLIC_ENABLE_WHATSAPP` | Habilitar integração WhatsApp | `true` | ❌ |
| `NEXT_PUBLIC_ENABLE_NOTIFICATIONS` | Habilitar sistema de notificações | `true` | ❌ |

### Exemplo de .env.local

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:64231

# Environment
NEXT_PUBLIC_ENV=development

# Feature Flags
NEXT_PUBLIC_ENABLE_WHATSAPP=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

### Ambientes

#### Desenvolvimento
- Backend: `http://localhost:64231`
- Frontend: `http://localhost:64232`

#### Produção
- Backend: `https://api.yourdomain.com`
- Frontend: `https://yourdomain.com`

## 🔌 Conectividade com Backend

### Health Check

Para verificar se o frontend está se conectando corretamente ao backend:

```bash
# Com backend rodando, teste o endpoint de health
curl http://localhost:64231/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-12-17T...",
  "version": "1.0.0"
}
```

### Problemas Comuns

#### Erro: "Network Error" ou "ERR_CONNECTION_REFUSED"
- **Causa**: Backend não está rodando
- **Solução**: Execute `npm run dev` na pasta `backend`

#### Erro: "CORS Policy"
- **Causa**: Backend não está permitindo origem do frontend
- **Solução**: Verifique `ALLOWED_ORIGINS` no `.env` do backend

#### Erro: "401 Unauthorized"
- **Causa**: Token JWT expirado ou inválido
- **Solução**: Faça login novamente

## 📂 Estrutura do Projeto

```
frontend/
├── app/                    # Next.js App Router pages
├── src/
│   ├── lib/               # Configurações (api, auth, queryClient)
│   ├── components/        # Componentes React
│   ├── features/          # Features específicas
│   └── store/             # Estado global (Zustand)
├── .env.local             # Variáveis de ambiente (não commitado)
├── .env.example           # Template de variáveis de ambiente
└── package.json
```

## 🧪 Testes

```bash
# Rodar testes
npm test

# Rodar testes em modo watch
npm run test:watch

# Cobertura de testes
npm run test:coverage

# End-to-end (Playwright)
npm run e2e
```

## 📝 Documentação Adicional

- [PRD - Requisitos do Produto](../tasks/prd-integracao/prd.md)
- [Tech Spec - Especificação Técnica](../tasks/prd-integracao/techspec.md)
- [Tasks - Lista de Tarefas](../tasks/prd-integracao/tasks.md)

## 🤝 Contribuindo

1. Siga os padrões de código do projeto
2. Utilize TypeScript de forma adequada
3. Mantenha os testes atualizados
4. Documente mudanças significativas
