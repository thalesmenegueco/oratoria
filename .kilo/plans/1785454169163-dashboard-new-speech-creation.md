# Dashboard: New Speech Creation & Design Improvements

## Goal
Enable users to create new speeches from the dashboard and navigate to an edit page. Improve the dashboard visual design based on user feedback.

## Current State Analysis

### What's Working
- Dashboard displays existing speeches correctly
- Authentication and RLS policies working
- SpeechService has all CRUD methods implemented
- Color scheme and fonts are defined

### What's Broken/Missing
1. **"+ Novo Discurso" button has no functionality** - clicking does nothing (line 36-38 in `src/app/dashboard/page.tsx`)
2. **No create action exists** - `src/actions/speech.actions.ts` only has `updateSpeechAction`
3. **No edit page exists** - `/dashboard/edit/[id]` route doesn't exist
4. **Dashboard design issues** (from screenshot):
   - Cards appear to take full width instead of grid layout
   - Overall spacing and visual hierarchy could be improved
   - Layout seems cramped

## Implementation Plan

### 1. Create Server Action for Speech Creation

**File:** `src/actions/speech.actions.ts`

**Task:** Add `createSpeechAction` function

**Implementation details:**
- Accept optional parameters: `title` (default: "Novo Discurso"), `type` (default: "SPEECH")
- Create speech with default values:
  ```typescript
  {
    title: title || "Novo Discurso",
    description: null,
    type: type || "SPEECH",
    cover_image_url: null,
    blocks: [
      {
        id: crypto.randomUUID(),
        level: 1,
        content: "# Clique para editar\n\nComece a escrever seu discurso aqui."
      }
    ]
  }
  ```
- Call `SpeechService.create()` with the supabase client
- Use `redirect()` from `next/navigation` to navigate to `/dashboard/edit/${newSpeech.id}`
- Return `{ success: true, data: newSpeech }` on success
- Return `{ success: false, error: message }` on error
- Add `revalidatePath('/dashboard')` before redirect

**Reference:** Similar pattern to `updateSpeechAction` (line 9-24)

---

### 2. Create Edit Page Route

**File:** `src/app/dashboard/edit/[id]/page.tsx` (new file)

**Task:** Create server component for the edit page

**Implementation details:**
- Server component that receives `params.id`
- Fetch user authentication (similar to dashboard page, line 10-18)
- If not authenticated, call `notFound()`
- Fetch speech using `SpeechService.getById(supabase, id)`
- If speech not found, call `notFound()`
- Render the `EditSpeechForm` client component with speech data:
  ```tsx
  <main className="min-h-screen bg-[#092047] py-8">
    <EditSpeechForm speech={speech} />
  </main>
  ```
- Handle errors gracefully with try/catch

**Dependencies:** Requires `EditSpeechForm` component (step 3)

---

### 3. Create Edit Form Component

**File:** `src/components/EditSpeechForm.tsx` (new file)

**Task:** Create client component for editing speeches

**Implementation details:**

**State management:**
- Use `useState` for all form fields:
  - `title: string`
  - `description: string | null`
  - `type: SpeechType`
  - `blocks: SpeechBlock[]`
- Use `useState` for `isSaving: boolean`

**UI Structure:**
```tsx
<div className="max-w-5xl mx-auto px-8">
  {/* Header with title and actions */}
  <header className="mb-8 flex items-center justify-between">
    <h1>Editar Discurso</h1>
    <div className="flex gap-3">
      <Link href="/dashboard">Cancelar</Link>
      <button onClick={handleSave}>Salvar</button>
    </div>
  </header>

  {/* Metadata Section */}
  <section className="bg-[#092047] border border-[#0b468c]/30 rounded-xl p-6 mb-6">
    <input type="text" value={title} placeholder="Título" />
    <textarea value={description} placeholder="Descrição" />
    <select value={type}>
      <option value="SPEECH">Discurso</option>
      <option value="COMMENT">Comentário</option>
    </select>
  </section>

  {/* Blocks Section */}
  <section>
    <h2>Blocos de Conteúdo</h2>
    {blocks.map((block, index) => (
      <BlockEditor
        key={block.id}
        block={block}
        index={index}
        onUpdate={handleBlockUpdate}
        onDelete={handleBlockDelete}
      />
    ))}
    <button onClick={handleAddBlock}>+ Adicionar Bloco</button>
  </section>
</div>
```

**Block Editor (inline component):**
- Each block has:
  - `<textarea>` for content (Markdown)
  - Level selector (1, 2, 3) as buttons or dropdown
  - Delete button (disable if only 1 block remains)
- Layout: content textarea takes most space, controls on the side

**Functions:**
- `handleSave`: Call `updateSpeechAction` with current state, show loading state
- `handleBlockUpdate(index, field, value)`: Update specific block in state
- `handleBlockDelete(index)`: Remove block from array (min 1 block)
- `handleAddBlock()`: Add new block with `{ id: crypto.randomUUID(), level: 1, content: "" }`

**Styling:**
- Follow existing color scheme (#092047, #0b468c, #ac61b9, #63345e, #b7c1de)
- Use Atkinson font for headers, Inter for inputs
- Inputs: dark background with light border, focus state with purple accent
- Buttons: primary (save) = #0b468c, secondary (cancel) = #63345e

---

### 4. Update Dashboard Page

**File:** `src/app/dashboard/page.tsx`

**Tasks:**

**4.1 Make "+ Novo Discurso" button functional**
- Replace the `<button>` (line 36-38) with a `<form>` using server action:
  ```tsx
  <form action={createSpeechAction}>
    <button 
      type="submit"
      className="bg-[#0b468c] hover:bg-[#0b468c]/80 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
    >
      + Novo Discurso
    </button>
  </form>
  ```
- Import `createSpeechAction` from `@/actions/speech.actions`

**4.2 Fix dashboard design issues**

**Grid layout fix** (line 55):
- Current: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Issue: Cards may be stretching incorrectly
- Verify responsive breakpoints are working
- Add explicit max-width constraints if needed

**Spacing improvements:**
- Increase gap between cards from `gap-6` to `gap-8`
- Add more breathing room in the header section
- Adjust padding on the empty state message

**Visual hierarchy:**
- Increase contrast on subtitle text from `text-[#b7c1de]` to `text-[#b7c1de]/90`
- Add subtle hover scale effect to cards: `hover:scale-[1.02]`
- Improve the "Sair" button visibility (currently purple on dark)

**Specific changes:**
```tsx
// Line 29: Add more vertical spacing
<div className="max-w-6xl mx-auto p-8 pb-16 font-inter">

// Line 30-34: Better header spacing
<header className="mb-16 flex items-center justify-between">
  <div>
    <h1 className="text-5xl font-bold text-white mb-3 font-atkinson">
      Os Meus Discursos
    </h1>
    <p className="text-lg text-[#b7c1de]/90">
      Selecione um esboço para iniciar a apresentação.
    </p>
  </div>
  {/* ... buttons ... */}
</header>

// Line 51-53: Better empty state
<div className="p-12 border-2 border-dashed border-[#b7c1de]/20 rounded-xl text-center">
  <p className="text-xl text-[#b7c1de]/70">
    Ainda não tem nenhum discurso criado.
  </p>
</div>

// Line 55: Better grid spacing
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

// Line 62: Add scale transform
<div className="bg-[#092047] border border-[#0b468c]/30 rounded-xl p-6 h-full transition-all hover:border-[#ac61b9] hover:shadow-[0_0_20px_rgba(172,97,185,0.25)] hover:scale-[1.02]">
```

---

## Validation Steps

After implementation, verify:

1. **New Speech Creation:**
   - [ ] Click "+ Novo Discurso" on dashboard
   - [ ] Verify redirect to `/dashboard/edit/[new-id]`
   - [ ] Verify new speech appears in database
   - [ ] Verify speech has default title, empty description, SPEECH type, and 1 default block

2. **Edit Page:**
   - [ ] Title input works and updates state
   - [ ] Description textarea works and updates state
   - [ ] Type selector works (SPEECH/COMMENT)
   - [ ] Can add new blocks
   - [ ] Can edit block content (textarea)
   - [ ] Can change block level (1, 2, 3)
   - [ ] Can delete blocks (except last one)
   - [ ] "Cancelar" returns to dashboard without saving
   - [ ] "Salvar" persists changes and shows success state

3. **Dashboard Design:**
   - [ ] Cards display in proper grid (1 col mobile, 2 col tablet, 3 col desktop)
   - [ ] Spacing looks balanced and not cramped
   - [ ] Hover effects work smoothly
   - [ ] Empty state displays properly when no speeches exist

4. **Round-trip test:**
   - [ ] Create new speech
   - [ ] Edit title, description, type
   - [ ] Add 3 blocks with different levels
   - [ ] Save
   - [ ] Return to dashboard
   - [ ] Click the speech card
   - [ ] Verify presentation mode shows all blocks correctly
   - [ ] Navigate back to edit page
   - [ ] Verify all changes persisted

---

## Edge Cases & Error Handling

### Authentication
- User not logged in → redirect to login (already handled by RLS)
- Session expired → show error and redirect

### Speech Creation
- Database error → show error message, don't redirect
- Network timeout → show retry option

### Edit Page
- Speech not found (invalid ID) → show 404
- RLS prevents access (wrong user) → show 404
- Concurrent edits → last write wins (acceptable for MVP)

### Form Validation
- Empty title → show warning but allow (can fix later)
- No blocks → prevent deletion of last block
- Empty block content → allow (user may want placeholder)

### Autosave (out of scope for MVP)
- Manual save only for MVP
- Can add debounced autosave in future iteration

---

## Files to Create/Modify

### New Files (3)
1. `src/app/dashboard/edit/[id]/page.tsx` - Edit page route
2. `src/components/EditSpeechForm.tsx` - Edit form component
3. `src/app/dashboard/edit/[id]/loading.tsx` (optional) - Loading state

### Modified Files (2)
1. `src/actions/speech.actions.ts` - Add `createSpeechAction`
2. `src/app/dashboard/page.tsx` - Make button functional + design improvements

---

## Design Tokens Reference

From existing codebase:

**Colors:**
- Background: `#092047` (dark blue)
- Surface: `#1a1a1a` or `#092047`
- Primary: `#0b468c` (blue)
- Accent: `#ac61b9` (purple/lilac)
- Secondary: `#63345e` (dark purple)
- Text primary: `#ffffff`
- Text secondary: `#b7c1de` (light blue-gray)

**Fonts:**
- Headings: `font-atkinson` (Atkinson Hyperlegible)
- Body/UI: `font-inter` (Inter)

**Spacing:**
- Container max-width: `max-w-5xl` or `max-w-6xl`
- Section padding: `p-6` to `p-8`
- Card padding: `p-6`
- Gap between cards: `gap-6` or `gap-8`

---

## Technical Notes

### Server Actions Pattern
- All mutations use Server Actions (already established pattern)
- Server Actions import supabase client via `createClient(await cookies())`
- Always call `revalidatePath()` after mutations
- Use `redirect()` for navigation after successful mutation

### Client Component State
- Use `useState` for form state (simple, no need for complex state management)
- Use `useTransition` or manual loading state for async operations
- No need for React Hook Form or Zod validation for MVP (can add later)

### Block Management
- Blocks stored as JSONB array in database
- Each block needs unique `id` (use `crypto.randomUUID()`)
- Block order determined by array index
- Minimum 1 block required (prevent empty speeches)

### Routing
- Dashboard: `/dashboard` (Server Component)
- Edit: `/dashboard/edit/[id]` (Server Component wrapping Client Component)
- Present: `/present/[id]` (already exists, Server Component)

---

## Out of Scope (Future Enhancements)

These features are mentioned in the codebase docs but NOT required for this MVP:

- Drag-and-drop reordering of blocks
- Image upload to Supabase Storage
- Live markdown preview
- Autosave functionality
- Rich text editor
- Keyboard shortcuts
- Mobile editing (desktop-focused for now)
- Undo/redo
- Block templates
- Export/import

---

## Success Criteria

This feature is complete when:

1. Users can click "+ Novo Discurso" and be taken to an edit page
2. Users can edit speech title, description, type
3. Users can add, edit, and remove blocks
4. Users can save changes and see them persist
5. Dashboard design looks polished and not cramped
6. All changes work with existing authentication and RLS policies
7. No regressions in the presentation mode functionality
