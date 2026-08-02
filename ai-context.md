# Principais informações

* **Stack:**: Next.js App Router, TailwindCSS, Supabase, TypeScript.
* **Priorizar componentes funcionais, Mobile-First, e evitar excesso de re-renderizações no componente Display/Cronômetro**.

## Arquitetura de Dados (Refinada)

Sua ideia inicial de um `NoteTree` (dicionário) faz sentido para armazenar, mas para um **prompter de discurso**, navegar por uma árvore recursiva em tempo de execução é complexo e custoso.

A melhor prática aqui é "achatar" (flatten) a árvore em uma lista de blocos ordenados. Isso torna a renderização do seu componente `Display` (anterior, atual, próximo) extremamente simples usando apenas um índice numérico (`currentIndex`).

Aqui está uma sugestão de arquitetura em TypeScript:

```typescript
// Define o tipo de anotação
type SpeechType = 'COMMENT' | 'SPEECH';

// Substitui o InfoCard e serve como a entidade principal no Banco de Dados
interface Speech {
    id: string;
    title: string;
    description: string;
    type: SpeechType;
    cover_image_url?: string;
    created_at: Date;
    updated_at: Date;
}

// Representa cada "ponto" ou "nó" do seu NoteTree
interface SpeechBlock {
    id: string;
    speech_id: string; // Chave estrangeira para o Speech
    order: number; // Define a ordem de leitura (0, 1, 2...)
    level: number; // 1 = Principal, 2 = Secundário, 3 = Terciário (Identação)
    content: string; // Texto em Markdown
    is_image: boolean; // Flag para facilitar a renderização
}

```

## Arquitetura de Rotas e UX
- O app possui duas experiências distintas:
  1. Desktop (`/dashboard` e `/dashboard/edit`): Focado em CRUD, gerenciamento de estado complexo, drag-and-drop para reordenação de blocos e upload de mídia para o Supabase Storage.
  2. Mobile (`/present/[id]`): Rota ultra-leve e performática. Não deve carregar nenhuma biblioteca de edição. Foco total em renderização limpa (Markdown para HTML via Server Components), controle de estado simples do índice do bloco atual e interface otimizada para toque (Touch Zones).
- Os blocos do discurso são armazenados como uma lista ordenada em uma coluna JSONB (`blocks`) na tabela `speeches`.

