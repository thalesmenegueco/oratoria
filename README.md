A confiabilidade (DX - *Developer Experience*) e a fluidez (UX - *User Experience*) precisam andar de mãos dadas. O aplicativo precisa ser "invisível" durante o uso para que você foque apenas na sua oratória.

---

### 1. Infraestrutura e Banco de Dados

Para um projeto de pequeno porte, gratuito, seguro e com Next.js, a melhor escolha atual é o **Supabase**.

* **Por que?** Ele é um BaaS (Backend as a Service) baseado em PostgreSQL. Ele fornece um banco de dados relacional robusto, uma API REST/GraphQL automática, autenticação pronta e, crucialmente para o seu caso, **Storage (armazenamento de arquivos)**.
* Você pode hospedar o banco no Supabase gratuitamente, fazer o deploy do front-end na Vercel e usar o Supabase Storage para fazer o upload das imagens que você quer colocar no meio do esboço.

---

Vamos aplicar um princípio de design clássico: **Separação de Contexto (Separation of Concerns)**.

Podemos criar duas experiências completamente diferentes dentro do mesmo app Next.js, otimizando o peso do código para o celular e a produtividade para o computador.

---

### 2. Mudança Estratégica na Arquitetura de Dados (Pragmatismo Sênior)

Como o volume de dados é de pequeno porte (uso pessoal) e as operações de ordenação (subir/descer um ponto do discurso) serão frequentes no computador, manter uma tabela separada para os blocos pode gerar uma complexidade desnecessária de reordenação no banco de dados.

**A Proposta:** Usar um campo tipo `JSONB` no Postgres (Supabase) para os blocos dentro da tabela principal de `Speech`.

* **Por que?** Em vez de atualizar 10 linhas no banco quando você arrasta um bloco para cima, você simplesmente atualiza um único array no banco. O CRUD se torna ridiculamente simples e atômico.

```typescript
type SpeechType = 'COMMENT' | 'SPEECH';

interface SpeechBlock {
    id: string; // Gerado no front-end (ex: crypto.randomUUID())
    level: 1 | 2 | 3; // 1 = Principal, 2 = Secundário...
    content: string; // Markdown
}

// Esta será a estrutura exata da sua linha na tabela "speeches" do Supabase
interface Speech {
    id: string;
    title: string;
    description: string;
    type: SpeechType;
    cover_image_url?: string;
    blocks: SpeechBlock[]; // Coluna do tipo JSONB
    created_at: string;
    updated_at: string;
}

```

---

### 3. Experiência de Edição (Desktop UX)

Já que você estará no computador, podemos enriquecer a interface de escrita:

* **Editor Split-Screen (Tela Dividida):** No lado esquerdo, você tem a lista de blocos com um campo de texto (textarea) para escrever em Markdown. No lado direito, um **Preview Mobile**, simulando exatamente o tamanho da tela do seu celular e como o componente `Display` vai renderizar o texto.
* **Arrastar e Soltar (Drag and Drop):** Use uma biblioteca leve como `@dnd-kit/core` ou `react-sortable-hoc` no desktop. Como seus dados estão em um array (`blocks`), reordenar é apenas dar um `splice` no array em memória e salvar no banco.
* **Upload de Imagens por Arrasto:** No desktop, você pode arrastar uma imagem do seu computador diretamente para o bloco. O Next.js intercepta, faz o upload para o Supabase Storage, recebe a URL e insere o `![Alt](url)` no seu texto automaticamente.

---

### 4. Otimização Crítica para o Celular (Next.js Performance)

Bibliotecas de rich text, editores de markdown e drag-and-drop são pesadas (aumentam o *Bundle Size*). Como você usará o app no celular no momento do discurso, **o celular não deve baixar o código do editor**.

No Next.js (App Router), estruturaremos as rotas assim:

* `/dashboard` -> Onde fica a lista e o editor pesado (renderizado majoritariamente no servidor ou com componentes pesados restritos ao Desktop).
* `/present/[id]` -> A tela do discurso no celular.

Na rota `/present/[id]`, você usará apenas o `react-markdown` (ou uma versão leve) para renderizar o texto estático e a lógica dos toques na tela. Usando os **Server Components** do Next.js, o processamento do Markdown pode ser feito no servidor da Vercel, entregando um HTML puro e ultra-leve para o seu celular, garantindo performance máxima e zero travamentos durante sua fala.

---

### 5. Melhorias na UX e Funcionalidades

#### O Cronômetro

Ele deve ser um componente fixo (`position: fixed` ou `sticky`) no topo ou na base da tela. Durante um discurso, você não pode correr o risco de o cronômetro sumir ao rolar a página.

#### O Componente de Display (Modo Apresentação)

Em vez de botões pequenos, divida a tela do celular em **"Touch Zones" (Zonas de Toque)** invisíveis.

* Tocar na metade inferior/direita da tela avança para o próximo bloco (`currentIndex + 1`).
* Tocar na metade superior/esquerda volta um bloco (`currentIndex - 1`).
* **Visualização:**
* `currentIndex - 1`: Opacidade 30%, fonte menor, mostrando apenas o finalzinho (truncado).
* `currentIndex`: Opacidade 100%, fonte grande, destaque total.
* `currentIndex + 1`: Opacidade 30%, mostrando apenas o início.



#### Inserção de Imagens no Markdown

Como você quer imagens no meio do esboço, a estratégia é:

1. No painel de edição (CRUD), você faz o upload da imagem para o Supabase Storage.
2. O Supabase devolve uma URL pública.
3. Você insere essa URL no seu bloco de conteúdo usando a sintaxe padrão do Markdown: `![Descrição da Imagem](https://url-do-supabase.com/imagem.png)`.
4. No front-end, bibliotecas como `react-markdown` renderizam isso nativamente sem esforço extra.


### 6. UI, Cores e Tipografia

A paleta que você escolheu é elegante e permite um bom contraste. Sugiro a seguinte aplicação (pensando em um **Dark Mode** nativo, que gasta menos bateria e agride menos os olhos durante uma apresentação):

* **Fundo do App:** `#092047` (Azul bem escuro, quase marinho, ótimo para leitura prolongada).
* **Texto Principal:** `#b7c1de` (Azul acinzentado claro, contraste suave que não cansa a visão).
* **Destaques / Botão de Avançar:** `#0b468c` (Azul vibrante).
* **Cronômetro / Avisos:** `#ac61b9` (Lilás claro) para o cronômetro rodando, e `#63345e` (Roxo escuro) para quando o tempo estiver estourando ou pausado.

**Tipografia:**
Para o painel de edição e botões, use **Inter** (limpa e moderna).
Para ler o discurso no celular, a clareza é inegociável. Recomendo fortemente a fonte **Atkinson Hyperlegible** (criada pelo Braille Institute especificamente para máxima legibilidade e distinção entre letras, evitando que você se perca na leitura) ou a clássica **Roboto**.

---

# From Next.js

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
