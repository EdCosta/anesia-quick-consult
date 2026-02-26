

# Plan: Smart Specialty Chips with Usage-Based Ordering

## Overview

Replace the current `SpecialtyFilter` with a smart chip bar that shows top specialties ordered by usage frequency, with a "+" button to access the full list. Specialties come from the database (with fallback to procedure-derived list).

## 1. Database: Create `specialties` Table

Create a new table to store specialty metadata with multi-language names.

```sql
CREATE TABLE public.specialties (
  id text PRIMARY KEY,
  name jsonb NOT NULL DEFAULT '{}',    -- { fr, en, pt }
  synonyms jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  sort_base integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read specialties" ON public.specialties
  FOR SELECT USING (true);

-- Admin write/update/delete
CREATE POLICY "Admin write specialties" ON public.specialties
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin update specialties" ON public.specialties
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin delete specialties" ON public.specialties
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
```

Then seed with initial data (the specialties currently derived from procedures), with multilingual names and sort_base ordering.

## 2. DataContext: Load Specialties from DB

**File: `src/contexts/DataContext.tsx`**

- Add a `Specialty` type: `{ id: string; name: { fr: string; en?: string; pt?: string }; synonyms?: string[]; is_active: boolean; sort_base: number }`
- Add `specialtiesData: Specialty[]` to context (rename current `specialties: string[]` to keep backward compat or adapt)
- In `loadFromSupabase`: fetch from `specialties` table where `is_active = true`, order by `sort_base`
- Fallback: if DB returns empty, derive from procedures as today (unique `procedure.specialty` values)
- Expose both `specialties` (string[]) for backward compat and `specialtiesData` (Specialty[]) for the new chip component

## 3. Specialty Usage Tracking (localStorage)

**File: `src/hooks/useSpecialtyUsage.ts`** (new)

Custom hook that manages `anesia-specialty-usage` in localStorage:

```typescript
interface SpecialtyUsage { [specialtyId: string]: number }

function useSpecialtyUsage() {
  const [usage, setUsage] = useLocalStorage<SpecialtyUsage>('anesia-specialty-usage', {});

  const increment = (specialtyId: string) => {
    setUsage(prev => ({ ...prev, [specialtyId]: (prev[specialtyId] || 0) + 1 }));
  };

  const getSorted = (allSpecialties: string[]): string[] => {
    return [...allSpecialties].sort((a, b) => (usage[b] || 0) - (usage[a] || 0));
  };

  return { usage, increment, getSorted };
}
```

## 4. New SpecialtyChips Component

**File: `src/components/anesia/SpecialtyChips.tsx`** (new, replaces SpecialtyFilter)

Props:
- `specialties: string[]` -- full list (already sorted by usage)
- `selected: string | null`
- `onSelect: (s: string | null) => void`
- `maxVisible?: number` (default 8)

UI:
- Horizontal scroll container (`overflow-x-auto flex gap-2 scrollbar-none`)
- "All" chip first (always visible)
- Top N chips from sorted list
- "+" chip at the end -- opens a Popover/Dialog with:
  - Search input to filter the full specialty list
  - Scrollable list of all specialties with checkboxes (single-select to match current behavior)
  - "Clear" button
- Active chip gets `bg-primary text-primary-foreground` styling
- Touch-friendly: min 40px height

## 5. Index.tsx Integration

**File: `src/pages/Index.tsx`**

- Import `useSpecialtyUsage` hook
- Replace `SpecialtyFilter` with `SpecialtyChips`
- Sort specialties using `getSorted()` before passing to chips
- Call `increment(specialty)` when:
  - User selects a specialty chip
  - User navigates to a procedure (increment that procedure's specialty)
- Pass sorted specialties to the new component
- Chips stay visible during search (already the case)

## 6. Increment on Procedure Navigation

In `Index.tsx`, when a procedure card is clicked (via `ProcedureCard` or recent link), call `increment(procedure.specialty)`. This can be done by wrapping the navigate/link action or by adding an `onClick` prop to `ProcedureCard`.

## 7. i18n Keys

Add to `LanguageContext.tsx`:
- `choose_specialties`: { fr: "Choisir spécialités", pt: "Escolher especialidades", en: "Choose specialties" }
- `search_specialties`: { fr: "Rechercher...", pt: "Pesquisar...", en: "Search..." }
- `clear`: { fr: "Effacer", pt: "Limpar", en: "Clear" }
- `apply`: { fr: "Appliquer", pt: "Aplicar", en: "Apply" }

---

## Technical Summary

| File | Action |
|------|--------|
| Database migration | Create `specialties` table + seed data |
| `src/contexts/DataContext.tsx` | Load specialties from DB with fallback |
| `src/hooks/useSpecialtyUsage.ts` | New hook for localStorage usage tracking |
| `src/components/anesia/SpecialtyChips.tsx` | New component replacing SpecialtyFilter |
| `src/pages/Index.tsx` | Wire up new chips, usage tracking, sorting |
| `src/contexts/LanguageContext.tsx` | Add i18n keys |

