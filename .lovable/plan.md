# Plan: Major Refactor -- i18n, DataContext, Guidelines, Dosing, Pro Gating, Drug Groups, Terminology

## Overview

Eight workstreams addressing i18n content translation, DataContext cleanup, tag-based guideline matching, unified dosing engine, Pro/Normal gating with switch, drug group completeness, and terminology standardization.

---

## 1. i18n: Auto-Translation with Persistence

### Current State

- `useAutoTranslation.ts` hook exists, calls `translate-content` edge function
- ProcedurePage already shows FR-only banner, auto-translated badge, and view-original toggle
- Missing: admin save button to persist translations back to DB

### Changes

**`src/pages/ProcedurePage.tsx`**:

- Add admin check using `useIsAdmin()` hook (new, calls `has_role` via Supabase RPC)
- When `isAutoTranslated` and user is admin, show "Save EN" / "Save PT" button
- On save: merge translated content into procedure's `content.quick.{lang}` and `content.deep.{lang}` via Supabase update, plus add `content_meta.{lang}.generated_at` and `review_status: 'auto'`
- Invalidate React Query cache after save

**`src/hooks/useIsAdmin.ts`** (new):

- Calls `supabase.rpc('has_role', { _user_id: userId, _role: 'admin' })`
- Returns `{ isAdmin, loading }`
- Cached via React Query with 5min staleTime

### Edge Function

- `translate-content` already exists and works -- no changes needed

---

## 2. DataContext Refactor

### Current State

- `DataContext.tsx` is ~200 lines with inline DB-to-model mapping, JSON fallback, validation, and merging all mixed together

### Changes

Create modular files:

**`src/data/normalize/normalizeProcedure.ts`**:

- Extract `wrapByLang()` and `dbRowToProcedure()` from DataContext
- Improve `wrapByLang`: if object already has `fr`/`en`/`pt` keys, keep as-is; if flat, wrap as `{ fr: flat }`
- Add Zod validation at entry point

**`src/data/normalize/normalizeDrug.ts`**:

- Extract `dbRowToDrug()`

**`src/data/normalize/normalizeGuideline.ts`**:

- Extract `dbRowToGuideline()`, `dbRowToProtocole()`, `dbRowToALRBlock()`

**`src/data/repositories/loadFromSupabase.ts`**:

- Extract `loadFromSupabase()` function
- Import normalizers

**`src/data/repositories/loadFromJson.ts`**:

- Extract `loadFromJson()` and `validateArray()`

**`src/data/merge/mergeProcedureFallback.ts`**:

- Extract the JSON-merge logic (fill missing `quick.{lang}.drugs` from JSON)

**`src/contexts/DataContext.tsx`**:

- Becomes a slim orchestrator: imports `loadFromSupabase`, `loadFromJson`, `mergeProcedureFallback`
- Provider + hooks only, ~60 lines

---

## 3. Guidelines: Tag-Based Matching

### Current State

- ProcedurePage uses substring heuristics (lines 60-74): checks if specialty includes "ortho", if title includes "thromboprophylaxie", etc.
- Guidelines table has a `tags` column (jsonb) but it's not used for matching
- Procedures table has a `tags` column (jsonb)

### Changes

**`src/pages/ProcedurePage.tsx`** -- replace `recommendations` useMemo:

- Instead of substring scoring, compute tag intersection: `procedure.tags intersect guideline.tags`
- Also match by specialty if guideline has a `specialties` tag array
- Score = number of matching tags
- Sort by score desc, take top 5
- Fallback: if procedure has no tags, use category-based matching (airway, ponv, etc.)

**Data requirement**: Ensure procedures and guidelines in DB have meaningful `tags`. The existing DB schema already supports this -- no migration needed. Data population can be done via admin or insert tool.

---

## 4. Unified Dosing Engine

### Current State

- `src/lib/dose.ts` has `calculateDose()` -- used by `DrugDoseRow`
- `DoseCalculator` also uses `DrugDoseRow` which calls `calculateDose()`
- Both already share the same code path through `DrugDoseRow` component
- **Assessment**: The dosing logic is already unified. Both DoseCalculator and ProcedurePage use `DrugDoseRow` which calls `calculateDose()` from `src/lib/dose.ts`.

### Changes (minor cleanup)

**`src/lib/dosingEngine.ts`** (new, optional refactor):

- Re-export `calculateDose`, `computeWeights`, `getScaledWeight` from a single entry point
- Add `explainDose()` helper that returns a human-readable string for the dose rationale (currently inline in DrugDoseRow)
- Add `formatDose()` helper for consistent rounding

This is a cosmetic refactor since the logic is already shared. The key improvement is extracting `explainDose()` so both DoseCalculator's popover and ProcedurePage's "generate summary" use the same explanation format.

---

## 5. Pro/Normal Gating with Header Switch

### Current State

- `ProGate` component exists, wraps pro-only content with lock modal
- `useEntitlements` checks `user_entitlements` table
- Only applied on ProcedurePage for `procedure.is_pro`
- No gating on list/cards, guidelines, ALR, protocols, calculators

### Changes

**`src/hooks/useViewMode.ts`** (new):

- Reads/writes `localStorage('anesia-view-mode')`: `'normal' | 'pro'`
- Returns `{ viewMode, setViewMode, isProView }`
- `isProView = viewMode === 'pro' && isPro` (real entitlement required)
- In normal mode: apply content limits

**`src/hooks/useContentLimits.ts`** (new):

- When `viewMode === 'normal'` or user has no Pro entitlement:
  - Procedures: show max 5 (most used or configurable)
  - Protocols: max 3
  - ALR: max 3
  - Calculators: max 3
  - Guidelines: max 3
- Returns `{ limitProcedures, limitProtocols, limitALR, limitCalc, limitGuidelines }`
- Items beyond limit show lock icon

**`src/components/anesia/AppLayout.tsx`**:

- Add a discrete Normal/Pro switch toggle in header (next to language switcher)
- Only visible when user is logged in
- Uses `useViewMode`

**`src/pages/Index.tsx`**:

- Apply content limits: slice `filteredResults` to limit, show locked cards after limit
- Locked cards: show title + specialty but with lock overlay, clicking opens ProGate modal

**`src/pages/Guidelines.tsx`**, **`src/pages/ALR.tsx`**, **`src/pages/Protocoles.tsx`**, **`src/pages/Calculateurs.tsx`**:

- Apply respective limits from `useContentLimits`
- Items beyond limit show with lock overlay

**`src/components/anesia/ProcedureCard.tsx`**:

- Accept `locked` prop; when true, show lock badge and grey overlay

---

## 6. Drug Groups: Complete, Normalize, Visualize

### Current State

- `src/lib/drugGroups.ts` exists with mapping logic
- ProcedurePage renders grouped drugs in collapsible sections
- AdminQuality page exists but is basic

### Changes

**`src/lib/drugGroups.ts`**:

- Expand `DRUG_GROUP_MAP` with more drugs (ketamine for both induction and analgesia context)
- Add `INDICATION_GROUP_MAP` entries for more tags

**`src/pages/AdminQuality.tsx`** -- expand checks:

- Add: procedures missing induction group
- Add: procedures missing maintenance group
- Add: procedures missing analgesia group
- Add: drugs with missing `dose_scalar`
- Add: procedures with empty references
- Add: quick-fix link to apply drug template

**Drug templates** (data concern):

- Create a mapping `DRUG_TEMPLATES` by specialty in `src/lib/drugTemplates.ts`
- E.g., `orthopedie` template = [propofol/induction, sufentanil/induction, rocuronium/induction, sevoflurane/maintenance, paracetamol/analgesia, ketorolac/analgesia, ondansetron/ponv, cefazoline/prophylaxis]
- AdminQuality can show "Apply template" button per procedure

---

## 7. Terminology: "Procedimento/Procedure" to "Intervention/Intervencion"

### Current State

- PT already uses "Intervenção" in some keys (done previously)
- FR still says "procédures" in some places
- EN still says "procedures"

### Changes

**`src/contexts/LanguageContext.tsx`** -- update keys:

| Key                   | FR (new)                         | EN (new)                      | PT (kept)               |
| --------------------- | -------------------------------- | ----------------------------- | ----------------------- |
| `all_procedures`      | "Toutes les interventions"       | "All interventions"           | "Todas as intervencoes" |
| `search_placeholder`  | "Rechercher une intervention..." | "Search an intervention..."   | (keep)                  |
| `view_all_procedures` | "Voir toutes les interventions"  | "View all interventions"      | (keep)                  |
| `procedures_title`    | "Interventions"                  | "Interventions"               | "Intervencoes"          |
| `select_procedure`    | "Intervention chirurgicale"      | "Surgical intervention"       | "Intervencao cirurgica" |
| `import_procedures`   | "Importer interventions"         | "Import interventions"        | "Importar intervencoes" |
| `missing_drugs`       | "Interventions sans medicaments" | "Interventions without drugs" | (keep)                  |

Also scan for any hardcoded "Procedure" strings in JSX.

---

## 8. i18n Keys Summary (new/updated)

New keys to add:

```
save_translation / translation_saving / admin_only
intervention_detail / interventions_count
mode_normal / mode_pro / switch_mode
content_locked / upgrade_to_unlock
apply_template / template_applied / incomplete_drugs
```

---

## Technical Summary

| File                                        | Action                                            |
| ------------------------------------------- | ------------------------------------------------- |
| `src/hooks/useIsAdmin.ts`                   | New -- admin role check via RPC                   |
| `src/hooks/useViewMode.ts`                  | New -- Normal/Pro view mode switch                |
| `src/hooks/useContentLimits.ts`             | New -- content limit rules per mode               |
| `src/data/normalize/normalizeProcedure.ts`  | New -- extracted normalizer                       |
| `src/data/normalize/normalizeDrug.ts`       | New -- extracted normalizer                       |
| `src/data/normalize/normalizeGuideline.ts`  | New -- extracted normalizers                      |
| `src/data/repositories/loadFromSupabase.ts` | New -- extracted loader                           |
| `src/data/repositories/loadFromJson.ts`     | New -- extracted loader                           |
| `src/data/merge/mergeProcedureFallback.ts`  | New -- extracted merge logic                      |
| `src/lib/dosingEngine.ts`                   | New -- unified dosing re-exports + helpers        |
| `src/lib/drugTemplates.ts`                  | New -- specialty-based drug templates             |
| `src/contexts/DataContext.tsx`              | Slim down to orchestrator                         |
| `src/pages/ProcedurePage.tsx`               | Admin save translation, tag-based recommendations |
| `src/pages/Index.tsx`                       | Pro gating on list                                |
| `src/pages/Guidelines.tsx`                  | Pro gating limits                                 |
| `src/pages/ALR.tsx`                         | Pro gating limits                                 |
| `src/pages/Protocoles.tsx`                  | Pro gating limits                                 |
| `src/pages/Calculateurs.tsx`                | Pro gating limits                                 |
| `src/pages/AdminQuality.tsx`                | Expanded checks + templates                       |
| `src/components/anesia/AppLayout.tsx`       | Normal/Pro switch                                 |
| `src/components/anesia/ProcedureCard.tsx`   | `locked` prop                                     |
| `src/contexts/LanguageContext.tsx`          | Terminology update + new keys                     |

## Implementation Order

1. `useIsAdmin` hook
2. DataContext refactor (extract files, keep behavior identical)
3. Terminology update (i18n keys)
4. Tag-based guideline matching in ProcedurePage
5. Admin save translation in ProcedurePage
6. `useViewMode` + `useContentLimits` hooks
7. Pro gating in AppLayout header switch
8. Pro gating in all list pages (Index, Guidelines, ALR, Protocoles, Calculateurs)
9. `dosingEngine.ts` + `explainDose()` extraction
10. Drug templates + AdminQuality expansion
11. QA pass
