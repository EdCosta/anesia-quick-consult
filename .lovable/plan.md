

# Adapter le projet actuel au format visuel de anesia-core

## Objectif

Transformer le projet actuel pour adopter le design et la structure de navigation de l'ancien projet **anesia-core**, tout en conservant toutes les fonctionnalites actuelles (multi-langue FR/PT/EN, calcul de doses, fuzzy search, JSON data, favoris, recents).

## Differences cles entre les deux projets

| Aspect | Projet actuel | anesia-core (cible) |
|--------|--------------|---------------------|
| Header | Simple sticky header avec nav inline | Top bar sombre (bg-primary) avec search integre + nav desktop + hamburger mobile |
| Couleur primaire | Teal (180 72% 28%) | Bleu marine (210 50% 25%) avec accent teal (174 60% 38%) |
| Accent | Orange (38 92% 50%) | Teal (174 60% 38%) |
| Cards | Simples avec border | `clinical-shadow` + `clinical-shadow-md` hover |
| Dashboard | Liste lineaire | Stats grid + specialty filters chips + favoris en grille 2col + procedures a cote |
| Disclaimer | Footer card dans chaque page | Banner fixe en haut du site (avant le header) |
| Sections procedure | Sections colorees custom (Section component) | Cards avec `border-l-4` + Tabs (Pre-op / Intra-op / Pos-op / etc.) |
| Font | Space Grotesk (headings) + DM Sans | DM Sans pour tout |
| Nav mobile | Pas de hamburger | Hamburger menu plein ecran |

## Plan d'implementation

### 1. Mettre a jour le design system

**Fichier: `src/index.css`**
- Changer `--primary` de teal vers bleu marine: `210 50% 25%`
- Changer `--accent` vers teal: `174 60% 38%`
- Ajouter les variables cliniques: `--clinical-warning`, `--clinical-success`, `--clinical-info`, `--clinical-danger`
- Ajouter les variables evidence: `--evidence-high`, `--evidence-moderate`, etc.
- Ajouter les variables disclaimer: `--disclaimer-bg`, `--disclaimer-border`, `--disclaimer-text`
- Mettre a jour les sidebar colors vers le bleu marine
- Ajouter les dark mode equivalents
- Ajouter les utilities CSS: `.clinical-shadow`, `.clinical-shadow-md`
- Changer la font heading vers DM Sans (comme l'ancien)

**Fichier: `tailwind.config.ts`**
- Ajouter les couleurs `clinical.*`, `evidence.*`, `disclaimer.*`
- Changer la font heading vers DM Sans
- Garder l'animation `fade-in` existante

### 2. Remplacer AppHeader par AppLayout

**Supprimer: `src/components/anesia/AppHeader.tsx`** (le contenu sera dans AppLayout)

**Creer: `src/components/anesia/AppLayout.tsx`**
- Top bar sombre (`bg-primary text-primary-foreground`) avec:
  - Hamburger button (mobile)
  - Logo "AnesIA" avec "Anes" en accent
  - Search bar integre au centre (avec icon Search)
  - Nav items desktop (Dashboard, Procedures, Admin) avec icones
  - LanguageSwitcher a droite
- Mobile: menu plein ecran qui s'ouvre au hamburger (overlay bg-background/95 backdrop-blur)
- Le search sera gere via props (searchQuery + onSearchChange)
- Content area via `children`

### 3. Creer DisclaimerBanner

**Creer: `src/components/anesia/DisclaimerBanner.tsx`**
- Banner fixe en haut du site avant le header
- Background `disclaimer-bg`, border `disclaimer-border`, texte `disclaimer-text`
- Icone AlertTriangle + texte du disclaimer (multi-langue via `t('disclaimer')`)

### 4. Adapter App.tsx

**Modifier: `src/App.tsx`**
- Ajouter un state `searchQuery` dans un composant `AppContent`
- Remplacer `AppHeader` par `DisclaimerBanner` + `AppLayout`
- Passer `searchQuery` et `onSearchChange` a AppLayout et aux pages
- Routes: `/` -> Index (dashboard), `/p/:id` -> ProcedurePage, `/admin-content` -> AdminContent

### 5. Adapter la page Index (Dashboard)

**Modifier: `src/pages/Index.tsx`**
- Recevoir `searchQuery` comme prop au lieu de gerer le state localement
- Ajouter une grille de stats en haut (nombre de procedures, specialites, etc.) avec Cards + `clinical-shadow`
- Specialty filter en chips teal (`bg-accent` quand actif)
- Layout en grille: favoris (2 colonnes avec cards `border-l-4 border-l-accent`) + procedures a droite
- Cards avec `clinical-shadow` et `hover:clinical-shadow-md`
- Supprimer le composant SearchBar (la recherche est maintenant dans AppLayout)

### 6. Adapter ProcedurePage

**Modifier: `src/pages/ProcedurePage.tsx`**
- Header avec bouton retour (ArrowLeft icon), titre, specialty badge
- Card "Pontos-Chave" avec `border-l-4 border-l-accent` (resume des pre-op items)
- Card "Alertes de Risque" avec `border-l-4 border-l-clinical-danger` (red_flags)
- Remplacer le toggle Court/Detail par des **Tabs** (shadcn) : Pre-op / Intra-op / Post-op / Detail
- Chaque tab dans une Card avec `clinical-shadow`
- Section Medicaments & doses garde la meme logique mais dans des Cards avec `clinical-shadow`
- Supprimer le Disclaimer en bas (il est maintenant en banner global)

### 7. Adapter ProcedureCard

**Modifier: `src/components/anesia/ProcedureCard.tsx`**
- Utiliser Card/CardContent de shadcn au lieu du div custom
- Ajouter `clinical-shadow hover:clinical-shadow-md transition-shadow`
- Afficher specialty en Badge, favoris en Star icon
- Ajouter cursor-pointer

### 8. Adapter Disclaimer.tsx

**Modifier: `src/components/anesia/Disclaimer.tsx`**
- Transformer en banner style (peut etre garde comme composant reutilisable mais le style principal est le banner global)

### 9. Fichiers non modifies

- `src/contexts/LanguageContext.tsx` -- intact
- `src/contexts/DataContext.tsx` -- intact
- `src/components/anesia/DrugDoseRow.tsx` -- intact (juste ajouter clinical-shadow aux cards)
- `src/components/anesia/Section.tsx` -- intact (utilise dans les tabs)
- `src/hooks/useLocalStorage.ts` -- intact
- `public/data/procedures.v3.json` -- intact
- `public/data/drugs.v1.json` -- intact

## Resume des fichiers

| Fichier | Action |
|---------|--------|
| `src/index.css` | Modifier -- nouvelles couleurs + utilities |
| `tailwind.config.ts` | Modifier -- ajouter clinical/evidence/disclaimer colors |
| `src/components/anesia/AppLayout.tsx` | Creer -- top bar sombre + nav + search |
| `src/components/anesia/DisclaimerBanner.tsx` | Creer -- banner fixe en haut |
| `src/App.tsx` | Modifier -- AppLayout + searchQuery state |
| `src/pages/Index.tsx` | Modifier -- layout dashboard avec stats grid |
| `src/pages/ProcedurePage.tsx` | Modifier -- Tabs + Cards clinical-shadow |
| `src/components/anesia/ProcedureCard.tsx` | Modifier -- Card shadcn + clinical-shadow |
| `src/components/anesia/AppHeader.tsx` | Supprimer -- remplace par AppLayout |
| `src/components/anesia/Disclaimer.tsx` | Modifier -- style banner |
| `src/components/anesia/SearchBar.tsx` | Supprimer -- integre dans AppLayout |

