

# Plan: Auto-Translation, Drug Groups, Terminology, Account/Pro, and Quick Enhancements

## Summary

Five workstreams: (1) Auto-translate procedure content FR->EN/PT via Lovable AI edge function, (2) Drug grouping on procedure page, (3) Replace "Procedimento" with "Intervenção" in PT, (4) Account page + Pro gating UI (Stripe sandbox prep), (5) Checklist mode + Generate summary.

---

## Workstream 1: Auto-Translation of Procedure Content

### 1.1 Edge Function: `supabase/functions/translate-content/index.ts`

- Receives `{ procedureId, targetLang, content }` (the FR content object)
- Uses Lovable AI Gateway (`google/gemini-3-flash-preview`) to translate
- System prompt: "Translate the following medical/anesthesia content from French to {lang}. Maintain JSON structure exactly. Do not add or remove keys. Translate only text values."
- Returns translated content object with same structure (preop/intraop/postop/red_flags/drugs preserved)
- Non-streaming (uses `supabase.functions.invoke`)

Config in `supabase/config.toml`:
```toml
[functions.translate-content]
verify_jwt = false
```

### 1.2 Translation Hook: `src/hooks/useAutoTranslation.ts`

- Takes `procedureId`, `lang`, `contentFr`
- Returns `{ translatedContent, isTranslating, isAutoTranslated }`
- Cache in localStorage keyed by `anesia-translation-{procedureId}-{lang}`
- Only triggers when `lang !== 'fr'` and `procedure.quick[lang]` is missing
- Uses React Query with long staleTime (24h)

### 1.3 ProcedurePage Changes

- When `isFallbackLang` is true, call `useAutoTranslation`
- Replace FR-only banner with "Auto-translated" badge + toggle "View original (FR)"
- Toggle switches between translated content and FR content
- Admin users see "Save EN translation" / "Save PT translation" button
- Save button calls Supabase update on the procedure row, filling `content.quick.{lang}` and `content.deep.{lang}`
- Add `content_meta` field with `{ [lang]: { generated_at, review_status: 'auto' | 'reviewed' } }`

### 1.4 Admin Save Logic

- On save, update procedure in Supabase: merge translated content into `content.quick.{lang}` and `content.deep.{lang}`
- After save, invalidate React Query cache for that procedure
- Admin check: use `useEntitlements` or a simple `has_role` RPC check

---

## Workstream 2: Drug Groups on Procedure Page

### 2.1 Drug Group Categorization

Add a `group` field to each drug reference in `quick.{lang}.drugs`. Groups:
- `induction` -- Propofol, Sufentanil, Rocuronium, Ketamine
- `maintenance` -- Sevoflurane
- `analgesia` -- Paracetamol, Ibuprofene, Ketorolac, Morphine, Ketamine
- `ponv` -- Ondansetron, Dexamethasone
- `prophylaxis` -- Cefazoline, Acide tranexamique, Enoxaparine

### 2.2 UI Changes in ProcedurePage

- Group drugs by `indication_tag` or a new mapping function `getDrugGroup(drugId, indicationTag)`
- Render sections with headers: "Induction", "Maintenance", "Analgesia", "PONV", "Prophylaxis"
- Create `src/lib/drugGroups.ts` with mapping logic
- Each group is a collapsible section with group icon/color

### 2.3 Admin Quality Validator: `/admin/quality`

New page `src/pages/AdminQuality.tsx`:
- Lists procedures missing drugs
- Lists drugs with missing units/dose_scalar
- Lists procedures with empty references
- Quick fix buttons (link to procedure edit)
- Route added to `App.tsx`

---

## Workstream 3: "Procedimento" to "Intervenção" (PT)

### 3.1 i18n Key Updates

In `LanguageContext.tsx`, update all PT strings:
- `all_procedures`: "Todas as intervenções"
- `search_placeholder`: "Pesquisar uma intervenção..."
- Other occurrences: "procedimento(s)" -> "intervenção(ões)"

### 3.2 Affected Keys
- `all_procedures`, `search_placeholder`, `view_all_procedures`, `no_results` context
- New key `intervention_detail` for procedure detail page heading

---

## Workstream 4: Account Page + Pro Gating

### 4.1 New Page: `src/pages/Account.tsx`

- Route `/account` in App.tsx
- Shows current plan (Free/Pro) via `useEntitlements`
- Feature comparison table (Free vs Pro)
- "Upgrade to Pro" button
- When `STRIPE_ENABLED` is false (env var check or hardcoded flag), button shows "Coming soon" / "Em preparação"

### 4.2 Database: `user_profiles` Table

Migration to create:
```sql
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
-- Users read/update own profile
CREATE POLICY "Users read own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
```

Note: `plans` and `user_entitlements` tables already exist.

### 4.3 Stripe Preparation (Sandbox)

- Edge function `supabase/functions/stripe-checkout/index.ts` (stub)
- Returns `{ error: "Stripe not enabled" }` when env `STRIPE_SECRET_KEY` is not set
- No actual Stripe integration yet -- just the skeleton
- ProGate modal "Upgrade" button links to `/account`

### 4.4 Nav Update

- Add `/account` to the mobile menu (visible when logged in)
- AppLayout: plan badge becomes a link to `/account`

---

## Workstream 5: Quick Enhancements

### 5.1 Checklist Mode on Procedure Page

- Toggle button "Checklist mode" at top of ProcedurePage
- When active, each bullet in preop/intraop/postop gets a checkbox
- State stored in component (not persisted)
- Uses `Checkbox` component from UI library
- Progress indicator: "3/8 completed"

### 5.2 Generate Summary (Copy/Export)

- Button "Generate summary" on ProcedurePage
- Generates text with: procedure title, patient weight, calculated doses, scores
- Copies to clipboard with `navigator.clipboard.writeText()`
- Toast confirmation
- Extends existing `handleCopyChecklist` with dose information

---

## i18n Keys to Add

```
auto_translated / view_original / save_translation_en / save_translation_pt
translation_saved / translating
drug_group_induction / drug_group_maintenance / drug_group_analgesia / drug_group_ponv / drug_group_prophylaxis
checklist_mode / checklist_progress / generate_summary / summary_copied
account / current_plan / upgrade_pro / coming_soon / pro_features_list
intervention (PT only replacement)
quality_dashboard / missing_drugs / missing_units / missing_refs
```

---

## Technical Summary

| File | Action |
|------|--------|
| `supabase/functions/translate-content/index.ts` | New -- AI translation edge function |
| `supabase/config.toml` | Add translate-content function config |
| DB migration | Create `user_profiles` table |
| `src/hooks/useAutoTranslation.ts` | New -- auto-translation hook with cache |
| `src/lib/drugGroups.ts` | New -- drug group mapping |
| `src/pages/Account.tsx` | New -- account/plan page |
| `src/pages/AdminQuality.tsx` | New -- quality validator |
| `src/pages/ProcedurePage.tsx` | Auto-translation UI, checklist mode, drug groups, summary |
| `src/components/anesia/ProGate.tsx` | Link upgrade to /account |
| `src/components/anesia/AppLayout.tsx` | Plan badge links to /account |
| `src/contexts/LanguageContext.tsx` | ~25 new i18n keys + PT terminology fix |
| `src/App.tsx` | Add /account and /admin/quality routes |

## Implementation Order

1. DB migration (user_profiles)
2. Edge function (translate-content) + config.toml
3. useAutoTranslation hook
4. ProcedurePage: auto-translation UI + checklist mode + summary
5. drugGroups.ts + drug grouping in ProcedurePage
6. PT terminology fix (i18n)
7. Account page + ProGate link
8. AdminQuality page
9. All i18n keys
10. QA

