

# Plan: AnesIA Architecture Overhaul + Feature Gating + Scores + Bug Fixes

## Summary

This is a major overhaul covering 7 workstreams: (1) confirm Supabase-first data layer, (2) Free/Pro gating, (3) fix Dose Calculator in /calculateurs, (4) clinical score calculators, (5) complete specialties, (6) polish CSV import, (7) QA fixes.

---

## Phase 1: Confirm Supabase as Source of Truth

**Current state**: DataContext already loads from Supabase first with JSON fallback + merge for missing drugs. This is working correctly.

**Changes needed**:
- **`src/contexts/DataContext.tsx`**: Add `content` field wrapping logic in `dbRowToProcedure()` to handle cases where `content.quick` is not wrapped by language key. If `content.quick` exists but has no `fr`/`en`/`pt` sub-keys (i.e. has `preop` directly), auto-wrap as `{ fr: content.quick }`.
- Same for `content.deep`.
- Ensure merge logic fills missing `drugs` arrays from JSON fallback (already done, just verify).

No DB schema changes needed -- tables already exist and match.

---

## Phase 2: Free vs Pro Feature Gating

### 2.1 Database

Create two new tables via migration:

```text
plans (id text PK, name text, features jsonb)
  - Seed: 'free' and 'pro'

user_entitlements (id uuid PK, user_id uuid FK auth.users, plan_id text FK plans, active bool, expires_at timestamptz)
  - RLS: users read own, admin write
```

Add `is_pro` boolean column (default false) to `procedures` table.

### 2.2 Hook: `src/hooks/useEntitlements.ts` (new)

- Fetch user's active entitlement from `user_entitlements`
- Return `{ plan: 'free' | 'pro', isPro: boolean, loading: boolean }`
- Unauthenticated users = free
- Cache in React Query

### 2.3 Pro Gate Component: `src/components/anesia/ProGate.tsx` (new)

- Wrapper that checks entitlement
- If free user tries Pro content: show modal "This is a Pro feature" with placeholder CTA
- Used around procedure detail, advanced calculators, etc.

### 2.4 UI Changes

- **`ProcedureCard.tsx`**: Show small "PRO" badge if `procedure.is_pro` (from a new optional field in Procedure type)
- **`ProcedurePage.tsx`**: Wrap content in `ProGate` if procedure is Pro
- **`AppLayout.tsx`**: Add "Account / Plan" item showing current plan (for authenticated users)

### 2.5 Type changes

- Add `is_pro?: boolean` to `Procedure` interface in `types.ts`
- Update `dbRowToProcedure` to read from DB row

---

## Phase 3: Fix Dose Calculator in /calculateurs

**Bug**: `Calculateurs.tsx` marks "Dose calculator" as `available: true` but only renders `ETTCalculator` for the "ett" id. The "dose" id has no component.

### 3.1 New component: `src/components/anesia/DoseCalculator.tsx`

Standalone dose calculator (not tied to a procedure):
- Drug selector (search/dropdown from all drugs in DataContext)
- PatientAnthropometrics component for weight/height/sex
- Shows all dose_rules for selected drug
- Calculates doses using `calculateDose()` with PatientWeights
- Dose Rationale button per rule
- Concentration selector

### 3.2 Update `Calculateurs.tsx`

- Import `DoseCalculator`
- Render it when `expanded === 'dose'`
- Replace Mallampati and BMI with new score calculators (Phase 4)

---

## Phase 4: Clinical Score Calculators

### 4.1 Score engine: `src/lib/scores.ts` (new)

Pure functions for each score:
- `calcSTOPBANG(inputs)` -- returns score 0-8 + risk category
- `calcRCRI(inputs)` -- returns score 0-6 + risk %
- `calcApfel(inputs)` -- returns score 0-4 + PONV risk %
- `calcCaprini(inputs)` -- returns total + VTE risk category

Each function takes a typed input object and returns `{ score: number, category: string, details: string }`.

### 4.2 Components (one per score, in `src/components/anesia/scores/`)

- `StopBangScore.tsx` -- 8 yes/no checkboxes (Snore, Tired, Observed, Pressure, BMI>35, Age>50, Neck>40cm, Gender male) + result card
- `RCRIScore.tsx` -- 6 checkboxes + risk table
- `ApfelScore.tsx` -- 4 checkboxes + risk percentage
- `CapriniScore.tsx` -- multi-factor checklist grouped by point value + total + recommendation

All scores:
- Work offline (pure local calculation)
- i18n FR/EN/PT
- Compact mobile-first UI
- Optional: save last inputs in localStorage

### 4.3 Update `Calculateurs.tsx`

Replace the static CALCULATORS array with expanded list:
- Dose Calculator (available)
- ETT/Intubation (available)
- STOP-BANG (available)
- RCRI/Lee (available)
- Apfel PONV (available)
- Caprini VTE (available)

Each renders its component when expanded.

---

## Phase 5: Complete Specialties List

**Current**: 7 specialties in DB. Procedures only cover these 7.

Add more specialties to the `specialties` table to be ready for future procedures:
- Chirurgie cardiaque / Cardiac Surgery
- Chirurgie vasculaire / Vascular Surgery
- Chirurgie thoracique / Thoracic Surgery
- Chirurgie plastique / Plastic Surgery
- Ophtalmologie / Ophthalmology
- Chirurgie pédiatrique / Pediatric Surgery
- Chirurgie bariatrique / Bariatric Surgery
- Chirurgie maxillo-faciale / Maxillofacial Surgery
- Transplantation / Transplant Surgery

These will be inserted via the data insert tool (not migration).

### 5.1 SpecialtyChips multilingual display

Currently chips show raw `procedure.specialty` string (e.g. "Orthopédie").
Update `SpecialtyChips` and `Index.tsx` to use `specialtiesData` from DataContext for multilingual display:
- Map specialty slug to `specialtiesData[].name[lang]`
- Fallback to raw string if not found

---

## Phase 6: Polish CSV Import

The import page (`AdminImportProcedures.tsx`) already works. Enhancements:
- Add a "Download template CSV" button
- Add validation: check if `specialty` exists in specialties table (warn if not)
- Show more detail in preview (title in all 3 languages)
- Better error display with row numbers

---

## Phase 7: i18n Keys

Add to `LanguageContext.tsx`:

```text
-- Scores
stop_bang: STOP-BANG (SAOS)
rcri: RCRI / Lee
apfel: Apfel (PONV)
caprini: Caprini (TEV)
score: Score
risk_low / risk_moderate / risk_high / risk_very_high
snore / tired / observed_apnea / blood_pressure / bmi_over_35 / age_over_50 / neck_circumference / gender_male
high_risk_surgery / ischemic_heart / congestive_heart / cerebrovascular / insulin_therapy / creatinine_elevated
female_gender / non_smoker / ponv_history / postop_opioids
-- Pro gating
pro_feature / pro_feature_desc / upgrade_pro
-- Account
account / current_plan / plan_free / plan_pro
-- Dose calculator standalone
select_drug / search_drug
-- Misc
no_doses_configured
```

---

## Phase 8: QA Fixes

1. **Drugs disappearing**: The merge logic in DataContext already handles this. Verify by checking that `quick.{lang}.drugs` is populated after DB load + JSON merge.

2. **Dose calculator "available" but empty**: Fixed in Phase 3.

3. **Advanced mode not affecting doses**: Already implemented -- `DrugDoseRow` receives `patientWeights` and passes to `calculateDose`. Verify the flow works end-to-end.

4. **`dbRowToProcedure` content wrapping**: Add defensive check for unwrapped content (Phase 1).

---

## Technical Summary

| File | Action |
|------|--------|
| DB migration | `plans`, `user_entitlements` tables; add `is_pro` to `procedures` |
| DB insert | Additional specialties |
| `src/lib/types.ts` | Add `is_pro` to Procedure |
| `src/lib/scores.ts` | New -- score calculation functions |
| `src/hooks/useEntitlements.ts` | New -- plan/entitlement hook |
| `src/components/anesia/ProGate.tsx` | New -- Pro feature gate modal |
| `src/components/anesia/DoseCalculator.tsx` | New -- standalone dose calc |
| `src/components/anesia/scores/StopBangScore.tsx` | New |
| `src/components/anesia/scores/RCRIScore.tsx` | New |
| `src/components/anesia/scores/ApfelScore.tsx` | New |
| `src/components/anesia/scores/CapriniScore.tsx` | New |
| `src/contexts/DataContext.tsx` | Content wrapping fix, is_pro field |
| `src/pages/Calculateurs.tsx` | Wire dose calc + all scores |
| `src/pages/ProcedurePage.tsx` | ProGate wrapper |
| `src/components/anesia/ProcedureCard.tsx` | PRO badge |
| `src/components/anesia/SpecialtyChips.tsx` | Multilingual display |
| `src/pages/Index.tsx` | Use specialtiesData for display |
| `src/pages/AdminImportProcedures.tsx` | Polish validation |
| `src/components/anesia/AppLayout.tsx` | Account/Plan display |
| `src/contexts/LanguageContext.tsx` | ~30 new i18n keys |

## Implementation Order

1. DB migration (plans, user_entitlements, is_pro column)
2. DB inserts (additional specialties)
3. Types + DataContext fixes (content wrapping, is_pro)
4. Score library (`src/lib/scores.ts`)
5. Score UI components (4 files)
6. DoseCalculator component
7. useEntitlements hook + ProGate component
8. Calculateurs.tsx overhaul (all scores + dose calc)
9. ProcedureCard PRO badge + ProcedurePage ProGate
10. SpecialtyChips multilingual
11. AppLayout account/plan display
12. i18n keys throughout
13. Import page polish
14. QA pass

