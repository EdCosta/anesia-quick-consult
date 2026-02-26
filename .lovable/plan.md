
# Plan: Advanced Weight Mode, Specialty Chips v2, CSV Import + Innovations

This is a large feature set split into 5 workstreams. Each builds on existing patterns.

---

## Phase 1: Weight Scalars Library + Advanced Anthropometrics

### 1.1 New file: `src/lib/weightScalars.ts`

Pure math functions:
- `calcBMI(heightCm, weightKg)` -- weight / (height/100)^2
- `calcIBW(sex, heightCm)` -- Devine formula: M: 50 + 0.9*(h-152), F: 45.5 + 0.9*(h-152)
- `calcLBW(sex, heightCm, weightKg)` -- Janmahasatian formula
- `calcAdjBW(ibw, tbw, factor=0.4)` -- IBW + factor*(TBW-IBW)
- Type: `DoseScalar = 'TBW' | 'IBW' | 'LBW' | 'AdjBW' | 'TITRATE'`
- `getScaledWeight(scalar, weights)` -- returns the appropriate weight from a weights object

### 1.2 New component: `src/components/anesia/PatientAnthropometrics.tsx`

Reusable component used in ProcedurePage and PreAnest:
- Props: `weightKg`, `onWeightChange`, `advancedMode` (from localStorage), `onAdvancedChange`
- When Advanced OFF: simple weight input (current behavior)
- When Advanced ON: shows weight + height + sex inputs, auto-calculates and displays read-only BMI, IBW, LBW, AdjBW
- Outputs a `PatientWeights` object: `{ tbw, ibw, lbw, adjbw, bmi }`
- Advanced mode preference saved in localStorage (`anesia-advanced-weight`)

### 1.3 Add `dose_scalar` to DoseRule type

In `src/lib/types.ts`, add optional field to `DoseRule`:
```typescript
dose_scalar?: 'TBW' | 'IBW' | 'LBW' | 'AdjBW' | 'TITRATE';
```

### 1.4 Update `src/lib/dose.ts`

Extend `calculateDose` to accept an optional `PatientWeights` object:
- If `dose_scalar` exists on the rule and `PatientWeights` is provided, use the scaled weight instead of raw `weightKg`
- Add `scalarUsed` to `DoseResult` for transparency
- Default to TBW if no scalar specified (backward compatible)

### 1.5 Update `DrugDoseRow.tsx`

- Accept `PatientWeights` as optional prop
- Pass to `calculateDose`
- Display scalar used (e.g. "LBW 52kg") next to dose
- Show "Titrate to effect" note when scalar is TITRATE

### 1.6 Update `ProcedurePage.tsx`

- Replace weight input with `PatientAnthropometrics` component
- Pass `PatientWeights` down to `DrugDoseRow`

### 1.7 "Dose Rationale" button (Innovation 4.1)

In `DrugDoseRow.tsx`, add a small "?" button next to the calculated dose that opens a Popover showing:
- Scalar used (TBW/IBW/LBW/AdjBW)
- Weight value used
- Formula: dose = X mg/kg x Y kg = Z mg (capped at max_mg)
- Clinical note: "Validate clinically and adjust to patient."

---

## Phase 2: Specialty Chips v2 (Wrap, No Horizontal Scroll)

### 2.1 Update `SpecialtyChips.tsx`

Change layout from `overflow-x-auto` (horizontal scroll) to `flex-wrap`:
- Container: `flex flex-wrap gap-2 pb-1`
- Show top 6-10 chips (configurable via `maxVisible`)
- "+" button always visible at the end
- Chips wrap to multiple lines if needed, staying compact
- Remove `shrink-0` from chips to allow natural wrapping

### 2.2 "+" opens inline expandable panel (not Dialog)

Replace current Dialog with a collapsible panel that expands in-place below the chips:
- When "+" clicked, show a bordered panel below with:
  - Search input
  - Grid of all specialties as selectable items
  - "Apply" and "Close" buttons
- When closed, panel collapses back to just top chips
- Use `useState` for expanded state (no Dialog/Popover needed)

### 2.3 Usage tracking already exists

`useSpecialtyUsage.ts` hook already tracks usage in localStorage. No changes needed except ensuring increment is called on procedure navigation (already done in Index.tsx).

---

## Phase 3: CSV Import for Procedures

### 3.1 Database: Create `import_logs` table

```sql
CREATE TABLE public.import_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  total integer NOT NULL DEFAULT 0,
  success integer NOT NULL DEFAULT 0,
  failed integer NOT NULL DEFAULT 0,
  errors jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);
-- RLS: admin only
```

### 3.2 New page: `src/pages/AdminImportProcedures.tsx`

Admin-only page at `/admin/import-procedures`:
1. **Upload area**: drag-and-drop or file picker for CSV (semicolon-delimited, matching the uploaded file format)
2. **Parse & Preview**: parse CSV client-side, show table of rows with id, specialty, title_fr, title_en, title_pt
3. **Validation**:
   - Check unique IDs
   - Check specialty exists in `specialties` table (or auto-create)
   - Validate content JSON structure
4. **Import button**: upsert rows into `procedures` table via Supabase client
5. **Result report**: show inserted / updated / failed counts with error details
6. **Audit**: insert a row into `import_logs`

### 3.3 CSV parsing

The uploaded CSV uses semicolons as delimiters and has columns: `id;specialty;titles;synonyms;content;tags;created_at;updated_at`. The `titles`, `synonyms`, `content`, and `tags` columns contain JSON strings with escaped quotes (`""`).

Parser logic:
- Split by semicolons (respecting quoted fields)
- Parse JSON columns
- Map to procedure DB shape: `{ id, specialty, titles, synonyms, content: { quick, deep }, tags }`

### 3.4 Add route in `App.tsx`

Add `/admin/import-procedures` route pointing to the new page.

### 3.5 Import the uploaded CSV file

After the import page is built, use it to import the 75 procedures from the uploaded `procedures-export-updated-v2.csv` file. Alternatively, copy the CSV to `public/data/` for use during import.

---

## Phase 4: Hospital Profile System (Innovation 4.2)

### 4.1 Database: Create `hospital_profiles` table

```sql
CREATE TABLE public.hospital_profiles (
  id text PRIMARY KEY,
  name text NOT NULL,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
-- RLS: public read, admin write
```

Settings JSONB can store: available drugs list, PONV protocol preference, default scalar overrides, etc.

### 4.2 Profile selector in AppLayout header

- Small dropdown (visible only to authenticated users)
- Lists available profiles from `hospital_profiles`
- Selected profile saved in localStorage
- Active profile passed via React context or a simple hook

### 4.3 Profile-aware drug filtering (future)

For now, just the infrastructure: profile selector, DB table, and context. Drug filtering by profile can be wired later without architectural changes.

---

## Phase 5: i18n Keys

Add to `LanguageContext.tsx`:
- `advanced_mode`: { fr: "Mode avancé", pt: "Modo avançado", en: "Advanced mode" }
- `height_cm`: already exists
- `bmi`: { fr: "IMC", pt: "IMC", en: "BMI" }
- `ibw`: { fr: "Poids idéal", pt: "Peso ideal", en: "Ideal body weight" }
- `lbw`: { fr: "Masse maigre", pt: "Massa magra", en: "Lean body weight" }
- `adjbw`: { fr: "Poids ajusté", pt: "Peso ajustado", en: "Adjusted body weight" }
- `dose_rationale`: { fr: "Pourquoi cette dose ?", pt: "Porquê esta dose?", en: "Why this dose?" }
- `titrate_to_effect`: { fr: "Titrer à l'effet", pt: "Titular ao efeito", en: "Titrate to effect" }
- `scalar_used`: { fr: "Escalateur utilisé", pt: "Escalador usado", en: "Scalar used" }
- `validate_clinically`: { fr: "Valider cliniquement", pt: "Validar clinicamente", en: "Validate clinically" }
- `import_procedures`: { fr: "Importer procédures", pt: "Importar procedimentos", en: "Import procedures" }
- `import_preview`: { fr: "Aperçu", pt: "Pré-visualização", en: "Preview" }
- `import_run`: { fr: "Importer", pt: "Importar", en: "Import" }
- `import_success`: { fr: "Importation réussie", pt: "Importação concluída", en: "Import successful" }
- `hospital_profile`: { fr: "Profil hôpital", pt: "Perfil hospital", en: "Hospital profile" }
- `apply`: already exists
- `close`: already exists

---

## Technical Summary

| File | Action |
|------|--------|
| `src/lib/weightScalars.ts` | New -- BMI/IBW/LBW/AdjBW math |
| `src/lib/types.ts` | Add `dose_scalar` to DoseRule |
| `src/lib/dose.ts` | Support scaled weights + expose scalar used |
| `src/components/anesia/PatientAnthropometrics.tsx` | New -- reusable weight/height/advanced component |
| `src/components/anesia/DrugDoseRow.tsx` | Accept PatientWeights, show scalar, add "?" rationale |
| `src/pages/ProcedurePage.tsx` | Use PatientAnthropometrics |
| `src/components/anesia/SpecialtyChips.tsx` | flex-wrap layout, inline expandable panel |
| `src/pages/AdminImportProcedures.tsx` | New -- CSV import page |
| `src/App.tsx` | Add import route |
| DB migration | `import_logs` + `hospital_profiles` tables |
| `src/contexts/LanguageContext.tsx` | Add ~15 i18n keys |
| `src/components/anesia/AppLayout.tsx` | Hospital profile selector (authenticated users) |

## Implementation Order

1. Weight scalars library + types
2. PatientAnthropometrics component
3. Dose calculation updates + DrugDoseRow + Dose Rationale
4. ProcedurePage integration
5. SpecialtyChips v2 (wrap + inline panel)
6. DB migrations (import_logs, hospital_profiles)
7. CSV import page + route
8. Hospital profile selector
9. i18n keys throughout
