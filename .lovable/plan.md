

# Plan: Home UX Overhaul + Drugs Section Resilience

## 1. Search Results "Above the Fold" (Index.tsx)

When `searchQuery.trim()` is not empty:
- Show results immediately below the search bar, inside the hero section
- Hide: Quick Access grid, Stats row, Favorites section, Recents section
- Show "Sem resultados" inline if `filteredResults.length === 0`

When `searchQuery` is empty:
- Show normal layout (with improvements below)

**Implementation**: Wrap the quick access, stats, favorites, and recents sections in a conditional `{!searchQuery.trim() && (...)}`. Move the results rendering up, right after the search bar + specialty filter, inside the hero area.

## 2. Quick Access: Replace Grid with FAB (Index.tsx)

Remove the 6-card grid from the hero section entirely. Replace with:
- A floating action button (FAB) fixed at bottom-right corner (`fixed bottom-6 right-6`)
- Icon: `Zap` (lightning bolt) from lucide-react
- On click: opens a Popover menu with 5 compact action items (Favorites toggle, Recents scroll, ETT Calculator, Pre-Anest, Clear filters)
- Popover closes on outside click (built-in Radix behavior)
- Mobile-friendly: 56px touch target

**Files**: `src/pages/Index.tsx`, uses existing `Popover` component from `src/components/ui/popover.tsx`

## 3. Recents: Horizontal Compact Scroll (Index.tsx)

Replace the vertical `ProcedureCard` list with:
- Horizontal scroll container (`flex overflow-x-auto gap-2 pb-2 snap-x`)
- Small cards: title + specialty badge only, ~160px wide, clickable (Link to `/p/{id}`)
- "Clear recents" as a small Trash icon button in the section header (no text label)
- If no recents, hide the entire section (already done)

## 4. Favorites: Compact + Collapsible (Index.tsx)

- Show max 3 favorites by default
- Add "Show all" / "Collapse" toggle button if more than 3
- Use `useState` for expanded state
- Smaller empty state (remove large icon, keep just one-line text)

## 5. Drugs Section Resilience (DataContext.tsx + ProcedurePage.tsx)

**Current status**: Drugs work correctly when DB has data. The `dbRowToProcedure` correctly maps `content.quick` (which contains `{fr: {drugs: [...]}}`) to the `Procedure.quick` shape.

**Add resilience**:
- In `DataContext.tsx`: after loading from DB, also load JSON as fallback. For each DB procedure, if `quick.fr.drugs` is empty/missing, merge drugs from the matching JSON procedure.
- In `ProcedurePage.tsx`: if `quick` exists but `quick.drugs` is empty, show an info message "No drug doses configured for this procedure" instead of silently hiding the section.

## 6. Reduce Hero Height

- Reduce `pt-16` to `pt-8` and `pb-8` to `pb-4` on the hero gradient container
- This pushes the procedure list closer to the search bar

---

## Technical Summary

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Search results above fold, FAB replaces quick access grid, horizontal recents, collapsible favorites, reduced hero padding |
| `src/contexts/DataContext.tsx` | JSON fallback merge for missing drug data in DB procedures |
| `src/pages/ProcedurePage.tsx` | Show "no drugs" message when drugs array is empty |

No new files needed. No database changes needed.

