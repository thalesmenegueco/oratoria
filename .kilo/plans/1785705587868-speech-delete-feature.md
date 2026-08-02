# Speech Delete Feature

## Goal
Add the ability to delete speeches from the dashboard list, with a confirmation card dialog before the destructive action.

## Context
- `SpeechService.delete()` already exists in `src/services/speech.service.ts:87-94` — fully functional, just not wired to any action or UI.
- The dashboard (`src/app/dashboard/page.tsx`) is a Server Component that renders speech cards as inline `<Link>`-wrapped `<div>` elements.
- No dialog/modal component exists yet. No shadcn/ui or Radix UI installed. `lucide-react` is available for icons.
- The project follows strict server/client boundary rules: `'use client'` only on leaves, server actions for mutations, `revalidatePath` for cache invalidation.

## Files to Create

### 1. `src/components/ConfirmDialog.tsx` (NEW — Client Component)
Reusable confirmation dialog that matches the app's dark theme colors.

**Props:**
```ts
type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;   // default: "Confirmar"
  cancelLabel?: string;    // default: "Cancelar"
  isLoading?: boolean;
};
```

**Behavior:**
- `fixed` overlay with `bg-black/60 backdrop-blur-sm`
- Centered card: `bg-[#092047] border border-[#0b468c]/30 rounded-xl p-8 max-w-md w-full`
- Title in white, message in `text-[#b7c1de]`
- Cancel button: `bg-[#63345e]` (matches "Sair"/"Cancelar" pattern from dashboard)
- Confirm button: `bg-red-600 hover:bg-red-700` (destructive action — matches red pattern from EditSpeechForm block delete)
- Shows spinner/disabled state when `isLoading`
- Close on overlay click and Escape key via keyboard event listener
- Uses `createPortal` from `react-dom` (renders into `document.body`)

### 2. `src/components/SpeechCard.tsx` (NEW — Client Component)
Extracts each speech card into a client component to host the delete button + confirmation dialog.

**Props:**
```ts
type SpeechCardProps = {
  speech: Speech;
};
```

**Structure:**
```
<div> (card container — same visual as current dashboard cards)
  <Link> (to /present/[id] — the main card body)
    ... title, description, type badge ...
  </Link>
  <button> (delete icon — Trash2 from lucide-react, positioned top-right corner)
  <ConfirmDialog> (opened on delete click)
</div>
```

**Behavior:**
- Card body is a `<Link>` to `/present/${speech.id}` (same as current)
- Delete button: `Trash2` icon from `lucide-react`, positioned `absolute top-3 right-3`
- Delete button styling: `text-[#b7c1de]/40 hover:text-red-400 transition-colors` (subtle until hover to avoid visual clutter)
- Clicking delete opens ConfirmDialog with title "Apagar Discurso" and message "Tem a certeza que deseja apagar **{speech.title}**? Esta ação é irreversível."
- On confirm: calls `deleteSpeechAction(speech.id)`, then calls `router.refresh()` from `next/navigation` to force re-render of the Server Component parent

## Files to Modify

### 3. `src/actions/speech.actions.ts` — Add `deleteSpeechAction`

```ts
export async function deleteSpeechAction(id: string) {
  const supabase = createClient(await cookies());
  await SpeechService.delete(supabase, id);
  revalidatePath('/dashboard');
  revalidatePath(`/present/${id}`);
  revalidatePath(`/dashboard/edit/${id}`);
}
```

Export added alongside existing `createSpeechAction` and `updateSpeechAction`.

### 4. `src/app/dashboard/page.tsx` — Use SpeechCard component

Replace the inline `<Link>` + `<div>` card JSX with `<SpeechCard speech={speech} />`.

- Import `SpeechCard` from `../../components/SpeechCard`
- The grid container stays the same; only the `{speeches.map(...)}` body changes

## Validation
1. Run `npm run lint` to verify zero errors
2. Manually verify: dashboard shows delete icon on each card
3. Click delete → confirmation card appears with speech title
4. Cancel closes dialog, nothing deleted
5. Confirm → speech removed from list, dialog closes
6. Attempting to navigate to `/present/[deleted-id]` returns 404 or error state
7. Confirmation dialog works on mobile viewport

## Risks
- **Server Component re-render after delete:** Using `router.refresh()` in the client component will re-fetch the Server Component's data. This is the standard Next.js pattern and works reliably.
- **RLS policies:** Deletion is already protected by the existing Supabase RLS — `SpeechService.delete` uses the authenticated client, so only the owner can delete their own speeches.
- **No optimistic update for v1:** Speech disappears only after server confirms deletion. Acceptable for this use case.
