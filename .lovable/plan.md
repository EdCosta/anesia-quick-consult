
# Plan: Melhorias de produto AnesIA

## Vista geral

7 eixos de trabalho: Stats clicaveis, favoritos melhorados, IOT em todas as cirurgias, MVP de Guidelines/Protocoles/ALR com JSON, ordem de linguas, e restauracao da barra de pesquisa flutuante.

---

## 1. Barra de pesquisa flutuante (ponto 7)

**Problema**: A barra de pesquisa esta fixa no hero e desaparece ao fazer scroll para baixo. O utilizador perde o acesso rapido a pesquisa.

**Solucao** em `src/pages/Index.tsx`:
- Adicionar um estado `showFloatingSearch` controlado por `IntersectionObserver` no input do hero
- Quando o input do hero sai do viewport, mostrar uma barra de pesquisa sticky no topo (abaixo do header)
- A barra flutuante partilha o mesmo estado `searchQuery` e `inputRef`
- Estilo: fundo `bg-background/95 backdrop-blur` com sombra, z-30, altura compacta (h-10)

**Ficheiro**: `src/pages/Index.tsx`

---

## 2. Stats clicaveis na Home (ponto 1)

**Em `src/pages/Index.tsx`**:
- Adicionar `ref` nas seccoes: `favoritesRef`, `proceduresRef`, `specialtyFilterRef`
- Card "Todas as cirurgias" -> `onClick` faz `proceduresRef.current?.scrollIntoView({ behavior: 'smooth' })`
- Card "Especialidades" -> `onClick` faz `specialtyFilterRef.current?.scrollIntoView(...)` e opcionalmente abre o primeiro filtro
- Card "Favoritos" -> `onClick` faz `favoritesRef.current?.scrollIntoView(...)`
- Se `favorites.length === 0`, mostrar no card: texto curto "Sem favoritos -- marca as tuas cirurgias frequentes" (via i18n `no_favorites_hint`)
- Mostrar card favoritos tambem em mobile (remover `hidden sm:block`)
- Adicionar `cursor-pointer hover:clinical-shadow-md transition-shadow` aos cards

---

## 3. Favoritos e recentes melhorados (ponto 2)

### `src/pages/Index.tsx`:
- Adicionar toggle "Favoritos primeiro" (`showFavoritesFirst`) que reordena `filteredResults` colocando favoritos no topo
- Adicionar filtro rapido "So favoritos" (`showOnlyFavorites`) que filtra para mostrar apenas favoritos
- Seccao "Favoritos" aparece SEMPRE (mesmo vazia), com empty state:
  - Texto: "Ainda sem favoritos" (i18n `no_favorites_empty`)
  - Botao: "Ver todas as cirurgias" -> scroll para lista
- Seccao "Recentes" com botao "Limpar recentes" que faz `setRecents([])`
- `ProcedureCard` ja tem estrela de favorito (confirmado no codigo) -- OK

### `src/contexts/LanguageContext.tsx` -- novas chaves:
- `no_favorites_hint`: "Sem favoritos -- marca as tuas cirurgias frequentes" / ...
- `no_favorites_empty`: "Ainda sem favoritos" / ...
- `view_all_procedures`: "Ver todas as cirurgias" / ...
- `clear_recents`: "Limpar recentes" / ...
- `favorites_first`: "Favoritos primeiro" / ...
- `only_favorites`: "So favoritos" / ...

---

## 4. IOT/Intubacao em todas as cirurgias (ponto 3)

**Ja implementado**: `IntubationGuide` com accordion ja esta em `ProcedurePage.tsx` no tab Intra-op (linha 198). A calculadora ETT ja esta integrada dentro do `IntubationGuide`.

**Melhorias**:
- O componente `IntubationGuide` ja aparece em TODAS as cirurgias (e generico, nao depende de dados do procedimento). Isto ja cumpre o requisito de "template base generico".
- Adicionar um botao visivel "Abrir calculadora ETT" fora do accordion para acesso rapido, que ou expande o accordion ou navega para `/calculateurs`

**Ficheiros**: `src/pages/ProcedurePage.tsx` (pequeno ajuste), `src/components/anesia/IntubationGuide.tsx` (ja OK)

---

## 5. MVP de Guidelines, Protocoles e ALR (ponto 4)

### Criar 3 ficheiros JSON em `public/data/`:

**`public/data/guidelines.v1.json`** -- array de guidelines por categoria:
```text
[
  {
    "id": "airway-management",
    "category": "airway",
    "titles": { "fr": "Gestion des voies aériennes", "en": "Airway management", "pt": "Gestao da via aerea" },
    "items": {
      "fr": ["Evaluation systematique...", "Classification Mallampati...", ...],
      "en": [...], "pt": [...]
    },
    "references": [{ "source": "DAS Guidelines", "year": 2015 }]
  },
  ...
]
```
Environ 12-15 guidelines couvrant: voies aeriennes, hemodynamique, temperature, douleur, PONV, remplissage vasculaire.

**`public/data/protocoles.v1.json`** -- array de protocoles/checklists:
```text
[
  {
    "id": "who-surgical-safety",
    "category": "safety",
    "titles": { "fr": "Checklist securite OMS", ... },
    "steps": { "fr": ["Verification identite...", ...], ... },
    "references": [...]
  },
  ...
]
```
Minimum 10 protocoles: checklist OMS, PONV, hemorragie massive, securite bloc, jeune preop, antibioprophylaxie, thromboprophylaxie, transfusion, hyperthermie maligne, anaphylaxie.

**`public/data/alr.v1.json`** -- array de bloqueios por regiao:
```text
[
  {
    "id": "interscalene",
    "region": "upper_limb",
    "titles": { "fr": "Bloc interscalenique", ... },
    "indications": { "fr": [...], ... },
    "contraindications": { "fr": [...], ... },
    "technique": { "fr": [...], ... },
    "drugs": { "fr": [...], ... }
  },
  ...
]
```
Bloqueios: interscalenique, supraclaviculaire, axillaire, femoral, sciatique, adducteur, TAP block, paravertebral, erecteur du rachis, scalp block.

### Modificar `src/contexts/DataContext.tsx`:
- Adicionar estados: `guidelines`, `protocoles`, `alrBlocks`
- Adicionar tipos em `src/lib/types.ts`: `Guideline`, `Protocole`, `ALRBlock`
- Fetch dos 3 novos JSON em paralelo com os existentes
- Validacao zod legere
- Exposer via contexto: `guidelines`, `protocoles`, `alrBlocks`

### Modificar paginas:

**`src/pages/Guidelines.tsx`**:
- Carregar dados do DataContext
- Barra de pesquisa Fuse.js por titulo
- Filtro por categoria (chips)
- Lista de cards clicaveis
- Ao clicar: expandir inline (accordion) com bullets + referencias
- Remover badge "Coming soon"

**`src/pages/Protocoles.tsx`**:
- Mesmo padrao: pesquisa + filtro por categoria
- Cards com steps expandiveis
- Remover badge "Coming soon"

**`src/pages/ALR.tsx`**:
- Pesquisa + filtro por regiao
- Cards com indicacoes, contra-indicacoes, tecnica, farmacos
- Remover badge "Coming soon"

---

## 6. Ordem de linguas (ponto 5)

**Ja implementado**: `LanguageSwitcher.tsx` ja tem `LANGS: ['fr', 'en', 'pt']` e o fallback em `LanguageContext.tsx` ja segue `fr -> en -> pt`. Confirmado no codigo actual -- nada a alterar.

---

## 7. Novas chaves i18n

Em `src/contexts/LanguageContext.tsx`, adicionar:
- Chaves para favoritos/recentes (ponto 3)
- Chaves para Guidelines/Protocoles/ALR: `search_guidelines`, `category`, `steps`, `indications`, `contraindications_alr`, `technique`, `drugs_alr`, `region`, `upper_limb`, `lower_limb`, `trunk`, `head_neck`, `safety`, `pain`, `airway_cat`, `hemodynamics`, `temperature`, `ponv`, `fluid`, `open_ett_calculator`
- Environ 20 novas chaves

---

## Resume des fichiers

| Ficheiro | Accao |
|----------|-------|
| `src/lib/types.ts` | Modifier -- ajouter types Guideline, Protocole, ALRBlock |
| `src/contexts/DataContext.tsx` | Modifier -- charger 3 nouveaux JSON, exposer dans contexte |
| `src/contexts/LanguageContext.tsx` | Modifier -- ~20 nouvelles cles i18n |
| `src/pages/Index.tsx` | Modifier -- floating search, stats clicaveis, favoritos/recentes ameliores |
| `src/pages/Guidelines.tsx` | Reescrever -- MVP avec donnees JSON, recherche, filtres |
| `src/pages/Protocoles.tsx` | Reescrever -- MVP avec donnees JSON, recherche, filtres |
| `src/pages/ALR.tsx` | Reescrever -- MVP avec donnees JSON, recherche, filtres |
| `src/pages/ProcedurePage.tsx` | Petit ajuste -- bouton acces rapide ETT |
| `public/data/guidelines.v1.json` | Creer -- ~15 guidelines |
| `public/data/protocoles.v1.json` | Creer -- ~10 protocoles |
| `public/data/alr.v1.json` | Creer -- ~10 bloqueios |

## O que NAO muda
- `procedures.v3.json`, `drugs.v1.json` -- contenu clinique intact
- `AppLayout.tsx`, `DrugDoseRow.tsx`, `DilutionModal.tsx`, `dose.ts`, `dilution.ts`, `ett.ts`
- `ETTCalculator.tsx`, `IntubationGuide.tsx`, `ProcedureCard.tsx`
- `index.css`, `tailwind.config.ts`

## Testes manuais
1. Scroll na landing: verificar barra de pesquisa flutuante aparece ao descer e desaparece ao voltar ao topo
2. Stats: clicar em cada card de stats e verificar scroll suave para a seccao correcta
3. Favoritos: marcar/desmarcar favoritos, testar "So favoritos", "Favoritos primeiro", empty state
4. Guidelines/Protocoles/ALR: abrir cada pagina, pesquisar, filtrar, expandir items
5. Limpar recentes: verificar que o botao apaga o historico
