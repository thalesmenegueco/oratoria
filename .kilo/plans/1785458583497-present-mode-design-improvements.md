# Present Mode Design Improvements Plan

## Goal
Improve the Present Mode's visual design and user experience by polishing typography, spacing, navigation, and transitions while maintaining focus on content readability during presentations.

## Current State Analysis

**File:** `src/components/PresentMode.tsx`

**Current Issues:**
- Debug touch zones visible (red/green overlays with text labels)
- Debug PREV/NEXT buttons in center of screen
- Basic typography not optimized for distance viewing
- No keyboard navigation support
- No slide transitions (instant content swap)
- Touch zones occupy full screen area unnecessarily

## Design Requirements

### 1. Remove Debug Elements
- Remove visible touch zone overlays (lines 151-173)
- Remove debug buttons (lines 133-146)
- Clean up console.log statements

### 2. Minimal Floating Navigation Buttons
**Style & Behavior:**
- Position: Fixed at left and right screen edges (vertical center)
- Appearance: Semi-transparent, subtle icons/arrows
- Interaction: 
  - Show on hover (desktop) or always visible with low opacity (mobile)
  - Smooth hover state with opacity/scale changes
  - Disabled state when at first/last slide
- Design: Minimal circular/pill buttons with arrow icons (← →)

### 3. Typography Improvements

**Current Typography:**
```tsx
prose prose-invert prose-p:text-3xl prose-p:leading-relaxed 
prose-headings:text-[#ac61b9] prose-strong:text-white
```

**Improvements:**
- **Headings (H1, H2, H3):**
  - Increase size: `prose-h1:text-6xl prose-h2:text-5xl prose-h3:text-4xl`
  - Increase weight: `prose-headings:font-bold`
  - Better spacing: `prose-headings:mb-6 prose-headings:leading-tight`
  - Keep accent color: `prose-headings:text-[#ac61b9]`

- **Paragraphs:**
  - Increase size: `prose-p:text-4xl` (up from 3xl)
  - Better line height: `prose-p:leading-[1.6]`
  - Letter spacing: `prose-p:tracking-wide`
  - Improve color: `prose-p:text-[#d4ddf4]` (lighter than current `#b7c1de`)

- **Strong/Bold text:**
  - Keep white: `prose-strong:text-white`
  - Increase weight: `prose-strong:font-extrabold`

- **Lists:**
  - Larger bullets/numbers: `prose-li:text-4xl`
  - Better spacing: `prose-li:mb-4`

### 4. Keyboard Navigation

**Implement keyboard event listener with these controls:**
- `ArrowLeft` / `ArrowRight`: Navigate between slides
- `Space`: Next slide (standard presentation behavior)
- `Escape`: Exit present mode (return to edit page)
- `Home`: Jump to first slide
- `End`: Jump to last slide

**Implementation notes:**
- Add `useEffect` with keyboard event listener
- Clean up listener on component unmount
- Prevent default browser behavior for these keys
- Show visual feedback when navigating (subtle flash or pulse)

### 5. Smooth Slide Transitions

**Animation Strategy:**
```
Current slide: Fade out (opacity 1 → 0) + Slide left/right slightly (transform translateX)
New slide: Fade in (opacity 0 → 1) + Slide from opposite direction
Duration: 300-400ms
Easing: ease-in-out
```

**Implementation approach:**
- Add transition state: `'entering' | 'exiting' | 'idle'`
- Wrap content in transition wrapper with conditional classes
- Use Tailwind transition utilities: `transition-all duration-300 ease-in-out`
- Direction-aware: slide left when going forward, slide right when going back

**Alternative (simpler):**
- Use Framer Motion's `AnimatePresence` + `motion.div`
- Variants for enter/exit animations
- Key by `currentIndex` to trigger transitions

### 6. Additional UX Polish

**Header Improvements:**
- Increase title size slightly: `text-base` (up from `text-sm`)
- Better gradient fade: Extend gradient area for smoother transition

**Timer Improvements:**
- Increase size: `text-3xl` (up from `text-2xl`)
- Add subtle pulse animation when running
- Better visual feedback on hover

**Progress Dots:**
- Slightly larger active dot: `w-10` (up from `w-8`)
- Smooth transitions: Keep `duration-300`
- Add subtle glow effect on active dot

**Spacing:**
- Increase content padding on large screens: `p-8 lg:p-12 xl:p-16`
- Add bottom padding to prevent button overlap: `pb-20`

**Performance:**
- Use `will-change-transform` on animated elements
- Debounce rapid navigation clicks
- Preload next/previous slide content if needed

## Implementation Tasks

### Task 1: Remove Debug Elements
**Files:** `src/components/PresentMode.tsx`

- Remove touch zone divs (lines 151-173)
- Remove debug button section (lines 133-146)
- Clean up unnecessary console.log statements
- Test that component still renders correctly

### Task 2: Implement Minimal Floating Buttons
**Files:** `src/components/PresentMode.tsx`

Create new button components:
```tsx
{/* Left Navigation Button */}
<button
  onClick={handlePrev}
  disabled={currentIndex === 0}
  className={/* positioning and styling */}
  aria-label="Previous slide"
>
  <ChevronLeft /> {/* or arrow icon */}
</button>

{/* Right Navigation Button */}
<button
  onClick={handleNext}
  disabled={currentIndex === blocks.length - 1}
  className={/* positioning and styling */}
  aria-label="Next slide"
>
  <ChevronRight /> {/* or arrow icon */}
</button>
```

**Styling specifications:**
- Position: `fixed left-4 md:left-8` and `fixed right-4 md:right-8`
- Vertical centering: `top-1/2 -translate-y-1/2`
- Z-index: `z-50` (above content, below header)
- Background: `bg-white/10 backdrop-blur-sm`
- Hover: `hover:bg-white/20 hover:scale-110`
- Transitions: `transition-all duration-200`
- Size: `w-12 h-12 md:w-14 md:h-14` (circular)
- Border radius: `rounded-full`
- Disabled state: `disabled:opacity-30 disabled:cursor-not-allowed`

**Icon options:**
- Use Lucide React icons: `import { ChevronLeft, ChevronRight } from 'lucide-react'`
- Size: `24px` or `28px`
- Color: `text-white`

### Task 3: Enhance Typography
**Files:** `src/components/PresentMode.tsx`

Update the prose classes on the markdown container:

```tsx
<div className="prose prose-invert max-w-none
  prose-headings:font-bold prose-headings:text-[#ac61b9] 
  prose-headings:mb-6 prose-headings:leading-tight
  prose-h1:text-6xl prose-h2:text-5xl prose-h3:text-4xl
  prose-p:text-4xl prose-p:leading-[1.6] 
  prose-p:tracking-wide prose-p:text-[#d4ddf4]
  prose-strong:text-white prose-strong:font-extrabold
  prose-li:text-4xl prose-li:mb-4
  prose-ul:mb-8 prose-ol:mb-8
">
  <ReactMarkdown>{blocks[currentIndex].content}</ReactMarkdown>
</div>
```

**Responsive adjustments:**
Add responsive classes for mobile:
```tsx
prose-p:text-2xl md:prose-p:text-3xl lg:prose-p:text-4xl
prose-h1:text-4xl md:prose-h1:text-5xl lg:prose-h1:text-6xl
```

### Task 4: Add Keyboard Navigation
**Files:** `src/components/PresentMode.tsx`

Add keyboard event handler:

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        handlePrev();
        break;
      case 'ArrowRight':
      case ' ': // Space bar
        e.preventDefault();
        handleNext();
        break;
      case 'Escape':
        e.preventDefault();
        // Navigate back to edit page
        window.location.href = `/dashboard/edit/${speechId}`;
        break;
      case 'Home':
        e.preventDefault();
        setCurrentIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setCurrentIndex(blocks.length - 1);
        break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [currentIndex, blocks.length]);
```

**Notes:**
- Need to pass `speechId` as prop to enable Escape navigation
- Update component interface: `interface PresentModeProps { title: string; blocks: SpeechBlock[]; speechId?: string; }`
- Update page component to pass `speechId`

### Task 5: Implement Slide Transitions
**Files:** `src/components/PresentMode.tsx`, `package.json`

**Option A: Pure CSS approach (recommended for simplicity)**

Add transition state:
```tsx
const [isTransitioning, setIsTransitioning] = useState(false);
const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
```

Update navigation handlers:
```tsx
const handleNext = () => {
  if (currentIndex < blocks.length - 1 && !isTransitioning) {
    setDirection('forward');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setIsTransitioning(false);
    }, 300);
  }
};
```

Apply transition classes:
```tsx
<div className={`transition-all duration-300 ease-in-out ${
  isTransitioning 
    ? direction === 'forward' 
      ? '-translate-x-8 opacity-0' 
      : 'translate-x-8 opacity-0'
    : 'translate-x-0 opacity-100'
}`}>
  <ReactMarkdown>{blocks[currentIndex].content}</ReactMarkdown>
</div>
```

**Option B: Framer Motion approach (smoother, more control)**

Install dependency:
```bash
npm install framer-motion
```

Implementation:
```tsx
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentIndex}
    custom={direction}
    initial={{ opacity: 0, x: direction === 'forward' ? 50 : -50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: direction === 'forward' ? -50 : 50 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    <ReactMarkdown>{blocks[currentIndex].content}</ReactMarkdown>
  </motion.div>
</AnimatePresence>
```

**Recommendation:** Start with Option A (CSS), upgrade to Option B if needed.

### Task 6: Additional Polish
**Files:** `src/components/PresentMode.tsx`

**Header updates:**
```tsx
<h1 className="text-base md:text-lg font-semibold tracking-wider text-[#0b468c] uppercase truncate w-1/2">
```

**Timer updates:**
```tsx
<button className={`text-3xl font-bold font-inter tabular-nums px-5 py-2 rounded-full transition-all duration-200 ${
  isTimerRunning 
    ? 'text-[#ac61b9] bg-[#ac61b9]/10 animate-pulse' 
    : 'text-[#63345e] hover:bg-[#63345e]/10'
}`}>
```

**Progress dots with glow:**
```tsx
<div className={`h-1.5 rounded-full transition-all duration-300 ${
  idx === currentIndex 
    ? 'w-10 bg-[#ac61b9] shadow-[0_0_8px_rgba(172,97,185,0.5)]' 
    : idx < currentIndex 
      ? 'w-2 bg-[#ac61b9]/50' 
      : 'w-2 bg-[#0b468c]'
}`} />
```

**Content container spacing:**
```tsx
<div className="relative z-10 w-full h-full flex flex-col items-center justify-center 
  p-8 md:p-12 lg:p-16 pb-20 pointer-events-none">
```

### Task 7: Update Parent Page Component
**Files:** `src/app/present/[id]/page.tsx`

Add `id` to PresentMode props:
```tsx
<PresentMode 
  title={speech.title} 
  blocks={speech.blocks}
  speechId={params.id}
/>
```

## Validation Plan

### Visual Testing
1. Test on different screen sizes (mobile, tablet, desktop)
2. Verify typography is readable from distance (2-3 meters)
3. Check button visibility and hover states
4. Confirm smooth transitions between slides
5. Verify progress dots animate correctly

### Functional Testing
1. Click navigation buttons (prev/next)
2. Test disabled states (first/last slide)
3. Test keyboard navigation (arrows, space, escape, home, end)
4. Verify timer functionality (start/stop/reset)
5. Test with different content types (short/long text, headings, lists)

### Accessibility Testing
1. Verify ARIA labels on buttons
2. Check keyboard navigation works fully
3. Test screen reader compatibility
4. Verify focus states are visible
5. Check color contrast ratios

### Performance Testing
1. Test transitions with rapid navigation
2. Verify no memory leaks from event listeners
3. Check smooth animations on lower-end devices
4. Monitor re-render performance

## Edge Cases & Considerations

1. **Empty blocks:** Already handled (lines 73-75)
2. **Single block:** Navigation buttons should be disabled
3. **Very long content:** May need scrolling or font size adjustment
4. **Rapid key presses:** Debounce navigation to prevent skipping
5. **Browser compatibility:** Test in Chrome, Firefox, Safari
6. **Touch devices:** Ensure buttons are tap-friendly (min 44px touch target)

## Migration Notes

- No database changes required
- No breaking changes to component interface (only additions)
- Backward compatible with existing speech data
- Can be deployed incrementally

## Dependencies

**Optional (for Framer Motion approach):**
```json
{
  "framer-motion": "^11.x.x"
}
```

**Icon library (if not already installed):**
```json
{
  "lucide-react": "^0.x.x"
}
```

**Check if already available:** Review `package.json` before installing.

## Rollout Strategy

1. **Phase 1:** Remove debug elements, add floating buttons
2. **Phase 2:** Enhance typography
3. **Phase 3:** Add keyboard navigation
4. **Phase 4:** Implement transitions
5. **Phase 5:** Final polish and testing

Each phase can be tested independently before proceeding.

## Out of Scope

- Presenter notes or dual-screen mode
- Slide thumbnails or overview mode
- Slide editing within present mode
- Recording or screenshot functionality
- Custom themes or color schemes
- PDF export of slides

## Success Criteria

✅ Debug elements completely removed  
✅ Minimal floating navigation buttons functional  
✅ Typography clearly readable from 2-3 meters  
✅ Smooth slide transitions (300ms fade + slide)  
✅ Full keyboard navigation support  
✅ No console errors or warnings  
✅ Responsive on mobile, tablet, and desktop  
✅ Maintains current timer and progress dot functionality  
✅ Professional, distraction-free presentation experience
