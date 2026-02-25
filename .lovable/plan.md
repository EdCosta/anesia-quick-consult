

# Amelioration complete d'AnesIA -- Plan d'implementation

## Vue d'ensemble

Ce plan couvre 7 axes : refactoring du DataContext, creation de librairies utilitaires (dose + dilution), amelioration du DrugDoseRow avec modal de dilution, audit multi-langue, validation des donnees, et optimisations UX.

---

## 1. Librairies utilitaires (`src/lib/`)

### `src/lib/dose.ts` -- Creer
Fonction pure `calculateDose(rule, weightKg, selectedConcentration)` :
- Retourne `{ canCalc, doseMgRaw, doseMgFinal, volumeMl, reasonIfNoCalc }`
- `canCalc = true` seulement si `mg_per_kg !== null && weightKg > 0`
- Applique `max_mg` si defini
- `volumeMl` calcule seulement si `mg_per_ml` est valide et > 0
- Arrondis : `doseMgFinal` a 0.1 mg, `volumeMl` a 0.1 mL (parametres configurables)
- `reasonIfNoCalc` : message cle i18n (`'protocol_local'` si mg_per_kg null, `'enter_weight'` si pas de poids)

### `src/lib/dilution.ts` -- Creer
Fonction pure `calculateDilution({ stockConcentration_mg_per_ml, targetConcentration_mg_per_ml?, finalVolume_ml?, syringeVolume_ml?, desiredDose_mg? })` :
- Retourne `{ volumeDrug_ml, volumeDiluent_ml, finalConcentration_mg_per_ml, warnings[] }`
- Cas A : target + finalVol -> `volumeDrug = (targetConc * finalVol) / stockConc`
- Cas B : dose + finalVol -> `targetConc = dose/finalVol`, puis Cas A
- Si `syringeVolume_ml` fourni et pas de `finalVolume_ml` -> utiliser comme `finalVolume_ml`
- Warnings : volume depasse seringue, valeurs negatives/invalides, stock insuffisant
- Aucune valeur clinique suggeree -- calcul purement mathematique

---

## 2. Refactoring DataContext

### `src/lib/types.ts` -- Creer
Extraire tous les types (`DrugRef`, `Reference`, `ProcedureQuick`, `ProcedureDeep`, `Procedure`, `DoseRule`, `Concentration`, `Drug`) dans un fichier dedie. DataContext les re-exporte pour ne rien casser.

### `src/contexts/DataContext.tsx` -- Modifier
- Importer les types depuis `src/lib/types.ts`
- Ajouter validation legere avec zod (deja installe) :
  - Verifier que `procedures` et `drugs` sont des arrays
  - Verifier champs minimaux (`id`, `specialty`, `titles.fr`, `quick.fr`)
  - Items invalides : filtrer + `console.warn` en dev
- Ajouter un state `error` pour afficher un message UI propre si echec total du fetch
- Le `DataContext.Provider` est deja correct (il rend bien `<DataContext.Provider value={...}>{children}`)

---

## 3. DrugDoseRow ameliore + Modal Dilution

### `src/components/anesia/DrugDoseRow.tsx` -- Modifier
- Utiliser `calculateDose()` de `src/lib/dose.ts` au lieu du calcul inline
- Gestion `unit_override` :
  - Si `unit_override` existe ET `mg_per_kg === null` -> afficher unit_override + "A definir selon protocole local"
  - Si `mg_per_kg` existe -> afficher mg/kg normalement, `unit_override` en info secondaire
- Si poids absent mais `mg_per_kg` existe : afficher mg/kg + max_mg + "Entrer poids pour calcul"
- Si concentration manquante : dose mg OK mais "Volume: non disponible (concentration non definie)"
- Selecteur de concentration visible si >1 concentration valide (meme sans poids)
- Ajouter bouton "Preparer dilution" dans le panel expanded -> ouvre DilutionModal

### `src/components/anesia/DilutionModal.tsx` -- Creer
- Dialog shadcn avec champs :
  - Stock mg/mL (pre-rempli si concentration selectionnee)
  - Volume final OU taille seringue (boutons 5/10/20/50 mL)
  - Target mg/mL (optionnel)
  - Dose mg (optionnel)
- Calcul en live via `calculateDilution()`
- Sortie : "Prelever X mL de produit + ajouter Y mL de diluant = Z mL a C mg/mL"
- Avertissements en rouge si incoherent
- Multi-langue via `t()`

---

## 4. Multi-langue : audit et completion

### `src/contexts/LanguageContext.tsx` -- Modifier
Ajouter les cles manquantes :
- `dilution_title` : "Preparer une dilution" / "Preparar uma diluicao" / "Prepare a dilution"
- `stock_concentration` : "Concentration stock (mg/mL)" / ... / ...
- `target_concentration` : "Concentration cible (mg/mL)" / ... / ...
- `final_volume` : "Volume final (mL)" / ... / ...
- `syringe_size` : "Taille seringue" / ... / ...
- `desired_dose` : "Dose souhaitee (mg)" / ... / ...
- `dilution_result` : "Prelever {X} mL + diluant {Y} mL = {Z} mL a {C} mg/mL" (templates)
- `prepare_dilution` : "Preparer dilution" / ... / ...
- `volume_unavailable` : "Volume: non disponible (concentration non definie)" / ... / ...
- `copy_checklist` : "Copier checklist" / ... / ...
- `copied` : "Copie !" / ... / ...
- `warning` : "Attention" / ... / ...
- `data_load_error` : "Erreur de chargement des donnees" / ... / ...

Verifier que toutes les cles existantes (loading, enter_weight, protocol_local, etc.) sont bien presentes -- elles le sont deja.

---

## 5. Qualite des donnees et failsafe

### Dans `src/contexts/DataContext.tsx`
- Schemas zod legers pour validation :
  ```text
  ProcedureSchema: z.object({ id: z.string(), specialty: z.string(), titles: z.object({ fr: z.string() }).passthrough() }).passthrough()
  DrugSchema: z.object({ id: z.string(), name: z.object({ fr: z.string() }).passthrough() }).passthrough()
  ```
- `z.array(ProcedureSchema).safeParse()` -- items invalides filtres avec `console.warn`
- State `error: string | null` -- si fetch echoue, afficher un message UI au lieu de crash
- Composant enfant `DataErrorFallback` dans le meme fichier pour affichage propre

---

## 6. Performance et UX "Bloc"

### `src/pages/Index.tsx` -- Modifier
- Focus auto sur le champ de recherche au chargement (avec `useEffect` + `inputRef.current?.focus()`)
- Enter sur la recherche -> naviguer vers le premier resultat (`useNavigate`)
- JSON deja charge une seule fois et memoize (OK actuellement)

### `src/pages/ProcedurePage.tsx` -- Modifier
- Ajouter bouton "Copier checklist" qui copie pre-op + intra-op + post-op en texte brut via `navigator.clipboard.writeText()`
- Toast de confirmation "Copie !"

### Optimisation mobile
- Revue des spacings dans DrugDoseRow et ProcedureCard (deja corrects, petits ajustements si necessaire)

---

## 7. Scripts et formatage

### `package.json` -- Modifier
- Le script `lint` existe deja (`eslint .`)
- Ajouter script `format` : `"format": "prettier --write \"src/**/*.{ts,tsx,css}\""` (Prettier n'est pas installe, donc on ajoute prettier en devDependency)
- Note : le formatage sera applique sans changer la logique

---

## Resume des fichiers

| Fichier | Action |
|---------|--------|
| `src/lib/types.ts` | Creer -- types extraits |
| `src/lib/dose.ts` | Creer -- calculateDose() |
| `src/lib/dilution.ts` | Creer -- calculateDilution() |
| `src/contexts/DataContext.tsx` | Modifier -- validation zod, error state, re-export types |
| `src/contexts/LanguageContext.tsx` | Modifier -- ajouter cles dilution/UX |
| `src/components/anesia/DrugDoseRow.tsx` | Modifier -- utiliser calculateDose(), unit_override, bouton dilution |
| `src/components/anesia/DilutionModal.tsx` | Creer -- modal de dilution |
| `src/pages/Index.tsx` | Modifier -- auto-focus, Enter navigation |
| `src/pages/ProcedurePage.tsx` | Modifier -- bouton copier checklist |
| `package.json` | Modifier -- ajouter prettier + script format |

## Ce qui ne change PAS
- `public/data/procedures.v3.json` et `public/data/drugs.v1.json` -- contenu clinique intact
- `AppLayout.tsx`, `DisclaimerBanner.tsx`, `ProcedureCard.tsx`, `Section.tsx`
- `index.css`, `tailwind.config.ts`
- Toutes les pages placeholder (Guidelines, ALR, Calculateurs, Protocoles)

## Ou mettre a jour le contenu clinique
- Procedures : `public/data/procedures.v3.json`
- Medicaments : `public/data/drugs.v1.json`
- Les deux fichiers suivent les interfaces definies dans `src/lib/types.ts`

## 5 tests manuels a effectuer apres implementation
1. **Doses** : Ouvrir une procedure, entrer un poids (70 kg), verifier que la dose calculee et le volume sont corrects (ex: Paracetamol 15 mg/kg = 1000 mg cap, 100 mL)
2. **Dilution** : Cliquer "Preparer dilution" sur un medicament, remplir les champs, verifier le calcul live et les avertissements
3. **Langues** : Switcher FR -> PT -> EN, verifier que tous les textes changent (y compris la modal dilution et le bouton copier)
4. **Favoris + Recherche** : Ajouter un favori, rechercher une procedure, appuyer Entree, verifier la navigation
5. **Copier checklist** : Sur une page procedure, cliquer "Copier checklist", coller dans un editeur, verifier le contenu pre/intra/post-op

