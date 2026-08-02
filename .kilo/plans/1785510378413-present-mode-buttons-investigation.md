# Present Mode Buttons Visibility Bug — Investigation & Fix Plan

## Problem
The bottom navigation buttons (Anterior/Próximo) in Present mode at `/present/[id]` are not visible and not clickable, though they exist in the source code at `src/components/PresentMode.tsx:147-187`.

## Investigation Steps (ordered by likelihood)

### 1. Browser DevTools Inspection
- Open `/present/[speech-id]` in a browser
- Right-click → Inspect → check if `<div className="fixed bottom-0...">` exists in the DOM
- If it exists: check Computed tab for actual `position`, `z-index`, `bottom`, `left`, `right`, `width`, `height`, `display`, `opacity`, `visibility`, `pointer-events`
- Check if the `<main>` or `<body>` element has any unexpected CSS that would clip `fixed` descendants:
  ```css
  /* Look for these on any ancestor: */
  overflow: hidden | clip
  transform: ...
  filter: ...
  contain: ...
  will-change: ...
  content-visibility: ...
  ```
- Use the Elements panel to check if the bottom bar rect overlaps the viewport

### 2. Check Tailwind Build
- Run `npm run build` or `npm run dev` and inspect the generated CSS
- Verify `fixed`, `bottom-0`, `z-50`, `bg-[#ac61b9]`, `w-14`, `h-14`, `rounded-full` are in the compiled CSS
- Check if the Tailwind `content` configuration in `tailwind.config.ts` includes `./src/components/**/*.{ts,tsx}`

### 3. Test Without Backdrop Filter
- Temporarily remove `backdrop-blur-md` from the bottom bar in `PresentMode.tsx:148`
- Test if removing `backdrop-filter` (which can create containing-block side effects in some browsers) fixes the issue

### 4. Verify Conditional Rendering
- Confirm the early return `if (!blocks || blocks.length === 0)` at line 96 is NOT being hit
- Add a temporary `console.log('BOTTOM BAR RENDERED')` inside the bar div to verify it reaches the DOM

## Fix Approaches (apply based on devtools findings)

### Fix A: If z-index / stacking context is the issue
Move the bottom bar to be a direct child of `<body>` using a React Portal:

```tsx
// in PresentMode.tsx
import { createPortal } from 'react-dom';

// Replace the bottom bar div with:
{typeof window !== 'undefined' && createPortal(
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#092047]/90 backdrop-blur-md border-t border-[#0b468c]/30">
        {/* buttons */}
    </div>,
    document.body
)}
```

This bypasses any stacking-context trap in the React tree.

### Fix B: If `backdrop-filter` causes the bug
- Remove `backdrop-blur-md` from the bottom bar
- Replace with `bg-[#092047]/95` (higher opacity, no blur) for a similar visual effect

### Fix C: If Tailwind purging is the issue
- Check `tailwind.config.ts` `content` paths include the component directory
- Use explicit inline styles as a fallback: `style={{ position: 'fixed', bottom: 0, zIndex: 50 }}`

### Fix D: If `pointer-events` inheritance is the issue
- Add explicit `pointer-events-auto` to the bottom bar div and the buttons

## User's Design Requirements
Once visibility is fixed, the user wants:
- **Right button**: label "Próximo" + right arrow icon (ChevronRight)
- **Left button**: label "Anterior" + left arrow icon (ChevronLeft)
- Style: visible but discreet, at the bottom of the screen

Current button implementation uses circular `w-14 h-14` buttons. Adding text labels requires changing to a wider pill/rounded shape:

```tsx
// Proposed button design (discreet):
className="flex items-center gap-2 px-4 py-2 rounded-full 
    bg-[#ac61b9]/20 hover:bg-[#ac61b9]/30 text-[#b7c1de]
    transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed
    border border-[#ac61b9]/30"
```

This replaces the solid purple circles with a ghost/outline pill style that shows both the icon and label.

## Files to Modify
1. `src/components/PresentMode.tsx` — fix visibility + add text labels to buttons

## Verification
1. Run `npm run lint` after changes
2. Visit `/present/[speech-id]` in browser
3. Confirm buttons are visible at the bottom
4. Test click to navigate to next/previous block
5. Test keyboard navigation (ArrowLeft/ArrowRight) still works
6. Test with a speech that has only 1 block (both buttons disabled but visible)
7. Test on a speech with 5+ blocks (navigation works correctly)
8. Test mobile viewport (responsive)
