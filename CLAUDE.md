@AGENTS.md

# NEXT.JS APP ROUTER & AGENT GUIDELINES

## 1. AGENT EXECUTION RULES (Cline & Kilo Code)
* **Verification First:** Before declaring a task finished, run `npm run lint` or `npx tsc --noEmit` via the terminal to verify zero build or type errors.
* **Minimal Edits:** Do not rewrite entire files when fixing bugs. Make precise, targeted updates.
* **Terminal Command Safety:** Do not execute destructive commands (e.g., deleting build artifacts, clearing git state) without explicit confirmation.
* **Read Before Write:** Always inspect surrounding components and `layout.tsx` before creating a new route to prevent duplicate layouts or state collisions.

---

## 2. SERVER VS. CLIENT COMPONENT BOUNDARIES
* **Default to Server Components:** Keep all files as React Server Components (RSC) unless interactivity or browser APIs are strictly required.
* **The `'use client'` Directive:**
  * Must be the **very first line** of the file (above imports).
  * Only add `'use client'` if using standard hooks (`useState`, `useEffect`), event listeners (`onClick`, `onChange`), or browser-only APIs (`localStorage`, `window`).
* **Boundary Pushing:** Keep `'use client'` leaves as far down the component tree as possible. Pass Server Components as `children` to Client Component wrappers rather than turning the parent into a Client Component.

---

## 3. ROUTING & PARAMS (Next.js 15+)
* **Navigation Imports:** ALWAYS import routing utilities from `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`, `redirect`). **NEVER** import from `next/router`.
* **Async Params:** In `page.tsx`, `layout.tsx`, and `route.ts`, treat `params` and `searchParams` as `Promise` types.
  ```tsx
  // CORRECT:
  type Props = {
    params: Promise<{ id: string }>;
  };

  export default async function Page({ params }: Props) {
    const { id } = await params;
    return <div>ID: {id}</div>;
  }
  ```
  ## 4. DATA FETCHING & SERVER ACTIONS

- **Server-Side Fetching:** Fetch data directly inside Server Components using `async/await`. Avoid client-side `useEffect` data fetching unless using SWR or React Query for dynamic polling.
- **Server Actions:** Place Server Actions in dedicated files (e.g., `actions.ts`) with `'use server'` at the top.
- **Form Mutations:** Use `useActionState` and `useFormStatus` from `react` (or `react-dom`) for managing form submit states cleanly across boundaries.

5. HYDRATION & STYLING

- **Prevent Hydration Errors:** Never render browser-dependent dynamic data (e.g., `new Date()`, `localStorage`, `window.innerWidth`) directly in the initial output without mounting checks (`useEffect` or `suppressHydrationWarning`).
- **Tailwind CSS:** Keep class strings readable. Group layout utility classes first (flex, grid, spacing), followed by visual styles (colors, borders, shadows).

6. PROJECT STRUCTURE CONVENTIONS

`app/` — Pages, layouts, API routes, and Server Actions only.

`components/ui/` — Pure, presentational, reusable client/server components.

`lib/` — Helper functions, database clients (Prisma/Drizzle/Supabase), and utilities.

`types/` — Global TypeScript declarations and interface definitions.