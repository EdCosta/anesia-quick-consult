

# Plan: Specialty Chips Overhaul + 10 New Procedures + i18n Fix

## Summary

Three main workstreams: (1) Fix specialty chips on Home with proper "+" expansion panel, (2) Add 10 new procedures to Supabase with full FR/EN/PT content, (3) Fix the i18n bug where procedure content doesn't change language + add translation missing indicator.

---

## Workstream 1: Specialty Chips on Home

### Problem
- The specialty list comes from `procedures` (derived), not from `specialtiesData` (DB). Only 7 unique specialties from procedures exist.
- The "+" button only shows when there are more than 8 specialties, but with only 7 from procedures, the button never appears.
- `SpecialtyChips` receives `specialties: string[]` (slugs from procedures) but the DB has 16 specialties.

### Fix: Use `specialtiesData` from DB as primary source

**`src/pages/Index.tsx`**:
- Change `sortedSpecialties` to use `specialtiesData` (all active specialties from DB) instead of procedure-derived `specialties`.
- Map specialtiesData to IDs, sort by usage then sort_base.
- This gives 16+ specialties, ensuring the "+" button appears.

**`src/components/anesia/SpecialtyChips.tsx`**:
- Keep current structure but improve the search in expanded panel to search by display name (multilingual), not just slug.
- Always show "+" button (even when fewer than maxVisible), since user requested it as a core feature.
- Ensure the expanded panel search matches against display names.

### New specialties to add (DB insert)
Need to add `gastroenterologie` specialty since 3 new procedures will use it:
```
gastroenterologie | { fr: "Gastro-entérologie", en: "Gastroenterology", pt: "Gastroenterologia" } | sort_base: 8
```

---

## Workstream 2: Add 10 New Procedures

Insert 10 procedures into the `procedures` table via the data insert tool. Each with:
- `id` (slug)
- `specialty` matching a specialty ID
- `titles` in FR/EN/PT
- `content` with `quick.fr` containing `preop`, `intraop`, `postop`, `red_flags`, `drugs`
- `tags` array

### Procedures list:

1. **ercp** (gastroenterologie) - ERCP / Endoscopic retrograde cholangiopancreatography
2. **colonoscopie_sedation** (gastroenterologie) - Colonoscopy under sedation
3. **gastroscopie_sedation** (gastroenterologie) - Gastroscopy under sedation
4. **herniorraphie_inguinale** (chirurgie-generale) - Inguinal hernia repair (open)
5. **hemicolectomie_lap** (chirurgie-generale) - Laparoscopic hemicolectomy
6. **cystectomie_robot** (urologie) - Robotic cystectomy
7. **prostatectomie_robot** (urologie) - Robotic prostatectomy
8. **cesarienne_urgente_code** (obstetrique) - Emergency C-section (code green/orange)
9. **amputation_transmetatarsienne** (orthopedie) - Transmetatarsal amputation
10. **lavage_articulaire_septique** (orthopedie) - Septic joint washout

Each procedure will include 5-10 drug references in `quick.fr.drugs` matching existing drug IDs.

Content is FR-only initially (matching current DB pattern). EN/PT titles will be provided.

---

## Workstream 3: i18n Fix for Procedure Content

### Root cause
- All procedures in DB only have `content.quick.fr` and `content.deep.fr` -- no EN/PT translations.
- The `resolve()` function correctly falls back to FR, but user sees no indication that content isn't translated.
- The `wrapByLang()` function works correctly for wrapping.

### Changes

**`src/pages/ProcedurePage.tsx`**:
- After resolving `quick` and `deep`, check if `procedure.quick[lang]` exists.
- If not (i.e., using fallback), show a small banner: "Content available in French only" (i18n).
- Badge is dismissible and non-intrusive.

**`src/components/anesia/ProcedureCard.tsx`**:
- Show specialty display name (from specialtiesData) instead of raw slug.

**`src/contexts/LanguageContext.tsx`**:
- Add i18n keys: `content_fr_only`, `generate_translation`, `apply_filter`, `choose_specialties`.

### Translation admin page (future)
- The admin translation tool (`/admin/translate-procedure/:id`) is a separate feature. For now, just add the "FR only" indicator on ProcedurePage.

---

## Workstream 4: CSV Import Multi-language Support

**`src/pages/AdminImportProcedures.tsx`**:
- Update the CSV parser to handle `title_fr`, `title_en`, `title_pt` columns.
- Map them into the `titles` JSON structure `{ fr, en, pt }`.
- For `content`, support a single JSON column or separate columns per language.
- Show warnings for missing translations in preview.

---

## Technical Summary

| File | Action |
|------|--------|
| DB insert | Add `gastroenterologie` specialty |
| DB insert | Add 10 new procedures with content |
| `src/pages/Index.tsx` | Use specialtiesData for chips source |
| `src/components/anesia/SpecialtyChips.tsx` | Always show "+", search by display name |
| `src/pages/ProcedurePage.tsx` | Add "FR only" banner when content not translated |
| `src/components/anesia/ProcedureCard.tsx` | Show translated specialty name |
| `src/contexts/LanguageContext.tsx` | Add ~5 new i18n keys |
| `src/pages/AdminImportProcedures.tsx` | Multi-language CSV support |

## Implementation Order
1. DB insert: gastroenterologie specialty
2. DB insert: 10 new procedures
3. Fix SpecialtyChips + Index.tsx (use DB specialties)
4. ProcedurePage i18n indicator
5. ProcedureCard specialty display name
6. i18n keys
7. CSV import polish
8. QA

