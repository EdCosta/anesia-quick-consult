

# Redesign: Landing avec recherche animee + nouveau menu de navigation

## Vue d'ensemble

Transformer la page d'accueil en une experience en deux etapes :
1. **Etat initial** : ecran epure avec logo "AnesIA" centre, barre de recherche grande et centree verticalement, et le menu de navigation en bas
2. **Etat actif** : quand l'utilisateur clique sur la recherche (ou scroll), la barre glisse vers le haut pour devenir le header, et le contenu dashboard apparait en dessous avec une animation fade-in

Ajouter de nouveaux onglets de navigation : **Accueil, Guidelines, ALR, Calculateurs, Protocoles**

## Architecture des pages

```text
/                -> Accueil (landing + dashboard)
/guidelines      -> Guidelines (page placeholder structuree)
/alr             -> ALR - Anesthesie Loco-Regionale (placeholder)
/calculateurs    -> Calculateurs (page avec outils de calcul)
/protocoles      -> Protocoles (checklists et protocoles)
/p/:id           -> ProcedurePage (inchange)
/admin-content   -> AdminContent (inchange)
```

**Suggestion supplementaire** : "Protocoles" -- une section pour les checklists pre-op standardisees (type OMS/HAS), tres utile au bloc operatoire.

## 1. Refonte de la page Index (/)

### Etat "Hero" (initial, pas de recherche active)
- Fond avec gradient subtil (primary vers background)
- Logo "AnesIA" grand et centre avec tagline "Votre assistant d'anesthesie"
- Barre de recherche grande (h-12, max-w-lg) centree verticalement
- Specialty chips en dessous de la recherche
- Section "Acces rapide" : 4 cards en grille (Procedures, Calculateurs, Guidelines, ALR)
- Favoris et Recents visibles en bas

### Etat "Dashboard" (recherche active ou saisie en cours)
- La barre de recherche glisse vers le haut (transition CSS `transform` + `top`) et reste sticky dans le header
- Le hero disparait (opacity 0, height 0 avec transition)
- Les resultats de recherche et le contenu dashboard apparaissent avec animation fade-in
- Un bouton "X" ou clic sur le logo permet de revenir a l'etat hero

### Implementation technique
- State `isSearchActive` dans Index.tsx
- `onFocus` sur l'input active la transition
- CSS transitions sur le container hero : `max-height`, `opacity`, `transform` avec `duration-500 ease-out`
- La recherche reste dans Index.tsx (pas dans AppLayout) pour controler l'animation

## 2. Nouveau AppLayout avec navigation etendue

### Menu de navigation (6 items)
| Item | Route | Icone | Description |
|------|-------|-------|-------------|
| Accueil | `/` | Home | Dashboard principal |
| Guidelines | `/guidelines` | BookOpen | Recommandations et bonnes pratiques |
| ALR | `/alr` | Target | Anesthesie Loco-Regionale |
| Calculateurs | `/calculateurs` | Calculator | Outils de calcul (doses, scores) |
| Protocoles | `/protocoles` | ClipboardCheck | Checklists et protocoles |
| Admin | `/admin-content` | Settings | Gestion du contenu |

### Desktop
- Top bar sombre avec logo a gauche, nav items au centre, LanguageSwitcher a droite
- Pas de search dans le header (il est dans la page Index avec l'animation)
- Sur les pages autres que `/`, le search reste dans le header normalement

### Mobile
- Top bar avec hamburger + logo + LanguageSwitcher
- Menu hamburger plein ecran avec les 6 items
- Bottom tab bar optionnelle avec les 4 items principaux (Accueil, Guidelines, ALR, Calculateurs)

## 3. Nouvelles pages (placeholder structurees)

### /guidelines
- Titre + description
- Liste de categories de guidelines (Airway, Hemodynamique, Douleur, PONV, etc.)
- Chaque categorie en card cliquable
- Contenu "A venir" avec structure preparee pour le JSON futur

### /alr
- Titre "Anesthesie Loco-Regionale"
- Grille de blocs par region anatomique (Membre superieur, Membre inferieur, Tronc, Tete/Cou)
- Cards avec icones anatomiques
- Contenu "A venir" -- structure preparee

### /calculateurs
- Titre "Calculateurs"
- Grille de calculateurs disponibles :
  - Calculateur de doses (lien vers la fonctionnalite existante)
  - Score de Mallampati (a venir)
  - Score ASA (a venir)
  - IMC (a venir)
- Cards cliquables avec status "Disponible" ou "A venir"

### /protocoles
- Titre "Protocoles & Checklists"
- Checklist pre-op OMS (a venir)
- Protocole PONV (a venir)
- Cards structurees

## 4. Reorganisation de la page Index

La page Index actuelle sera reorganisee :

```text
+------------------------------------------+
|          LOGO "AnesIA"                   |
|     Votre assistant d'anesthesie         |
|                                          |
|    [====== Rechercher... ======]         |
|                                          |
|  [Ortho] [Uro] [Gynéco] [Dig] [ORL]    |
|                                          |
|  --- Acces Rapide (grille 2x2) ---      |
|  [Procedures]  [Calculateurs]            |
|  [Guidelines]  [ALR]                     |
|                                          |
|  --- Favoris ---    --- Recents ---      |
|  [Card]             [Card]               |
|  [Card]             [Card]               |
|                                          |
|  --- Toutes les procedures ---           |
|  [Card] [Card]                           |
|  [Card] [Card]                           |
+------------------------------------------+
```

Quand on clique sur la recherche :

```text
+------------------------------------------+
| [AnesIA]  [=== Rechercher... ===]  [FR] |  <- header sticky
+------------------------------------------+
|  [Ortho] [Uro] [Gynéco] [Dig] [ORL]    |
|                                          |
|  --- Resultats ---                       |
|  [Card] [Card]                           |
|  [Card] [Card]                           |
+------------------------------------------+
```

## 5. Traductions a ajouter (LanguageContext)

Nouvelles cles :
- `guidelines` : "Guidelines" / "Guidelines" / "Guidelines"
- `alr` : "ALR" / "ALR" / "ALR"
- `alr_full` : "Anesthesie Loco-Regionale" / "Anestesia Loco-Regional" / "Regional Anesthesia"
- `calculateurs` : "Calculateurs" / "Calculadoras" / "Calculators"
- `protocoles` : "Protocoles" / "Protocolos" / "Protocols"
- `coming_soon` : "A venir" / "Em breve" / "Coming soon"
- `quick_access` : "Acces rapide" / "Acesso rapido" / "Quick access"
- `tagline` : "Votre assistant d'anesthesie" / "O seu assistente de anestesia" / "Your anesthesia assistant"

## Fichiers a modifier/creer

| Fichier | Action |
|---------|--------|
| `src/contexts/LanguageContext.tsx` | Modifier -- ajouter les nouvelles cles de traduction |
| `src/components/anesia/AppLayout.tsx` | Modifier -- nouveau menu 6 items, search conditionnel |
| `src/pages/Index.tsx` | Modifier -- hero animee + acces rapide + reorganisation |
| `src/pages/Guidelines.tsx` | Creer -- page placeholder structuree |
| `src/pages/ALR.tsx` | Creer -- page placeholder structuree |
| `src/pages/Calculateurs.tsx` | Creer -- page placeholder avec calculateurs |
| `src/pages/Protocoles.tsx` | Creer -- page placeholder structuree |
| `src/App.tsx` | Modifier -- nouvelles routes |
| `src/index.css` | Modifier -- animations hero slide-up |

## Ce qui ne change PAS
- `DataContext.tsx`, `DrugDoseRow.tsx`, `Section.tsx`, `Disclaimer.tsx`
- `ProcedurePage.tsx`, `AdminContent.tsx`
- Fichiers JSON (procedures, drugs)
- `useLocalStorage.ts`, `SpecialtyFilter.tsx`, `ProcedureCard.tsx`

