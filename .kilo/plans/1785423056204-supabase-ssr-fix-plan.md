# Plan: Fix Supabase SSR Session Refresh + Params + Dashboard Issues

## Context

The project uses `@supabase/ssr` with Next.js 16 but is missing the required `middleware.ts` for session refresh. Additionally, `params` is used synchronously in a Next.js 15+ async component, and the dashboard page lacks auth checks and error handling.

## Tasks

### 1. Create `src/middleware.ts`

Create a Supabase SSR middleware that refreshes the session on every request. This is the root fix for the `"Auth session missing!"` error.

- Import `createServerClient` from `@supabase/ssr`
- Use the same `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` env vars as `server.ts`
- In `onRequest`, call `supabase.auth.getSession()` to refresh the cookie
- Export a `config` with `matcher` covering protected routes (e.g. `['/present/:path*', '/dashboard']`)

### 2. Fix `params` in `src/app/present/[id]/page.tsx`

- Change the type from `{ params: { id: string } }` to `{ params: Promise<{ id: string }> }`
- Add `const { id } = await params` at the top of the component
- Replace all 5 occurrences of `params.id` with `id` (lines 35, 40, 43, 52, 57)

### 3. Add auth check to `src/app/dashboard/page.tsx`

- Add `supabase.auth.getUser()` call before `SpeechService.getAll()`
- If no user, redirect to login or call `notFound()`
- Follow the same pattern used in `present/[id]/page.tsx`

### 4. Add error handling to `src/app/dashboard/page.tsx`

- Wrap `SpeechService.getAll(supabase)` in a `try/catch`
- On error, log the error and return an empty array or show an error state
- Follow the pattern from `present/[id]/page.tsx`

## Verification

1. Run `npm run build` (or `next build`) to verify no TypeScript errors
2. Verify `middleware.ts` is picked up by Next.js (should be at project root or `src/` top level)
3. Confirm `params` type is `Promise<{ id: string }>` and `await`ed
4. Confirm dashboard page handles unauthenticated users gracefully