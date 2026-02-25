
# Plan: UI/UX Review, Bug Fix & New Procedures

## 1. Bug Fix: Double Back Arrow

**Root cause identified**: The i18n key `back` contains "← Retour" (with a left arrow character), AND `ProcedurePage.tsx` renders an `<ArrowLeft>` icon next to it (line 91-92). This produces two arrows side by side.

**Fix**: Remove the "←" character from the i18n `back` key in all 3 languages. Keep only the `<ArrowLeft>` icon component.

Also fix the console warnings about "Function components cannot be given refs" for `Section` and `Badge` -- these are caused by refs being passed to function components in `ProcedurePage`.

**File**: `src/contexts/LanguageContext.tsx` -- change `back` from `"← Retour"` to `"Retour"` (and EN/PT equivalents).

---

## 2. Quick Access: Action-Oriented Shortcuts

Current quick access mirrors the header nav (Home, Guidelines, ALR, Calculateurs, Protocoles, Pre-Anest). The user wants action shortcuts instead.

**New QUICK_ACCESS_ITEMS** (separate from HEADER_ITEMS in `src/config/nav.ts`):

1. "Toutes les cirurgies" -- scroll to procedures list (Star icon replaced by Activity)
2. "Favoritos" -- toggle show only favorites
3. "Recentes" -- scroll to recents section
4. "Calculadora ETT" -- navigate to /calculateurs
5. "Pre-Anest Mode" -- navigate to /preanest
6. "Limpar filtros" -- clear search + filters + scroll to list

Update `src/config/nav.ts` to separate HEADER_ITEMS (nav links) from QUICK_ACCESS_ITEMS (action shortcuts).

Update `src/pages/Index.tsx` to handle the new action types.

**Files**: `src/config/nav.ts`, `src/pages/Index.tsx`

---

## 3. UX Polish

### 3.1 Search improvements
- Fuse.js already searches by synonyms and titles -- confirmed working.
- No changes needed for search logic (already well configured).

### 3.2 Consistent procedure template
- All existing 10 procedures already follow the template (preop/intraop/postop/red_flags/drugs/deep).
- New procedures will follow the same structure.

### 3.3 i18n consistency
- Fix the `back` key (point 1).
- Audit for any hardcoded strings in ProcedurePage and Index.

### 3.4 Technical quality
- Fix React ref warnings in ProcedurePage (Section and Badge components getting refs).
- Loading states already implemented.

---

## 4. Database Seed

The database tables exist but are empty (confirmed via query). The DataContext already has Supabase-first logic with JSON fallback.

**Action**: Create a database migration that seeds all procedure data (existing 10 + new 15) into the `procedures` table, plus seed `drugs`, `guidelines`, `protocoles`, and `alr_blocks` from existing JSON files.

This way the app reads from the database as primary source.

**File**: New SQL migration with INSERT statements.

---

## 5. Add 15+ New Procedures

Adding these procedures to `public/data/procedures.v3.json` (for fallback) AND to the database seed:

| ID | Specialty | Title (FR) |
|----|-----------|------------|
| arthroscopie_genou | Orthopedie | Arthroscopie du genou (meniscectomie/ligamentoplastie) |
| ptg | Orthopedie | Prothese totale de genou (PTG) |
| fracture_radius | Orthopedie | Fixation fracture radius distal (ORIF) |
| osteosynthese_cheville | Orthopedie | Osteosynthese de cheville |
| laminectomie_lombaire | Neurochirurgie | Laminectomie lombaire |
| arthrodese_cervicale | Neurochirurgie | Arthrodese cervicale anterieure (ACDF) |
| rtu_bexiga | Urologie | Resection transurethrale de vessie (RTUV) |
| nephrostomie_dj | Urologie | Nephrostomie percutanee / Double-J |
| cesarienne_elective | Obstetrique | Cesarienne elective (programmee) |
| conisation_leep | Gynecologie | Conisation / LEEP |
| hernie_inguinale | Chirurgie generale | Hernie inguinale (laparoscopie/TEP) |
| thyroidectomie | Chirurgie generale | Thyroidectomie |
| mastectomie | Chirurgie generale | Mastectomie / tumorectomie |
| septoplastie | ORL | Septoplastie / rhinoplastie fonctionnelle |
| microlaryngoscopie | ORL | Microlaryngoscopie en suspension |

Each procedure will have:
- titles in FR/EN/PT
- synonyms in FR/EN/PT
- Complete quick block (preop, intraop, postop, red_flags, drugs)
- Deep block (clinical, pitfalls, references)
- All following the same template as existing procedures

**File**: `public/data/procedures.v3.json` (append 15 new entries)

---

## Summary of Files

| File | Action |
|------|--------|
| `src/contexts/LanguageContext.tsx` | Fix `back` key (remove "←" character) |
| `src/config/nav.ts` | Separate QUICK_ACCESS_ITEMS from HEADER_ITEMS as action shortcuts |
| `src/pages/Index.tsx` | Update quick access to handle action types, add recentsRef |
| `src/pages/ProcedurePage.tsx` | Remove duplicate arrow, fix ref warnings |
| `public/data/procedures.v3.json` | Add 15 new procedures |
| SQL migration | Seed all data into database tables |

## What does NOT change
- `AppLayout.tsx` (header nav stays the same, using HEADER_ITEMS)
- `DataContext.tsx` (already has Supabase-first + JSON fallback)
- Drug data, guidelines, protocoles, ALR blocks (unchanged)
- `ETTCalculator.tsx`, `IntubationGuide.tsx`, `DrugDoseRow.tsx`
- UI components (card, badge, button, etc.)

## Manual Tests
1. Open a procedure page -- confirm only 1 back arrow, no overlap with title
2. Home page -- click each quick access button and verify correct action
3. Search for a new procedure (e.g. "genou") and confirm it appears
4. Check mobile layout for procedure page header and quick access wrap
5. Verify database has data after migration (procedures table no longer empty)
