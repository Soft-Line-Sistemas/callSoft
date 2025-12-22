export type KanbanTipo = 'PROJETO' | 'CHAMADO' | 'MARKETING' | 'SUPORTE' | 'EVENTOS';

export interface KanbanListItem {
  id: string;
  titulo: string;
  descricao?: string | null;
  tipo: KanbanTipo;
  referenciaId?: string | null;
  pinned?: boolean;
}

export interface KanbanColuna {
  id: string;
  titulo: string;
  kanbanId: string;
  indice: number;
  tarefas: KanbanTarefa[];
}

export interface KanbanTarefaResponsavel {
  userId: string;
  user: {
    id: string;
    email?: string | null;
  };
}

export interface KanbanComentario {
  id: string;
  userId?: string;
  user?: {
    id: string;
    email?: string | null;
  };
  conteudo: string;
  createdAt?: string;
}

export interface KanbanSubtarefa {
  id: string;
  conteudo?: string | null;
  concluido?: boolean;
}

export interface KanbanTarefa {
  id: string;
  kanbanId: string;
  colunaId: string;
  titulo?: string | null;
  descricao?: string | null;
  cor?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  comentarios?: KanbanComentario[];
  subtarefas?: KanbanSubtarefa[];
  responsaveis?: KanbanTarefaResponsavel[];
}

export interface Kanban {
  id: string;
  titulo: string;
  descricao?: string | null;
  tipo: KanbanTipo;
  referenciaId?: string | null;
  colunas: KanbanColuna[];
}
